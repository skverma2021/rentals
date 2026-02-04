Authentication Implementation Summary

1. Schema Updates (schema.prisma)
Added agencies model - tenant organizations that subscribe to the app
Added authUsers model - pre-authorized users with email, role, OAuth provider info
Added agencyId field to all data models for multi-tenant isolation

2. Installed NextAuth.js
npm install next-auth@beta

3. Auth Configuration (auth.ts)
Configured GitHub and Google OAuth providers
signIn callback: Checks if email exists in authUsers table
jwt callback: Adds agencyId, role, user details to token
session callback: Exposes agency info to client

4. API Route (src/app/api/auth/[...nextauth]/route.ts)
NextAuth.js handler for OAuth callbacks

5. TypeScript Types (next-auth.d.ts)
Extended Session and JWT types with agencyId, role, etc.

6. UI Pages
page.tsx - Sign-in page with GitHub/Google buttons
page.tsx - Error page for unauthorized users

7. Route Protection (proxy.ts)
Replaced deprecated middleware.ts with proxy.ts (Next.js 16 convention)
Uses getToken() from next-auth/jwt for Edge Runtime compatibility
Redirects unauthenticated users to sign-in page

8. Session Provider (AuthProvider.tsx)
Wraps app with SessionProvider for client-side session access

9. Navbar Updates (Navbar.tsx)
Displays logged-in user name, agency, and role
Added sign-out button

10. API Route Updates (all routes in api)
Added auth() check to verify session
Added agencyId filtering to all queries
Returns 401 Unauthorized if not authenticated
Data isolation: Users only see their agency's data

11. Seed Data (seed.ts)
Creates agencies, authorized users, and reference data
User's email must be in authUsers table to log in

12. Environment Variables (.env.local)
AUTH_SECRET=<random-secret>
GITHUB_CLIENT_ID=<from-github>
GITHUB_CLIENT_SECRET=<from-github>
NEXTAUTH_URL=http://localhost:3000

Authentication Flow
User visits any page → proxy.ts checks for token
No token → redirect to /auth/signin
User clicks "Sign in with GitHub" → GitHub OAuth
Callback returns email → signIn callback checks authUsers table
Email found & active → JWT created with agencyId and role
All API calls filter data by session.user.agencyId