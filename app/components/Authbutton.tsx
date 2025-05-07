"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button onClick={() => signIn("google", { callbackUrl: "/" })}>
        Sign in with Google
      </button>
    );
  }

  return <button onClick={() => signOut()}>Sign out</button>;
}
