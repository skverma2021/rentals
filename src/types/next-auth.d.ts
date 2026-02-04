import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      agencyId: number;
      agencyName: string;
      role: string;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    agencyId?: number;
    agencyName?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  }
}
