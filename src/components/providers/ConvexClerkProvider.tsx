
"use client";

import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";



const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);



export default function ConvexClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth as any}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}