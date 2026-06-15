"use server"

import { prisma } from "@/lib/prisma"
import { cacheAside } from "@/lib/cache"
import {
  getStudentPetSnapshots,
  type StudentPetSnapshot,
} from "@/app/actions/pet-snapshot"

export interface PocketKPI {
  postCount: number
  postChange: string
  commentCount: number
  commentChange: string
  aiConsultCount: number
  aiConsultChange: string
  appointmentCount: number
  appointmentChange: string
}

export interface PocketPost {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  content: string
  likes: number
  comments: number
  shares: number
  timeAgo: string
}

export interface HourlyDistribution {
  hour: string
  count: number
}

export interface PocketDataRecord {
  kpis: PocketKPI
  posts: PocketPost[]
  petsByStudentId: Record<string, StudentPetSnapshot>
  hourlyDist: HourlyDistribution[]
}

/**
 * 获取小程序数据记录
 */
export async function getPocketDataRecords(): Promise<PocketDataRecord> {
  return cacheAside(
    "pocket:records:v3",
    async () => {
      // 模拟 KPI 数据（实际应从数据库聚合查询）
      const kpis: PocketKPI = {
        postCount: 1284,
        postChange: "+12%本周",
        commentCount: 3567,
        commentChange: "+8%本周",
        aiConsultCount: 892,
        aiConsultChange: "+23%本周",
        appointmentCount: 46,
        appointmentChange: "+5%本周",
      }

      // 获取心墙帖子
      const posts = await prisma.post.findMany({
        include: {
          author: { select: { id: true, name: true, className: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })

      const now = new Date()
      const pocketPosts: PocketPost[] = posts.map((post) => {
        const diff = now.getTime() - post.createdAt.getTime()
        const minutes = Math.floor(diff / 60000)
        let timeAgo = ""
        if (minutes < 60) timeAgo = `${minutes}分钟前`
        else if (minutes < 1440) timeAgo = `${Math.floor(minutes / 60)}小时前`
        else timeAgo = `${Math.floor(minutes / 1440)}天前`

        return {
          id: post.id,
          studentId: post.author.id,
          studentName: post.author.name,
          studentClass: post.author.className,
          content: post.content,
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          shares: post.viewCount || 0,
          timeAgo,
        }
      })
      const petsByStudentId = await getStudentPetSnapshots(
        pocketPosts.map((post) => post.studentId),
      )

      // 模拟时段分布数据（实际应从数据库聚合）
      const hourlyDist: HourlyDistribution[] = [
        { hour: "8时", count: 120 },
        { hour: "12时", count: 350 },
        { hour: "18时", count: 480 },
        { hour: "22时", count: 280 },
      ]

      return {
        kpis,
        posts: pocketPosts,
        petsByStudentId,
        hourlyDist,
      }
    },
    300 // 5 分钟 TTL
  )
}
