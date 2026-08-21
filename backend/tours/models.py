from django.contrib.postgres.fields import ArrayField
from django.db import models

from destinations.models import Destination

# Mirrors types/index.ts -> HalalFeature union
HALAL_FEATURE_CHOICES = [
    ("prayer_friendly", "Prayer friendly"),
    ("certified_halal_food", "Certified halal food"),
    ("gender_separated_options", "Gender separated options"),
    ("no_alcohol_venues", "No alcohol venues"),
    ("scholar_led", "Scholar led"),
]


class Tour(models.Model):
    """Mirrors types/index.ts -> Tour"""

    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="tours")
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    duration_days = models.PositiveIntegerField()
    duration_nights = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    cover_image = models.URLField()
    halal_features = ArrayField(
        models.CharField(max_length=32, choices=HALAL_FEATURE_CHOICES),
        default=list,
        blank=True,
    )
    summary = models.TextField()
    departure_city = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class TourImage(models.Model):
    """Mirrors types/index.ts -> TourImage { id, url, alt }"""

    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name="images")
    url = models.URLField()
    alt = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.alt or self.url


class ItineraryDay(models.Model):
    """Mirrors types/index.ts -> ItineraryDay { id, day, title, description }"""

    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name="itinerary")
    day = models.PositiveIntegerField()
    title = models.CharField(max_length=150)
    description = models.TextField()

    class Meta:
        ordering = ["day"]

    def __str__(self):
        return f"Day {self.day}: {self.title}"
