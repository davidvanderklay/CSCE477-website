// types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the default User type provided by next-auth
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    // Add your custom property 'id' to the user object
    user?: {
      id: string; // Or number, depending on your user ID type
    } & DefaultSession["user"]; // Keep the default properties
  }

  // Extend the default User type as well (optional, but good practice)
  // This is the shape expected from your database adapter or authorize callback
  interface User extends DefaultUser {
    id: string; // Or number
  }
}

// Extend the JWT type if you are using JWT strategy and adding id to the token
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    id?: string; // Or number - match the type you add in the jwt callback
  }
}
