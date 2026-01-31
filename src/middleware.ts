import { withAuth } from "next-auth/middleware";

// This is the default export Next.js is looking for
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Define which routes are protected. 
// Any page matching these paths will require a login.
export const config = { 
  matcher: [
    "/",            // Dashboard
    "/inventory",   // Warehouse
    "/billing",     // Sales Terminal
  ] 
};