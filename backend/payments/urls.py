from django.urls import path

from .views import CreateOrderView, RazorpayWebhookView

urlpatterns = [
    path("payments/create-order/", CreateOrderView.as_view(), name="payments-create-order"),
    path("payments/webhook/", RazorpayWebhookView.as_view(), name="payments-webhook"),
]
