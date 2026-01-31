import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = { 
  /*
   * Match all request paths except for the ones starting with:
   * - api/auth (NextAuth internal routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public images/assets
   */
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)",
  ] 
};