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

    const roles = await db.role.findMany({
      include: {
        userRoles: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const rolesWithUserCount = roles.map(role => ({
      ...role,
      userCount: role.userRoles.length,
    }));

    // Mock data for demonstration
    const mockRoles = [
      {
        id: "1",
        name: "Super Admin",
        description: "Full system access with all permissions",
        permissions: JSON.stringify(["user:create", "user:read", "user:update", "user:delete", "role:manage", "system:manage"]),
        isSystem: true,
        userCount: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Admin",
        description: "Administrative access with limited permissions",
        permissions: JSON.stringify(["user:read", "user:update", "course:manage", "product:manage"]),
        isSystem: true,
        userCount: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Content Manager",
        description: "Manage content and resources",
        permissions: JSON.stringify(["course:create", "course:read", "course:update", "resource:manage"]),
        isSystem: false,
        userCount: 3,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Support",
        description: "Customer support and user management",
        permissions: JSON.stringify(["user:read", "user:update", "ticket:manage"]),
        isSystem: false,
        userCount: 4,
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(mockRoles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, permissions, isSystem } = await request.json();

    const role = await db.role.create({
      data: {
        name,
        description,
        permissions: JSON.stringify(permissions),
        isSystem: isSystem || false,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}