"use client";
import axios from "axios";
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { handleError, queryParamsToQs } from "@/lib/utils";
import {
  error,
  listParams,
  listResult,
  listResultInfinite,
  mutationParams,
} from "@/services/apiTypes";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const baseURL = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export const useApi = () => {
  const { data: session }: any = useSession();
  console.log("session:",session);
  console.log("baseURL:",baseURL);
  
  
  const headers: any = {};
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session?.access_token}`;
  }
  const axiosInstance = axios.create({ baseURL, headers });
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    },
  );
  return { api: axiosInstance, session };
};

export const useApiList = (
  table: string,
  {
    queryParams = {},
    skip = false,
    isPublic = false,
    keys,
    staleTime = 0,
    retry = false,
    enabled,
  }: listParams = {},
) => {
  const queryString = queryParamsToQs(queryParams);
  const { api, session } = useApi();
  return useQuery({
    queryKey: keys ? [...keys, queryString] : [table, queryString],
    queryFn: async (): Promise<listResult> => {
      const { data } = await api.get(`${table}${queryString}`);
      return data;
    },
    enabled: enabled ?? (isPublic ? !skip : !!session?.access_token && !skip),
    placeholderData: (previousData) => previousData,
    throwOnError: false,
    refetchOnWindowFocus: false,
    ...(staleTime ? { staleTime } : {}),
    retry,
  });
};

export const useApiRead = (
  table: string,
  id: string | number,
  {
    queryParams = {},
    skip = false,
    isPublic = false,
    keys,
    staleTime = 0,
    retry = false,
    enabled,
  }: listParams = {},
) => {
  const queryString = queryParamsToQs(queryParams);
  const { api, session } = useApi();
  return useQuery({
    queryKey: keys ? [...keys, queryString] : [table, id, queryString],
    queryFn: async (): Promise<{ [key: string]: any }> => {
      const { data } = await api.get(`${table}/${id}${queryString}`);
      return data;
    },
    enabled:
      enabled ??
      (isPublic ? !!id && !skip : !!id && !!session?.access_token && !skip),
    placeholderData: (previousData) => previousData,
    throwOnError: false,
    refetchOnWindowFocus: false,
    ...(staleTime ? { staleTime } : {}),
    retry,
  });
};

export const useApiPost = (
  table: string,
  { invalidateKeys = [] }: mutationParams = {},
) => {
  const queryClient = useQueryClient();
  const { api } = useApi();
  return useMutation({
    mutationFn: async (payload: any) => {
      return await api.post(`${table}`, payload);
    },
    onSuccess: () => {
      if (!!invalidateKeys?.length) {
        for (let i = 0; i < invalidateKeys.length; i++) {
          const key = invalidateKeys[i];
          queryClient.invalidateQueries({ queryKey: [key] });
        }
      }
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: handleError,
    throwOnError: false,
  });
};

export const useApiPatch = (
  table: string,
  { invalidateKeys = [] }: mutationParams = {},
) => {
  const queryClient = useQueryClient();
  const { api } = useApi();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: any;
    }) => {
      return await api.patch(`${table}/${id}`, payload);
    },
    onSuccess: (data, variables, context) => {
      if (!!invalidateKeys?.length) {
        for (let i = 0; i < invalidateKeys.length; i++) {
          const key = invalidateKeys[i];
          queryClient.invalidateQueries({ queryKey: [key] });
        }
      }
      queryClient.invalidateQueries({ queryKey: [table] });
      queryClient.invalidateQueries({ queryKey: [`${variables.id}`] });

      queryClient.invalidateQueries({ queryKey: [`${table}-${variables.id}`] });
    },
    onError: handleError,
    throwOnError: false,
  });
};

export const useApiDelete = (
  table: string,
  { invalidateKeys = [] }: mutationParams = {},
) => {
  const queryClient = useQueryClient();
  const { api } = useApi();
  return useMutation({
    mutationFn: async (id?: string | number) => {
      return await api.delete(`${table}${id ? `/${id}` : ""}`);
    },
    onSuccess: (data, id, context) => {
      if (!!invalidateKeys?.length) {
        for (let i = 0; i < invalidateKeys.length; i++) {
          const key = invalidateKeys[i];
          queryClient.invalidateQueries({ queryKey: [key] });
        }
      }
      queryClient.invalidateQueries({ queryKey: [table] });
      queryClient.invalidateQueries({ queryKey: [id] });

      queryClient.invalidateQueries({ queryKey: [`${table}-${id}`] });
    },
    onError: handleError,
    throwOnError: false,
  });
};

// >> FOR DYNAMIC TYPES:
export const useApiAnyGet = (
  table: string,
  {
    queryParams = {},
    skip = false,
    isPublic = false,
    keys,
    staleTime = 0,
    retry = false,
    enabled,
  }: listParams = {},
) => {
  const queryString = queryParamsToQs(queryParams);
  const { api, session } = useApi();
  return useQuery({
    queryKey: keys ? [...keys, queryString] : [table, queryString],

    queryFn: async () => {
      const { data } = await api.get(`${table}${queryString}`);
      return data;
    },
    enabled: enabled ?? (isPublic ? !skip : !!session?.access_token && !skip),
    placeholderData: (previousData) => previousData,
    throwOnError: false,
    refetchOnWindowFocus: false,
    ...(staleTime ? { staleTime } : {}),
    retry,
  });
};

export const useApiInfiniteList = (
  table: string,
  {
    queryParams = {},
    skip = false,
    isPublic = false,
    keys,
    staleTime = 0,
    retry = false,
    enabled,
  }: listParams = {},
) => {
  const queryString = queryParamsToQs(queryParams);
  const { api, session } = useApi();

  return useInfiniteQuery({
    queryKey: keys ? [...keys, queryString] : [table, queryString],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<listResultInfinite> => {
      try {
        const combinedQueryParams = { ...queryParams, page: pageParam };
        const queryString = queryParamsToQs(combinedQueryParams);
        const { data } = await api.get(`${table}${queryString}`);
        return data;
      } catch (error) {
        return { pages: [], pageParams: [] };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages) => {
      const { meta } = lastPage;
      const page =
        typeof meta?.page === "string" ? parseInt(meta?.page) : meta?.page;
      const nextPage = page < meta?.pageCount ? page + 1 : undefined;
      return nextPage;
      // return page < meta?.pageCount ? page + 1 : undefined;
    },
    enabled: enabled ?? (isPublic ? !skip : !!session?.access_token && !skip),
    placeholderData: (previousData) => previousData,
    throwOnError: false,
    refetchOnWindowFocus: false,
    ...(staleTime ? { staleTime } : {}),
    retry,
  });
};
