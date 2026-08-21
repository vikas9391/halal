from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer, BookingDetailSerializer, BookingCreateSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/bookings/          (mine, or all if staff)
    POST /api/v1/bookings/
    GET  /api/v1/bookings/<id>/
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related("tour").prefetch_related("travelers")
        return qs if user.is_staff else qs.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return BookingCreateSerializer
        if self.action == "retrieve":
            return BookingDetailSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingDetailSerializer(booking).data, status=201)
