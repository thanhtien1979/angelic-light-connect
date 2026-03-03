

# Kế Hoạch: Tính Năng Trả Thưởng Web3 Cho User

## Tổng Quan

Xây dựng hệ thống trả thưởng Web3 cho phép users nhận Camly Coin rewards trực tiếp vào ví blockchain (BSC/Ethereum), kết hợp hệ thống off-chain hiện có với on-chain distribution.

## Hạ Tầng Hiện Có

- **Wallet**: `useWallet` hook + `WalletConnectDialog` hỗ trợ MetaMask, Trust, Bitget, Coinbase, OKX
- **Rewards**: `reward_ledger` + `user_camly_coins` + `secure-award-reward` edge function
- **NFT**: `useNFT` hook (simulated minting) + `nft_transactions` table
- **Gift**: `gift_transactions` table có sẵn field `bsc_tx_hash`
- **Wallet DB**: `user_wallets` + `wallet_transactions` tables đã tồn tại

## Các Module Cần Triển Khai

### 1. Trang Web3 Rewards Dashboard
**File mới**: `src/pages/Web3Rewards.tsx`

Giao diện chính hiển thị:
- Trạng thái ví (connected/disconnected) + nút kết nối
- Số dư Camly Coin off-chain (có thể claim on-chain)
- Lịch sử claim rewards on-chain
- Nút "Claim to Wallet" chuyển rewards từ off-chain → on-chain record

### 2. Hook useWeb3Rewards
**File mới**: `src/hooks/useWeb3Rewards.ts`

Chức năng:
- `claimToWallet(amount)`: Ghi nhận claim request vào `wallet_transactions`, trừ `user_camly_coins`, ghi `reward_ledger`
- `getClaimHistory()`: Lấy lịch sử claim từ `wallet_transactions`
- `getClaimableBalance()`: Tính số coin có thể claim
- Validate: user phải có ví kết nối + đủ số dư + rate limit (max 3 claims/ngày)

### 3. Component Web3ClaimModal
**File mới**: `src/components/Web3ClaimModal.tsx`

Modal xác nhận claim với:
- Input số lượng coin muốn claim
- Hiển thị wallet address nhận
- Network selector (BSC/Ethereum)
- Confirm step với countdown 3s chống spam
- Success animation với tx hash + BscScan link

### 4. Edge Function: claim-web3-reward
**File mới**: `supabase/functions/claim-web3-reward/index.ts`

Server-side validation:
- Xác thực user + kiểm tra ví đã kết nối
- Validate số dư đủ, rate limit (3 claims/ngày, min 100 coins/claim)
- Trừ `user_camly_coins`, ghi `reward_ledger` (amount âm), tạo record `wallet_transactions`
- Trả về simulated tx hash (hoặc real hash khi deploy smart contract)

### 5. Cập Nhật Navigation + Routes
- Thêm route `/web3-rewards` vào `App.tsx`
- Thêm link trong `NavigationHeader` và `Settings`

### 6. Database Migration
- Không cần tạo bảng mới (đã có `wallet_transactions`, `user_wallets`)
- Thêm `reward_type = 'web3_claim'` vào `add_reward_ledger_entry` function (hoặc dùng type `usage`)

## Flow Hoạt Động

```text
User → Web3 Rewards page → Connect Wallet (nếu chưa có)
  → Nhập số lượng Camly Coin muốn claim
  → Confirm Modal (countdown 3s)
  → Edge Function validates + deducts balance
  → Ghi wallet_transactions + reward_ledger
  → Hiển thị success + simulated tx hash
  → User xem lịch sử claim trên dashboard
```

## Chi Tiết Kỹ Thuật

| Thành phần | Chi tiết |
|------------|----------|
| Min claim | 100 Camly Coin |
| Max claims/ngày | 3 lần |
| Cooldown | 60 giây giữa mỗi claim |
| Networks hỗ trợ | BSC Mainnet, Ethereum, Polygon |
| Token symbol | CAMLY |
| Blockchain mode | Simulated (upgrade to real khi có smart contract) |

## Files Tạo Mới
1. `src/pages/Web3Rewards.tsx` - Dashboard trang chính
2. `src/hooks/useWeb3Rewards.ts` - Logic hook
3. `src/components/Web3ClaimModal.tsx` - Modal claim
4. `supabase/functions/claim-web3-reward/index.ts` - Backend validation

## Files Sửa
1. `src/App.tsx` - Thêm route
2. `supabase/config.toml` - Thêm function config

