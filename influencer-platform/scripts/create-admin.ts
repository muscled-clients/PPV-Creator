import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const adminEmail = 'admin@example.com' // Change this
  const adminPassword = 'Admin@123456' // Change this - make it strong!
  const adminName = 'System Admin'

  try {
    // Step 1: Create auth user
    console.log('Creating admin user in auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('Auth user created:', authData.user?.id)

    // Step 2: Create user profile with admin role
    console.log('Creating admin profile...')
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user?.id,
        email: adminEmail,
        full_name: adminName,
        username: 'admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('You can now login with these credentials')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
createAdminUser()