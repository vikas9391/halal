from django.contrib import admin

from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone", "handled", "created_at"]
    list_filter = ["handled"]
    list_editable = ["handled"]
    search_fields = ["name", "email", "message"]
