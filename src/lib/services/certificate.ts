import { db } from '@/lib/db'

export interface CertificateData {
  userId: string
  courseId: string
  userName: string
  courseName: string
  instructorName: string
  completionDate: Date
  certificateId: string
}

export class CertificateService {
  static async generateCertificate(userId: string, courseId: string): Promise<string> {
    try {
      // Check if user has completed the course
      const enrollment = await db.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          course: {
            include: {
              instructor: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      if (!enrollment || enrollment.progress < 100) {
        throw new Error('Course not completed')
      }

      // Check if certificate already exists
      const existingCertificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      })

      if (existingCertificate) {
        return existingCertificate.certificateUrl!
      }

      // Generate certificate data
      const certificateData: CertificateData = {
        userId,
        courseId,
        userName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        courseName: enrollment.course.title,
        instructorName: `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`,
        completionDate: enrollment.completedAt || new Date(),
        certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Generate certificate URL (in a real implementation, this would generate a PDF)
      const certificateUrl = await this.createCertificateImage(certificateData)

      // Save certificate to database
      const certificate = await db.certificate.create({
        data: {
          userId,
          courseId,
          certificateUrl,
          issuedAt: new Date()
        }
      })

      // Update enrollment with certificate ID
      await db.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        data: {
          certificateId: certificate.id
        }
      })

      return certificateUrl
    } catch (error) {
      console.error('Error generating certificate:', error)
      throw error
    }
  }

  private static async createCertificateImage(data: CertificateData): Promise<string> {
    // In a real implementation, this would generate a PDF or image certificate
    // For now, we'll return a placeholder URL
    // You could use libraries like pdf-lib, jspdf, or canvas to generate actual certificates
    
    const certificateTemplate = `
      Certificate of Completion
      
      This is to certify that
      
      ${data.userName}
      
      has successfully completed the course
      
      ${data.courseName}
      
      instructed by ${data.instructorName}
      
      on ${data.completionDate.toLocaleDateString()}
      
      Certificate ID: ${data.certificateId}
    `

    // For demo purposes, we'll create a data URL
    // In production, you would upload this to cloud storage
    const certificateDataUrl = `data:text/plain;base64,${btoa(certificateTemplate)}`
    
    return certificateDataUrl
  }

  static async verifyCertificate(certificateId: string): Promise<boolean> {
    try {
      // Extract the actual ID from the certificate ID format
      const actualId = certificateId.replace('CERT-', '').split('-')[0]
      const timestamp = parseInt(actualId)
      
      // Check if certificate exists and is not expired
      const certificate = await db.certificate.findFirst({
        where: {
          OR: [
            {
              certificateUrl: {
                contains: certificateId
              }
            }
          ]
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          course: {
            select: {
              title: true
            }
          }
        }
      })

      if (!certificate) {
        return false
      }

      // Check if certificate is expired
      if (certificate.expiresAt && certificate.expiresAt < new Date()) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error verifying certificate:', error)
      return false
    }
  }

  static async getUserCertificates(userId: string) {
    try {
      const certificates = await db.certificate.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              category: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { issuedAt: 'desc' }
      })

      return certificates
    } catch (error) {
      console.error('Error fetching user certificates:', error)
      throw error
    }
  }

  static async getCertificateDetails(certificateId: string) {
    try {
      const certificate = await db.certificate.findFirst({
        where: {
          OR: [
            {
              id: certificateId
            },
            {
              certificateUrl: {
                contains: certificateId
              }
            }
          ]
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          course: {
            select: {
              title: true,
              description: true,
              duration: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      return certificate
    } catch (error) {
      console.error('Error fetching certificate details:', error)
      throw error
    }
  }
}