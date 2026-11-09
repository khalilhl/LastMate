import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, COOKIE_NAME, isStaffRole, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: identifier.trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your login info." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your login info." },
        { status: 401 }
      );
    }

    // Ban and Suspension Checks
    if (user.status === "BANNED") {
      return NextResponse.json(
        {
          error: `Your account has been permanently suspended. Reason: ${
            user.banReason || "Violation of community rules"
          }`,
        },
        { status: 403 }
      );
    }

    if (
      user.status === "SUSPENDED" &&
      user.suspendedUntil &&
      new Date(user.suspendedUntil) > new Date()
    ) {
      return NextResponse.json(
        {
          error: `Your account is temporarily suspended until ${new Date(
            user.suspendedUntil
          ).toLocaleString()}`,
        },
        { status: 403 }
      );
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // If admin or moderator logs in, log action in audit trail
    if (isStaffRole(user.role)) {
      await logAdminAction({
        adminId: user.id,
        adminName: user.username,
        action: "ADMIN_LOGIN",
        targetType: "Auth",
        targetId: user.id,
        details: `Staff member ${user.username} (${user.role}) authenticated.`,
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      riotId: user.riotId,
      rank: user.rank,
      mainRole: user.mainRole,
      preferredServer: user.preferredServer,
      languages: user.languages,
      discordUsername: user.discordUsername,
      bio: user.bio,
      role: user.role,
      status: user.status,
      lastLoginAt: new Date(),
      createdAt: user.createdAt,
    };

    const res = NextResponse.json(
      { success: true, user: safeUser, message: "Logged in successfully" },
      { status: 200 }
    );

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
