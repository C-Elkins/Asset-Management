import { useMutation } from '@tanstack/react-query';
import { backendCategorize, backendInsights, BackendCategorizeResponse, BackendInsightsResponse } from '../services/aiService.ts';

export function useCategorizeMutation() {
  return useMutation<BackendCategorizeResponse, Error, string>({
    mutationFn: async (text: string) => backendCategorize(text)
  });
}

export function useInsightsMutation() {
  return useMutation<BackendInsightsResponse, Error, string>({
    mutationFn: async (content: string) => backendInsights(content)
  });
}
