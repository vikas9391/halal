from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("accounts.urls")),
    path("api/v1/", include("destinations.urls")),
    path("api/v1/", include("tours.urls")),
    path("api/v1/", include("bookings.urls")),
    path("api/v1/", include("reviews.urls")),
    path("api/v1/", include("payments.urls")),
    path("api/v1/", include("core.urls")),
]
