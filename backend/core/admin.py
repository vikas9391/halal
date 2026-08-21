from django.contrib import admin

from .models import Enquiry, SiteSettings


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone", "handled", "created_at"]
    list_filter = ["handled"]
    list_editable = ["handled"]
    search_fields = ["name", "email", "message"]


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ["phone", "email", "whatsapp", "updated_at"]

    def has_add_permission(self, request):
        # Enforce singleton — only allow adding if no row exists yet
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
