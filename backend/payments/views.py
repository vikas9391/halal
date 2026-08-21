"""Razorpay order creation and server-side webhook verification."""
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
    if razorpay is None or not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("bookingId") or request.data.get("booking_id")
        if not booking_id:
            return Response({"detail": "bookingId is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            booking = Booking.objects.select_related("tour").get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.payment_method != "card":
            return Response({"detail": "This booking is not configured for card payment."}, status=status.HTTP_400_BAD_REQUEST)
        if booking.payment_type != "full_payment":
            return Response({"detail": "A down-payment amount has not been configured for this tour."}, status=status.HTTP_400_BAD_REQUEST)

        client = _client()
        if client is None:
            return Response({"detail": "Card payments are not configured. Add Razorpay credentials to the backend environment."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        amount_paise = int(booking.total_price * 100)
        order = client.order.create({
            "amount": amount_paise,
            "currency": booking.tour.currency,
            "receipt": f"booking-{booking.id}",
            "notes": {"booking_id": str(booking.id)},
        })
        Payment.objects.create(
            booking=booking,
            razorpay_order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            status="created",
        )
        return Response({"orderId": order["id"], "amount": order["amount"], "currency": order["currency"], "keyId": settings.RAZORPAY_KEY_ID})


@method_decorator(csrf_exempt, name="dispatch")
class RazorpayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature", "")
        client = _client()
        if client is None or not settings.RAZORPAY_WEBHOOK_SECRET:
            return Response({"detail": "Webhook verification is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        try:
            client.utility.verify_webhook_signature(request.body.decode("utf-8"), signature, settings.RAZORPAY_WEBHOOK_SECRET)
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
        payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first() if razorpay_order_id else None

        if event == "payment.captured" and booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
            except Booking.DoesNotExist:
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
