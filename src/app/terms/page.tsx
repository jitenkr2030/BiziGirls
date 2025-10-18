'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/layout/public-layout'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  DollarSign,
  Shield
} from 'lucide-react'

function TermsContent() {
  return (
    <PublicLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            These terms and conditions govern your use of the GirlsPreneur platform and services.
          </p>
        </div>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>Acceptance of Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By accessing and using GirlsPreneur ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              GirlsPreneur reserves the right to modify, update, or change these terms at any time. Your continued use of the Platform after any changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-purple-600" />
              <span>User Responsibilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">As a user of GirlsPreneur, you agree to:</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the Platform for lawful purposes only</li>
                <li>Respect the rights and privacy of other users</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent, deceptive, or harmful activities</li>
                <li>Not use automated tools or bots to access the Platform</li>
                <li>Not attempt to interfere with the Platform's functionality</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Account Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Account Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Creation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You must be at least 18 years old to create an account on GirlsPreneur. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Suspension</h3>
              <p className="text-gray-600 dark:text-gray-300">
                GirlsPreneur reserves the right to suspend or terminate your account for violations of these terms, fraudulent activity, or any other reason that, in our sole discretion, threatens the safety or integrity of the Platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span>Payment Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Subscription Fees</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Some features and services on GirlsPreneur may require payment of subscription fees. All fees are clearly stated before purchase, and you authorize us to charge your selected payment method for these fees.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Refund Policy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Refunds are available within 30 days of purchase for annual subscriptions and within 7 days for monthly subscriptions, provided you have not used premium features extensively. Refund requests can be made through your account settings.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All payment transactions are processed securely through third-party payment processors. We do not store your payment information on our servers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <span>Prohibited Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are strictly prohibited from engaging in the following activities on GirlsPreneur:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Posting false, misleading, or fraudulent information</li>
              <li>Harassing, abusing, or threatening other users</li>
              <li>Infringing on intellectual property rights</li>
              <li>Distributing malware, viruses, or harmful code</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Impersonating others or creating fake accounts</li>
              <li>Collecting user data without permission</li>
              <li>Interfering with the Platform's technical infrastructure</li>
              <li>Using the Platform for illegal purposes</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <span>Intellectual Property</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All content on GirlsPreneur, including text, graphics, logos, and software, is owned by or licensed to GirlsPreneur and is protected by intellectual property laws.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                By posting content on GirlsPreneur, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with operating and improving the Platform. You retain ownership of your content.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <span>Limitation of Liability</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GirlsPreneur is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the Platform's operation or the information, content, or materials included on the Platform.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              To the fullest extent permitted by law, GirlsPreneur shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Any disputes arising from these terms shall be resolved in the courts located in San Francisco, California.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-900 dark:text-white">
              Email: legal@girlspreneur.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </CardContent>
        </Card>

        {/* Effective Date */}
        <Card>
          <CardHeader>
            <CardTitle>Effective Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              These Terms of Service are effective as of December 1, 2024, and were last updated on this date.
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

export default function TermsPage() {
  return <TermsContent />
}