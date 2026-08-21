import django_filters
from django import forms

from .models import Tour, HALAL_FEATURE_CHOICES


class HalalFeatureContainsFilter(django_filters.ChoiceFilter):
    """?halal=scholar_led — Postgres ArrayField's `contains` lookup expects a
    list (e.g. ['scholar_led']), not the bare scalar ChoiceFilter passes by
    default, so wrap the value before it reaches the ORM."""

    def filter(self, qs, value):
        if value in (None, ""):
            return qs
        return qs.filter(**{f"{self.field_name}__contains": [value]})


class TourFilter(django_filters.FilterSet):
    # ?destination=makkah-madinah
    destination = django_filters.CharFilter(field_name="destination__slug")
    # ?min_price=500&max_price=2000
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    # ?duration=7  (duration_days exact)
    duration = django_filters.NumberFilter(field_name="duration_days")
    # ?halal=prayer_friendly  — matches ToursPage's single-value filter
    halal = HalalFeatureContainsFilter(field_name="halal_features", choices=HALAL_FEATURE_CHOICES)

    class Meta:
        model = Tour
        fields = ["destination", "min_price", "max_price", "duration", "halal"]
