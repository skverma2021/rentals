import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

export async function getAgencyId() {
  const session = await auth();
  if (!session?.user?.agencyId) {
    throw new Error("Not authenticated or missing agency");
  }
  return session.user.agencyId;
}
