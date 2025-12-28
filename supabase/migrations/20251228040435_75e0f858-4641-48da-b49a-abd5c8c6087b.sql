
-- Create trigger function to notify when someone receives a new private message
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get sender's display name
  SELECT display_name INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Create notification for the receiver
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    NEW.receiver_id,
    'message',
    'Tin nhắn mới',
    COALESCE(sender_name, 'Một người bạn') || ' đã gửi tin nhắn cho bạn',
    NEW.sender_id,
    NEW.id::TEXT
  );

  RETURN NEW;
END;
$function$;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON public.private_messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

-- Create trigger function to notify when someone saves a moment
CREATE OR REPLACE FUNCTION public.create_save_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  saver_name TEXT;
  moment_owner_id UUID;
BEGIN
  -- Get the moment owner's user_id
  SELECT user_id INTO moment_owner_id
  FROM public.shared_light_moments
  WHERE id = NEW.moment_id;

  -- Don't notify if saving own moment
  IF moment_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get saver's display name
  SELECT display_name INTO saver_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Create notification for the moment owner
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    moment_owner_id,
    'save',
    'Khoảnh khắc được lưu',
    COALESCE(saver_name, 'Một linh hồn') || ' đã lưu khoảnh khắc của bạn',
    NEW.user_id,
    NEW.moment_id::TEXT
  );

  RETURN NEW;
END;
$function$;

-- Create trigger for saved moments
DROP TRIGGER IF EXISTS on_new_save ON public.saved_moments;
CREATE TRIGGER on_new_save
  AFTER INSERT ON public.saved_moments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_save_notification();
