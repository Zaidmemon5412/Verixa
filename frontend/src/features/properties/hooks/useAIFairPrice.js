import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/services/apiClient';

/**
 * Fetches the Verixa AI Fair Price prediction for a given property.
 * Endpoint: GET /api/properties/{propertyId}/fair-price/
 */
async function fetchAIFairPrice(propertyId) {
  if (!propertyId) throw new Error('Property ID is required');
  const res = await apiClient.get('/properties/' + propertyId + '/fair-price/');
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to fetch AI fair price');
  }
  return res.data.data;
}

export function useAIFairPrice(propertyId) {
  return useQuery({
    queryKey: ['ai-fair-price', propertyId],
    queryFn: () => fetchAIFairPrice(propertyId),
    enabled: Boolean(propertyId),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
