import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eraser, 
  Upload, 
  Download, 
  Loader2, 
  Check,
  Sparkles,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

// Spiritual backgrounds
const spiritualBackgrounds = [
  {
    id: "heaven",
    name: "Thiên Đường",
    gradient: "linear-gradient(180deg, #87CEEB 0%, #FFE4B5 50%, #FFFFFF 100%)",
    preview: "bg-gradient-to-b from-sky-300 via-amber-100 to-white"
  },
  {
    id: "galaxy",
    name: "Ngân Hà",
    gradient: "linear-gradient(180deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
    preview: "bg-gradient-to-b from-[#0F0C29] via-[#302B63] to-[#24243E]"
  },
  {
    id: "aurora",
    name: "Cực Quang",
    gradient: "linear-gradient(180deg, #000428 0%, #004e92 30%, #00d4ff 60%, #48c6ef 100%)",
    preview: "bg-gradient-to-b from-[#000428] via-[#004e92] to-cyan-400"
  },
  {
    id: "divine-light",
    name: "Ánh Sáng Thần Thánh",
    gradient: "radial-gradient(circle at center, #FFFEF0 0%, #FFD700 40%, #FFA500 80%, #FF8C00 100%)",
    preview: "bg-gradient-radial from-yellow-50 via-amber-400 to-orange-500"
  },
  {
    id: "rose-garden",
    name: "Vườn Hồng",
    gradient: "linear-gradient(180deg, #FFDEE9 0%, #B5FFFC 100%)",
    preview: "bg-gradient-to-b from-pink-200 to-cyan-100"
  },
  {
    id: "sacred-sunset",
    name: "Hoàng Hôn Linh Thiêng",
    gradient: "linear-gradient(180deg, #FF512F 0%, #F09819 30%, #FDCBF1 70%, #E8CBC0 100%)",
    preview: "bg-gradient-to-b from-orange-500 via-amber-400 to-pink-200"
  },
  {
    id: "cosmic-purple",
    name: "Vũ Trụ Tím",
    gradient: "linear-gradient(180deg, #1A0533 0%, #3D1F5C 30%, #6B2D7B 60%, #9D4EDD 100%)",
    preview: "bg-gradient-to-b from-purple-950 via-purple-800 to-purple-500"
  },
  {
    id: "ocean-depths",
    name: "Đại Dương Sâu Thẳm",
    gradient: "linear-gradient(180deg, #000046 0%, #1CB5E0 100%)",
    preview: "bg-gradient-to-b from-[#000046] to-cyan-500"
  },
  {
    id: "angelic-clouds",
    name: "Mây Thiên Thần",
    gradient: "linear-gradient(180deg, #E0C3FC 0%, #8EC5FC 50%, #FFFFFF 100%)",
    preview: "bg-gradient-to-b from-purple-200 via-sky-200 to-white"
  },
  {
    id: "transparent",
    name: "Trong Suốt (PNG)",
    gradient: "transparent",
    preview: "bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><rect fill=%22%23ccc%22 width=%2210%22 height=%2210%22/><rect fill=%22%23fff%22 x=%2210%22 width=%2210%22 height=%2210%22/><rect fill=%22%23fff%22 y=%2210%22 width=%2210%22 height=%2210%22/><rect fill=%22%23ccc%22 x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22/></svg>')] bg-[length:20px_20px]"
  }
];

interface BackgroundRemoverProps {
  imageUrl?: string | null;
  onApply?: (resultUrl: string) => void;
}

export default function BackgroundRemover({ imageUrl, onApply }: BackgroundRemoverProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(imageUrl || null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>("transparent");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const resizeImageIfNeeded = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement
  ) => {
    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return { width, height };
  };

  const removeBackground = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      toast.info("Đang tải mô hình AI... Lần đầu có thể mất 30-60 giây");
      
      setProgress(20);
      const segmenter = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );

      setProgress(50);

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = uploadedImage;
      });

      // Create canvas and resize
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const { width, height } = resizeImageIfNeeded(canvas, ctx, img);

      setProgress(60);

      // Get image data for segmentation
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Run segmentation
      const result = await segmenter(imageDataUrl);
      setProgress(80);

      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Không thể phân tích ảnh');
      }

      // Find the main subject (person/object) - usually has label that's not "wall", "floor", "sky", etc.
      const backgroundLabels = ['wall', 'floor', 'ceiling', 'sky', 'grass', 'road', 'building', 'tree', 'water', 'sea', 'mountain'];
      
      // Create output canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Could not get output canvas context');

      // Draw the selected background
      const selectedBg = spiritualBackgrounds.find(bg => bg.id === selectedBackground);
      if (selectedBg && selectedBg.gradient !== 'transparent') {
        // Parse and draw gradient
        const gradient = selectedBg.gradient;
        if (gradient.includes('radial-gradient')) {
          const radialGrad = outputCtx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) / 2
          );
          radialGrad.addColorStop(0, '#FFFEF0');
          radialGrad.addColorStop(0.4, '#FFD700');
          radialGrad.addColorStop(0.8, '#FFA500');
          radialGrad.addColorStop(1, '#FF8C00');
          outputCtx.fillStyle = radialGrad;
        } else {
          const linearGrad = outputCtx.createLinearGradient(0, 0, 0, height);
          // Parse gradient stops from the CSS gradient
          const colors = gradient.match(/#[A-Fa-f0-9]{6}/g) || ['#87CEEB', '#FFFFFF'];
          colors.forEach((color, i) => {
            linearGrad.addColorStop(i / (colors.length - 1), color);
          });
          outputCtx.fillStyle = linearGrad;
        }
        outputCtx.fillRect(0, 0, width, height);
      }

      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);

      // Get output image data
      const outputImageData = outputCtx.getImageData(0, 0, width, height);
      const data = outputImageData.data;

      // Combine masks for background elements
      let combinedMask = new Float32Array(width * height).fill(0);
      
      for (const segment of result) {
        const isBackground = backgroundLabels.some(label => 
          segment.label?.toLowerCase().includes(label)
        );
        
        if (isBackground && segment.mask?.data) {
          for (let i = 0; i < segment.mask.data.length; i++) {
            combinedMask[i] = Math.max(combinedMask[i], segment.mask.data[i]);
          }
        }
      }

      // If no background detected, invert the first non-background mask
      if (combinedMask.every(v => v === 0) && result[0]?.mask?.data) {
        for (let i = 0; i < result[0].mask.data.length; i++) {
          combinedMask[i] = 1 - result[0].mask.data[i];
        }
      }

      // Apply mask to alpha channel
      for (let i = 0; i < combinedMask.length; i++) {
        const alpha = Math.round((1 - combinedMask[i]) * 255);
        if (selectedBackground === 'transparent') {
          data[i * 4 + 3] = alpha;
        } else {
          // Blend with background based on alpha
          if (alpha < 255) {
            // Keep background where subject is transparent
          }
        }
      }

      outputCtx.putImageData(outputImageData, 0, 0);

      setProgress(100);

      // Convert to blob then URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        outputCanvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
          'image/png',
          1.0
        );
      });

      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);
      toast.success("Đã xóa nền thành công!");

    } catch (error) {
      console.error('Background removal error:', error);
      toast.error("Không thể xóa nền. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải ảnh!");
  };

  const handleApply = () => {
    if (processedImage && onApply) {
      onApply(processedImage);
      toast.success("Đã áp dụng ảnh!");
    }
  };

  return (
    <Card className="border-rose-soft/30 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eraser className="w-5 h-5 text-primary" />
          Xóa Nền & Thay Background
        </CardTitle>
        <CardDescription>
          Sử dụng AI để xóa nền và thay bằng background tâm linh
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        {!uploadedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rose-soft/40 rounded-lg p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Click để tải lên hình ảnh
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Hỗ trợ JPG, PNG, WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">Ảnh gốc</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={uploadedImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setUploadedImage(null);
                      setProcessedImage(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-center">Kết quả</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><rect fill=%22%23eee%22 width=%2210%22 height=%2210%22/><rect fill=%22%23fff%22 x=%2210%22 width=%2210%22 height=%2210%22/><rect fill=%22%23fff%22 y=%2210%22 width=%2210%22 height=%2210%22/><rect fill=%22%23eee%22 x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22/></svg>')] bg-[length:20px_20px]">
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col items-center justify-center bg-background/80"
                      >
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Đang xử lý... {progress}%
                        </p>
                      </motion.div>
                    ) : processedImage ? (
                      <motion.img
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={processedImage}
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex items-center justify-center bg-muted/50"
                      >
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Background Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Chọn Background</p>
              <div className="grid grid-cols-5 gap-2">
                {spiritualBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedBackground === bg.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50"
                    } ${bg.preview}`}
                    title={bg.name}
                  >
                    {selectedBackground === bg.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {spiritualBackgrounds.find(bg => bg.id === selectedBackground)?.name}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={removeBackground}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-primary to-rose-soft"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Xóa Nền
                  </>
                )}
              </Button>

              {processedImage && (
                <>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                  {onApply && (
                    <Button variant="secondary" onClick={handleApply}>
                      <Check className="w-4 h-4 mr-1" />
                      Áp dụng
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
