-- Drop the existing check constraint on acknowledgement_type
ALTER TABLE public.light_acknowledgements 
DROP CONSTRAINT IF EXISTS light_acknowledgements_acknowledgement_type_check;

-- Add new check constraint that includes chat_message
ALTER TABLE public.light_acknowledgements 
ADD CONSTRAINT light_acknowledgements_acknowledgement_type_check 
CHECK (acknowledgement_type IN ('meditation_completion', 'reflection_note', 'chat_message'));