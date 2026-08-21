from rest_framework import serializers

from tours.models import Tour
from .models import Booking, Traveler


class TravelerInputSerializer(serializers.Serializer):
    """Mirrors validations.ts -> travelerSchema"""

    full_name = serializers.CharField(min_length=2)
    passport_number = serializers.CharField(min_length=4)
    date_of_birth = serializers.DateField()


class BookingSerializer(serializers.ModelSerializer):
    """Read shape — mirrors types/index.ts -> Booking exactly.
    NOTE: `travelers` here is a COUNT (number), matching the TS type;
    see BookingDetailSerializer for the full nested traveler list."""

    tour_slug = serializers.SlugRelatedField(source="tour", slug_field="slug", read_only=True)
    travelers = serializers.IntegerField(source="travelers_count", read_only=True)
    total_price = serializers.FloatField()

    class Meta:
        model = Booking
        fields = ["id", "tour_slug", "status", "travelers", "departure_date", "total_price"]


class BookingDetailSerializer(BookingSerializer):
    """Extra detail view with full traveler records, contact info."""

    traveler_details = serializers.SerializerMethodField()

    class Meta(BookingSerializer.Meta):
        fields = BookingSerializer.Meta.fields + ["contact_email", "contact_phone", "traveler_details"]

    def get_traveler_details(self, obj):
        return [
            {
                "fullName": t.full_name,
                "passportNumber": t.passport_number,
                "dateOfBirth": t.date_of_birth,
            }
            for t in obj.travelers.all()
        ]


class BookingCreateSerializer(serializers.Serializer):
    """Write shape — mirrors validations.ts -> bookingSchema exactly:
    { tourSlug, departureDate, travelers: TravelerDraft[], contactEmail, contactPhone }"""

    tour_slug = serializers.SlugField()
    departure_date = serializers.DateField()
    travelers = TravelerInputSerializer(many=True)
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(min_length=7)

    def validate_tour_slug(self, value):
        if not Tour.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Tour not found.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        tour = Tour.objects.get(slug=validated_data["tour_slug"])
        travelers_data = validated_data.pop("travelers")

        booking = Booking.objects.create(
            user=request.user,
            tour=tour,
            departure_date=validated_data["departure_date"],
            contact_email=validated_data["contact_email"],
            contact_phone=validated_data["contact_phone"],
            total_price=tour.price * len(travelers_data),
            status="pending",
        )
        Traveler.objects.bulk_create(
            [
                Traveler(
                    booking=booking,
                    full_name=t["full_name"],
                    passport_number=t["passport_number"],
                    date_of_birth=t["date_of_birth"],
                )
                for t in travelers_data
            ]
        )
        return booking
