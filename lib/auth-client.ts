"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // No baseURL → defaults to same origin (window.location.origin in the
  // browser). Avoids env-driven URL drift between localhost / Vercel previews
  // / production.
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        phone: { type: "string", required: false },
      },
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
