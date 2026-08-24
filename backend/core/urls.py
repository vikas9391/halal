from django.urls import path

from .views import CloudinaryImageUploadView, EnquiryCreateView, SiteSettingsView
from .admin_views import (
    AdminCustomerListView,
    AdminEnquiryDetailView,
    AdminEnquiryListView,
    AdminJotFormRegistrationListView,
    AdminPaymentListView,
    AdminSummaryView,
)

urlpatterns = [
    path("enquiries/", EnquiryCreateView.as_view(), name="enquiry-create"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("media/upload/", CloudinaryImageUploadView.as_view(), name="cloudinary-image-upload"),
    path("admin/summary/", AdminSummaryView.as_view(), name="admin-summary"),
    path("admin/enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiries"),
    path("admin/enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    path("admin/customers/", AdminCustomerListView.as_view(), name="admin-customers"),
    path("admin/payments/", AdminPaymentListView.as_view(), name="admin-payments"),
    path("admin/jotform-registrations/", AdminJotFormRegistrationListView.as_view(), name="admin-jotform-registrations"),
]
