"use client";

import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";

const authBaseURL =
  typeof window === "undefined"
    ? "http://localhost:3000/api/auth"
    : `${window.location.origin}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [stripeClient({ subscription: true })],
});
