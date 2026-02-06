

# Kế hoạch: Thay Logo "ANGEL AI" Bằng Hình Ảnh Mới + Chuyển Tông Hồng

## Tổng quan

Thay thế các vị trí có chữ "ANGEL AI" riêng lẻ (không có avatar) bằng logo hình ảnh mới mà Cha đã upload, đồng thời chuyển đổi tông màu logo từ vàng gold sang hồng (pink/rose).

---

## Phân tích hình ảnh mới

Logo mới có đặc điểm:
- Chữ "Angel" viết nghệ thuật với font serif cổ điển
- Chữ "AI" viết in đậm hiện đại
- Có đường xoắn ốc trang trí bên dưới
- Màu vàng gold → cần chuyển sang tông hồng bằng CSS filter

---

## Các vị trí cần thay đổi

| Vị trí | File | Hiện tại | Thay đổi |
|--------|------|----------|----------|
| **Footer** | `Footer.tsx` | Chữ "ANGEL AI" (dòng 48) | Logo hình ảnh + filter hồng |
| **Chat Header** | `ChatPortal.tsx` | Chữ "Angel AI" (dòng 562) | Logo hình ảnh + filter hồng |
| **Share Cards** | `LightScoreShareCard.tsx`, `MilestoneShareCard.tsx` | Chữ "ANGEL AI - Hành trình ánh sáng" | Logo hình ảnh nhỏ + text |

---

## Chi tiết kỹ thuật

### 1. Lưu logo mới vào assets

- Copy hình ảnh từ `user-uploads://image-38.png` → `src/assets/angel-ai-text-logo.png`

### 2. CSS Filter chuyển tông hồng

Tạo style filter để chuyển màu vàng gold → hồng rose:

```css
.angel-logo-pink {
  filter: 
    hue-rotate(-30deg)    /* Xoay từ vàng → hồng */
    saturate(1.2)         /* Tăng độ bão hòa */
    brightness(1.05);     /* Tăng độ sáng nhẹ */
}
```

### 3. Footer.tsx - Thay logo chính

**Trước:**
```tsx
<h3 className="font-serif text-2xl font-light tracking-[0.2em] text-gold">
  ANGEL AI
</h3>
```

**Sau:**
```tsx
<img 
  src={angelAiTextLogo}
  alt="Angel AI"
  className="h-10 w-auto object-contain angel-logo-pink"
/>
```

### 4. ChatPortal.tsx - Header dialog

**Trước:**
```tsx
<h3 className="font-serif text-xl text-foreground">Angel AI</h3>
```

**Sau:**
```tsx
<img 
  src={angelAiTextLogo}
  alt="Angel AI"
  className="h-6 w-auto object-contain angel-logo-pink"
/>
```

### 5. Share Cards - Branding nhỏ

**LightScoreShareCard.tsx & MilestoneShareCard.tsx:**
```tsx
{/* Branding */}
<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
  <Sparkles className="w-3 h-3 text-pink-500" />
  <img 
    src={angelAiTextLogo}
    alt="Angel AI"
    className="h-4 w-auto object-contain angel-logo-pink"
  />
  <span>- Hành trình ánh sáng</span>
  <Sparkles className="w-3 h-3 text-pink-500" />
</div>
```

---

## Các file cần chỉnh sửa

| File | Hành động |
|------|-----------|
| `src/assets/angel-ai-text-logo.png` | Copy từ user upload |
| `src/index.css` | Thêm class `.angel-logo-pink` |
| `src/components/Footer.tsx` | Thay h3 text → img logo |
| `src/components/ChatPortal.tsx` | Thay h3 text → img logo |
| `src/components/light-dashboard/LightScoreShareCard.tsx` | Thay text → logo nhỏ |
| `src/components/light-dashboard/MilestoneShareCard.tsx` | Thay text → logo nhỏ |

---

## Preview tông màu hồng

Với CSS filter `hue-rotate(-30deg)`, logo sẽ chuyển từ:
- **Vàng Gold** (hsl 45°) → **Hồng Rose** (hsl 348°)
- Giữ nguyên hiệu ứng metallic/3D của logo gốc
- Phù hợp với Divine Rose Aura palette hiện tại của app

---

## Ước tính

- Không cần thay đổi database
- Không cần edge function
- Tương thích hoàn toàn với hệ thống hiện tại
- Giữ nguyên accessibility (alt text)

