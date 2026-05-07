import { QueryClient, UseQueryOptions } from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type objectAny = { [key: string]: any };

export type mutationParams = {
  invalidateKeys?: string[];
  isPublic?: boolean;
  optimistic?: false | { table: string };
};

export type listParams = {
  queryParams?: queryParams;
  skip?: boolean;
  isPublic?: boolean;
  keys?: string[];
  staleTime?: number;
  retry?: UseQueryOptions["retry"];
  enabled?: boolean;
};

export type filterQuery = {
  search?: string;
  keys?: string;
  [key: string]: any;
};

export type anyGetQueryParams = {
  [key: string]: any;
};

export type queryParams = filterQuery & {
  take?: number;
  page?: number;
  sort?: string;
  select?: string;
  search?: string;
};

export type metaResponse = {
  count: number;
  take: number;
  page: number;
  pageCount: number;
};

export type listResult = {
  data: any[];
  meta: metaResponse;
};

export type listResultInfinite = {
  pageParams: number[];
  pages: listResult[];
};

export type error =
  | {
      response?: {
        data?: { message?: string; [key: string]: any };
        [key: string]: any;
      };
      [key: string]: any;
    }
  | any;

export type HandleLogoutParams = {
  pathname: string;
  router: AppRouterInstance;
  queryClient: QueryClient;
  userId: string;
};
