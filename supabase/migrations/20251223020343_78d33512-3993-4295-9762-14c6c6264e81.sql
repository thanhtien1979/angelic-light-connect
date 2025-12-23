-- Drop the existing check constraint and add new one with daily_login
ALTER TABLE public.light_acknowledgements 
DROP CONSTRAINT IF EXISTS light_acknowledgements_acknowledgement_type_check;

ALTER TABLE public.light_acknowledgements 
ADD CONSTRAINT light_acknowledgements_acknowledgement_type_check 
CHECK (acknowledgement_type IN ('meditation_completion', 'reflection_note', 'chat_message', 'daily_login'));