DO $$
BEGIN
  IF to_regclass('public.students') IS NOT NULL THEN
    ALTER TABLE public.students
      ADD COLUMN IF NOT EXISTS aadhar_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(12);
  END IF;
END $$;
