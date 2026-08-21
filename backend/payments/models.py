from django.db import models

from bookings.models import Booking


class Payment(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("captured", "Captured"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.PROTECT, related_name="payments")
    razorpay_order_id = models.CharField(max_length=64)
    razorpay_payment_id = models.CharField(max_length=64, blank=True)
    amount = models.PositiveIntegerField(help_text="Amount in paise")
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.razorpay_order_id} — {self.status}"
