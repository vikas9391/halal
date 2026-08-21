from django.contrib import admin

from .models import Destination


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ["name", "country", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name", "country"]
