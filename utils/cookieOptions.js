// Common base options
const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  signed: true,
};

// Access token cookie (short-lived, optional if you want to store it in cookies)
export const accessCookieOptions = {
  ...baseCookieOptions,
  path: "/", // accessible across your app
  maxAge: 60 * 60 * 1000, // 1 hour
};

// Refresh token cookie (long-lived, only used by server for silent refresh)
export const refreshCookieOptions = {
  ...baseCookieOptions,
  path: "/api/v1/user/refresh-token", // narrower scope for security
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
