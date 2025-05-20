"use client";

import { AuthButton } from "../components/AuthentificationButton";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl mb-4">Please sign in with Google</h1>
      <AuthButton />
    </div>
  );
}
