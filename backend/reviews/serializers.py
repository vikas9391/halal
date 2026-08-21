from rest_framework import serializers

from tours.models import Tour
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Mirrors types/index.ts -> Review { id, tourSlug, authorName, rating, comment, createdAt }.
    tour_slug does double duty: reads as the tour's slug, writes by looking
    the tour up by slug — this is what SlugRelatedField is for."""

    tour_slug = serializers.SlugRelatedField(source="tour", slug_field="slug", queryset=Tour.objects.all())

    class Meta:
        model = Review
        fields = ["id", "tour_slug", "author_name", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        request = self.context["request"]
        validated_data.setdefault(
            "author_name", request.user.full_name or request.user.email
        )
        return Review.objects.create(user=request.user, **validated_data)
