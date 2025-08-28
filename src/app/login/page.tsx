"use client";
import { FormEvent, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo");

  if (session?.user) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          Signed in as {session.user.email}
        </h1>
        <div className="flex gap-3">
          <Link
            className="underline"
            href={`/hos/${new Date().toISOString().slice(0, 10)}`}>
            Go to today’s HOS
          </Link>
          <button className="border px-3 py-1" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await signIn("credentials", { email, password, callbackUrl: "/login" });
  }

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4 max-w-sm">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <input
        className="border w-full p-2"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border w-full p-2"
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="border px-3 py-1" type="submit">
        Sign in (password: demo)
      </button>
    </form>
  );
}
