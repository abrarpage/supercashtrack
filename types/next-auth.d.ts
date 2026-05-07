import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    /** Minted in Credentials `authorize`; OAuth users get JWT in `jwt` callback. */
    access_token?: string;
  }

  interface Session {
    user: {
      id: string;
      publicId: string | null;
    } & DefaultSession["user"];
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    publicId?: string | null;
    access_token?: string;
  }
}
