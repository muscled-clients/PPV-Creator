'use client'

import Link from "next/link"
import { useState, useEffect } from 'react'
import { ChevronRight, Users, Zap, BarChart3, CheckCircle, Star, TrendingUp, Shield, Globe, ArrowRight } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "AI-powered algorithm connects brands with the perfect influencers for their campaigns",
      color: "blue"
    },
    {
      icon: Zap,
      title: "Fast Collaboration",
      description: "Streamlined workflow from campaign creation to content delivery in record time",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track campaign performance with comprehensive metrics and insights",
      color: "green"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions with escrow system ensuring trust for all parties",
      color: "indigo"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with influencers and brands from around the world",
      color: "pink"
    },
    {
      icon: TrendingUp,
      title: "Growth Tools",
      description: "Built-in tools to help influencers grow their audience and maximize earnings",
      color: "yellow"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Influencer",
      content: "This platform transformed my career. I've connected with amazing brands and doubled my income!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Tech Startup Inc.",
      role: "Brand",
      content: "Found the perfect influencers for our product launch. The ROI exceeded our expectations!",
      rating: 5,
      avatar: "TS"
    },
    {
      name: "Mike Chen",
      role: "Food Blogger",
      content: "The analytics tools are game-changing. I can track everything and optimize my content strategy.",
      rating: 5,
      avatar: "MC"
    }
  ]

  const stats = [
    { label: "Active Influencers", value: "50K+", suffix: "" },
    { label: "Brands", value: "5,000", suffix: "+" },
    { label: "Campaigns Completed", value: "100K", suffix: "+" },
    { label: "Success Rate", value: "94", suffix: "%" }
  ]

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
    pink: "bg-pink-100 text-pink-600",
    yellow: "bg-yellow-100 text-yellow-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Simple Badge */}
            <div className={`inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-50 border border-blue-200 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Trusted by 50,000+ creators worldwide</span>
            </div>
            
            {/* Main Heading */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 ${mounted ? 'animate-fade-in-up animation-delay-100' : 'opacity-0'}`}>
              Where Brands Meet
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Authentic Influence
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              Connect, collaborate, and create impactful campaigns. The all-in-one platform for influencer marketing success.
            </p>
            
            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 ${mounted ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>
              <Link 
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Sign In
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            {/* Simple Trust Text */}
            <p className={`text-sm text-gray-500 ${mounted ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              No credit card required • Free forever for basic features
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {stat.value}<span className="text-blue-600">{stat.suffix}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make influencer marketing simple, effective, and profitable
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index} 
                  className={`group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 border border-gray-100 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className={`w-14 h-14 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and launch your first campaign today
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Sign Up", desc: "Create your free account as a brand or influencer" },
              { step: "2", title: "Connect", desc: "Find perfect matches using our smart algorithm" },
              { step: "3", title: "Collaborate", desc: "Launch campaigns and create amazing content" }
            ].map((item, index) => (
              <div key={index} className={`text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{animationDelay: `${index * 150}ms`}}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200" />
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Creators & Brands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands who are already growing with our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful brands and influencers already using our platform
          </p>
          <Link 
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full hover:bg-gray-100 transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            Start Your Journey Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>&copy; 2024 Influencer Platform. All rights reserved.</p>
            <div className="mt-4 space-x-6">
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(1.05);
          }
          66% {
            transform: translate(20px, -20px) scale(0.95);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, -30px) scale(1.1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes draw {
          from {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
          }
          to {
            stroke-dasharray: 300;
            stroke-dashoffset: 0;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }

        .animate-draw {
          animation: draw 2s ease-out forwards;
          animation-delay: 0.5s;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}