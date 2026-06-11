import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { getCollection, ObjectId, type Doc } from "./store";

const COOKIE = "jiva_session";
const SECRET = process.env.AUTH_SECRET ?? "jiva-space-dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type User = {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  avatar?: string;
  role?: string;
  verified?: boolean;
  favourites?: string[];
  otp?: string;
  otpExpires?: number;
  resetCode?: string;
  resetExpires?: number;
};

const SECRET_FIELDS = [
  "password",
  "otp",
  "otpExpires",
  "resetCode",
  "resetExpires",
] as const;

export type PublicUser = Omit<
  User,
  "_id" | (typeof SECRET_FIELDS)[number]
> & { id: string };

export function toPublicUser(user: User): PublicUser {
  const rest = { ...user } as Record<string, unknown>;
  delete rest._id;
  for (const field of SECRET_FIELDS) delete rest[field];
  return { id: String(user._id), ...rest } as PublicUser;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashed = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  return original.length === hashed.length && timingSafeEqual(original, hashed);
}

function sign(value: string): string {
  const sig = createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
  return `${value}.${sig}`;
}

function unsign(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
  return sig === expected ? value : null;
}

export async function createSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const userId = unsign(token);
  if (!userId || !ObjectId.isValid(userId)) return null;
  const users = await getCollection<User & Doc>("users");
  const user = await users.findOne({ _id: new ObjectId(userId) });
  return (user as User) ?? null;
}

export async function requireUser(): Promise<User | null> {
  return getCurrentUser();
}
