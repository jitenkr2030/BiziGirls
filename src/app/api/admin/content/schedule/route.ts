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

    const schedules = await db.contentSchedule.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    // Mock data for demonstration
    const mockSchedules = [
      {
        id: "1",
        title: "Weekly Newsletter - March Edition",
        description: "Monthly newsletter with platform updates and featured content",
        contentType: "newsletter",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
        status: "scheduled",
        platforms: JSON.stringify(["email", "website"]),
        author: {
          firstName: "Sarah",
          lastName: "Johnson",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Blog Post: Women in Tech Leadership",
        description: "Interview with successful women tech leaders",
        contentType: "blog_post",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
        status: "scheduled",
        platforms: JSON.stringify(["website", "social_media"]),
        author: {
          firstName: "Emily",
          lastName: "Davis",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Social Media: Success Story Friday",
        description: "Weekly success story showcase",
        contentType: "social_media",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours from now
        status: "scheduled",
        platforms: JSON.stringify(["social_media"]),
        author: {
          firstName: "Lisa",
          lastName: "Wilson",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        title: "Monthly Platform Updates",
        description: "Monthly newsletter with platform updates",
        contentType: "newsletter",
        scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: "published",
        platforms: JSON.stringify(["email"]),
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        author: {
          firstName: "Maria",
          lastName: "Garcia",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "5",
        title: "Failed Newsletter Send",
        description: "Newsletter that failed to send",
        contentType: "newsletter",
        scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        status: "failed",
        platforms: JSON.stringify(["email"]),
        errorMessage: "Failed to connect to email service",
        author: {
          firstName: "Sarah",
          lastName: "Johnson",
        },
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(mockSchedules);
  } catch (error) {
    console.error("Error fetching content schedules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, contentType, scheduledFor, platforms, metadata } = await request.json();

    const schedule = await db.contentSchedule.create({
      data: {
        title,
        description,
        contentType,
        scheduledFor: new Date(scheduledFor),
        platforms: JSON.stringify(platforms),
        metadata: JSON.stringify(metadata),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error creating content schedule:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}