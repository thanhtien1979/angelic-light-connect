

# Kế hoạch: Phân trang cuộn vô hạn & Xuất lịch sử chat

## Tổng quan

Thêm 2 tính năng cho Chat Portal:
- **Cuộn vô hạn (Infinite Scroll)**: Tự động tải thêm tin nhắn cũ khi người dùng cuộn lên đầu
- **Xuất lịch sử chat**: Nút tải về toàn bộ lịch sử chat dưới dạng file JSON hoặc TXT

---

## Chi tiết kỹ thuật

### 1. Hook `useAngelChat.ts` - Thêm phân trang

**Thay đổi:**
- Thêm hàm `loadMoreMessages()` để tải tin nhắn cũ hơn
- Thêm state `hasMoreMessages` để biết còn tin nhắn cũ không
- Thêm state `isLoadingMore` để hiển thị loading khi tải thêm
- Sử dụng cursor-based pagination dựa trên `created_at`
- Mỗi lần tải thêm 50 tin nhắn

```text
Luồng hoạt động:
┌─────────────────┐
│ Khởi tạo chat   │
│ Tải 50 tin gần  │
│ nhất từ DB      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cuộn lên đầu    │
│ → Gọi loadMore  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tải 50 tin cũ   │
│ hơn, chèn vào   │
│ đầu danh sách   │
└─────────────────┘
```

### 2. Hook mới `useChatExport.ts` - Xuất lịch sử

**Tính năng:**
- Hàm `exportAsJSON()`: Xuất toàn bộ tin nhắn dạng JSON
- Hàm `exportAsText()`: Xuất dạng văn bản thuần
- Tự động đặt tên file với ngày giờ

**Format xuất:**
```text
JSON:
{
  "exported_at": "2026-02-03T...",
  "total_messages": 500,
  "messages": [
    {"role": "user", "content": "...", "created_at": "..."},
    {"role": "assistant", "content": "...", "created_at": "..."}
  ]
}

TXT:
=== Angel AI - Lịch sử trò chuyện ===
Xuất ngày: 03/02/2026 12:00

[03/02/2026 10:00] Bạn: Xin chào
[03/02/2026 10:01] Angel AI: Chào mừng bạn...
```

### 3. Component `ChatPortal.tsx` - Cập nhật UI

**Infinite Scroll:**
- Sử dụng `IntersectionObserver` để detect khi cuộn đến đầu
- Hiển thị loading spinner khi đang tải thêm
- Giữ vị trí cuộn không bị nhảy khi chèn tin nhắn mới

**Nút xuất:**
- Thêm nút "Tải xuống" (Download icon) vào header
- Menu dropdown chọn định dạng: JSON hoặc TXT
- Toast thông báo khi xuất thành công

### 4. Component mới `ChatLoadMoreIndicator.tsx`

Hiển thị:
- Spinner loading khi đang tải
- Thông báo "Đã tải hết tin nhắn" khi không còn

---

## Các file cần tạo/chỉnh sửa

| File | Hành động |
|------|-----------|
| `src/hooks/useAngelChat.ts` | Sửa - thêm pagination logic |
| `src/hooks/useChatExport.ts` | Tạo mới - export functionality |
| `src/components/ChatPortal.tsx` | Sửa - thêm infinite scroll & export UI |
| `src/components/ChatLoadMoreIndicator.tsx` | Tạo mới - loading indicator |
| `src/components/ChatExportMenu.tsx` | Tạo mới - export dropdown menu |

---

## Ước tính

- Không cần thay đổi database
- Không cần edge function mới
- Tương thích hoàn toàn với hệ thống hiện tại
- Bảo mật: Chỉ user đã đăng nhập mới có thể export/load more

