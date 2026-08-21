from rest_framework import serializers

from .models import Destination


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = ["id", "slug", "name", "country", "hero_image", "short_description", "latitude", "longitude"]


class DestinationRefSerializer(serializers.ModelSerializer):
    """Matches Tour.destination -> Pick<Destination, 'id'|'slug'|'name'|'country'>"""

    class Meta:
        model = Destination
        fields = ["id", "slug", "name", "country"]
