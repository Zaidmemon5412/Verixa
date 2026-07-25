from django.db import models
from django.contrib.auth import get_user_model
# pyrefly: ignore [missing-import]
from apps.properties.models import Property

User = get_user_model()


class ComparisonSession(models.Model):
    """
    Groups properties selected by a user for analysis and compares their features,
    valuations, and legal risk parameters.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comparisons')
    title = models.CharField(max_length=100, default='My Comparison Session')
    
    # Many-to-many relationship with Property listings
    properties = models.ManyToManyField(Property, related_name='comparison_sessions')
    
    # Custom weighting criteria for ranking properties (json format)
    # E.g. {"price_weight": 0.4, "location_weight": 0.3, "verification_weight": 0.3}
    ranking_weights = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.user.username} ({self.properties.count()} properties)"
