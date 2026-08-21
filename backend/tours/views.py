from rest_framework import permissions, viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Tour, TourImage
from .serializers import TourListSerializer, TourDetailSerializer, TourAdminSerializer, TourImageWriteSerializer
from .filters import TourFilter


class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.select_related("destination").prefetch_related("images", "itinerary")
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend]
    filterset_class = TourFilter

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [permissions.IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return TourAdminSerializer
        return TourDetailSerializer if self.action == "retrieve" else TourListSerializer


class TourImageViewSet(viewsets.ModelViewSet):
    queryset = TourImage.objects.select_related("tour").all()
    serializer_class = TourImageWriteSerializer
    permission_classes = [permissions.IsAdminUser]
