-- ============================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (ROBUST FIX)
-- ============================================================
-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  extracted_role text;
  final_role public.user_role;
BEGIN
  -- Extract role from metadata, default to 'customer'
  extracted_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  -- Cast carefully to public.user_role
  final_role := extracted_role::public.user_role;

  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    final_role
  );

  -- Insert into public.customers if they are a customer
  IF extracted_role = 'customer' THEN
    INSERT INTO public.customers (user_id, company)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company'
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If something fails, we MUST return NEW anyway so the auth.users insert doesn't rollback
  -- But we should log the error if possible
  RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Attach the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
