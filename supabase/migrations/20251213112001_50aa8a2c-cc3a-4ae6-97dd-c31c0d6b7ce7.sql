-- Create rate limiting table to track API requests
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (identifier, endpoint, window_start)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow the service role to manage rate limits (edge functions use service role)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 20,
    p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_current_count INTEGER;
BEGIN
    -- Calculate the start of the current window
    v_window_start := date_trunc('minute', now()) - 
        ((EXTRACT(MINUTE FROM now())::INTEGER % p_window_minutes) * INTERVAL '1 minute');
    
    -- Try to insert or update the rate limit record
    INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_start)
    VALUES (p_identifier, p_endpoint, 1, v_window_start)
    ON CONFLICT (identifier, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING request_count INTO v_current_count;
    
    -- Clean up old entries (older than 1 hour)
    DELETE FROM public.rate_limits 
    WHERE window_start < now() - INTERVAL '1 hour';
    
    -- Check if rate limit exceeded
    RETURN v_current_count <= p_max_requests;
END;
$$;