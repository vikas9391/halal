from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["author_name", "tour", "rating", "created_at"]
    list_filter = ["rating"]
    search_fields = ["author_name", "comment"]
