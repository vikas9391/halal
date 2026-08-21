from django.contrib import admin

from .models import Booking, Traveler


@admin.register(Traveler)
class TravelerAdmin(admin.ModelAdmin):
    list_display = ["id", "full_name", "booking", "passport_status", "mobility_assistance", "has_passport_document", "has_passport_photo"]
    list_filter = ["passport_status", "mobility_assistance"]
    search_fields = ["full_name", "passport_number", "booking__id"]

    @admin.display(boolean=True, description="Passport")
    def has_passport_document(self, obj):
        return bool(obj.passport_document)

    @admin.display(boolean=True, description="Photo")
    def has_passport_photo(self, obj):
        return bool(obj.passport_photo)


class TravelerInline(admin.TabularInline):
    model = Traveler
    extra = 0
    fields = ["full_name", "passport_number", "date_of_birth", "passport_status", "mobility_assistance", "passport_document", "passport_photo"]
    readonly_fields = ["passport_document", "passport_photo"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "tour", "user", "status", "payment_type", "payment_method", "departure_date", "total_price"]
    list_filter = ["status", "payment_type", "payment_method"]
    list_editable = ["status"]
    inlines = [TravelerInline]
