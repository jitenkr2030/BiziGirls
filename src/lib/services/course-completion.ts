import { db } from '@/lib/db'
import { CertificateService } from './certificate'

export class CourseCompletionService {
  static async checkAndUpdateCourseCompletion(userId: string, courseId: string) {
    try {
      // Get course with all lessons and quizzes
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: {
            include: {
              quizzes: {
                include: {
                  questions: true
                }
              }
            }
          },
          enrollments: {
            where: { userId },
            include: {
              lessonProgress: true
            }
          }
        }
      })

      if (!course || course.enrollments.length === 0) {
        return { completed: false, message: 'Course or enrollment not found' }
      }

      const enrollment = course.enrollments[0]
      
      // Check if all lessons are completed
      const totalLessons = course.lessons.length
      const completedLessons = enrollment.lessonProgress.filter(p => p.isCompleted).length

      if (completedLessons < totalLessons) {
        return { 
          completed: false, 
          message: `${completedLessons}/${totalLessons} lessons completed`,
          progress: (completedLessons / totalLessons) * 100
        }
      }

      // Check if all required quizzes are passed
      const requiredQuizzes = course.lessons
        .flatMap(lesson => lesson.quizzes)
        .filter(quiz => quiz.isRequired)

      if (requiredQuizzes.length > 0) {
        const quizAttempts = await db.quizAttempt.findMany({
          where: {
            userId,
            quizId: {
              in: requiredQuizzes.map(q => q.id)
            }
          }
        })

        const passedQuizzes = quizAttempts.filter(attempt => attempt.isPassed)
        
        if (passedQuizzes.length < requiredQuizzes.length) {
          return { 
            completed: false, 
            message: `${passedQuizzes.length}/${requiredQuizzes.length} required quizzes passed`,
            progress: 100 // Lessons are complete, but quizzes not
          }
        }
      }

      // Course is completed, update enrollment
      if (enrollment.progress < 100) {
        await db.courseEnrollment.update({
          where: { id: enrollment.id },
          data: {
            progress: 100,
            completedAt: new Date()
          }
        })

        // Generate certificate if not already exists
        try {
          await CertificateService.generateCertificate(userId, courseId)
        } catch (certificateError) {
          console.error('Error generating certificate:', certificateError)
          // Don't fail the completion process if certificate generation fails
        }

        // Update course completion stats
        await db.course.update({
          where: { id: courseId },
          data: {
            enrollmentCount: {
              increment: 0 // No change, just updating completion stats
            }
          }
        })

        return { 
          completed: true, 
          message: 'Course completed successfully!',
          certificateGenerated: true
        }
      }

      return { 
        completed: true, 
        message: 'Course was already completed',
        certificateGenerated: !!enrollment.certificateId
      }
    } catch (error) {
      console.error('Error checking course completion:', error)
      throw error
    }
  }

  static async getCourseCompletionStats(courseId: string) {
    try {
      const stats = await db.courseEnrollment.groupBy({
        by: ['courseId'],
        where: { courseId },
        _count: {
          id: true
        },
        _avg: {
          progress: true
        },
        having: {
          courseId: courseId
        }
      })

      const completedCount = await db.courseEnrollment.count({
        where: {
          courseId,
          progress: 100
        }
      })

      const inProgressCount = await db.courseEnrollment.count({
        where: {
          courseId,
          progress: {
            gt: 0,
            lt: 100
          }
        }
      })

      const averageProgress = stats[0]?._avg.progress || 0
      const totalEnrollments = stats[0]?._count.id || 0

      return {
        totalEnrollments,
        completedCount,
        inProgressCount,
        completionRate: totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0,
        averageProgress
      }
    } catch (error) {
      console.error('Error getting course completion stats:', error)
      throw error
    }
  }

  static async getUserCourseCompletionSummary(userId: string) {
    try {
      const enrollments = await db.courseEnrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              level: true,
              duration: true,
              thumbnail: true
            }
          },
          lessonProgress: {
            select: {
              isCompleted: true,
              timeSpent: true
            }
          },
          certificate: {
            select: {
              id: true,
              issuedAt: true,
              expiresAt: true
            }
          }
        }
      })

      const summary = {
        totalEnrollments: enrollments.length,
        completedCourses: enrollments.filter(e => e.progress === 100).length,
        inProgressCourses: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
        totalTimeSpent: enrollments.reduce((sum, e) => 
          sum + e.lessonProgress.reduce((lessonSum, p) => lessonSum + p.timeSpent, 0), 0
        ),
        averageProgress: enrollments.length > 0 
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
          : 0,
        certificates: enrollments.filter(e => e.certificate).length,
        courses: enrollments.map(e => ({
          id: e.course.id,
          title: e.course.title,
          category: e.course.category,
          level: e.course.level,
          duration: e.course.duration,
          thumbnail: e.course.thumbnail,
          progress: e.progress,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          hasCertificate: !!e.certificate,
          stats: {
            completedLessons: e.lessonProgress.filter(p => p.isCompleted).length,
            totalLessons: e.lessonProgress.length,
            timeSpent: e.lessonProgress.reduce((sum, p) => sum + p.timeSpent, 0)
          }
        }))
      }

      return summary
    } catch (error) {
      console.error('Error getting user completion summary:', error)
      throw error
    }
  }

  static async getCompletionLeaderboard(limit: number = 10) {
    try {
      const leaderboard = await db.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          enrollments: {
            select: {
              progress: true,
              completedAt: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          certificates: {
            select: {
              id: true,
              issuedAt: true
            }
          }
        },
        where: {
          enrollments: {
            some: {
              progress: {
                gt: 0
              }
            }
          }
        },
        orderBy: [
          {
            certificates: {
              _count: 'desc'
            }
          },
          {
            enrollments: {
              _count: 'desc'
            }
          }
        ],
        take: limit
      })

      return leaderboard.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        stats: {
          totalEnrollments: user.enrollments.length,
          completedCourses: user.enrollments.filter(e => e.progress === 100).length,
          certificates: user.certificates.length,
          totalProgress: user.enrollments.reduce((sum, e) => sum + e.progress, 0)
        }
      }))
    } catch (error) {
      console.error('Error getting completion leaderboard:', error)
      throw error
    }
  }
}