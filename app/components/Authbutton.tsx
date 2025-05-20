"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: "/",
            prompt: "consent",
            access_type: "offline",
            scope:
              "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          })
        }
      >
        Sign in with Google
      </button>
    );
  }

  return <button onClick={() => signOut()}>Sign out</button>;
}
