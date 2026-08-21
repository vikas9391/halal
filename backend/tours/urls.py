from rest_framework.routers import DefaultRouter

from .views import TourViewSet, TourImageViewSet

router = DefaultRouter()
router.register("tours", TourViewSet, basename="tour")
router.register("tour-images", TourImageViewSet, basename="tour-image")

urlpatterns = router.urls
