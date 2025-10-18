'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Trash2
} from 'lucide-react'

interface Document {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

interface GrantApplicationFormProps {
  opportunity: {
    id: string
    title: string
    organization: string
    requirements: string[]
  }
  initialData?: {
    businessPlan?: string
    pitchDeck?: string
    financialStatements?: string
    supportingDocuments?: Document[]
  }
  onSave: (data: any) => void
  onSubmit?: () => void
  isSubmitting?: boolean
}

export function GrantApplicationForm({
  opportunity,
  initialData,
  onSave,
  onSubmit,
  isSubmitting = false
}: GrantApplicationFormProps) {
  const [formData, setFormData] = useState({
    businessPlan: initialData?.businessPlan || '',
    pitchDeck: initialData?.pitchDeck || '',
    financialStatements: initialData?.financialStatements || '',
    additionalInfo: '',
    supportingDocuments: initialData?.supportingDocuments || []
  })
  
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (file: File, type: string) => {
    setUploading(type)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/funding-documents/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        
        setFormData(prev => ({
          ...prev,
          [type]: result.url,
          supportingDocuments: [
            ...prev.supportingDocuments,
            {
              id: Date.now().toString(),
              name: result.fileName,
              url: result.url,
              size: result.size,
              type: result.type,
              uploadedAt: new Date().toISOString()
            }
          ]
        }))
        
        onSave({
          ...formData,
          [type]: result.url
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(null)
      setUploadProgress(0)
    }
  }

  const removeDocument = (type: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: ''
    }))
    onSave({
      ...formData,
      [type]: ''
    })
  }

  const removeSupportingDocument = (id: string) => {
    const updatedDocs = formData.supportingDocuments.filter(doc => doc.id !== id)
    setFormData(prev => ({
      ...prev,
      supportingDocuments: updatedDocs
    }))
    onSave({
      ...formData,
      supportingDocuments: updatedDocs
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    if (type.includes('presentation') || type.includes('powerpoint')) return '📽️'
    return '📎'
  }

  const calculateProgress = () => {
    const fields = ['businessPlan', 'pitchDeck', 'financialStatements']
    const completedFields = fields.filter(field => formData[field as keyof typeof formData]).length
    return (completedFields / fields.length) * 100
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Application Progress
            <Badge variant="outline">{Math.round(calculateProgress())}% Complete</Badge>
          </CardTitle>
          <CardDescription>
            Complete all required documents to submit your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="h-3" />
          <div className="mt-2 text-sm text-gray-600">
            {calculateProgress() === 100 ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ready to submit!
              </span>
            ) : (
              <span className="text-orange-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Complete required documents
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload the following documents to complete your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Plan */}
          <div>
            <Label className="text-base font-medium">Business Plan *</Label>
            <p className="text-sm text-gray-600 mb-3">
              A comprehensive business plan outlining your business model, market analysis, and growth strategy
            </p>
            
            {formData.businessPlan ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">Business Plan Uploaded</div>
                    <div className="text-sm text-green-600">Click to view or replace</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDocument('businessPlan')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <div className="text-sm text-gray-600 mb-2">
                  Upload your business plan
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'businessPlan')
                  }}
                  className="hidden"
                  id="business-plan-upload"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('business-plan-upload')?.click()}
                  disabled={uploading === 'businessPlan'}
                >
                  {uploading === 'businessPlan' ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            )}
          </div>

          {/* Pitch Deck */}
          <div>
            <Label className="text-base font-medium">Pitch Deck *</Label>
            <p className="text-sm text-gray-600 mb-3">
              A presentation deck showcasing your business idea, team, and funding requirements
            </p>
            
            {formData.pitchDeck ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">Pitch Deck Uploaded</div>
                    <div className="text-sm text-green-600">Click to view or replace</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDocument('pitchDeck')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <div className="text-sm text-gray-600 mb-2">
                  Upload your pitch deck
                </div>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'pitchDeck')
                  }}
                  className="hidden"
                  id="pitch-deck-upload"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('pitch-deck-upload')?.click()}
                  disabled={uploading === 'pitchDeck'}
                >
                  {uploading === 'pitchDeck' ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            )}
          </div>

          {/* Financial Statements */}
          <div>
            <Label className="text-base font-medium">Financial Statements *</Label>
            <p className="text-sm text-gray-600 mb-3">
              Recent financial statements including income statement, balance sheet, and cash flow
            </p>
            
            {formData.financialStatements ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">Financial Statements Uploaded</div>
                    <div className="text-sm text-green-600">Click to view or replace</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDocument('financialStatements')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <div className="text-sm text-gray-600 mb-2">
                  Upload financial statements
                </div>
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'financialStatements')
                  }}
                  className="hidden"
                  id="financial-statements-upload"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('financial-statements-upload')?.click()}
                  disabled={uploading === 'financialStatements'}
                >
                  {uploading === 'financialStatements' ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Additional documents that strengthen your application (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.supportingDocuments.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.supportingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getDocumentIcon(doc.type)}</span>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeSupportingDocument(doc.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <div className="text-sm text-gray-600 mb-2">
              Upload supporting documents
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                files.forEach(file => handleFileUpload(file, 'supporting'))
              }}
              className="hidden"
              id="supporting-docs-upload"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('supporting-docs-upload')?.click()}
              disabled={uploading === 'supporting'}
            >
              {uploading === 'supporting' ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Provide any additional information that supports your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell us more about your business, your team, your achievements, and how this funding will help you achieve your goals..."
            className="min-h-[120px]"
            value={formData.additionalInfo}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* Application Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Application Requirements</CardTitle>
          <CardDescription>
            Review the requirements for this funding opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {opportunity.requirements.map((req, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{req}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => onSave(formData)}>
          Save as Draft
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={calculateProgress() < 100 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  )
}