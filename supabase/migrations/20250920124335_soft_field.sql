/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - The "Admins can view all profiles" policy causes infinite recursion
    - It queries the profiles table from within a profiles table policy
    - This creates a circular dependency when Supabase evaluates the policy

  2. Solution
    - Drop the problematic admin policy that causes recursion
    - Keep the simple user policies that don't cause recursion
    - Admins can still manage profiles through the application logic
    - This maintains security while preventing the infinite recursion

  3. Security
    - Users can still only view and update their own profiles
    - Application-level role checking can handle admin permissions
    - RLS remains enabled for basic user data protection
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- The remaining policies are safe and don't cause recursion:
-- - "Users can view their own profile" uses (uid() = user_id)
-- - "Users can update their own profile" uses (uid() = user_id)
-- These don't reference the profiles table in their conditions