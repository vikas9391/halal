from django.contrib import admin

from .models import Booking, Traveler


class TravelerInline(admin.TabularInline):
    model = Traveler
    extra = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "tour", "user", "status", "departure_date", "total_price"]
    list_filter = ["status"]
    list_editable = ["status"]
    inlines = [TravelerInline]
