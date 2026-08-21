# Halal Tours API (Django REST backend)

Matches the frontend at `halal-tours-web/` field-for-field. See "Frontend contract"
below for exactly how this was verified.

## Stack
Django 5 + DRF + SimpleJWT + django-filter + djangorestframework-camel-case +
PostgreSQL + django-cors-headers + Razorpay + Resend.

## Local setup

```bash
cd halal_tours_api
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # then edit DB_* and SECRET_KEY

# create the Postgres role/db (adjust to your local setup)
createuser halal_tours -P
createdb halal_tours -O halal_tours

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API is now live at `http://localhost:8000/api/v1/`, admin at `/admin/`.

## Seed data

Nothing is seeded automatically. Use `/admin/` (Tour, Destination, TourImage,
ItineraryDay are all editable there — see `tours/admin.py`) or run:

```bash
python manage.py shell
```

and create objects the same way the smoke test in this project's build notes
did (see `tours/models.py` / `destinations/models.py` field names).

## Frontend contract — why this shape

The Next.js frontend (`lib/api.ts`, `types/index.ts`, `lib/validations.ts`)
expects:

- **camelCase JSON** everywhere (`durationDays`, `coverImage`, `halalFeatures`,
  `tourSlug`, ...). This backend stays Pythonic (`duration_days`, snake_case
  models/serializers) and `djangorestframework-camel-case` converts both
  directions automatically — no manual field renaming needed.
- **Plain arrays**, not `{count, next, previous, results}` — pagination is
  intentionally **off** globally (`REST_FRAMEWORK` in `config/settings.py`).
  `apiFetch<Tour[]>()` expects `Tour[]`, not a paginated envelope.
- **Numbers, not decimal strings** — `price` and `rating` are explicitly cast
  with `serializers.FloatField()` so `tour.price.toLocaleString()` in
  `app/tours/[slug]/page.tsx` doesn't silently break.
- **Email-based login** — `lib/auth.ts` calls `login(email, password)`; the
  custom `accounts.User` model uses `USERNAME_FIELD = "email"`.
- **`bookingSchema` / `travelerSchema`** in `lib/validations.ts` map directly
  onto `BookingCreateSerializer` in `bookings/serializers.py`.

All of this was verified against a live Postgres instance and real HTTP
requests before delivery — auth, tours (with every filter param), bookings,
reviews, enquiries, and the payments stub all round-trip correctly.

## Endpoints

```
GET  /api/v1/tours/                    ?destination=&min_price=&max_price=&duration=&halal=
GET  /api/v1/tours/<slug>/
GET  /api/v1/destinations/
GET  /api/v1/destinations/<slug>/
POST /api/v1/auth/register/
POST /api/v1/auth/login/               { email, password } -> { access, refresh }
POST /api/v1/auth/refresh/
GET  /api/v1/accounts/me/
PATCH /api/v1/accounts/me/
GET  /api/v1/bookings/                 (mine, or all if staff)
POST /api/v1/bookings/
GET  /api/v1/bookings/<id>/
POST /api/v1/reviews/
GET  /api/v1/reviews/?tour=<slug>
POST /api/v1/enquiries/
POST /api/v1/payments/create-order/    { bookingId } -> { orderId, amount, currency, keyId }
POST /api/v1/payments/webhook/         (CSRF-exempt, Razorpay-signature-verified)
```

## Deploying (Render)

1. New Web Service, root = `halal_tours_api/`.
2. Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
3. Start: `gunicorn config.wsgi:application`
4. Add a Render PostgreSQL instance — it injects `DATABASE_URL` automatically
   (`config/settings.py` picks it up over the discrete `DB_*` vars if present).
5. Env vars: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS=<your-render-host>`,
   `CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`,
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
   `RESEND_API_KEY`, `DEFAULT_FROM_EMAIL`.
6. `python manage.py migrate` (Render's shell or a release command) then
   `python manage.py createsuperuser`.

On the Next.js/Vercel side, set `NEXT_PUBLIC_API_URL` to
`https://<your-render-host>/api/v1`.
