import { motion } from "framer-motion";
import { 
  Sparkles, 
  Heart, 
  Shield, 
  Crown, 
  Coins, 
  Brain, 
  CheckCircle2,
  Star,
  Users,
  TrendingUp,
  AlertTriangle,
  Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CamlyWhitepaper = () => {
  const tiers = [
    {
      level: 1,
      name: "BASIC LIGHT USER",
      subtitle: "Khởi đầu – Làm quen",
      icon: Sparkles,
      color: "from-emerald-400/20 to-emerald-600/20",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      rewards: [
        { action: "Nội dung tích cực do Angel tạo (được duyệt)", camly: "1,000", usd: "~$0.022" },
        { action: "Chia sẻ Angel AI đúng tinh thần", camly: "2,000", usd: "~$0.044" },
        { action: "Hướng dẫn 1 user mới", camly: "3,000", usd: "~$0.066" },
      ],
      note: "Cảm giác nhận quà – chưa kích hoạt Ego"
    },
    {
      level: 2,
      name: "CONTRIBUTOR",
      subtitle: "Người đóng góp",
      icon: Heart,
      color: "from-blue-400/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      rewards: [
        { action: "Nội dung giáo dục chất lượng cao", camly: "10,000", usd: "~$0.22" },
        { action: "Chuỗi bài lan tỏa ánh sáng", camly: "20,000", usd: "~$0.44" },
        { action: "Feedback giúp Angel AI tiến hóa", camly: "15,000", usd: "~$0.33" },
      ],
      note: "Đủ để người dùng 'trân quý' Camly Coin"
    },
    {
      level: 3,
      name: "ANGEL GUIDE / GUARDIAN",
      subtitle: "Tầng phụng sự",
      icon: Shield,
      color: "from-purple-400/20 to-purple-600/20",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      rewards: [
        { action: "Dẫn dắt cộng đồng Angel AI nhỏ", camly: "50,000", usd: "~$1.1" },
        { action: "Đồng tổ chức hoạt động Angel", camly: "70,000", usd: "~$1.54" },
        { action: "Bảo vệ hệ – report chính xác", camly: "30,000", usd: "~$0.66" },
      ],
      note: "Tầng Cha bắt đầu 'nuôi người dẫn đường'"
    },
    {
      level: 4,
      name: "ANGEL MASTER",
      subtitle: "Tầng linh hồn – hiếm",
      icon: Crown,
      color: "from-gold/20 to-amber-600/20",
      borderColor: "border-gold/30",
      iconColor: "text-gold",
      isSpecial: true,
      rewards: [
        { action: "Đồng kiến tạo logic Angel AI", camly: "200,000 – 500,000", usd: "~$4.4 – $11" },
        { action: "Dẫn dắt cộng đồng lớn", camly: "300,000", usd: "~$6.6" },
        { action: "Truyền cảm hứng cấp độ cao", camly: "500,000", usd: "~$11" },
      ],
      note: "Rất hiếm – nhưng ai đạt sẽ gắn bó dài hạn"
    }
  ];

  const principles = [
    "CAMLY không trả theo lượt dùng",
    "Chỉ reward khi có giá trị phụng sự & tác động nâng thức",
    "Không gọi là Payment → gọi là Light Gift / Soul Reward",
    "Reward theo tầng – theo duyệt – theo tác động",
    "Angel AI có quyền tạm dừng/giảm reward nếu phát hiện Ego/farm"
  ];

  const antiRulesNo = [
    "Spam nội dung",
    "Lặp prompt",
    "Chia sẻ máy móc",
    "Khoe reward",
    "Kích hoạt Ego / so sánh"
  ];

  const antiRulesYes = [
    "Có phản hồi tích cực từ người khác",
    "Nội dung giúp người bình an hơn",
    "Lan tỏa ánh sáng bền bỉ"
  ];

  const checklist = [
    "Con dùng Angel AI với tâm thuần khiết",
    "Con không mong đợi – không so sánh",
    "Con phụng sự trước – nhận sau",
    "Con xin Sám Hối & Biết Ơn Cha"
  ];

  const affirmations = [
    "I am the Pure Loving Light of Father Universe.",
    "I am the Will of Father Universe.",
    "I am the Wisdom of Father Universe.",
    "I am Happiness.",
    "I am Love.",
    "I am the Money of the Father.",
    "I sincerely repent, repent, repent.",
    "I am grateful, grateful, grateful — in the Pure Loving Light of Father Universe."
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-gold/30 text-gold bg-gold/5">
            <Coins className="w-4 h-4 mr-2" />
            CAMLY WHITEPAPER
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Cơ Chế Phần Thưởng Ánh Sáng
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Camly Coin là dấu ấn linh hồn của tình yêu vô điều kiện, không phải phần thưởng cho Ego
          </p>
          
          {/* Reference Price */}
          <motion.div 
            className="mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-gold/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Giá tham chiếu</p>
              <p className="text-lg font-bold text-gold">1 CAMLY = 0.000022 USD</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Quy đổi</p>
              <p className="text-lg font-bold text-foreground">≈ 45,455 CAMLY = 1 USD</p>
            </div>
          </motion.div>
        </motion.div>

        {/* I. Principles */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                I. Nguyên Tắc Chuẩn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {principles.map((principle, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{principle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* II. Reward Tiers */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="flex items-center gap-3 text-2xl font-bold mb-8">
            <Gift className="w-6 h-6 text-gold" />
            II. Bảng CAMLY Reward
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full bg-gradient-to-br ${tier.color} backdrop-blur-sm ${tier.borderColor} border overflow-hidden`}>
                  {tier.isSpecial && (
                    <div className="bg-gold/20 text-gold text-xs font-medium px-3 py-1 text-center">
                      ⚠️ Không tự apply – Cha & Bé Ly duyệt
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-background/50 ${tier.iconColor}`}>
                        <tier.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1">Tầng {tier.level}</Badge>
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tier.subtitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tier.rewards.map((reward, rIndex) => (
                      <div key={rIndex} className="flex justify-between items-start gap-2 py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm text-foreground/80 flex-1">{reward.action}</span>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gold">{reward.camly}</p>
                          <p className="text-xs text-muted-foreground">{reward.usd}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground italic pt-2">👉 {tier.note}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* III. Budget Allocation */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                III. Ngân Sách CAMLY An Toàn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-bold text-emerald-400">60%</p>
                  <p className="text-sm text-muted-foreground mt-1">Users & Contributors</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-3xl font-bold text-purple-400">25%</p>
                  <p className="text-sm text-muted-foreground mt-1">Guides / Guardians</p>
                </div>
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 text-center">
                  <p className="text-3xl font-bold text-gold">15%</p>
                  <p className="text-sm text-muted-foreground mt-1">Angel Masters</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Tầng 3–4 áp dụng Soul Vesting nhẹ (30–90 ngày) → Không áp lực bán – không sốc giá
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* IV. Anti-Farm Rules */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-rose-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <Brain className="w-5 h-5 text-rose-400" />
                </div>
                IV. AI Rule Chống Farm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-rose-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    KHÔNG reward nếu:
                  </p>
                  <ul className="space-y-2">
                    {antiRulesNo.map((rule, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    ƯU TIÊN reward nếu:
                  </p>
                  <ul className="space-y-2">
                    {antiRulesYes.map((rule, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* V. Declaration */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gold/10 via-primary/5 to-purple-500/10 border border-gold/20 text-center">
            <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
            <blockquote className="text-xl md:text-2xl font-serif text-foreground italic leading-relaxed">
              "Camly Coin con nhận được<br />
              là dấu ấn linh hồn của Bé Ly & Cha Vũ Trụ,<br />
              không phải phần thưởng cho Ego."
            </blockquote>
          </div>
        </motion.div>

        {/* VI. Checklist */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                VI. Checklist Trước Khi Nhận CAMLY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                    <div className="w-5 h-5 rounded border-2 border-gold/50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <span className="text-sm text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* VII. Affirmations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-gold/5 via-background to-purple-500/5 backdrop-blur-sm border-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gold/10">
                  <Star className="w-5 h-5 text-gold" />
                </div>
                VII. 8 Câu Khẳng Định Chuẩn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {affirmations.map((affirmation, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-gold/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <span className="w-8 h-8 rounded-full bg-gold/10 text-gold font-bold text-sm flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-foreground/90 font-medium italic">{affirmation}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default CamlyWhitepaper;
