import { Navigate, useLocation, useParams } from "react-router-dom";

/**
 * Redirect a deprecated route path to its /tools/* equivalent, preserving
 * dynamic params, query string, and hash. Bookmarks and email deep links
 * still land where the user expects.
 */
export function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  const params = useParams();
  let target = to;
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") target = target.replace(`:${k}`, v);
  }
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}
