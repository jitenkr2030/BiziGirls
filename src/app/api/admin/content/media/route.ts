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

    const mediaFiles = await db.mediaFile.findMany({
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mock data for demonstration
    const mockMediaFiles = [
      {
        id: "1",
        filename: "hero-banner.jpg",
        originalName: "hero-banner.jpg",
        filePath: "/uploads/hero-banner.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
        altText: "Hero banner for homepage",
        caption: "Welcome to GirlsPreneur platform",
        description: "Main hero banner image",
        category: "image",
        tags: JSON.stringify(["banner", "homepage", "hero"]),
        isPublic: true,
        usageCount: 15,
        uploader: {
          firstName: "Sarah",
          lastName: "Johnson",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        filename: "intro-video.mp4",
        originalName: "platform-intro.mp4",
        filePath: "/uploads/intro-video.mp4",
        fileSize: 5120000,
        mimeType: "video/mp4",
        altText: "Platform introduction video",
        caption: "Welcome video for new users",
        description: "Introduction video explaining platform features",
        category: "video",
        tags: JSON.stringify(["video", "intro", "welcome"]),
        isPublic: true,
        usageCount: 8,
        uploader: {
          firstName: "Emily",
          lastName: "Davis",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: "3",
        filename: "podcast-episode-1.mp3",
        originalName: "women-in-business-ep1.mp3",
        filePath: "/uploads/podcast-episode-1.mp3",
        fileSize: 2560000,
        mimeType: "audio/mpeg",
        altText: "Women in business podcast episode 1",
        caption: "First episode of our podcast series",
        description: "Interview with successful women entrepreneurs",
        category: "audio",
        tags: JSON.stringify(["podcast", "interview", "business"]),
        isPublic: true,
        usageCount: 12,
        uploader: {
          firstName: "Lisa",
          lastName: "Wilson",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: "4",
        filename: "guide-pdf.pdf",
        originalName: "startup-guide.pdf",
        filePath: "/uploads/guide-pdf.pdf",
        fileSize: 2048000,
        mimeType: "application/pdf",
        altText: "Startup guide document",
        caption: "Complete guide for starting a business",
        description: "Comprehensive PDF guide for women entrepreneurs",
        category: "document",
        tags: JSON.stringify(["guide", "pdf", "startup"]),
        isPublic: true,
        usageCount: 25,
        uploader: {
          firstName: "Maria",
          lastName: "Garcia",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        id: "5",
        filename: "team-photo.jpg",
        originalName: "team-members.jpg",
        filePath: "/uploads/team-photo.jpg",
        fileSize: 1536000,
        mimeType: "image/jpeg",
        altText: "Team photo",
        caption: "Our amazing team members",
        description: "Photo of the GirlsPreneur team",
        category: "image",
        tags: JSON.stringify(["team", "photo", "about"]),
        isPublic: true,
        usageCount: 6,
        uploader: {
          firstName: "Sarah",
          lastName: "Johnson",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      },
    ];

    return NextResponse.json(mockMediaFiles);
  } catch (error) {
    console.error("Error fetching media files:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string;
    const caption = formData.get("caption") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Upload the file to a storage service (S3, Cloudinary, etc.)
    // 2. Save the file metadata to the database
    // 3. Return the saved file record

    const mediaFile = await db.mediaFile.create({
      data: {
        filename: file.name,
        originalName: file.name,
        filePath: `/uploads/${file.name}`,
        fileSize: file.size,
        mimeType: file.type,
        altText,
        caption,
        description,
        category,
        tags,
        uploadedBy: session.user.id,
      },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(mediaFile);
  } catch (error) {
    console.error("Error uploading media file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}