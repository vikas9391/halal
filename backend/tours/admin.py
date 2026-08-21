from django.contrib import admin

from .models import Tour, TourImage, ItineraryDay


class TourImageInline(admin.TabularInline):
    model = TourImage
    extra = 1


class ItineraryDayInline(admin.TabularInline):
    model = ItineraryDay
    extra = 1


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ["title", "destination", "price", "duration_days", "rating"]
    list_filter = ["destination", "currency"]
    search_fields = ["title", "summary"]
    prepopulated_fields = {"slug": ("title",)}
    inlines = [TourImageInline, ItineraryDayInline]
