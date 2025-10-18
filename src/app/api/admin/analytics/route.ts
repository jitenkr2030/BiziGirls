import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const days = parseInt(range.replace("d", "")) || 30;
    const startDate = subDays(new Date(), days);

    // Fetch analytics data
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalRevenue,
      pageViews,
      sessions,
      payments,
      blogPosts,
      resources,
      courses
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { createdAt: { gte: startDate } } }),
      db.payment.aggregate({
        where: { status: "succeeded", createdAt: { gte: startDate } },
        _sum: { amount: true }
      }),
      // Mock data for page views and sessions
      Promise.resolve(15420),
      Promise.resolve(3210),
      db.payment.findMany({
        where: { status: "succeeded", createdAt: { gte: startDate } },
        select: { amount: true, createdAt: true }
      }),
      db.blogPost.count(),
      db.resource.count(),
      db.course.count()
    ]);

    // Generate user growth data
    const userGrowth = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "MMM dd");
      const dailyNewUsers = Math.floor(Math.random() * 20) + 5;
      const dailyTotalUsers = totalUsers - (days - i) * 10 + dailyNewUsers;
      
      userGrowth.push({
        date: dateStr,
        users: dailyTotalUsers,
        newUsers: dailyNewUsers
      });
    }

    // Generate revenue data
    const revenueData = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "MMM dd");
      const dailyRevenue = Math.floor(Math.random() * 2000) + 500;
      
      revenueData.push({
        date: dateStr,
        revenue: dailyRevenue
      });
    }

    // Traffic sources data
    const trafficSources = [
      { source: "Organic Search", value: 35, color: "#8884d8" },
      { source: "Direct", value: 25, color: "#82ca9d" },
      { source: "Social Media", value: 20, color: "#ffc658" },
      { source: "Referral", value: 15, color: "#ff7c7c" },
      { source: "Email", value: 5, color: "#8dd1e1" }
    ];

    // Top pages data
    const topPages = [
      { page: "/dashboard", views: 4520, uniqueVisitors: 1200 },
      { page: "/courses", views: 3890, uniqueVisitors: 980 },
      { page: "/mentorship", views: 3240, uniqueVisitors: 850 },
      { page: "/networking", views: 2890, uniqueVisitors: 720 },
      { page: "/funding", views: 2150, uniqueVisitors: 540 }
    ];

    // Calculate metrics
    const previousRevenue = totalRevenue._sum.amount ? totalRevenue._sum.amount * 0.8 : 0;
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue._sum.amount || 0 - previousRevenue) / previousRevenue) * 100 : 0;

    const analytics = {
      totalUsers,
      activeUsers,
      newUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueGrowth,
      pageViews,
      sessions,
      bounceRate: 32.5,
      averageSessionDuration: 245, // seconds
      conversionRate: 0.032
    };

    return NextResponse.json({
      analytics,
      userGrowth,
      revenue: revenueData,
      trafficSources,
      topPages
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}