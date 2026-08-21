from rest_framework import viewsets, permissions

from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/reviews/?tour=<slug>
    POST /api/v1/reviews/
    """

    serializer_class = ReviewSerializer
    queryset = Review.objects.select_related("tour", "user")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        tour_slug = self.request.query_params.get("tour")
        if tour_slug:
            qs = qs.filter(tour__slug=tour_slug)
        return qs

    def perform_create(self, serializer):
        serializer.save()
