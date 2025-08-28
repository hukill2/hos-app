import jwt from "jsonwebtoken";
import { auth } from "./auth";

export async function proxyFetch(path: string, init?: RequestInit) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const token = jwt.sign(
    { sub: session.user.id, role: session.user.role },
    process.env.PROXY_JWT_SECRET!,
    { expiresIn: "5m" }
  );

  const url = `${process.env.PROXY_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}
