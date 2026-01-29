-- Add explicit INSERT policy with WITH CHECK for entry_tags table
CREATE POLICY "Users can create their own entry tags"
ON public.entry_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.time_entries
    WHERE time_entries.id = entry_tags.entry_id
    AND time_entries.user_id = auth.uid()
  )
);