import { useQuery, type QueryKey, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

type ApiQueryOptions<TQueryFnData, TData = TQueryFnData, TError = Error> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
  'queryKey'
> & {
  queryKey: QueryKey;
  errorMessage?: string;
};

export function useApiQuery<TQueryFnData, TData = TQueryFnData, TError = Error>(
  options: ApiQueryOptions<TQueryFnData, TData, TError>
): UseQueryResult<TData, TError> {
  const { errorMessage, meta, ...rest } = options;

  return useQuery({
    ...rest,
    meta: {
      ...meta,
      errorMessage,
    },
  });
}
