import { useQuery } from '@tanstack/react-query';
import { listTemplatesRequest } from '../api/template.api';

export const useTemplates = (category) => {
  return useQuery({
    queryKey: ['templates', category || 'all'],
    queryFn: () => listTemplatesRequest(category),
    select: (data) => data?.data?.templates || [],
    staleTime: 5 * 60 * 1000,
  });
};

export default useTemplates;
