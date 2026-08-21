from django.conf import settings
from django.db import models

from tours.models import Tour


class Review(models.Model):
    """Mirrors types/index.ts -> Review"""

    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    author_name = models.CharField(max_length=150)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author_name} — {self.tour.title} ({self.rating}★)"
