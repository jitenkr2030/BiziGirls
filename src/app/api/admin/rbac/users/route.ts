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

    const users = await db.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mock data for demonstration
    const mockUsers = [
      {
        id: "1",
        email: "admin@girlspreneur.com",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "admin",
        isActive: true,
        roles: [
          {
            id: "1",
            name: "Super Admin",
            description: "Full system access with all permissions",
            isSystem: true,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "manager@girlspreneur.com",
        firstName: "Emily",
        lastName: "Davis",
        role: "admin",
        isActive: true,
        roles: [
          {
            id: "2",
            name: "Admin",
            description: "Administrative access with limited permissions",
            isSystem: true,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        email: "content@girlspreneur.com",
        firstName: "Lisa",
        lastName: "Wilson",
        role: "entrepreneur",
        isActive: true,
        roles: [
          {
            id: "3",
            name: "Content Manager",
            description: "Manage content and resources",
            isSystem: false,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        email: "support@girlspreneur.com",
        firstName: "Maria",
        lastName: "Garcia",
        role: "entrepreneur",
        isActive: true,
        roles: [
          {
            id: "4",
            name: "Support",
            description: "Customer support and user management",
            isSystem: false,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}