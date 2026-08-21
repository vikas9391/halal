from django.urls import path

from .views import EnquiryCreateView, SiteSettingsView
from .admin_views import (
    AdminCustomerListView,
    AdminEnquiryDetailView,
    AdminEnquiryListView,
    AdminPaymentListView,
    AdminSummaryView,
)

urlpatterns = [
    path("enquiries/", EnquiryCreateView.as_view(), name="enquiry-create"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("admin/summary/", AdminSummaryView.as_view(), name="admin-summary"),
    path("admin/enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiries"),
    path("admin/enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    path("admin/customers/", AdminCustomerListView.as_view(), name="admin-customers"),
    path("admin/payments/", AdminPaymentListView.as_view(), name="admin-payments"),
]
