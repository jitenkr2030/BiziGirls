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

    const permissions = await db.permission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mock data for demonstration
    const mockPermissions = [
      {
        id: "1",
        name: "Create Users",
        description: "Ability to create new user accounts",
        resource: "user",
        action: "create",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Read Users",
        description: "Ability to view user information",
        resource: "user",
        action: "read",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Update Users",
        description: "Ability to modify user information",
        resource: "user",
        action: "update",
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Delete Users",
        description: "Ability to remove user accounts",
        resource: "user",
        action: "delete",
        createdAt: new Date().toISOString(),
      },
      {
        id: "5",
        name: "Manage Roles",
        description: "Ability to create and manage roles",
        resource: "role",
        action: "manage",
        createdAt: new Date().toISOString(),
      },
      {
        id: "6",
        name: "Manage System",
        description: "Full system administration access",
        resource: "system",
        action: "manage",
        createdAt: new Date().toISOString(),
      },
      {
        id: "7",
        name: "Create Courses",
        description: "Ability to create new courses",
        resource: "course",
        action: "create",
        createdAt: new Date().toISOString(),
      },
      {
        id: "8",
        name: "Manage Resources",
        description: "Ability to manage platform resources",
        resource: "resource",
        action: "manage",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(mockPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, resource, action } = await request.json();

    const permission = await db.permission.create({
      data: {
        name,
        description,
        resource,
        action,
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error creating permission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}