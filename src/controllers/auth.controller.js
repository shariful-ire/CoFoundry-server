import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, setTokenCookie, clearTokenCookie } from '../config/auth.js';
import { verifyJWT } from '../config/auth.js';

const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

/* POST /api/auth/register */
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    if (!['founder', 'collaborator'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    if (!PW_REGEX.test(password))
      return res.status(400).json({ message: 'Password must be 6+ chars with uppercase and lowercase' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });

    const token = await signToken({ userId: user._id.toString(), role: user.role, isPremium: user.isPremium });
    setTokenCookie(res, token);

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* POST /api/auth/login */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBlocked)
      return res.status(403).json({ message: 'Your account has been suspended' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = await signToken({ userId: user._id.toString(), role: user.role, isPremium: user.isPremium });
    setTokenCookie(res, token);

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* GET /api/auth/me */
export async function me(req, res) {
  try {
    const token = req.cookies['auth-token'];
    if (!token) return res.status(401).json({ message: 'Unauthenticated' });

    const payload = await verifyJWT(token);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

/* POST /api/auth/signout */
export async function signout(_req, res) {
  clearTokenCookie(res);
  res.json({ message: 'Signed out' });
}
