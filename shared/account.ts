export function getAccountDestination(isAuthenticated: boolean) {
  return isAuthenticated ? "/profile" : "/login";
}

export function getAccountLabel(isAuthenticated: boolean) {
  return isAuthenticated ? "Profile" : "Sign in";
}
