// lib/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma'; // Your prisma instance
import { comparePassword } from '@/lib/auth'; // Your password comparison function

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null; // Or throw an error
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && await comparePassword(credentials.password, user.password)) {
            // Return user object without password
            // Any object returned will be saved in `user` property of the JWT
            console.log('User authorized:', user.email);
            return {
              id: user.id.toString(), // Convert ID to string for JWT standard
              email: user.email,
              name: user.name,
              // Add any other user properties you want in the token/session, EXCEPT password
            };
          } else {
            console.log('Invalid credentials for:', credentials.email);
            // If you return null then an error will be displayed advising the user to check their details.
            return null;
            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
            // throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.error("Error during authorization:", error);
          return null; // Or throw an error
        }
      }
    })
    // ...add more providers here if needed (Google, GitHub, etc.)
  ],

  // Use JWT strategy for sessions
  session: {
    strategy: 'jwt',
  },

  // Secret for signing JWTs (required for production)
  // Generate one with: openssl rand -base64 32
  // Add this to your .env file as NEXTAUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET,

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  callbacks: {
    // Called whenever a JWT is created or updated.
    async jwt({ token, user }) {
      // If user object exists (initial sign in), add user id to the token
      if (user) {
        token.id = user.id;
        // You could add other safe properties like roles here if needed
      }
      return token;
    },
    // Called whenever a session is checked.
    async session({ session, token }) {
      // Add property 'id' from token to the session object
      if (token?.id && session.user) {
        // Ensure session.user exists before assigning to it
        session.user.id = token.id as string;
      }
      // You might want to ensure name/email are up-to-date here if they can change
      // session.user.name = token.name; // Already included by default if in user obj from authorize
      // session.user.email = token.email; // Already included by default
      return session;
    }
  },

  // Custom pages (optional)
  pages: {
    signIn: '/login', // Redirect users to your custom login page
    // error: '/auth/error', // Error code passed in query string as ?error=
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },

  // Enable debug messages in the console if you are having problems
  debug: process.env.NODE_ENV === 'development',
};
