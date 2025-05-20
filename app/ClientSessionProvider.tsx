"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import React, { useEffect } from "react";

export function ClientSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionWatcher />
      {children}
    </SessionProvider>
  );
}

function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (
      session?.error === "RefreshAccessTokenError" ||
      session?.error === "NoRefreshToken"
    ) {
      console.warn("⚠️ Session error — redirecting to login...");
      signOut({ callbackUrl: "/signin" });
    }
  }, [session]);

  return null;
}
