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
        # 1. Builder & Locality & City
        builder = params.get('builder')
        if builder and builder != 'All':
            try:
                import uuid
                val = uuid.UUID(str(builder))
                queryset = queryset.filter(builder_id=val)
            except (ValueError, TypeError):
                queryset = queryset.filter(builder__builder_name__icontains=builder)

        locality = params.get('locality')
        if locality and locality != 'All':
            try:
                import uuid
                val = uuid.UUID(str(locality))
                queryset = queryset.filter(locality_id=val)
            except (ValueError, TypeError):
                loc_str = str(locality).strip()
                queryset = queryset.filter(
                    Q(locality__name__icontains=loc_str) |
                    Q(address__icontains=loc_str) |
                    Q(property_name__icontains=loc_str)
                )

        city = params.get('city')
        if city and city != 'All':
            queryset = queryset.filter(
                Q(locality__city__icontains=city) |
                Q(address__icontains=city)
            )

        # 2. Property Type & Transaction Type
        property_type = params.get('property_type')
        if property_type and property_type != 'All':
            queryset = queryset.filter(property_type__iexact=property_type)

        transaction_type = params.get('transaction_type')
        if transaction_type and transaction_type != 'All':
            queryset = queryset.filter(transaction_type__iexact=transaction_type)

        # 3. Status & Furnishing & Facing
        status = params.get('status') or params.get('possession_status')
        if status and status != 'All':
            queryset = queryset.filter(status__iexact=status)

        furnishing_status = params.get('furnishing_status')
        if furnishing_status and furnishing_status != 'All':
            queryset = queryset.filter(furnishing_status__iexact=furnishing_status)

        facing = params.get('facing')
        if facing and facing != 'All':
            queryset = queryset.filter(facing__iexact=facing)

        # 4. BHK Filter (Supports single number or comma-separated values like '1,2,3')
        bhk_param = params.get('bhk')
        if bhk_param and bhk_param != 'All':
            if isinstance(bhk_param, str) and ',' in bhk_param:
                bhk_values = []
                has_five_plus = False
                for val in bhk_param.split(','):
                    v = val.strip().replace('+ BHK', '').replace(' BHK', '').replace('+', '')
                    if v == '5' and '+' in val:
                        has_five_plus = True
                    try:
                        bhk_values.append(int(v))
                    except ValueError:
                        pass
                if bhk_values:
                    if has_five_plus or 5 in bhk_values:
                        queryset = queryset.filter(Q(bhk__in=bhk_values) | Q(bhk__gte=5))
                    else:
                        queryset = queryset.filter(bhk__in=bhk_values)
            else:
                v = str(bhk_param).strip().replace('+ BHK', '').replace(' BHK', '').replace('+', '')
                try:
                    num = int(v)
                    if num >= 5 or '+' in str(bhk_param):
                        queryset = queryset.filter(bhk__gte=5)
                    else:
                        queryset = queryset.filter(bhk=num)
                except ValueError:
                    pass

        # 5. Price & Area Range
        min_price = params.get('min_price')
        if min_price is not None and str(min_price) != '':
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass

        max_price = params.get('max_price')
        if max_price is not None and str(max_price) != '':
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass

        min_area = params.get('min_area') or params.get('min_carpet_area')
        if min_area is not None and str(min_area) != '':
            try:
                val = float(min_area)
                queryset = queryset.filter(Q(carpet_area__gte=val) | Q(builtup_area__gte=val))
            except (ValueError, TypeError):
                pass

        max_area = params.get('max_area') or params.get('max_carpet_area')
        if max_area is not None and str(max_area) != '':
            try:
                val = float(max_area)
                queryset = queryset.filter(Q(carpet_area__lte=val) | Q(builtup_area__lte=val))
            except (ValueError, TypeError):
                pass


        # 6. Search Keyword (property_name, rera_number, address, locality name, builder name, property_type, status)
        search = params.get('search') or params.get('q')
        if search:
            search_str = str(search).strip()
            queryset = queryset.filter(
                Q(property_name__icontains=search_str) |
                Q(rera_number__icontains=search_str) |
                Q(address__icontains=search_str) |
                Q(locality__name__icontains=search_str) |
                Q(locality__city__icontains=search_str) |
                Q(builder__builder_name__icontains=search_str) |
                Q(property_type__icontains=search_str) |
                Q(status__icontains=search_str) |
                Q(transaction_type__icontains=search_str) |
                Q(furnishing_status__icontains=search_str)
            )

        # 7. Sorting / Ordering
        ordering = params.get('ordering') or params.get('sort_by')
        if ordering:
            ordering_map = {
                'price_asc': 'price',
                'price_desc': '-price',
                'newest': '-created_at',
                'popular': '-created_at',
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
