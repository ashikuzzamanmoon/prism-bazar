import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { PrismaService } from 'src/prisma/prisma';

@Injectable()
export class AnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper function to get month-year string
   */
  private getMonthYearString(date: Date): string {
    return date.toISOString().slice(0, 7); // YYYY-MM format
  }

  /**
   * Helper function to get last 12 months
   */
  private getLast12Months(): { month: string; date: Date }[] {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      months.push({
        month: this.getMonthYearString(date),
        date,
      });
    }
    return months;
  }

  /**
   * Helper function to calculate trend (up/down/stable)
   */
  private calculateTrend(current: number, previous: number): {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  } {
    if (previous === 0) {
      return {
        direction: current > 0 ? 'up' : 'stable',
        percentage: current > 0 ? 100 : 0,
      };
    }
    const percentage = ((current - previous) / previous) * 100;
    return {
      direction: percentage > 2 ? 'up' : percentage < -2 ? 'down' : 'stable',
      percentage: Math.round(percentage * 10) / 10,
    };
  }

  /**
   * Get monthly order data for graph visualization
   */
  async getMonthlyOrderData() {
    const last12Months = this.getLast12Months();
    const monthlyOrders: any[] = [];

    for (let i = 0; i < last12Months.length; i++) {
      const currentMonth = last12Months[i];
      const nextMonthDate =
        i < last12Months.length - 1
          ? last12Months[i + 1].date
          : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

      const orderCount = await this.prisma.order.count({
        where: {
          createdAt: {
            gte: currentMonth.date,
            lt: nextMonthDate,
          },
        },
      });

      const monthData: any = {
        month: currentMonth.month,
        count: orderCount,
        displayMonth: currentMonth.date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
      };

      // Calculate trend if not first month
      if (i > 0) {
        const previousCount = monthlyOrders[i - 1].count;
        const trend = this.calculateTrend(orderCount, previousCount);
        monthData.trend = trend.direction;
        monthData.trendPercentage = trend.percentage;
      }

      monthlyOrders.push(monthData);
    }

    return monthlyOrders;
  }

  /**
   * Get monthly revenue data for graph visualization
   */
  async getMonthlyRevenueData() {
    const last12Months = this.getLast12Months();
    const monthlyRevenue: any[] = [];

    for (let i = 0; i < last12Months.length; i++) {
      const currentMonth = last12Months[i];
      const nextMonthDate =
        i < last12Months.length - 1
          ? last12Months[i + 1].date
          : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

      const revenueData = await this.prisma.transaction.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: {
            gte: currentMonth.date,
            lt: nextMonthDate,
          },
        },
        _sum: { amount: true },
      });

      const revenue = Number(revenueData._sum.amount) || 0;

      const monthData: any = {
        month: currentMonth.month,
        revenue: revenue,
        displayMonth: currentMonth.date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
      };

      // Calculate trend if not first month
      if (i > 0) {
        const previousRevenue = monthlyRevenue[i - 1].revenue;
        const trend = this.calculateTrend(revenue, previousRevenue);
        monthData.trend = trend.direction;
        monthData.trendPercentage = trend.percentage;
      }

      monthlyRevenue.push(monthData);
    }

    return monthlyRevenue;
  }

  async getDashboardAnalytics() {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      ordersByStatus,
      paymentsByStatus,
      topProducts,
      recentOrders,
      totalPromoCodeUsage,
      monthlyOrderData,
      monthlyRevenueData,
    ] = await Promise.all([
      // Total products count
      this.prisma.product.count({ where: { isDeleted: false, isPublish: true } }),

      // Total orders count
      this.prisma.order.count(),

      // Total users count
      this.prisma.user.count(),

      // Total revenue from successful transactions
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),

      // Successful transactions count
      this.prisma.transaction.count({
        where: { status: 'SUCCESS' },
      }),

      // Failed transactions count
      this.prisma.transaction.count({
        where: { status: 'FAILED' },
      }),

      // Pending transactions count
      this.prisma.transaction.count({
        where: { status: 'PENDING' },
      }),

      // Orders breakdown by status
      this.prisma.order.groupBy({
        by: ['orderStatus'],
        _count: true,
      }),

      // Payment breakdown by status
      this.prisma.transaction.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Top 5 best selling products
      this.prisma.product.findMany({
        where: { isDeleted: false, isPublish: true },
        select: {
          id: true,
          title: true,
          slug: true,
          sold: true,
          price: true,
          ratings: true,
          reviewsCount: true,
          productImages: {
            take: 1,
            select: { url: true },
          },
        },
        orderBy: { sold: 'desc' },
        take: 5,
      }),

      // Recent 5 orders
      this.prisma.order.findMany({
        select: {
          id: true,
          traxId: true,
          name: true,
          email: true,
          totalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Total promo code usage
      this.prisma.order.aggregate({
        where: { promoCodeId: { not: null } },
        _count: true,
      }),

      // Monthly order data
      this.getMonthlyOrderData(),

      // Monthly revenue data
      this.getMonthlyRevenueData(),
    ]);

    return {
      summary: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        generatedAt: new Date().toISOString(),
      },
      orderAnalysis: {
        byStatus: ordersByStatus.map((item) => ({
          status: item.orderStatus,
          count: item._count,
        })),
      },
      paymentAnalysis: {
        byStatus: paymentsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
      },
      topProducts: topProducts.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        sold: product.sold,
        price: product.price,
        ratings: product.ratings,
        reviewsCount: product.reviewsCount,
        image: product.productImages[0]?.url || null,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        traxId: order.traxId,
        customerName: order.name,
        email: order.email,
        amount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        customer: order.user
          ? {
              id: order.user.id,
              name: order.user.name,
              profilePicture: order.user.profilePicture,
            }
          : null,
      })),
      promoCodeAnalysis: {
        totalUsed: totalPromoCodeUsage._count,
      },
      monthlyOrderTrend: {
        label: 'Monthly Orders (Last 12 Months)',
        data: monthlyOrderData,
        currentMonth: monthlyOrderData[monthlyOrderData.length - 1],
      },
      monthlyRevenueTrend: {
        label: 'Monthly Revenue (Last 12 Months)',
        data: monthlyRevenueData,
        currentMonth: monthlyRevenueData[monthlyRevenueData.length - 1],
      },
    };
  }
}
