import Link from 'next/link'
import { 
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Video,
  Book,
  Search,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Zap
} from 'lucide-react'

export default function HelpSupportPage() {
  const faqs = [
    {
      category: 'Getting Started',
      icon: Zap,
      questions: [
        {
          q: 'How do I create my first campaign?',
          a: 'Navigate to your dashboard and click "Create Campaign". Fill in the campaign details including title, description, budget, and requirements. Once submitted, your campaign will be reviewed and published.'
        },
        {
          q: 'What types of campaigns can I create?',
          a: 'You can create various campaign types including product reviews, sponsored posts, brand ambassadorships, and content collaborations across different social media platforms.'
        },
        {
          q: 'How do I find the right influencers?',
          a: 'Use our advanced search filters to find influencers by category, follower count, engagement rate, and location. Review their profiles and previous work before sending collaboration requests.'
        }
      ]
    },
    {
      category: 'Payments & Billing',
      icon: CheckCircle,
      questions: [
        {
          q: 'How do payments work?',
          a: 'Payments are processed securely through our platform. Funds are held in escrow until the influencer completes the campaign requirements and you approve their submission.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept major credit cards, debit cards, and bank transfers. You can manage your payment methods in the Payments section of your dashboard.'
        },
        {
          q: 'When are influencers paid?',
          a: 'Influencers are paid within 3-5 business days after you approve their content submission. The payment is automatically processed through our secure payment system.'
        }
      ]
    },
    {
      category: 'Campaign Management',
      icon: Users,
      questions: [
        {
          q: 'How do I review applications?',
          a: 'Go to the Applications section in your dashboard to see all pending applications. You can review influencer profiles, approve or reject applications, and communicate with applicants.'
        },
        {
          q: 'Can I edit a campaign after publishing?',
          a: 'Yes, you can edit campaign details at any time. However, if influencers have already applied, some changes may require their consent.'
        },
        {
          q: 'How do I track campaign performance?',
          a: 'Use the Analytics dashboard to monitor campaign metrics including reach, engagement, conversions, and ROI. You can also export detailed reports.'
        }
      ]
    }
  ]

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available 9am-6pm EST',
      action: 'Start Chat',
      color: 'blue'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: 'purple'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Talk to a specialist',
      availability: 'Mon-Fri 9am-5pm EST',
      action: 'Call Now',
      color: 'green'
    }
  ]

  const resources = [
    {
      icon: Book,
      title: 'Knowledge Base',
      description: 'Browse our comprehensive guides and tutorials',
      link: '/help/knowledge-base'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      link: '/help/tutorials'
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Read detailed platform documentation',
      link: '/help/docs'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to your questions or get in touch with our support team
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {resources.map((resource, index) => {
            const Icon = resource.icon
            return (
              <Link
                key={index}
                href={resource.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                      {resource.title}
                      <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {faqs.map((category, catIndex) => {
              const CategoryIcon = category.icon
              return (
                <div key={catIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <CategoryIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-semibold text-gray-900">{category.category}</h3>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {category.questions.map((item, qIndex) => (
                      <details key={qIndex} className="group">
                        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                          <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="px-6 pb-6 -mt-2">
                          <p className="text-gray-600">{item.a}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Still need help?</h2>
          <p className="text-gray-600 text-center mb-8">Our support team is here to assist you</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 hover:bg-blue-600',
                purple: 'bg-purple-100 text-purple-600 hover:bg-purple-600',
                green: 'bg-green-100 text-green-600 hover:bg-green-600'
              }
              
              return (
                <div key={index} className="bg-white rounded-lg p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${colorClasses[method.color as keyof typeof colorClasses]} transition-colors group`}>
                    <Icon className="w-6 h-6 group-hover:text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                  <p className="text-xs text-gray-500 mb-4 flex items-center justify-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {method.availability}
                  </p>
                  <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    method.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    method.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                    'bg-green-600 text-white hover:bg-green-700'
                  }`}>
                    {method.action}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Help Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Account Settings',
              'Campaign Creation',
              'Payment Issues',
              'Profile Setup',
              'Analytics Guide',
              'Content Guidelines',
              'Privacy & Security',
              'API Documentation'
            ].map((topic) => (
              <Link
                key={topic}
                href={`/help/topic/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
              >
                {topic} →
              </Link>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <AlertCircle className="w-4 h-4 mr-2" />
            For urgent issues, email us at{' '}
            <a href="mailto:urgent@influencerplatform.com" className="ml-1 text-blue-600 hover:text-blue-700 font-medium">
              urgent@influencerplatform.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}