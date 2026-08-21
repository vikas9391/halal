from django.urls import path

from .views import EnquiryCreateView, SiteSettingsView

urlpatterns = [
    path("enquiries/", EnquiryCreateView.as_view(), name="enquiry-create"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
]
