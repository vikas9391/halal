from django.conf import settings
from django.db import models

from tours.models import Tour


class Booking(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("confirmed", "Confirmed"), ("cancelled", "Cancelled")]
    PAYMENT_TYPE_CHOICES = [("full_payment", "Full Payment"), ("down_payment", "Down Payment ONLY")]
    PAYMENT_METHOD_CHOICES = [("card", "Credit/Debit Card"), ("zelle", "Zelle")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    tour = models.ForeignKey(Tour, on_delete=models.PROTECT, related_name="bookings")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    departure_date = models.DateField()
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=32)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default="full_payment")
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default="card")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.id} — {self.tour.title}"

    @property
    def travelers_count(self):
        return self.travelers.count()


class Traveler(models.Model):
    PASSPORT_STATUS_CHOICES = [("valid", "Valid"), ("expired", "Expired")]
    MOBILITY_CHOICES = [("yes", "Yes"), ("wheelchair_assistance", "Need help for pushing wheelchair")]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="travelers")
    full_name = models.CharField(max_length=150)
    passport_number = models.CharField(max_length=32)
    date_of_birth = models.DateField()
    passport_status = models.CharField(max_length=8, choices=PASSPORT_STATUS_CHOICES, blank=True, null=True)
    mobility_assistance = models.CharField(max_length=24, choices=MOBILITY_CHOICES, blank=True, null=True)
    passport_document = models.FileField(upload_to="private/passports/%Y/%m/", blank=True, null=True)
    passport_photo = models.ImageField(upload_to="private/passport-photos/%Y/%m/", blank=True, null=True)

    def __str__(self):
        return self.full_name
