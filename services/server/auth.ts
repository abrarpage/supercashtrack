import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@/lib/generated/prisma/client";

type P = {
  adminOnly?: boolean; // todo: ganti jadi roles utk handle staff
  include?: Prisma.UserInclude;
  ignoreInactive?: boolean;
};
export const restrict = async ({
  adminOnly = false,
  include = {},
  ignoreInactive = false,
}: P = {}) => {
  const headerStore = await headers();
  const auth = headerStore?.get("Authorization");
  const token = auth?.split(" ")?.[1];
  if (!token) throw new Error("404-Unauthorized");
  const decoded: any = verifyJwtToken(token);
  const user = await prisma.user.findFirstOrThrow({
    where: { email: decoded.email },
    include,
  });
  // if (!user.active && !ignoreInactive) throw new Error("You were inactive");
  // if (adminOnly && user.role !== UserRole.ADMIN)
  //   throw new Error("Unauthorized"); //todo: add staff logic
  return user as User;
};

export function signJwtToken(payload: any, options = {}) {
  const secret: any = process.env.AUTH_SECRET;
  const token = jwt.sign(payload, secret, options);
  return token;
}

export function verifyJwtToken(token: string) {
  const secret: any = process.env.AUTH_SECRET;
  const payload = jwt.verify(token, secret);
  return payload;
}
