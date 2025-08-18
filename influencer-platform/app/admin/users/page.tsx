'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Mail,
  Calendar,
  Building2,
  Sparkles,
  Crown,
  Ban,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string
  username: string
  role: 'influencer' | 'brand' | 'admin'
  status?: 'active' | 'suspended' | 'pending'
  created_at: string
  last_sign_in_at?: string
  avatar_url?: string
  bio?: string
  total_campaigns?: number
  total_earnings?: number
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: { x: number; y: number; position: 'above' | 'below' } }>({})
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    username: '',
    role: '',
    status: ''
  })
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [filterRole, filterStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterRole !== 'all') {
        query = query.eq('role', filterRole)
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error

      toast.success(`User status updated to ${newStatus}`)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name || '',
      email: user.email,
      username: user.username || '',
      role: user.role,
      status: user.status || 'active'
    })
    setEditModalOpen(true)
    setActionMenuOpen(null)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      console.log('Updating user:', selectedUser.id, editForm)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          username: editForm.username,
          role: editForm.role,
          status: editForm.status
        })
        .eq('id', selectedUser.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Update successful:', data)
      toast.success('User updated successfully')
      setEditModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'influencer':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'brand':
        return <Building2 className="w-4 h-4 text-blue-500" />
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleActionMenuClick = (userId: string, event: React.MouseEvent<HTMLButtonElement>, index: number, totalUsers: number) => {
    event.preventDefault()
    event.stopPropagation()
    
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const menuWidth = 192 // w-48 = 12rem = 192px
    
    // Same menu height calculation as campaigns page for consistency
    const menuHeight = 152 // Exactly matching campaigns page that works well
    
    // Positioning logic
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    
    // Only open above if there's not enough space below AND enough space above
    const shouldOpenAbove = spaceBelow < menuHeight && spaceAbove >= menuHeight
    
    // Calculate X position (right-aligned with button)
    const x = rect.right - menuWidth
    
    // Calculate Y position - directly touching the button (same as campaigns)
    let y
    if (shouldOpenAbove) {
      // Open above: dropdown bottom edge almost touches button top
      y = rect.top - menuHeight - 1
      // But don't let it go off the top of the screen
      if (y < 8) {
        // If it would go off-screen, just position it below instead
        y = rect.bottom + 1
      }
    } else {
      // Open below: dropdown top edge almost touches button bottom
      y = rect.bottom + 1
    }
    
    // Ensure dropdown stays within horizontal viewport
    const finalX = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8))
    const finalY = y // Don't clamp Y anymore since we handle it above
    
    console.log('DEBUG - Button rect:', rect)
    console.log('DEBUG - Should open above:', shouldOpenAbove)
    console.log('DEBUG - Raw x,y:', x, y)
    console.log('DEBUG - Final x,y:', finalX, finalY)
    
    setDropdownPosition({ 
      ...dropdownPosition, 
      [userId]: { x: finalX, y: finalY, position: shouldOpenAbove ? 'above' : 'below' } 
    })
    setActionMenuOpen(actionMenuOpen === userId ? null : userId)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const exportUsers = () => {
    console.log('Export button clicked')
    console.log('Filtered users count:', filteredUsers.length)
    
    try {
      if (filteredUsers.length === 0) {
        toast.error('No users to export')
        return
      }

      // Prepare data for export
      const exportData = filteredUsers.map(user => ({
        'Full Name': user.full_name || '',
        'Email': user.email,
        'Username': user.username || '',
        'Role': user.role,
        'Status': user.status || 'active',
        'Created At': new Date(user.created_at).toLocaleDateString(),
        'Last Sign In': user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
      }))

      console.log('Export data prepared:', exportData.length, 'records')

      if (exportData.length === 0) {
        toast.error('No data to export')
        return
      }

      // Convert to CSV
      const headers = Object.keys(exportData[0])
      console.log('CSV headers:', headers)
      
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row] || ''
            return `"${String(value).replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')

      console.log('CSV content generated, length:', csvContent.length)

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      console.log('Blob created:', blob.size, 'bytes')
      
      const link = document.createElement('a')
      
      // Check if browser supports download attribute
      if (typeof link.download !== 'undefined') {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        console.log('File download initiated')
      } else {
        // Fallback for older browsers
        const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
        window.open(url, '_blank')
        console.log('Fallback download method used')
      }
      
      toast.success(`Exported ${exportData.length} users successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to export users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor all platform users
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => {
                console.log('Button clicked!')
                exportUsers()
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg transform transition hover:scale-105"
            >
              <Users className="w-4 h-4 mr-2" />
              Export Users ({filteredUsers.length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Influencers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {users.filter(u => u.role === 'influencer').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Brands</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {users.filter(u => u.role === 'brand').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {users.filter(u => (u.status || 'active') === 'active').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="influencer">Influencers</option>
              <option value="brand">Brands</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 animate-pulse">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar_url}
                              alt={user.full_name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.username && (
                            <div className="text-xs text-gray-400">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => handleActionMenuClick(user.id, e, index, filteredUsers.length)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {actionMenuOpen === user.id && dropdownPosition[user.id] && (
                          <div 
                            className="fixed z-50 w-48 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5"
                            style={{
                              left: `${dropdownPosition[user.id].x}px`,
                              top: `${dropdownPosition[user.id].y}px`
                            }}>
                            <div className="py-1">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </button>
                              <button
                                onClick={() => {
                                  window.location.href = `mailto:${user.email}`
                                  setActionMenuOpen(null)
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </button>
                              {(user.status || 'active') === 'active' ? (
                                <button
                                  onClick={() => {
                                    handleStatusChange(user.id, 'suspended')
                                    setActionMenuOpen(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full text-left"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend User
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleStatusChange(user.id, 'active')
                                    setActionMenuOpen(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate User
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleDeleteUser(user.id)
                                  setActionMenuOpen(null)
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditModalOpen(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit User
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="influencer">Influencer</option>
                      <option value="brand">Brand</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleSaveUser}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  )
}