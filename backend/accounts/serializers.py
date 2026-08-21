from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    """Mirrors types/index.ts -> Profile { id, fullName, email, phone }"""

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone"]
        read_only_fields = ["id", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["full_name", "email", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirmPassword": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """SimpleJWT already uses USERNAME_FIELD (email) — this just documents it
    and lets us extend the payload later if needed."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["fullName"] = user.full_name
        return token
