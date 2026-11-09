import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));

    const where: any = {};

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { adminName: { contains: q } },
        { action: { contains: q } },
        { targetType: { contains: q } },
        { details: { contains: q } },
      ];
    }

    if (action && action !== "all") {
      where.action = action;
    }

    const [total, logs] = await Promise.all([
      prisma.adminLog.count({ where }),
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin logs GET error:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

