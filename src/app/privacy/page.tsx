'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/layout/public-layout'
import { 
  Shield, 
  Eye, 
  Database, 
  Lock,
  Globe,
  Cookie
} from 'lucide-react'

function PrivacyContent() {
  return (
    <PublicLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-blue-600" />
              <span>Information We Collect</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Name and contact information</li>
                <li>Email address and password</li>
                <li>Business information and profile details</li>
                <li>Payment and billing information</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Data</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Pages visited and time spent on our platform</li>
                <li>Features and services used</li>
                <li>Device information and IP address</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-green-600" />
              <span>How We Use Your Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To personalize your experience on our platform</li>
              <li>To process transactions and manage your account</li>
              <li>To send you updates and promotional materials</li>
              <li>To improve our services and develop new features</li>
              <li>To communicate with you about your account</li>
              <li>To comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-6 w-6 text-purple-600" />
              <span>Data Protection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure storage of sensitive information</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cookie className="h-6 w-6 text-orange-600" />
              <span>Cookies and Tracking Technologies</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small files stored on your device that help us:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our platform</li>
              <li>Provide personalized content and recommendations</li>
              <li>Analyze platform performance and usage patterns</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300">
              You can control cookie preferences through your browser settings, but disabling cookies may affect your experience on our platform.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <span>Third-Party Sharing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Service providers who assist in operating our platform</li>
              <li>Business partners with whom we offer joint services</li>
              <li>Legal requirements when required by law or regulation</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span>Your Rights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request copies of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Opt out of certain data processing</li>
              <li><strong>Restriction:</strong> Limit how we use your information</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              If you have any questions about this Privacy Policy or how we handle your personal information, please contact us at:
            </p>
            <p className="text-gray-900 dark:text-white mt-2">
              Email: privacy@girlspreneur.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </CardContent>
        </Card>

        {/* Policy Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last Updated: December 2024
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

export default function PrivacyPage() {
  return <PrivacyContent />
}