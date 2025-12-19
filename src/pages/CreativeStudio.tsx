import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
import { 
  Sparkles, 
  Wand2, 
  Download, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Palette,
  Save,
  Images,
  Settings2,
  Link2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useImageGallery } from "@/hooks/useImageGallery";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import PromptBuilder from "@/components/PromptBuilder";

const promptSuggestions = [
  "Thiên thần đang bay trên bầu trời hoàng hôn với đôi cánh vàng rực rỡ",
  "Khu vườn thiên đường với hoa sen và ánh sáng thần thánh",
  "Cảnh bình minh trên núi với mây mù huyền bí",
  "Chân dung thiên thần với vầng hào quang sáng rực",
  "Đền thờ cổ đại trong rừng với ánh sáng xuyên qua cây",
];

export default function CreativeStudio() {
  const [prompt, setPrompt] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [mainView, setMainView] = useState<"create" | "gallery">("create");
  const [isSaving, setIsSaving] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(true);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { isGenerating, generatedImage, generateImage, editImage, clearImage } = useImageGeneration();
  const { saveImage, refetch } = useImageGallery();

  const connectBlockchain = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Vui lòng cài đặt MetaMask để kết nối blockchain");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        toast.success("Kết nối blockchain thành công!");
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Bạn đã từ chối kết nối ví");
      } else {
        toast.error("Không thể kết nối blockchain");
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    toast.success("Đã ngắt kết nối ví");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generateImage(prompt);
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !uploadedImage) return;
    await editImage(editPrompt, uploadedImage);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `angel-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage || !prompt.trim()) return;
    setIsSaving(true);
    const success = await saveImage(generatedImage, prompt);
    if (success) {
      refetch();
    }
    setIsSaving(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-rose-light/5 to-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-rose-soft/30">
              <Palette className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground">
              Creative Studio
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Tạo những hình ảnh thiêng liêng và đẹp đẽ với sức mạnh của AI
          </p>

          {/* Main View Toggle */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              variant={mainView === "create" ? "default" : "outline"}
              onClick={() => setMainView("create")}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Tạo Ảnh
            </Button>
            <Button
              variant={mainView === "gallery" ? "default" : "outline"}
              onClick={() => setMainView("gallery")}
              className="flex items-center gap-2"
            >
              <Images className="w-4 h-4" />
              Gallery
            </Button>
            
            {/* Blockchain Connect Button */}
            {walletAddress ? (
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="flex items-center gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
              >
                <Link2 className="w-4 h-4" />
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={connectBlockchain}
                disabled={isConnectingWallet}
                className="flex items-center gap-2 border-primary/50 hover:bg-primary/5"
              >
                {isConnectingWallet ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                Liên kết Blockchain
              </Button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mainView === "create" ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-6xl mx-auto"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="generate" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Tạo Mới
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Chỉnh Sửa
                  </TabsTrigger>
                </TabsList>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Input Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border-rose-soft/30 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {activeTab === "generate" ? (
                            <>
                              <Sparkles className="w-5 h-5 text-primary" />
                              Mô tả hình ảnh
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-5 h-5 text-primary" />
                              Chỉnh sửa hình ảnh
                            </>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {activeTab === "generate" 
                            ? "Nhập mô tả chi tiết về hình ảnh bạn muốn tạo"
                            : "Tải lên hình ảnh và mô tả những thay đổi bạn muốn"
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <TabsContent value="generate" className="mt-0 space-y-4">
                          <Textarea
                            placeholder="Ví dụ: Một thiên thần với đôi cánh trắng đang bay trên bầu trời đầy sao..."
                            value={prompt}
                            onChange={(e) => {
                              setPrompt(e.target.value);
                              setBasePrompt(e.target.value);
                            }}
                            className="min-h-[100px] resize-none border-rose-soft/40 focus:border-primary"
                          />
                          
                          {/* Prompt Builder Toggle */}
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPromptBuilder(!showPromptBuilder)}
                              className="text-xs h-8 gap-1"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                              {showPromptBuilder ? "Ẩn tùy chọn" : "Hiện tùy chọn sáng tạo"}
                            </Button>
                          </div>

                          {/* Prompt Builder */}
                          <AnimatePresence>
                            {showPromptBuilder && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border border-rose-soft/30 rounded-lg p-3 bg-rose-soft/5"
                              >
                                <PromptBuilder 
                                  basePrompt={basePrompt}
                                  onPromptChange={setPrompt}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          {/* Suggestions */}
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Gợi ý nhanh:</p>
                            <div className="flex flex-wrap gap-2">
                              {promptSuggestions.map((suggestion, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs px-3 py-1.5 rounded-full bg-rose-soft/20 hover:bg-rose-soft/40 text-foreground/80 transition-colors"
                                >
                                  {suggestion.slice(0, 25)}...
                                </button>
                              ))}
                            </div>
                          </div>

                          <Button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full bg-gradient-to-r from-primary to-rose-soft hover:opacity-90"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tạo...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Tạo Hình Ảnh
                              </>
                            )}
                          </Button>
                        </TabsContent>

                        <TabsContent value="edit" className="mt-0 space-y-4">
                          {/* Upload area */}
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-rose-soft/40 rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
                          >
                            {uploadedImage ? (
                              <div className="relative">
                                <img 
                                  src={uploadedImage} 
                                  alt="Uploaded" 
                                  className="max-h-48 mx-auto rounded-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-2 right-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadedImage(null);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                                <p className="text-muted-foreground">
                                  Click để tải lên hình ảnh
                                </p>
                              </div>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>

                          <Textarea
                            placeholder="Mô tả những thay đổi bạn muốn... Ví dụ: Thêm cầu vồng phía sau, làm sáng hơn..."
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="min-h-[100px] resize-none border-rose-soft/40 focus:border-primary"
                          />

                          <Button 
                            onClick={handleEdit}
                            disabled={isGenerating || !editPrompt.trim() || !uploadedImage}
                            className="w-full bg-gradient-to-r from-primary to-rose-soft hover:opacity-90"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Chỉnh Sửa Ảnh
                              </>
                            )}
                          </Button>
                        </TabsContent>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Output Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-rose-soft/30 bg-white/80 backdrop-blur-sm h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          Kết Quả
                        </CardTitle>
                        <CardDescription>
                          Hình ảnh được tạo sẽ hiển thị ở đây
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AnimatePresence mode="wait">
                          {isGenerating ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="aspect-square rounded-lg bg-gradient-to-br from-rose-soft/20 to-primary/10 flex flex-col items-center justify-center"
                            >
                              <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              </div>
                              <p className="mt-4 text-muted-foreground">Đang tạo hình ảnh...</p>
                            </motion.div>
                          ) : generatedImage ? (
                            <motion.div
                              key="result"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="space-y-4"
                            >
                              <div className="relative group">
                                <img 
                                  src={generatedImage} 
                                  alt="Generated" 
                                  className="w-full rounded-lg shadow-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleDownload}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Tải xuống
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setUploadedImage(generatedImage);
                                      setActiveTab("edit");
                                    }}
                                  >
                                    <Wand2 className="w-4 h-4 mr-1" />
                                    Chỉnh sửa
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {user && (
                                  <Button
                                    variant="default"
                                    className="flex-1 bg-gradient-to-r from-primary to-rose-soft"
                                    onClick={handleSaveToGallery}
                                    disabled={isSaving}
                                  >
                                    {isSaving ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Lưu vào Gallery
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  className={user ? "" : "flex-1"}
                                  onClick={handleDownload}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Tải xuống
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    clearImage();
                                    setPrompt("");
                                  }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="aspect-square rounded-lg bg-gradient-to-br from-rose-soft/10 to-primary/5 border-2 border-dashed border-rose-soft/30 flex flex-col items-center justify-center text-center p-6"
                            >
                              <ImageIcon className="w-16 h-16 text-muted-foreground/40 mb-4" />
                              <p className="text-muted-foreground">
                                Nhập mô tả và nhấn "Tạo Hình Ảnh" để bắt đầu
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <ImageGallery />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
