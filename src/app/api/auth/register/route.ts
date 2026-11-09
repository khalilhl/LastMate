import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, riotId, rank, mainRole, preferredServer } = body;

    // Validation
    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user or email already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { username: username.trim() },
        ],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "This username is already taken." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        riotId: riotId?.trim() || null,
        rank: rank || "Gold 1",
        mainRole: mainRole || "Duelist",
        preferredServer: preferredServer || "Frankfurt (EU Central)",
      },
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
        createdAt: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json(
      { success: true, user, message: "Account created successfully" },
      { status: 201 }
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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong while registering." },
      { status: 500 }
    );
  }
}

