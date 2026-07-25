"""
Filter utilities for the properties app.
Supports filtering by attributes (builder, locality, property_type, transaction_type, bhk, furnishing, status, facing),
range filters (min_price, max_price, min_area, max_area), search keywords, and sorting.
"""
from django.db.models import Q, QuerySet


class PropertyFilter:
    """
    Applies request query parameters to filter and sort Property QuerySets.
    """
    @staticmethod
    def filter_queryset(queryset: QuerySet, params: dict) -> QuerySet:
        # 1. Builder & Locality
        builder = params.get('builder')
        if builder:
            queryset = queryset.filter(builder_id=builder)

        locality = params.get('locality')
        if locality:
            queryset = queryset.filter(locality_id=locality)

        # 2. Property Type & Transaction Type
        property_type = params.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type__iexact=property_type)

        transaction_type = params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type__iexact=transaction_type)

        # 3. Status & Furnishing & Facing
        status = params.get('status')
        if status:
            queryset = queryset.filter(status__iexact=status)

        furnishing_status = params.get('furnishing_status')
        if furnishing_status:
            queryset = queryset.filter(furnishing_status__iexact=furnishing_status)

        facing = params.get('facing')
        if facing:
            queryset = queryset.filter(facing__iexact=facing)

        # 4. Numeric fields: BHK, Price Range, Area Range
        bhk = params.get('bhk')
        if bhk is not None:
            try:
                queryset = queryset.filter(bhk=int(bhk))
            except (ValueError, TypeError):
                pass

        min_price = params.get('min_price')
        if min_price is not None:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass

        max_price = params.get('max_price')
        if max_price is not None:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass

        min_area = params.get('min_area') or params.get('min_carpet_area')
        if min_area is not None:
            try:
                queryset = queryset.filter(carpet_area__gte=float(min_area))
            except (ValueError, TypeError):
                pass

        max_area = params.get('max_area') or params.get('max_carpet_area')
        if max_area is not None:
            try:
                queryset = queryset.filter(carpet_area__lte=float(max_area))
            except (ValueError, TypeError):
                pass

        # 5. Search Keyword (property_name, rera_number, address, locality name, builder name)
        search = params.get('search') or params.get('q')
        if search:
            search_str = str(search).strip()
            queryset = queryset.filter(
                Q(property_name__icontains=search_str) |
                Q(rera_number__icontains=search_str) |
                Q(address__icontains=search_str) |
                Q(locality__name__icontains=search_str) |
                Q(builder__builder_name__icontains=search_str)
            )

        # 6. Sorting / Ordering
        ordering = params.get('ordering') or params.get('sort_by')
        if ordering:
            ordering_map = {
                'price_asc': 'price',
                'price_desc': '-price',
                'newest': '-created_at',
                'oldest': 'created_at',
                'bhk_asc': 'bhk',
                'bhk_desc': '-bhk',
                'carpet_area_asc': 'carpet_area',
                'carpet_area_desc': '-carpet_area',
            }
            sort_field = ordering_map.get(ordering, ordering)
            try:
                queryset = queryset.order_by(sort_field)
            except Exception:
                pass

        return queryset.distinct()


class PropertyListingFilter:
    """
    Applies request query parameters to filter PropertyListing QuerySets.
    """
    @staticmethod
    def filter_queryset(queryset: QuerySet, params: dict) -> QuerySet:
        property_id = params.get('property') or params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        listed_by_type = params.get('listed_by_type')
        if listed_by_type:
            queryset = queryset.filter(listed_by_type__iexact=listed_by_type)

        listing_status = params.get('listing_status') or params.get('status')
        if listing_status:
            queryset = queryset.filter(listing_status__iexact=listing_status)

        is_verified = params.get('is_verified')
        if is_verified is not None:
            val = str(is_verified).lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_verified=val)

        owner_id = params.get('owner') or params.get('owner_id')
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)

        builder_id = params.get('builder') or params.get('builder_id')
        if builder_id:
            queryset = queryset.filter(builder_id=builder_id)

        search = params.get('search')
        if search:
            search_str = str(search).strip()
            queryset = queryset.filter(
                Q(contact_name__icontains=search_str) |
                Q(contact_email__icontains=search_str) |
                Q(contact_phone__icontains=search_str) |
                Q(property__property_name__icontains=search_str)
            )

        return queryset.distinct()


class PropertyLegalFilter:
    """
    Applies request query parameters to filter PropertyLegal QuerySets.
    """
    @staticmethod
    def filter_queryset(queryset: QuerySet, params: dict) -> QuerySet:
        property_id = params.get('property') or params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        verification_status = params.get('verification_status') or params.get('status')
        if verification_status:
            queryset = queryset.filter(verification_status__iexact=verification_status)

        na_converted = params.get('na_converted')
        if na_converted is not None:
            val = str(na_converted).lower() in ['true', '1', 'yes']
            queryset = queryset.filter(na_converted=val)

        verified_by = params.get('verified_by') or params.get('verified_by_id')
        if verified_by:
            queryset = queryset.filter(verified_by_id=verified_by)

        search = params.get('search')
        if search:
            search_str = str(search).strip()
            queryset = queryset.filter(
                Q(survey_number__icontains=search_str) |
                Q(khata_number__icontains=search_str) |
                Q(remarks__icontains=search_str) |
                Q(property__property_name__icontains=search_str)
            )

        return queryset.distinct()
