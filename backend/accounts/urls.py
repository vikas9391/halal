from django.urls import path

from .views import RegisterView, LoginView, RefreshView, MeView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("accounts/me/", MeView.as_view(), name="accounts-me"),
]
