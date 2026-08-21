from io import BytesIO

import cloudinary
import cloudinary.uploader
from PIL import Image, UnidentifiedImageError
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Enquiry, SiteSettings
from .serializers import EnquirySerializer, SiteSettingsSerializer
from .emails import send_enquiry_notification


class EnquiryCreateView(generics.CreateAPIView):
    """POST /api/v1/enquiries/"""

    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        send_enquiry_notification(enquiry)


class SiteSettingsView(APIView):
    """GET (public) / PATCH (staff only) /api/v1/settings/"""

    def get_permissions(self):
        if self.request.method == "PATCH":
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get(self, request):
        return Response(SiteSettingsSerializer(SiteSettings.load()).data)

    def patch(self, request):
        settings_obj = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CloudinaryImageUploadView(APIView):
    """Upload a public catalog image to Cloudinary and return its secure URL."""

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        upload = request.FILES.get("file")
        folder = (request.data.get("folder") or "halal-tours/catalog").strip()

        if not upload:
            return Response({"file": ["An image file is required."]}, status=400)
        if upload.size > 10 * 1024 * 1024:
            return Response({"file": ["Image must be 10 MB or smaller."]}, status=400)
        if not getattr(upload, "content_type", "").startswith("image/"):
            return Response({"file": ["Only image files are allowed."]}, status=400)

        try:
            Image.open(BytesIO(upload.read())).verify()
            upload.seek(0)
        except (UnidentifiedImageError, OSError):
            return Response({"file": ["The uploaded file is not a valid image."]}, status=400)

        if not all([
            cloudinary.config().cloud_name,
            cloudinary.config().api_key,
            cloudinary.config().api_secret,
        ]):
            return Response({"detail": "Cloudinary is not configured on the server."}, status=503)

        result = cloudinary.uploader.upload(
            upload,
            folder=folder,
            resource_type="image",
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )
        return Response({
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "width": result.get("width"),
            "height": result.get("height"),
        }, status=201)
