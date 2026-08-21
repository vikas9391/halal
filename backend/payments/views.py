"""
Razorpay integration — see build plan section 6:
"Django creates the order ... returns the order_id to Next.js; Next.js
client component opens Razorpay Checkout; Django's webhook endpoint
verifies the signature and flips Booking.status to confirmed server-side.
Never trust the client success callback alone."

Matches components/booking/PaymentStep.tsx's Phase-6 comment:
  const { order_id } = await apiFetch('/payments/create-order/', {...})
"""
import logging

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from core.emails import send_booking_confirmation

from .models import Payment

logger = logging.getLogger(__name__)

try:
    import razorpay
except ImportError:  # pragma: no cover
    razorpay = None


def _client():
    if razorpay is None:
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateOrderView(APIView):
    """POST /api/v1/payments/create-order/  body: { bookingId } -> { orderId, amount, currency, keyId }"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("bookingId") or request.data.get("booking_id")
        if not booking_id:
            return Response({"detail": "bookingId is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.select_related("tour").get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        amount_paise = int(booking.total_price * 100)  # Razorpay expects the smallest currency unit
        client = _client()

        if client is None or not settings.RAZORPAY_KEY_ID:
            # Local dev without Razorpay creds configured — return a stub so the
            # frontend flow (open Checkout) still has something to call.
            logger.warning("Razorpay not configured — returning stub order for booking %s", booking.id)
            stub_order_id = f"stub_order_{booking.id}"
            Payment.objects.create(
                booking=booking,
                razorpay_order_id=stub_order_id,
                amount=amount_paise,
                currency=booking.tour.currency,
                status="created",
            )
            return Response(
                {
                    "orderId": stub_order_id,
                    "amount": amount_paise,
                    "currency": booking.tour.currency,
                    "keyId": settings.RAZORPAY_KEY_ID or "rzp_test_stub",
                }
            )

        order = client.order.create(
            {
                "amount": amount_paise,
                "currency": booking.tour.currency,
                "receipt": f"booking-{booking.id}",
                "notes": {"booking_id": str(booking.id)},
            }
        )
        Payment.objects.create(
            booking=booking,
            razorpay_order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            status="created",
        )
        return Response(
            {
                "orderId": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "keyId": settings.RAZORPAY_KEY_ID,
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
class RazorpayWebhookView(APIView):
    """POST /api/v1/payments/webhook/ — signature-verified, flips Booking.status."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # webhook has no user session; auth is the signature

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature", "")
        client = _client()

        if client is not None and settings.RAZORPAY_WEBHOOK_SECRET:
            try:
                client.utility.verify_webhook_signature(
                    request.body.decode("utf-8"), signature, settings.RAZORPAY_WEBHOOK_SECRET
                )
            except Exception:  # noqa: BLE001
                logger.warning("Razorpay webhook signature verification failed")
                return Response({"detail": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        payload = request.data
        event = payload.get("event")
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        notes = payment_entity.get("notes", {})
        booking_id = notes.get("booking_id")
        razorpay_order_id = payment_entity.get("order_id")
        razorpay_payment_id = payment_entity.get("id", "")

        payment = None
        if razorpay_order_id:
            payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()

        if event == "payment.captured" and booking_id:
            try:
                booking = Booking.objects.select_related("tour").get(id=booking_id)
            except Booking.DoesNotExist:
                logger.warning("Webhook: booking %s not found", booking_id)
                return Response(status=status.HTTP_200_OK)

            if payment is not None:
                payment.razorpay_payment_id = razorpay_payment_id
                payment.status = "captured"
                payment.save(update_fields=["razorpay_payment_id", "status", "updated_at"])

            if booking.status != "confirmed":
                booking.status = "confirmed"
                booking.save(update_fields=["status"])
                send_booking_confirmation(booking)

        elif event == "payment.failed" and payment is not None:
            payment.razorpay_payment_id = razorpay_payment_id
            payment.status = "failed"
            payment.save(update_fields=["razorpay_payment_id", "status", "updated_at"])

        return Response(status=status.HTTP_200_OK)
