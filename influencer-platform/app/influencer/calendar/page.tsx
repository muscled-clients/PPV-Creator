import { Calendar, Clock, Camera, DollarSign } from 'lucide-react'

export default function InfluencerCalendarPage() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600">Track your content deadlines and submissions</p>
            </div>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Add Deadline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{currentMonth}</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">←</button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">→</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            {/* Generate calendar days (simplified) */}
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="text-sm text-gray-900">{(i % 31) + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-start">
                <Camera className="w-4 h-4 text-purple-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Content Submission</p>
                  <p className="text-xs text-gray-600 mt-1">Fashion Brand Campaign</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Tomorrow, 11:59 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <DollarSign className="w-4 h-4 text-green-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment Due</p>
                  <p className="text-xs text-gray-600 mt-1">Tech Product Review</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>In 3 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}