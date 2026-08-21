from rest_framework import serializers

from destinations.serializers import DestinationRefSerializer
from .models import Tour, TourImage, ItineraryDay


class TourImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourImage
        fields = ["id", "url", "alt"]


class TourImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourImage
        fields = ["id", "tour", "url", "alt"]


class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryDay
        fields = ["id", "day", "title", "description"]


class TourListSerializer(serializers.ModelSerializer):
    destination = DestinationRefSerializer(read_only=True)
    images = TourImageSerializer(many=True, read_only=True)
    itinerary = ItineraryDaySerializer(many=True, read_only=True)
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
    pass


class TourAdminSerializer(serializers.ModelSerializer):
    """Staff CRUD serializer. Images and itinerary are replaced atomically on update."""

    images = TourImageSerializer(many=True, required=False)
    itinerary = ItineraryDaySerializer(many=True, required=False)

    class Meta:
        model = Tour
        fields = [
            "id", "slug", "title", "destination", "duration_days", "duration_nights",
            "price", "currency", "rating", "review_count", "cover_image", "images",
            "halal_features", "summary", "itinerary", "departure_city",
        ]

    def _save_children(self, tour, images=None, itinerary=None):
        if images is not None:
            tour.images.all().delete()
            TourImage.objects.bulk_create([
                TourImage(tour=tour, **item) for item in images
            ])
        if itinerary is not None:
            tour.itinerary.all().delete()
            ItineraryDay.objects.bulk_create([
                ItineraryDay(tour=tour, **item) for item in itinerary
            ])

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        itinerary = validated_data.pop("itinerary", [])
        tour = Tour.objects.create(**validated_data)
        self._save_children(tour, images, itinerary)
        return tour

    def update(self, instance, validated_data):
        images = validated_data.pop("images", None)
        itinerary = validated_data.pop("itinerary", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._save_children(instance, images, itinerary)
        return instance
