import * as qs from "qs";

import {
  completeParams,
  findTable,
  handleError,
  mergeObjects,
  parseFilter,
  parseInclude,
  sortingDataWithParams,
} from "./index";

import { NextRequest, NextResponse } from "next/server";
import { prismaAny } from "@/lib/prisma";

declare global {
  interface BigInt {
    toJSON(): string | number;
  }
}

BigInt.prototype.toJSON = function (): string | number {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

type obj = { [key: string]: any };
type args = {
  params?: any;
  select?: obj;
  include?: obj;
  where?: obj;
  withoutLimitPagination?: boolean;
  returnValue?: boolean;
  QParams?: obj;
  body?: obj;
  table?: string;
  key?: string;
};

export const CREATE = async (
  req: NextRequest,
  { select = {}, include = {}, table, body, returnValue }: args,
) => {
  try {
    const dbTable: any = table || findTable(req);
    const params = { data: body || (await req.json()) };
    completeParams({ params, select, include });
    const result = await prismaAny[dbTable].create(params);
    if (returnValue) {
      return result;
    }
    return NextResponse.json(result);
  } catch (error) {
    if (returnValue) {
      throw error;
    }
    return handleError(error);
  }
};

export const LIST = async (
  req: NextRequest,
  {
    include,
    where = {},
    select = {},
    withoutLimitPagination = false,
    returnValue,
    QParams,
    table,
    paramsException = "",
    distinct = [],
  }: args & { distinct?: string[]; paramsException?: string },
): Promise<any> => {
  try {
    const dbTable = table || findTable(req);
    const url = new URL(req.url).search.substring(1);
    const parsedParams: any = QParams || qs.parse(url);

    if (paramsException && parsedParams[paramsException]) {
      delete parsedParams[paramsException];
    }

    const { page, take, include: QInclude, ...query } = parsedParams;
    const params: any = {
      where: where.AND
        ? { AND: [where.AND, parseFilter(query)] }
        : mergeObjects(parseFilter(query), where),
    };

    if (!withoutLimitPagination || (page && take)) {
      params.skip = (parseInt(page || 1) - 1) * parseInt(take || 10);
      params.take = parseInt(take || 10);
    }
    completeParams({
      params,
      select,
      include: include || parseInclude(QInclude),
    });
    sortingDataWithParams(query.sort, params);
    const [data, count] = await Promise.all([
      prismaAny[dbTable].findMany(!!distinct?.length ? { distinct, ...params } : params),
      prismaAny[dbTable].count({ where: params.where }),
    ]);

    const result = {
      data,
      meta: {
        count,
        take: take || (withoutLimitPagination ? count : 10),
        page: page || 1,
        pageCount: Math.ceil(count / (take || (withoutLimitPagination ? count : 10))),
      },
    };
    if (returnValue) {
      return result;
    }
    return NextResponse.json(result);
  } catch (error: any) {
    if (returnValue) {
      throw new Error(`${error?.status || "500"}-${error?.message || "something went wrong"}`);
    }
    return handleError(error);
  }
};

export const READ = async (
  req: NextRequest,
  { params: p, include = {}, select = {}, where, returnValue, table, key = "id" }: args,
) => {
  try {
    const dbTable = table || findTable(req);
    const pStore = await p;
    const id = pStore.id;
    const params = { where: where || { [key]: id } };
    completeParams({ params, select, include });
    const result = await prismaAny[dbTable].findFirstOrThrow(params);
    if (returnValue) {
      return result;
    }
    return NextResponse.json(result);
  } catch (error: any) {
    if (returnValue) {
      throw new Error(`${error?.status || "500"}-${error?.message || "something went wrong"}`);
    }
    return handleError(error);
  }
};

export const UPDATE = async (
  req: NextRequest,
  { params: p, include = {}, select = {}, where = {}, returnValue, body, table, key = "id" }: args,
) => {
  try {
    const { id } = await p;
    const dbTable = table || findTable(req);
    const params = {
      where: { ...where, [key]: id },
      data: body || (await req.json()),
    };
    completeParams({ params, select, include });
    const result = await prismaAny[dbTable].update(params);
    if (returnValue) {
      return result;
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
};

export const REMOVE = async (
  req: NextRequest,
  { params: p, table, key = "id", returnValue }: args,
) => {
  try {
    const dbTable = table || findTable(req);
    const pStore = await p;

    const where: any = {
      [key]: pStore.id,
    };

    const result = await prismaAny[dbTable].delete({ where });
    if (returnValue) {
      return result;
    }
    return NextResponse.json(result);
  } catch (error) {
    if (returnValue) {
      throw error;
    }
    return handleError(error);
  }
};

export const DEACTIVATE = async (req: NextRequest, { params, table }: args) => {
  try {
    const dbTable = table || findTable(req);
    const data = {
      where: { id: params.id },
      data: { active: false },
    };
    const result = await prismaAny[dbTable].update(data);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
};
