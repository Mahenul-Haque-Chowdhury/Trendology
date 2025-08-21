const { createClient } = require('@supabase/supabase-js')

// Replace with your Supabase project URL and service role key
const supabase = createClient('https://masgnkbsczgbhxgqjhib.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hc2dua2JzY3pnYmh4Z3FqaGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA3MjI3NCwiZXhwIjoyMDcwNjQ4Mjc0fQ.WIrJjiAfiwJ3y6dwYh4UrAyN4eV8DckZ9LW3WMQqn8g')

// Replace with your admin user's UUID
const userIds = [
  '6e2b17f1-9d91-4bc6-a5ff-f66bc1ac5501',
  '6d10c8e8-531c-489a-ad67-de1031c91ccc'
  // Add more UUIDs here
]

async function setAdminRole() {
  for (const userId of userIds) {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    })
    if (error) {
      console.error(`Error updating user ${userId}:`, error)
    } else {
      console.log(`User updated: ${userId}`, data)
    }
  }
}

setAdminRole()
