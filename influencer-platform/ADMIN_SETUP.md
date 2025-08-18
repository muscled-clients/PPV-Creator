# How to Create and Login as Admin

## Method 1: Convert Existing User to Admin (Easiest)

1. **Register a normal account first**
   - Go to `/auth/register`
   - Create an account as either Influencer or Brand
   - Verify your email if required

2. **Get your User ID**
   - Login to your Supabase Dashboard
   - Go to Authentication → Users
   - Find your user and copy the User ID (UUID)

3. **Update your role to Admin**
   - Go to Supabase Dashboard → Table Editor
   - Open the `user_profiles` table
   - Find your record (by email)
   - Change the `role` field from 'influencer' or 'brand' to 'admin'
   - Save the changes

4. **Login as Admin**
   - Go to `/auth/login`
   - Use your email and password
   - You'll be redirected to `/admin/dashboard`

## Method 2: Using SQL Editor in Supabase

Run this SQL in Supabase SQL Editor:

```sql
-- Replace with your actual email
UPDATE user_profiles 
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Method 3: Create Admin via Script

1. Install dependencies:
```bash
npm install dotenv
```

2. Edit the script `scripts/create-admin.ts`:
   - Change `adminEmail` to your desired email
   - Change `adminPassword` to a strong password

3. Run the script:
```bash
npx tsx scripts/create-admin.ts
```

## Admin Features Available

Once logged in as admin, you can access:

- **Dashboard**: `/admin/dashboard` - Overview of platform activity
- **User Management**: `/admin/users` - Manage all users
- **Campaign Review**: `/admin/campaigns` - Review and moderate campaigns
- **Transactions**: `/admin/transactions` - View all transactions
- **Reports**: `/admin/reports` - Platform analytics
- **System Settings**: `/admin/settings` - Platform configuration

## Default Admin Credentials (if using script)

- **Email**: admin@example.com
- **Password**: Admin@123456

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

## Troubleshooting

If you can't login as admin:

1. Check that the `role` field in `user_profiles` table is exactly 'admin' (lowercase)
2. Make sure the user exists in both `auth.users` and `user_profiles` tables
3. Clear your browser cache/cookies
4. Check browser console for errors

## Security Note

- Admin accounts have full access to the platform
- Use strong passwords
- Enable 2FA if available
- Regularly audit admin access
- Remove admin access when no longer needed