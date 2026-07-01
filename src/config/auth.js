import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload, expiresIn) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn ?? process.env.JWT_EXPIRES_IN ?? '7d')
    .sign(secret());
}

export async function verifyJWT(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}

const isProd = process.env.NODE_ENV === 'production';

export function setTokenCookie(res, token) {
  const shared = {
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  };
  res.cookie('auth-token', token, { ...shared, httpOnly: true });
  // Non-HttpOnly companion flag so the client can tell "no session exists"
  // without firing a request that's guaranteed to 401 (avoids console noise
  // for anonymous visitors on every page load).
  res.cookie('has-session', '1', { ...shared, httpOnly: false });
}

export function clearTokenCookie(res) {
  const shared = {
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
  res.clearCookie('auth-token',  { ...shared, httpOnly: true });
  res.clearCookie('has-session', { ...shared, httpOnly: false });
}
