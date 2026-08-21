from rest_framework import serializers

from tours.models import Tour
from .models import Booking, Traveler


class TravelerInputSerializer(serializers.Serializer):
    full_name = serializers.CharField(min_length=2)
    passport_number = serializers.CharField(min_length=4)
    date_of_birth = serializers.DateField()
    passport_status = serializers.ChoiceField(choices=Traveler.PASSPORT_STATUS_CHOICES)
    mobility_assistance = serializers.ChoiceField(choices=Traveler.MOBILITY_CHOICES)
    passport_document = serializers.FileField()
    passport_photo = serializers.ImageField()

    def validate_passport_document(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Passport file must be 10 MB or smaller.")
        if value.content_type not in {"application/pdf", "image/jpeg", "image/png", "image/webp"}:
            raise serializers.ValidationError("Passport must be a PDF, JPG, PNG, or WebP file.")
        return value

    def validate_passport_photo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Passport photo must be 5 MB or smaller.")
        if value.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise serializers.ValidationError("Passport photo must be a JPG, PNG, or WebP image.")
        return value


class BookingSerializer(serializers.ModelSerializer):
    tour_slug = serializers.SlugRelatedField(source="tour", slug_field="slug", read_only=True)
    travelers = serializers.IntegerField(source="travelers_count", read_only=True)
    total_price = serializers.FloatField()

    class Meta:
        model = Booking
        fields = ["id", "tour_slug", "status", "travelers", "departure_date", "total_price", "payment_type", "payment_method"]


class BookingDetailSerializer(BookingSerializer):
    traveler_details = serializers.SerializerMethodField()

    class Meta(BookingSerializer.Meta):
        fields = BookingSerializer.Meta.fields + ["contact_email", "contact_phone", "traveler_details"]

    def get_traveler_details(self, obj):
        return [
            {
                "fullName": t.full_name,
                "passportNumber": t.passport_number,
                "dateOfBirth": t.date_of_birth,
                "passportStatus": t.passport_status,
                "mobilityAssistance": t.mobility_assistance,
                "hasPassportDocument": bool(t.passport_document),
                "hasPassportPhoto": bool(t.passport_photo),
            }
            for t in obj.travelers.all()
        ]


class BookingCreateSerializer(serializers.Serializer):
    tour_slug = serializers.SlugField()
    departure_date = serializers.DateField()
    travelers = TravelerInputSerializer(many=True)
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(min_length=7)
    payment_type = serializers.ChoiceField(choices=Booking.PAYMENT_TYPE_CHOICES)
    payment_method = serializers.ChoiceField(choices=Booking.PAYMENT_METHOD_CHOICES)

    def validate_tour_slug(self, value):
        if not Tour.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Tour not found.")
        return value

    def validate_travelers(self, value):
        if not value:
            raise serializers.ValidationError("At least one traveler is required.")
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
            payment_type=validated_data["payment_type"],
            payment_method=validated_data["payment_method"],
            total_price=tour.price * len(travelers_data),
            status="pending",
        )

        # FileField/ImageField storage must run through model.save(); bulk_create
        # bypasses that storage lifecycle and can leave uploaded files unpersisted.
        for traveler in travelers_data:
            Traveler.objects.create(booking=booking, **traveler)

        return booking
