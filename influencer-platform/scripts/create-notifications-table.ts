import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createNotificationsTable() {
  try {
    // Create notifications table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create notifications table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          data JSONB,
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

        -- Enable RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON public.notifications
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON public.notifications
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete own notifications" ON public.notifications
          FOR DELETE USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "System can insert notifications" ON public.notifications
          FOR INSERT WITH CHECK (true);
      `
    })

    if (createTableError) {
      // If exec_sql doesn't exist, try direct SQL
      console.log('exec_sql failed, trying alternative approach...')
      
      // Use the Supabase SQL editor API or direct connection
      // For now, let's output the SQL for manual execution
      console.log('\nPlease execute the following SQL in your Supabase SQL editor:\n')
      console.log(`
-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
      `)
    } else {
      console.log('✅ Notifications table created successfully!')
    }

    // Test if table exists
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Table test failed:', error)
    } else {
      console.log('✅ Table verification successful!')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  } finally {
    process.exit(0)
  }
}

createNotificationsTable()