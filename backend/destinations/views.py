from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Destination
from .serializers import DestinationSerializer


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/destinations/
    GET /api/v1/destinations/<slug>/
    """

    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
