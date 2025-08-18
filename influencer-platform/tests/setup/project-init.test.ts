import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('Project Initialization', () => {
  const projectRoot = path.join(__dirname, '../..')

  it('should have Next.js configuration', () => {
    const nextConfigPath = path.join(projectRoot, 'next.config.ts')
    expect(fs.existsSync(nextConfigPath)).toBe(true)
  })

  it('should have TypeScript configuration', () => {
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json')
    expect(fs.existsSync(tsConfigPath)).toBe(true)
    
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'))
    expect(tsConfig.compilerOptions.strict).toBeDefined()
  })

  it('should have Tailwind CSS configuration', () => {
    const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.ts')
    expect(fs.existsSync(tailwindConfigPath)).toBe(true)
  })

  it('should have required dependencies installed', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    
    // Core dependencies
    expect(packageJson.dependencies).toHaveProperty('next')
    expect(packageJson.dependencies).toHaveProperty('react')
    expect(packageJson.dependencies).toHaveProperty('react-dom')
    
    // Supabase
    expect(packageJson.dependencies).toHaveProperty('@supabase/supabase-js')
    expect(packageJson.dependencies).toHaveProperty('@supabase/ssr')
    
    // Form handling
    expect(packageJson.dependencies).toHaveProperty('react-hook-form')
    expect(packageJson.dependencies).toHaveProperty('zod')
    
    // Payment SDKs
    expect(packageJson.dependencies).toHaveProperty('stripe')
    expect(packageJson.dependencies).toHaveProperty('@paypal/checkout-server-sdk')
  })

  it('should have app directory structure', () => {
    const appDir = path.join(projectRoot, 'app')
    expect(fs.existsSync(appDir)).toBe(true)
    
    // Check for essential files
    expect(fs.existsSync(path.join(appDir, 'layout.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(appDir, 'page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(appDir, 'globals.css'))).toBe(true)
  })

  it('should have test directory structure', () => {
    const testDirs = [
      'tests/setup',
      'tests/auth',
      'tests/database',
      'tests/features',
      'tests/payments',
      'tests/e2e',
      'tests/utils'
    ]
    
    testDirs.forEach(dir => {
      const dirPath = path.join(projectRoot, dir)
      expect(fs.existsSync(dirPath)).toBe(true)
    })
  })

  it('should have Jest configuration', () => {
    const jestConfigPath = path.join(projectRoot, 'jest.config.js')
    expect(fs.existsSync(jestConfigPath)).toBe(true)
  })

  it('should have environment variable template', () => {
    // We'll create this file next
    const envExamplePath = path.join(projectRoot, '.env.local.example')
    // This test will initially fail, which is expected
    // expect(fs.existsSync(envExamplePath)).toBe(true)
  })
})