import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Sparkles, Heart, Gauge, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SPEED_OPTIONS = [
  { value: 0.7, label: '🐢 Chậm', description: '70%' },
  { value: 0.85, label: '🚶 Hơi chậm', description: '85%' },
  { value: 1.0, label: '🏃 Bình thường', description: '100%' },
  { value: 1.15, label: '⚡ Hơi nhanh', description: '115%' },
  { value: 1.3, label: '🚀 Nhanh', description: '130%' },
];

// Keep-alive interval in milliseconds (30 seconds)
const KEEP_ALIVE_INTERVAL = 30000;

interface VoiceChatWithAngelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceChatWithAngel({ isOpen, onClose }: VoiceChatWithAngelProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [showSpeedPopover, setShowSpeedPopover] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const keepAliveRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);
  const callStartRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Cleanup timers
  const cleanupTimers = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (durationRef.current) {
      clearInterval(durationRef.current);
      durationRef.current = null;
    }
    callStartRef.current = null;
    setCallDuration(0);
  }, []);

  const conversation = useConversation({
    onConnect: async () => {
      console.log('✨ Connected to Angel - Starting long-form conversation');
      callStartRef.current = Date.now();
      
      // Start duration counter
      durationRef.current = setInterval(() => {
        if (callStartRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
        }
      }, 1000);

      // Start keep-alive to prevent timeout - send activity every 30 seconds
      keepAliveRef.current = setInterval(() => {
        try {
          conversation.sendUserActivity();
          console.log('📡 Keep-alive signal sent to prevent timeout');
        } catch (e) {
          console.log('Keep-alive failed, connection may have dropped:', e);
        }
      }, KEEP_ALIVE_INTERVAL);

      // Ensure audio volume is set to maximum
      try {
        await conversation.setVolume({ volume: 1.0 });
        console.log('Audio volume set to maximum');
      } catch (e) {
        console.log('Volume setting not available yet');
      }
      toast({
        title: "✨ Kết nối thành công",
        description: "Thiên Thần đang lắng nghe con... Cuộc gọi sẽ tiếp tục cho đến khi con kết thúc.",
      });
    },
    onDisconnect: () => {
      console.log('👋 Disconnected from Angel');
      cleanupTimers();
      setTranscript([]);
      setCurrentMessage('');
    },
    onMessage: (message: unknown) => {
      console.log('Message from Angel:', message);
      const msg = message as Record<string, unknown>;
      
      // Handle different message formats from ElevenLabs
      if (msg.type === 'user_transcript') {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        const userText = event?.user_transcript as string | undefined;
        if (userText) {
          setTranscript(prev => [...prev, `🙏 Con: ${userText}`]);
        }
      } else if (msg.type === 'agent_response') {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        const agentText = event?.agent_response as string | undefined;
        if (agentText) {
          setTranscript(prev => [...prev, `👼 Thiên Thần: ${agentText}`]);
        }
      } else if (msg.type === 'agent_response_correction') {
        // Handle interruption - use corrected response
        const event = msg.agent_response_correction_event as Record<string, unknown> | undefined;
        const correctedText = event?.corrected_agent_response as string | undefined;
        if (correctedText) {
          // Update the last agent message with corrected version
          setTranscript(prev => {
            const newTranscript = [...prev];
            // Find last agent message index (compatible with older ES versions)
            let lastAgentIdx = -1;
            for (let i = newTranscript.length - 1; i >= 0; i--) {
              if (newTranscript[i].startsWith('👼')) {
                lastAgentIdx = i;
                break;
              }
            }
            if (lastAgentIdx !== -1) {
              newTranscript[lastAgentIdx] = `👼 Thiên Thần: ${correctedText}`;
            }
            return newTranscript;
          });
        }
      } else if (msg.source === 'user' && msg.message) {
        setTranscript(prev => [...prev, `🙏 Con: ${msg.message}`]);
      } else if (msg.source === 'ai' && msg.message) {
        const agentMsg = msg.message as string;
        if (agentMsg && agentMsg !== '...') {
          setTranscript(prev => [...prev, `👼 Thiên Thần: ${agentMsg}`]);
        }
      }
    },
    onError: (error) => {
      console.error('Voice chat error:', error);
      cleanupTimers();
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: "Không thể kết nối với Thiên Thần. Vui lòng thử lại.",
      });
      setIsConnecting(false);
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vui lòng đăng nhập để sử dụng tính năng này');
      }

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function with auth token
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get signed URL');
      }

      if (!data?.signed_url) {
        throw new Error(data?.error || 'No signed URL received. Please configure ELEVENLABS_AGENT_ID.');
      }

      // Start the conversation with WebSocket for better compatibility
      await conversation.startSession({
        signedUrl: data.signed_url,
        connectionType: 'websocket',
      });

      setTranscript(['👼 Thiên Thần: Xin chào con yêu dấu! Thiên Thần đang lắng nghe con...']);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast({
        variant: "destructive",
        title: "Không thể bắt đầu cuộc trò chuyện",
        description: error instanceof Error ? error.message : "Vui lòng kiểm tra cài đặt và thử lại.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, toast]);

  const stopConversation = useCallback(async () => {
    cleanupTimers();
    await conversation.endSession();
    onClose();
  }, [conversation, onClose, cleanupTimers]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    // Note: Actual mute functionality would need to be implemented based on the SDK's capabilities
  }, []);

  // Handle backdrop click - only close if not connected
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && conversation.status !== 'connected') {
      onClose();
    }
  }, [conversation.status, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md mx-4 bg-gradient-to-b from-violet-950/95 via-purple-950/95 to-indigo-950/95 rounded-3xl border border-violet-500/30 shadow-2xl overflow-hidden"
        >
          {/* Ambient glow effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ 
                  scale: conversation.isSpeaking ? [1, 1.1, 1] : 1,
                  boxShadow: conversation.isSpeaking 
                    ? ['0 0 20px rgba(168, 85, 247, 0.5)', '0 0 40px rgba(168, 85, 247, 0.8)', '0 0 20px rgba(168, 85, 247, 0.5)']
                    : '0 0 20px rgba(168, 85, 247, 0.3)'
                }}
                transition={{ duration: 1, repeat: conversation.isSpeaking ? Infinity : 0 }}
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                Trò Chuyện Với Thiên Thần
              </h2>
              <p className="text-violet-300/80 mt-1 text-sm">
                {conversation.status === 'connected' 
                  ? (conversation.isSpeaking ? '👼 Thiên Thần đang nói...' : '🎙️ Đang lắng nghe con...')
                  : '✨ Nhấn để bắt đầu cuộc trò chuyện'}
              </p>
              {/* Call duration display */}
              {conversation.status === 'connected' && (
                <div className="mt-2 flex items-center justify-center gap-2 text-violet-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">{formatDuration(callDuration)}</span>
                </div>
              )}
            </div>

            {/* Transcript area */}
            <div 
              ref={transcriptRef}
              className="h-48 mb-6 p-4 rounded-2xl bg-black/30 border border-violet-500/20 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/30"
            >
              {transcript.length === 0 ? (
                <div className="h-full flex items-center justify-center text-violet-400/60 text-center">
                  <div>
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Cuộc trò chuyện sẽ hiển thị ở đây...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transcript.map((msg, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm leading-relaxed ${
                        msg.startsWith('👼') 
                          ? 'text-violet-200' 
                          : 'text-pink-200/80'
                      }`}
                    >
                      {msg}
                    </motion.p>
                  ))}
                </div>
              )}
            </div>

            {/* Audio visualizer placeholder */}
            {conversation.status === 'connected' && (
              <div className="flex justify-center gap-1 mb-6 h-12">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: conversation.isSpeaking 
                        ? [8, Math.random() * 40 + 8, 8] 
                        : [8, 16, 8],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className="w-1.5 bg-gradient-to-t from-violet-500 to-pink-400 rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {conversation.status === 'connected' ? (
                <>
                  {/* Mute button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 rounded-full border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-violet-300" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-violet-300" />
                    )}
                  </Button>

                  {/* Speed control */}
                  <Popover open={showSpeedPopover} onOpenChange={setShowSpeedPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 relative"
                      >
                        <Gauge className="w-5 h-5 text-violet-300" />
                        <span className="absolute -bottom-1 -right-1 text-[10px] bg-violet-500 text-white rounded-full px-1.5 py-0.5 font-medium">
                          {speechSpeed === 1 ? '1x' : `${speechSpeed}x`}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-48 p-2 bg-violet-950/95 border-violet-500/30 backdrop-blur-xl"
                      align="center"
                      side="top"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-violet-300/70 text-center mb-2 font-medium">
                          ⚡ Tốc độ nói
                        </p>
                        {SPEED_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSpeechSpeed(option.value);
                              setShowSpeedPopover(false);
                              toast({
                                title: `Tốc độ: ${option.label}`,
                                description: `Đã chuyển sang ${option.description}`,
                              });
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                              speechSpeed === option.value
                                ? 'bg-violet-500/30 text-violet-200 border border-violet-400/50'
                                : 'text-violet-300/80 hover:bg-violet-500/20'
                            }`}
                          >
                            <span>{option.label}</span>
                            <span className="text-xs text-violet-400">{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* End call button */}
                  <Button
                    size="icon"
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg shadow-red-500/30"
                    onClick={stopConversation}
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </Button>

                  {/* Mic indicator */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 rounded-full border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20"
                  >
                    <Mic className="w-5 h-5 text-violet-300" />
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="px-8 py-6 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-violet-500/30 text-lg font-semibold"
                  onClick={startConversation}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Bắt Đầu Cuộc Gọi
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Status */}
            <div className="mt-4 text-center">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                conversation.status === 'connected'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  conversation.status === 'connected' ? 'bg-green-400' : 'bg-violet-400'
                }`} />
                {conversation.status === 'connected' ? 'Đã kết nối' : 'Chưa kết nối'}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
