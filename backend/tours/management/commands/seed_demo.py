from django.core.management.base import BaseCommand
from django.db import transaction

from destinations.models import Destination
from tours.models import ItineraryDay, Tour, TourImage

# These demo assets are already committed to the frontend repository, so they
# remain available in production without depending on third-party hotlinking.
DEMO_IMAGE_BASE = "https://raw.githubusercontent.com/vikas9391/halal/main/frontend/public/"
DEMO_IMAGES = {
    "kaaba": DEMO_IMAGE_BASE + "kaaba-night_d708ab92.jpg",
    "madinah": DEMO_IMAGE_BASE + "madinah-courtyard_bded3f4c.jpeg",
    "bosnia": DEMO_IMAGE_BASE + "bosnia-mostar_053d512e.jpg",
}

DESTINATIONS = [
    {
        "slug": "istanbul",
        "name": "Istanbul",
        "country": "Turkey",
        "hero_image": DEMO_IMAGES["bosnia"],
        "short_description": "A mosque-rich city where Ottoman history, Bosphorus views, and halal dining meet.",
        "latitude": 41.0082,
        "longitude": 28.9784,
    },
    {
        "slug": "makkah-madinah",
        "name": "Makkah & Madinah",
        "country": "Saudi Arabia",
        "hero_image": DEMO_IMAGES["kaaba"],
        "short_description": "A carefully planned spiritual journey with time for worship, reflection, and guided visits.",
        "latitude": 21.4225,
        "longitude": 39.8262,
    },
    {
        "slug": "dubai",
        "name": "Dubai",
        "country": "United Arab Emirates",
        "hero_image": DEMO_IMAGES["bosnia"],
        "short_description": "Modern Gulf hospitality, skyline experiences, desert landscapes, and abundant halal options.",
        "latitude": 25.2048,
        "longitude": 55.2708,
    },
    {
        "slug": "morocco",
        "name": "Morocco",
        "country": "Morocco",
        "hero_image": DEMO_IMAGES["bosnia"],
        "short_description": "Marrakech color, historic medinas, mountain scenery, and a rich Muslim heritage.",
        "latitude": 31.6295,
        "longitude": -7.9811,
    },
    {
        "slug": "bali",
        "name": "Bali",
        "country": "Indonesia",
        "hero_image": DEMO_IMAGES["bosnia"],
        "short_description": "Tropical scenery, peaceful retreats, Muslim-friendly dining, and relaxed private touring.",
        "latitude": -8.3405,
        "longitude": 115.0920,
    },
]

TOURS = [
    {
        "destination": "istanbul",
        "slug": "istanbul-heritage-trial",
        "title": "Istanbul Heritage Trial",
        "duration_days": 5,
        "duration_nights": 4,
        "price": "1299.00",
        "rating": "4.9",
        "review_count": 128,
        "departure_city": "New York",
        "summary": "A trial-ready sample itinerary covering Sultanahmet, the Blue Mosque area, Grand Bazaar, Bosphorus, and halal culinary stops.",
        "halal_features": ["prayer_friendly", "certified_halal_food", "no_alcohol_venues", "scholar_led"],
        "images": [
            (DEMO_IMAGES["bosnia"], "Demo travel destination image"),
            (DEMO_IMAGES["madinah"], "Historic Muslim destination"),
            (DEMO_IMAGES["kaaba"], "Spiritual travel destination"),
        ],
        "itinerary": [
            (1, "Welcome to Istanbul", "Airport arrival, hotel check-in, orientation, and evening prayer-friendly dinner."),
            (2, "Old City Heritage", "Explore Sultanahmet, historic mosques, courtyards, and the Grand Bazaar."),
            (3, "Bosphorus Day", "Private Bosphorus cruise, waterfront neighborhoods, and sunset viewpoints."),
            (4, "Markets & Culture", "Visit local markets, halal food experiences, and time for independent shopping."),
            (5, "Farewell", "Breakfast, final prayer time, checkout, and airport transfer."),
        ],
    },
    {
        "destination": "makkah-madinah",
        "slug": "umrah-essentials-trial",
        "title": "Umrah Essentials Trial",
        "duration_days": 8,
        "duration_nights": 7,
        "price": "2499.00",
        "rating": "5.0",
        "review_count": 94,
        "departure_city": "Chicago",
        "summary": "A sample Umrah package with guided spiritual orientation, hotel transfers, and structured time in Makkah and Madinah.",
        "halal_features": ["prayer_friendly", "certified_halal_food", "scholar_led", "no_alcohol_venues"],
        "images": [
            (DEMO_IMAGES["kaaba"], "Kaaba at night"),
            (DEMO_IMAGES["madinah"], "Madinah courtyard"),
        ],
        "itinerary": [
            (1, "Arrival", "Arrival transfer, hotel check-in, orientation, and preparation for worship."),
            (2, "Makkah", "Guided orientation around the Haram area and dedicated worship time."),
            (3, "Makkah Worship", "Flexible worship schedule with group support and optional guided visits."),
            (4, "Makkah Visits", "Historical sites and reflection time, subject to local access and conditions."),
            (5, "Transfer to Madinah", "Comfortable transfer and hotel check-in in Madinah."),
            (6, "Madinah", "Mosque visits, guided heritage walk, and dedicated worship time."),
            (7, "Madinah Reflection", "Flexible prayer and reflection day with optional local visits."),
            (8, "Departure", "Breakfast, checkout, and airport transfer."),
        ],
    },
    {
        "destination": "dubai",
        "slug": "dubai-family-escape",
        "title": "Dubai Family Escape",
        "duration_days": 5,
        "duration_nights": 4,
        "price": "1599.00",
        "rating": "4.8",
        "review_count": 76,
        "departure_city": "Houston",
        "summary": "A family-friendly Dubai sample package with skyline views, desert scenery, shopping, and halal dining.",
        "halal_features": ["prayer_friendly", "certified_halal_food", "gender_separated_options", "no_alcohol_venues"],
        "images": [
            (DEMO_IMAGES["bosnia"], "Family travel destination"),
            (DEMO_IMAGES["madinah"], "Muslim-friendly destination"),
        ],
        "itinerary": [
            (1, "Arrival & Marina", "Airport transfer, hotel check-in, and relaxed evening by the marina."),
            (2, "Old & New Dubai", "Historic district, souks, skyline viewpoints, and halal lunch."),
            (3, "Desert Experience", "Private desert excursion with prayer-friendly timing and family activities."),
            (4, "Shopping & Leisure", "Mall time, local attractions, and a flexible evening."),
            (5, "Departure", "Breakfast, checkout, and airport transfer."),
        ],
    },
    {
        "destination": "morocco",
        "slug": "morocco-imperial-cities",
        "title": "Morocco Imperial Cities",
        "duration_days": 7,
        "duration_nights": 6,
        "price": "1899.00",
        "rating": "4.7",
        "review_count": 61,
        "departure_city": "Toronto",
        "summary": "A colorful sample route through Marrakech, historic medinas, local markets, and Moroccan Muslim heritage.",
        "halal_features": ["prayer_friendly", "certified_halal_food", "no_alcohol_venues"],
        "images": [
            (DEMO_IMAGES["bosnia"], "Historic destination architecture"),
            (DEMO_IMAGES["madinah"], "Heritage travel scene"),
        ],
        "itinerary": [
            (1, "Marrakech Arrival", "Airport pickup and relaxed medina orientation."),
            (2, "Marrakech Heritage", "Historic medina, gardens, mosques, and traditional crafts."),
            (3, "Atlas Day", "Scenic mountain excursion with prayer and halal meal stops."),
            (4, "Fes", "Travel to Fes and explore its historic old city."),
            (5, "Fes Heritage", "Guided medina walk, artisan quarter, and cultural sites."),
            (6, "Casablanca", "Transfer toward Casablanca with coastal stops."),
            (7, "Departure", "Final breakfast, prayer time, and airport transfer."),
        ],
    },
    {
        "destination": "bali",
        "slug": "bali-muslim-friendly-retreat",
        "title": "Bali Muslim-Friendly Retreat",
        "duration_days": 6,
        "duration_nights": 5,
        "price": "1699.00",
        "rating": "4.8",
        "review_count": 43,
        "departure_city": "Los Angeles",
        "summary": "A relaxed Bali sample journey combining nature, private touring, Muslim-friendly dining, and quiet resort time.",
        "halal_features": ["prayer_friendly", "certified_halal_food", "no_alcohol_venues"],
        "images": [
            (DEMO_IMAGES["bosnia"], "Tropical travel placeholder"),
            (DEMO_IMAGES["kaaba"], "Muslim-friendly travel placeholder"),
        ],
        "itinerary": [
            (1, "Arrival", "Airport transfer, resort check-in, and welcome dinner."),
            (2, "Ubud", "Rice terraces, local crafts, scenic viewpoints, and halal dining."),
            (3, "Nature Day", "Private waterfall and countryside excursion."),
            (4, "Coast & Leisure", "Beachside leisure with flexible prayer and dining options."),
            (5, "Private Island Day", "Optional private excursion with a relaxed evening."),
            (6, "Departure", "Breakfast, checkout, and airport transfer."),
        ],
    },
]


class Command(BaseCommand):
    help = "Create or update realistic demo destinations, tours, galleries, and itineraries. Safe to run repeatedly."

    @transaction.atomic
    def handle(self, *args, **options):
        destination_map = {}
        for data in DESTINATIONS:
            slug = data["slug"]
            destination, _ = Destination.objects.update_or_create(slug=slug, defaults=data)
            destination_map[slug] = destination

        for data in TOURS:
            tour_defaults = {
                key: value
                for key, value in data.items()
                if key not in {"destination", "images", "itinerary"}
            }
            tour_defaults["destination"] = destination_map[data["destination"]]
            tour, created = Tour.objects.update_or_create(slug=data["slug"], defaults=tour_defaults)

            TourImage.objects.filter(tour=tour).delete()
            TourImage.objects.bulk_create(
                [TourImage(tour=tour, url=url, alt=alt) for url, alt in data["images"]]
            )

            ItineraryDay.objects.filter(tour=tour).delete()
            ItineraryDay.objects.bulk_create(
                [
                    ItineraryDay(tour=tour, day=day, title=title, description=description)
                    for day, title, description in data["itinerary"]
                ]
            )

            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action}: {tour.title}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo catalog ready: {Destination.objects.count()} destinations, "
                f"{Tour.objects.count()} tours, {TourImage.objects.count()} gallery images."
            )
        )
