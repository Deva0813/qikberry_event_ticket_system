import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { jwtExpiresIn, jwtSecret } from '../config/env.ts';
import { mysqlClient } from "../config/prismaClient.ts";
import { type User } from "../generated/mysql-client/index.js";
import ApiError from '../utils/error.ts';

const SALT_ROUNDS = 12;

function signToken(user: User) {
  if (!jwtSecret) throw new ApiError(500, 'JWT secret is not configured');
  if (!jwtExpiresIn) throw new ApiError(500, 'JWT expiration is not configured');

  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn as SignOptions['expiresIn'] });
}

function toSafeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function register({ name, email, password }: { name: string, email: string, password: string }) {
  const existing = await mysqlClient.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email is already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await mysqlClient.user.create({
    data: { name, email, passwordHash },
  });

  return { user: toSafeUser(user), token: signToken(user) };
}

async function login({ email, password }: { email: string, password: string }) {
  const user = await mysqlClient.user.findUnique({ where: { email } });

  if (!user) throw new ApiError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  return { user: toSafeUser(user), token: signToken(user) };
}

export default { login, register, toSafeUser };

