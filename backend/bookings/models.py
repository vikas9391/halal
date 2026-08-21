from django.conf import settings
from django.db import models

from tours.models import Tour


class Booking(models.Model):
    """Mirrors types/index.ts -> Booking, built from lib/booking-store.ts state."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    tour = models.ForeignKey(Tour, on_delete=models.PROTECT, related_name="bookings")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    departure_date = models.DateField()
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=32)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.id} — {self.tour.title}"

    @property
    def travelers_count(self):
        return self.travelers.count()


class Traveler(models.Model):
    """Mirrors validations.ts -> travelerSchema"""

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="travelers")
    full_name = models.CharField(max_length=150)
    passport_number = models.CharField(max_length=32)
    date_of_birth = models.DateField()

    def __str__(self):
        return self.full_name
