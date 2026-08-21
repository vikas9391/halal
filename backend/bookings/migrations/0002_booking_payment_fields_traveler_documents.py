from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("bookings", "0001_initial")]
    operations = [
        migrations.AddField(model_name="booking", name="payment_type", field=models.CharField(choices=[("full_payment", "Full Payment"), ("down_payment", "Down Payment ONLY")], default="full_payment", max_length=20)),
        migrations.AddField(model_name="booking", name="payment_method", field=models.CharField(choices=[("card", "Credit/Debit Card"), ("zelle", "Zelle")], default="card", max_length=10)),
        migrations.AddField(model_name="traveler", name="passport_status", field=models.CharField(choices=[("valid", "Valid"), ("expired", "Expired")], default="valid", max_length=8)),
        migrations.AddField(model_name="traveler", name="mobility_assistance", field=models.CharField(choices=[("yes", "Yes"), ("wheelchair_assistance", "Need help for pushing wheelchair")], default="yes", max_length=24)),
        migrations.AddField(model_name="traveler", name="passport_document", field=models.FileField(blank=True, null=True, upload_to="private/passports/%Y/%m/")),
        migrations.AddField(model_name="traveler", name="passport_photo", field=models.ImageField(blank=True, null=True, upload_to="private/passport-photos/%Y/%m/")),
    ]
