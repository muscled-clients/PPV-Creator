import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import * as DatabaseTypes from '@/lib/types/database'

describe('Database Schema', () => {
  const projectRoot = path.join(__dirname, '../..')
  const migrationsPath = path.join(projectRoot, 'supabase/migrations')

  it('should have migration files', () => {
    expect(fs.existsSync(migrationsPath)).toBe(true)
    
    const migrationFiles = fs.readdirSync(migrationsPath)
    expect(migrationFiles.length).toBeGreaterThan(0)
    
    // Check for specific migration files
    expect(migrationFiles).toContain('001_initial_schema.sql')
    expect(migrationFiles).toContain('002_row_level_security.sql')
    expect(migrationFiles).toContain('003_database_functions.sql')
  })

  it('should have TypeScript database types', () => {
    const typesPath = path.join(projectRoot, 'lib/types/database.ts')
    expect(fs.existsSync(typesPath)).toBe(true)
  })

  it('should export correct database types', () => {
    // Test UserRole enum
    const userRoles: DatabaseTypes.UserRole[] = ['influencer', 'brand', 'admin']
    expect(userRoles).toHaveLength(3)

    // Test CampaignStatus enum
    const campaignStatuses: DatabaseTypes.CampaignStatus[] = [
      'draft', 'active', 'paused', 'completed', 'cancelled'
    ]
    expect(campaignStatuses).toHaveLength(5)

    // Test PaymentMethod enum
    const paymentMethods: DatabaseTypes.PaymentMethod[] = ['ach', 'paypal']
    expect(paymentMethods).toHaveLength(2)

    // Test PlatformType enum
    const platforms: DatabaseTypes.PlatformType[] = ['instagram', 'tiktok']
    expect(platforms).toHaveLength(2)
  })

  it('should have correct table structure in migration files', () => {
    const schemaPath = path.join(migrationsPath, '001_initial_schema.sql')
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')

    // Check for table creations
    const expectedTables = [
      'user_profiles',
      'influencer_profiles',
      'brand_profiles',
      'campaigns',
      'campaign_applications',
      'submissions',
      'transactions',
      'notifications'
    ]

    expectedTables.forEach(table => {
      expect(schemaContent).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`)
    })

    // Check for important columns
    expect(schemaContent).toContain('instagram_handle')
    expect(schemaContent).toContain('tiktok_handle')
    expect(schemaContent).toContain('payment_method')
    expect(schemaContent).toContain('stripe_account_id')
    expect(schemaContent).toContain('paypal_email')
  })

  it('should have RLS policies in migration files', () => {
    const rlsPath = path.join(migrationsPath, '002_row_level_security.sql')
    const rlsContent = fs.readFileSync(rlsPath, 'utf-8')

    // Check for RLS enablement
    expect(rlsContent).toContain('ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY')
    expect(rlsContent).toContain('ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY')
    expect(rlsContent).toContain('ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY')

    // Check for policies
    expect(rlsContent).toContain('CREATE POLICY')
    expect(rlsContent).toContain('FOR SELECT')
    expect(rlsContent).toContain('FOR INSERT')
    expect(rlsContent).toContain('FOR UPDATE')
    expect(rlsContent).toContain('auth.uid()')
  })

  it('should have database functions in migration files', () => {
    const functionsPath = path.join(migrationsPath, '003_database_functions.sql')
    const functionsContent = fs.readFileSync(functionsPath, 'utf-8')

    // Check for function definitions
    const expectedFunctions = [
      'handle_new_user',
      'update_campaign_slots',
      'calculate_reputation_score',
      'process_payout',
      'approve_submission',
      'get_campaign_stats'
    ]

    expectedFunctions.forEach(func => {
      expect(functionsContent).toContain(`CREATE OR REPLACE FUNCTION public.${func}`)
    })

    // Check for triggers
    expect(functionsContent).toContain('CREATE TRIGGER')
    expect(functionsContent).toContain('on_auth_user_created')
    expect(functionsContent).toContain('update_campaign_slots_trigger')
  })

  it('should have proper indexes for performance', () => {
    const schemaContent = fs.readFileSync(
      path.join(migrationsPath, '001_initial_schema.sql'), 
      'utf-8'
    )

    // Check for important indexes
    expect(schemaContent).toContain('CREATE INDEX idx_campaigns_brand_id')
    expect(schemaContent).toContain('CREATE INDEX idx_campaigns_status')
    expect(schemaContent).toContain('CREATE INDEX idx_applications_campaign_id')
    expect(schemaContent).toContain('CREATE INDEX idx_submissions_status')
    expect(schemaContent).toContain('CREATE INDEX idx_transactions_user_id')
  })
})