from rest_framework import serializers

from destinations.serializers import DestinationRefSerializer
from .models import Tour, TourImage, ItineraryDay


class TourImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourImage
        fields = ["id", "url", "alt"]


class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryDay
        fields = ["id", "day", "title", "description"]


class TourListSerializer(serializers.ModelSerializer):
    """GET /tours/ list — matches Tour shape minus nested images/itinerary
    is unnecessary here since Tour cards in the frontend (TourCard.tsx) use
    the full Tour object from dummy-data, so we return the full shape here
    too to avoid any field-shape drift between list and detail."""

    destination = DestinationRefSerializer(read_only=True)
    images = TourImageSerializer(many=True, read_only=True)
    itinerary = ItineraryDaySerializer(many=True, read_only=True)
    # Decimal -> plain number (not a string) so tour.price.toLocaleString() works.
    price = serializers.FloatField()
    rating = serializers.FloatField()

    class Meta:
        model = Tour
        fields = [
            "id", "slug", "title", "destination", "duration_days", "duration_nights",
            "price", "currency", "rating", "review_count", "cover_image", "images",
            "halal_features", "summary", "itinerary", "departure_city",
        ]


class TourDetailSerializer(TourListSerializer):
    """Same full shape — kept as an alias so views.py can distinguish
    list vs retrieve serializers if the shape ever needs to diverge."""
    pass
