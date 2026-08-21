from django.db import models


class Destination(models.Model):
    """Mirrors types/index.ts -> Destination"""

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=150)
    country = models.CharField(max_length=100)
    hero_image = models.URLField()
    short_description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
