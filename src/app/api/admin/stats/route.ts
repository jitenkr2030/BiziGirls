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

    const [
      totalUsers,
      activeUsers,
      totalCourses,
      totalProducts,
      totalRevenue
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.course.count(),
      db.product.count(),
      db.payment.aggregate({
        where: { status: "succeeded" },
        _sum: { amount: true }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalCourses,
      totalProducts,
      totalRevenue: totalRevenue._sum.amount || 0,
      systemUptime: "99.9%"
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}