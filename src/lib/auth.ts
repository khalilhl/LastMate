import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import { UserRole } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lastmate-super-secret-jwt-key-valorant-2026-production-ready"
);

export const COOKIE_NAME = "lastmate_token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export async function createSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionUserFromToken(token: string) {
  const verified = await verifySessionToken(token);
  if (!verified?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: verified.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        riotId: true,
        rank: true,
        mainRole: true,
        preferredServer: true,
        languages: true,
        discordUsername: true,
        bio: true,
        role: true,
        status: true,
        banReason: true,
        suspendedUntil: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // Check account status: if banned or actively suspended
    if (user.status === "BANNED") {
      return null;
    }

    if (user.status === "SUSPENDED" && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error retrieving user from session token:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await getSessionUserFromToken(token);
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return await getSessionUserFromToken(token);
}

// RBAC Role Rank: SUPER_ADMIN (3) > ADMIN (2) > MODERATOR (1) > USER (0)
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  MODERATOR: 1,
  USER: 0,
};

export function hasRolePermission(userRole: string, requiredRole: UserRole): boolean {
  const userRank = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userRank >= requiredRank;
}

export function isStaffRole(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "MODERATOR";
}

export async function requireAdmin(
  req: NextRequest,
  requiredRole: UserRole = "MODERATOR"
) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (!isStaffRole(user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  if (!hasRolePermission(user.role, requiredRole)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Forbidden: This action requires at least ${requiredRole} rank.` },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

export async function logAdminAction({
  adminId,
  adminName,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: {
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: any;
  ipAddress?: string | null;
}) {
  try {
    const stringifiedDetails =
      typeof details === "string" ? details : details ? JSON.stringify(details) : null;

    await prisma.adminLog.create({
      data: {
        adminId,
        adminName,
        action,
        targetType,
        targetId: targetId || null,
        details: stringifiedDetails,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Failed to write to admin audit log:", err);
  }
}
