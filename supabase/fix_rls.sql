-- ============================================================
-- FIX RLS POLICIES FOR REGISTRATION
-- ============================================================
-- Run this in your Supabase SQL Editor to allow new users
-- to create their profiles when registering.
-- ============================================================

-- Allow authenticated users to insert their own user profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own customer profile
CREATE POLICY "Customers can insert own profile" ON public.customers
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


