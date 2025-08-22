'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { ApplicationLinksDisplay, ContentLink } from './application-links-display'
import { toast } from 'react-hot-toast'

interface ApplicationApprovalModalProps {
  applicationId: string
  applicantName: string
  contentLinks: ContentLink[]
  onClose: () => void
  onApprove: (applicationId: string, selectedLinkIds: string[]) => Promise<void>
  onReject: (applicationId: string) => Promise<void>
}

export function ApplicationApprovalModal({
  applicationId,
  applicantName,
  contentLinks,
  onClose,
  onApprove,
  onReject
}: ApplicationApprovalModalProps) {
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(
    new Set(contentLinks.filter(link => link.is_selected).map(link => link.id))
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmReject, setShowConfirmReject] = useState(false)

  const handleLinkSelect = (linkId: string, selected: boolean) => {
    setSelectedLinks(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(linkId)
      } else {
        newSet.delete(linkId)
      }
      return newSet
    })
  }

  const handleApprove = async () => {
    if (selectedLinks.size === 0) {
      toast.error('Please select at least one link to approve')
      return
    }

    setIsProcessing(true)
    try {
      await onApprove(applicationId, Array.from(selectedLinks))
      toast.success('Application approved with selected links!')
      onClose()
    } catch (error) {
      toast.error('Failed to approve application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectAll = async () => {
    setIsProcessing(true)
    try {
      await onReject(applicationId)
      toast.success('Application rejected')
      onClose()
    } catch (error) {
      toast.error('Failed to reject application')
    } finally {
      setIsProcessing(false)
    }
  }

  // Update content links with selection state
  const updatedLinks = contentLinks.map(link => ({
    ...link,
    is_selected: selectedLinks.has(link.id),
    selection_status: selectedLinks.has(link.id) ? 'selected' as const : 'not_selected' as const
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Review Application
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Application from <span className="font-medium">{applicantName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Submitted Content Links ({contentLinks.length})
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the links you want to approve for view tracking and payment.
            </p>
          </div>

          <ApplicationLinksDisplay
            links={updatedLinks}
            userRole="brand"
            showViewCounts={false}
            onLinkSelect={handleLinkSelect}
            isSelectionMode={true}
          />

          {/* Selection Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                {selectedLinks.size} of {contentLinks.length} links selected for approval
              </p>
            </div>
            {selectedLinks.size === 0 && (
              <p className="text-sm text-blue-700 mt-1">
                No links selected means the entire application will be rejected.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {!showConfirmReject ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowConfirmReject(true)}
                disabled={isProcessing}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5 inline mr-2" />
                Reject All
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing || selectedLinks.size === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve with {selectedLinks.size} Link{selectedLinks.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 font-medium">
                Are you sure you want to reject this entire application?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmReject(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectAll}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Yes, Reject All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}