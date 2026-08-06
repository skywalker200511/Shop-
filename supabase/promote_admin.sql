-- Run this script in the Supabase SQL Editor AFTER you have registered an account at /register

-- This will promote the user with the specified email to 'admin' role
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@gmail.com';

-- You can also run this for support staff:
-- UPDATE public.users
-- SET role = 'support'
-- WHERE email = 'support@gmail.com';
