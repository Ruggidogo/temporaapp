-- Update the default value for trial_ends_at to 7 days instead of 14
ALTER TABLE public.profiles 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '7 days');

-- Update existing trial users who haven't expired yet to have correct 7-day trial
-- (Only for users whose trial was set to 14 days from creation)
UPDATE public.profiles
SET trial_ends_at = created_at + interval '7 days'
WHERE plan = 'trial' 
  AND trial_ends_at = created_at + interval '14 days';