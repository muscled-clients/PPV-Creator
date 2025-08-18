import { describe, it, expect, beforeAll } from '@jest/globals'
import { createClient } from '@/lib/supabase/client'
import fs from 'fs'
import path from 'path'

describe('Supabase Configuration', () => {
  const projectRoot = path.join(__dirname, '../..')

  it('should have Supabase client configuration files', () => {
    const clientPath = path.join(projectRoot, 'lib/supabase/client.ts')
    const serverPath = path.join(projectRoot, 'lib/supabase/server.ts')
    const middlewarePath = path.join(projectRoot, 'lib/supabase/middleware.ts')
    
    expect(fs.existsSync(clientPath)).toBe(true)
    expect(fs.existsSync(serverPath)).toBe(true)
    expect(fs.existsSync(middlewarePath)).toBe(true)
  })

  it('should have middleware configuration', () => {
    const middlewarePath = path.join(projectRoot, 'middleware.ts')
    expect(fs.existsSync(middlewarePath)).toBe(true)
  })

  it('should create Supabase client without errors', () => {
    expect(() => createClient()).not.toThrow()
  })

  it('should have environment variables configured', () => {
    // In test environment, these are mocked in jest.setup.js
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
  })

  it('should have correct Supabase URL format', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/)
  })
})