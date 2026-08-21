from rest_framework import generics, permissions

from .models import Enquiry
from .serializers import EnquirySerializer
from .emails import send_enquiry_notification


class EnquiryCreateView(generics.CreateAPIView):
    """POST /api/v1/enquiries/"""

    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        enquiry = serializer.save()
        send_enquiry_notification(enquiry)
