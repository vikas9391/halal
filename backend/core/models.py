from django.db import models


class Enquiry(models.Model):
    """Mirrors validations.ts -> enquirySchema { name, email, phone, message }"""

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Enquiries"

    def __str__(self):
        return f"{self.name} <{self.email}>"


class SiteSettings(models.Model):
    """Singleton row — public contact info, editable from /admin/ and
    the AdminSettings page instead of hardcoded in the frontend."""

    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    whatsapp = models.CharField(max_length=32, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Site settings"
