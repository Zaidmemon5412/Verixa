"""
Serializers for the locations app.
Defines serializers for listing/presenting, creating, and updating Localities and Nearby Places.
"""
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _

from .models import Locality, NearbyPlace
from .validators import (
    validate_locality_name,
    validate_city,
    validate_state,
    validate_pincode,
    validate_latitude,
    validate_longitude,
    validate_place_name,
    validate_place_type,
    validate_distance,
    validate_travel_time,
    validate_distance_km,
    validate_rating,
    validate_address,
)


class LocalitySerializer(serializers.ModelSerializer):
    """
    Read-only serializer returning all locality details.
    """
    class Meta:
        model = Locality
        fields = [
            'locality_id',
            'name',
            'city',
            'state',
            'pincode',
            'latitude',
            'longitude',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class LocalityValidationMixin:
    """
    Mixin containing common validation logic for Locality fields.
    """
    def validate_name(self, value: str) -> str:
        try:
            return validate_locality_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_city(self, value: str) -> str:
        try:
            return validate_city(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_state(self, value: str) -> str:
        try:
            return validate_state(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_pincode(self, value: str) -> str:
        try:
            return validate_pincode(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_latitude(self, value) -> str:
        try:
            return validate_latitude(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_longitude(self, value) -> str:
        try:
            return validate_longitude(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate(self, attrs):
        # Validate unique constraint: unique_locality_name_city_state
        name = attrs.get('name', getattr(self.instance, 'name', None))
        city = attrs.get('city', getattr(self.instance, 'city', None))
        state = attrs.get('state', getattr(self.instance, 'state', None))

        if name and city and state:
            query = Locality.objects.filter(
                name__iexact=name,
                city__iexact=city,
                state__iexact=state
            )
            if self.instance:
                query = query.exclude(pk=self.instance.pk)
            if query.exists():
                raise serializers.ValidationError({
                    "non_field_errors": [
                        _("A locality with this name, city, and state already exists.")
                    ]
                })

        return attrs


class LocalityCreateSerializer(LocalityValidationMixin, serializers.ModelSerializer):
    """
    Serializer handling the validation and creation of new Locality instances.
    """
    class Meta:
        model = Locality
        fields = [
            'locality_id',
            'name',
            'city',
            'state',
            'pincode',
            'latitude',
            'longitude',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['locality_id', 'created_at', 'updated_at']


class LocalityUpdateSerializer(LocalityValidationMixin, serializers.ModelSerializer):
    """
    Serializer handling the update of existing Locality instances.
    """
    class Meta:
        model = Locality
        fields = [
            'locality_id',
            'name',
            'city',
            'state',
            'pincode',
            'latitude',
            'longitude',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['locality_id', 'created_at', 'updated_at']


class NearbyPlaceSerializer(serializers.ModelSerializer):
    """
    Serializer returning all nearby place details.
    """
    locality = LocalitySerializer(read_only=True)

    class Meta:
        model = NearbyPlace
        fields = [
            'place_id',
            'locality',
            'name',
            'type',
            'distance',
            'distance_km',
            'address',
            'rating',
            'travel_time',
            'latitude',
            'longitude',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class NearbyPlaceValidationMixin:
    """
    Mixin containing common validation logic for NearbyPlace fields.
    """
    def validate_name(self, value: str) -> str:
        try:
            return validate_place_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_type(self, value: str) -> str:
        try:
            return validate_place_type(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_distance(self, value) -> str:
        if value is None:
            return value
        try:
            return validate_distance(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_distance_km(self, value) -> str:
        if value is None:
            return value
        try:
            return validate_distance_km(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_rating(self, value) -> str:
        if value is None:
            return value
        try:
            return validate_rating(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_address(self, value: str) -> str:
        try:
            return validate_address(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_travel_time(self, value) -> int:
        try:
            return validate_travel_time(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_latitude(self, value) -> str:
        try:
            return validate_latitude(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_longitude(self, value) -> str:
        try:
            return validate_longitude(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class NearbyPlaceCreateSerializer(NearbyPlaceValidationMixin, serializers.ModelSerializer):
    """
    Serializer handling validation and creation of NearbyPlace instances.
    """
    locality = serializers.PrimaryKeyRelatedField(
        queryset=Locality.objects.all(),
        error_messages={
            'does_not_exist': _("The referenced locality does not exist.")
        }
    )

    class Meta:
        model = NearbyPlace
        fields = [
            'place_id',
            'locality',
            'name',
            'type',
            'distance',
            'distance_km',
            'address',
            'rating',
            'travel_time',
            'latitude',
            'longitude',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['place_id', 'created_at', 'updated_at']


class NearbyPlaceUpdateSerializer(NearbyPlaceValidationMixin, serializers.ModelSerializer):
    """
    Serializer handling update of editable NearbyPlace fields only.
    """
    class Meta:
        model = NearbyPlace
        fields = [
            'place_id',
            'locality',
            'name',
            'type',
            'distance',
            'distance_km',
            'address',
            'rating',
            'travel_time',
            'latitude',
            'longitude',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['place_id', 'locality', 'created_at', 'updated_at']
