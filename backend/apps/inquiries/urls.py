"""
URL routing for the Enquiries app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnquiryViewSet

app_name = 'inquiries'

router = DefaultRouter()
router.register(r'', EnquiryViewSet, basename='enquiry')

urlpatterns = [
    path('', include(router.urls)),
]
