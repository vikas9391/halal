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
