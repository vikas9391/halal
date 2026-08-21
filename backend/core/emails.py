"""
Email sending via Resend — see build plan section 6:
"Django sends confirmation/notification emails ... entirely backend-side,
Next.js never touches it." Failing silently on missing config is
intentional so local dev without a Resend key doesn't 500.
"""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import resend
except ImportError:  # pragma: no cover
    resend = None


def _send(to: str, subject: str, html: str):
    if not settings.RESEND_API_KEY or resend is None:
        logger.info("RESEND_API_KEY not set — skipping email to %s: %s", to, subject)
        return
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send(
            {
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": [to],
                "subject": subject,
                "html": html,
            }
        )
    except Exception:  # noqa: BLE001
        logger.exception("Failed to send email to %s", to)


def send_enquiry_notification(enquiry):
    _send(
        to=settings.DEFAULT_FROM_EMAIL,
        subject=f"New enquiry from {enquiry.name}",
        html=f"<p><b>{enquiry.name}</b> ({enquiry.email}, {enquiry.phone or 'no phone'})</p>"
        f"<p>{enquiry.message}</p>",
    )


def send_booking_confirmation(booking):
    tour_title = booking.tour.title
    _send(
        to=booking.contact_email,
        subject=f"Your booking for {tour_title} is confirmed",
        html=(
            f"<p>Salaam {booking.contact_email},</p>"
            f"<p>Your booking (#{booking.id}) for <b>{tour_title}</b> departing "
            f"{booking.departure_date} is now confirmed.</p>"
            f"<p>Total paid: {booking.total_price} {booking.tour.currency}</p>"
        ),
    )
