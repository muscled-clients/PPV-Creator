import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Check Supabase connection
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()
    
    const dbStatus = !dbError
    const responseTime = Date.now() - startTime
    
    const healthCheck = {
      status: dbStatus ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        database: dbStatus ? 'operational' : 'error',
        api: 'operational',
      },
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
    }
    
    return NextResponse.json(healthCheck, {
      status: dbStatus ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
}