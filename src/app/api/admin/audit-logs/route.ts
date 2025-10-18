import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      db.auditLog.count(),
    ]);

    // Generate mock data for demonstration
    const mockLogs = [
      {
        id: "1",
        action: "login",
        resourceType: "user",
        status: "success",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        createdAt: new Date().toISOString(),
        user: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      },
      {
        id: "2",
        action: "create",
        resourceType: "course",
        resourceId: "course-123",
        status: "success",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        user: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
        },
      },
      {
        id: "3",
        action: "update",
        resourceType: "user",
        resourceId: "user-456",
        status: "success",
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        user: {
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
        },
      },
      {
        id: "4",
        action: "delete",
        resourceType: "product",
        resourceId: "product-789",
        status: "success",
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        user: {
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike@example.com",
        },
      },
      {
        id: "5",
        action: "login",
        resourceType: "user",
        status: "failed",
        errorMessage: "Invalid credentials",
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0",
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ];

    return NextResponse.json({
      logs: mockLogs,
      total: mockLogs.length,
      page,
      limit,
      totalPages: Math.ceil(mockLogs.length / limit),
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, resourceType, resourceId, status, errorMessage, ipAddress, userAgent } = await request.json();

    const auditLog = await db.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId,
        status,
        errorMessage,
        ipAddress,
        userAgent,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(auditLog);
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}