const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('Applying migration for multiple content links...\n')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250121_add_multiple_content_links.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute\n`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      
      // For debugging - show first 100 chars of statement
      console.log(`  ${statement.substring(0, 100)}...`)
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      })
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message)
        // Continue with other statements even if one fails
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }
    
    console.log('\n✅ Migration complete!')
    
    // Verify the table was created
    const { data, error } = await supabase
      .from('application_content_links')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('\n❌ Table verification failed:', error.message)
    } else {
      console.log('\n✅ Table application_content_links verified successfully!')
    }
    
  } catch (error) {
    console.error('Error applying migration:', error)
  }
}

applyMigration()