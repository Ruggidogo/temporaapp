-- Update trial_ends_at default from 14 days to 7 days for new users
ALTER TABLE public.profiles 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '7 days');