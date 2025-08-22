import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

export type LinkStatus = 'pending' | 'selected' | 'not_selected'

interface LinkStatusBadgeProps {
  status: LinkStatus
  viewCount?: number
  showViewCount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LinkStatusBadge({ 
  status, 
  viewCount, 
  showViewCount = false,
  size = 'md' 
}: LinkStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const statusConfig = {
    pending: {
      label: 'Pending Review',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      iconColor: 'text-yellow-600'
    },
    selected: {
      label: 'Selected',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-300',
      iconColor: 'text-green-600'
    },
    not_selected: {
      label: 'Not Selected',
      icon: XCircle,
      className: 'bg-gray-100 text-gray-600 border-gray-300',
      iconColor: 'text-gray-500'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        className={`
          inline-flex items-center gap-1.5 rounded-full border font-medium
          ${config.className} ${sizeClasses[size]}
        `}
      >
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
        <span>{config.label}</span>
      </span>
      
      {showViewCount && viewCount !== undefined && status === 'selected' && (
        <span className={`
          inline-flex items-center gap-1 text-gray-600
          ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
        `}>
          <Eye className={iconSizes[size]} />
          {viewCount.toLocaleString()} views
        </span>
      )}
    </div>
  )
}