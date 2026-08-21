from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Tour
from .serializers import TourListSerializer, TourDetailSerializer
from .filters import TourFilter


class TourViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/tours/?destination=&min_price=&max_price=&duration=&halal=
    GET /api/v1/tours/<slug>/
    """

    queryset = Tour.objects.select_related("destination").prefetch_related("images", "itinerary")
    permission_classes = [AllowAny]
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend]
    filterset_class = TourFilter

    def get_serializer_class(self):
        return TourDetailSerializer if self.action == "retrieve" else TourListSerializer
