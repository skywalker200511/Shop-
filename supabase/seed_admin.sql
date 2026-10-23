-- ============================================================
-- SEED ADMIN USER SCRIPT
-- ============================================================
-- Run this in your Supabase SQL Editor to bypass email rate limits
-- and instantly create an Admin account.
-- 
-- Email: admin@nexus.ai
-- Password: admin123
-- ============================================================

-- 1. Enable pgcrypto (already enabled in most Supabase projects)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if user already exists from previous script run
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@nexus.ai' LIMIT 1;
  
  IF new_user_id IS NOT NULL THEN
    -- Fix the existing user by setting aud and role
    UPDATE auth.users 
    SET aud = 'authenticated', 
        role = 'authenticated',
        encrypted_password = crypt('admin123', gen_salt('bf')),
        email_confirmed_at = now()
    WHERE id = new_user_id;
  ELSE
    new_user_id := gen_random_uuid();
    
    -- 2. Insert into Supabase Auth
    INSERT INTO auth.users (
      id, 
      instance_id, 
      aud,
      role,
      email, 
      encrypted_password, 
      email_confirmed_at, 
      raw_app_meta_data, 
      raw_user_meta_data, 
      created_at, 
      updated_at
    )
    VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@nexus.ai',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    );

    -- 3. Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      new_user_id::text,
      new_user_id,
      format('{"sub":"%s","email":"admin@nexus.ai"}', new_user_id::text)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  -- 4. Upsert the public user profile (Admin Role)
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    is_active
  )
  VALUES (
    new_user_id,
    'admin@nexus.ai',
    'Shop+ Administrator',
    'admin',
    true
  )
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', is_active = true;

  RAISE NOTICE 'Admin user created successfully!';
END $$;
