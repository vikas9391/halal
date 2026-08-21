import json
from rest_framework import parsers, viewsets, permissions
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer, BookingDetailSerializer, BookingCreateSerializer, BookingAdminSerializer


class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related("tour", "user").prefetch_related("travelers", "payments")
        return qs if user.is_staff else qs.filter(user=user)

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return BookingCreateSerializer
        if self.request.user.is_staff:
            return BookingAdminSerializer
        if self.action == "retrieve":
            return BookingDetailSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        raw_travelers = data.get("travelers", "[]")
        try:
            travelers = json.loads(raw_travelers) if isinstance(raw_travelers, str) else raw_travelers
        except (TypeError, json.JSONDecodeError):
            return Response({"travelers": ["Invalid traveler data."]}, status=400)

        for index, traveler in enumerate(travelers):
            traveler["passport_document"] = request.FILES.get(f"traveler_{index}_passport_document")
            traveler["passport_photo"] = request.FILES.get(f"traveler_{index}_passport_photo")
        data["travelers"] = travelers

        serializer = self.get_serializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingAdminSerializer(booking).data if request.user.is_staff else BookingDetailSerializer(booking).data, status=201)
