from rest_framework import serializers

from .models import Enquiry


class EnquirySerializer(serializers.ModelSerializer):
    """Mirrors validations.ts -> enquirySchema exactly (no case conversion needed)."""

    class Meta:
        model = Enquiry
        fields = ["id", "name", "email", "phone", "message", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_message(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Tell us a bit more about your trip")
        return value
