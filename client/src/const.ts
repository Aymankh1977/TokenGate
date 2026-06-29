export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login is now handled in-app (email/password). All "Sign In" links and the
// auth guard point here instead of the Manus OAuth portal.
export const getLoginUrl = () => "/login";
