import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from bookings.models import Booking
from payments.models import Payment
from .models import Enquiry


class AdminEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ["id", "name", "email", "phone", "message", "created_at", "handled"]
        read_only_fields = ["id", "created_at"]


class AdminEnquiryListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminEnquirySerializer
    queryset = Enquiry.objects.all()


class AdminEnquiryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminEnquirySerializer
    queryset = Enquiry.objects.all()


class AdminCustomerSerializer(serializers.ModelSerializer):
    booking_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone", "is_staff", "date_joined", "booking_count"]
        read_only_fields = fields

    def get_booking_count(self, obj):
        return obj.bookings.count()


class AdminCustomerListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminCustomerSerializer
    queryset = User.objects.order_by("-date_joined")


class AdminPaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(read_only=True)
    customer_name = serializers.CharField(source="booking.user.full_name", read_only=True)
    customer_email = serializers.EmailField(source="booking.user.email", read_only=True)
    tour_slug = serializers.CharField(source="booking.tour.slug", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "booking_id", "customer_name", "customer_email", "tour_slug", "razorpay_order_id", "razorpay_payment_id", "amount", "currency", "status", "created_at", "updated_at"]
        read_only_fields = fields


class AdminPaymentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminPaymentSerializer
    queryset = Payment.objects.select_related("booking__user", "booking__tour").all()


class AdminSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            "bookings": {
                "total": Booking.objects.count(),
                "pending": Booking.objects.filter(status="pending").count(),
                "confirmed": Booking.objects.filter(status="confirmed").count(),
                "cancelled": Booking.objects.filter(status="cancelled").count(),
            },
            "customers": User.objects.filter(is_staff=False).count(),
            "enquiries": Enquiry.objects.filter(handled=False).count(),
            "payments": {
                "total": Payment.objects.count(),
                "captured": Payment.objects.filter(status="captured").count(),
                "failed": Payment.objects.filter(status="failed").count(),
            },
        })


class AdminJotFormRegistrationListView(APIView):
    """Proxy JotForm submissions through the authenticated backend so the API key never reaches the browser."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        api_key = os.environ.get("JOTFORM_API_KEY")
        form_id = os.environ.get("JOTFORM_FORM_ID", "262335830425050")
        if not api_key:
            return Response({
                "configured": False,
                "message": "JOTFORM_API_KEY is not configured on the backend.",
                "submissions": [],
            }, status=503)

        query = urlencode({"apiKey": api_key, "limit": "100", "orderby": "created_at"})
        url = f"https://api.jotform.com/form/{form_id}/submissions?{query}"
        try:
            request_obj = Request(url, headers={"Accept": "application/json", "User-Agent": "HalalTours/1.0"})
            with urlopen(request_obj, timeout=15) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            return Response({
                "configured": True,
                "message": f"Unable to retrieve JotForm submissions: {exc}",
                "submissions": [],
            }, status=502)

        submissions = payload.get("content", []) if isinstance(payload, dict) else []
        return Response({
            "configured": True,
            "form_id": form_id,
            "form_url": f"https://form.jotform.com/{form_id}",
            "count": len(submissions),
            "submissions": submissions,
        })
