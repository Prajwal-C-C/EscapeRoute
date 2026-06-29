import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/?showLogin=true", // If a user is not logged in, send them here
  },
});

export const config = { 
  // This explicitly locks down the main dashboard AND any pages inside it
  matcher: ["/dashboard", "/dashboard/:path*"] 
};