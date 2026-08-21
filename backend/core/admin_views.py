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
