import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });

      // Use webm format which is widely supported
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") 
        ? "audio/webm" 
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast.error("Vui lòng cho phép truy cập microphone để sử dụng tính năng này");
      } else {
        toast.error("Không thể bắt đầu ghi âm");
      }
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || "audio/webm" 
        });

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(",")[1];
            
            // Call edge function to transcribe
            const { data, error } = await supabase.functions.invoke("transcribe-audio", {
              body: { audio: base64Audio }
            });

            setIsTranscribing(false);

            if (error) {
              console.error("Transcription error:", error);
              toast.error("Không thể chuyển đổi giọng nói thành văn bản");
              resolve(null);
              return;
            }

            if (data?.text) {
              resolve(data.text);
            } else {
              toast.info("Không nghe rõ giọng nói, vui lòng thử lại");
              resolve(null);
            }
          };
        } catch (error) {
          console.error("Transcription failed:", error);
          setIsTranscribing(false);
          toast.error("Lỗi khi xử lý giọng nói");
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current.stop();
    }
    chunksRef.current = [];
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
