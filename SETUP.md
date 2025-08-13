# TOEIC Practice - Setup Instructions

## 🔐 Environment Variables Setup

1. **Copy environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Update .env.local với thông tin thật:**
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

   # JWT Secret
   JWT_SECRET=your_secure_random_secret_key

   # Admin Configuration  
   ADMIN_EMAIL=your_admin_email@gmail.com
   ```

## 👤 User System & Admin Access

### Roles:
- **User**: Người dùng thường (tự động tạo khi đăng ký)
- **Admin**: Chỉ có 1 tài khoản duy nhất

### Admin Access:
- **Email**: `huynhlytankhoa@gmail.com`
- **Password**: `Kho@1611`
- **URL**: `/admin` (chỉ admin mới truy cập được)

### User Data Structure:
```typescript
{
  uid: string,           // Firebase UID
  email: string,         // Email từ Firebase
  displayName: string,   // Tên hiển thị
  role: 'user' | 'admin',
  studyStats: {
    totalStudyTime: number,    // phút
    streak: number,            // ngày
    completedTests: number,    // số bài đã hoàn thành
    lastStudyDate: Date,
    streakStartDate: Date
  }
}
```

## 🗄️ Database Collections

### MongoDB Collections:
1. **users** - Thông tin người dùng và thống kê
2. **part5Questions** - Câu hỏi Part 5
3. **part6Questions** - Câu hỏi Part 6  
4. **part7Questions** - Câu hỏi Part 7

## 🔄 API Endpoints

### User Management:
- `GET /api/user?uid={uid}` - Lấy thông tin user
- `POST /api/user` - Tạo/cập nhật user
- `PUT /api/user/study-stats` - Cập nhật thống kê học tập

### Questions:
- `GET /api/questions?part={part}&testSet={testSet}` - Lấy câu hỏi

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables** (xem trên)

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - User: http://localhost:3000
   - Admin: http://localhost:3000/admin

## 🔒 Security Features

1. **Environment Variables**: Tất cả secrets được lưu trong .env.local
2. **Role-based Access**: Admin routes được bảo vệ
3. **Firebase Auth**: Xác thực qua Google/Email
4. **MongoDB Integration**: User data synced với Firebase
5. **Auto-refresh Navigation**: Bảo mật session state

## 📊 Dashboard Features

- **Thời gian học**: Tính từ study sessions
- **Streak**: Số ngày học liên tiếp
- **Bài đã hoàn thành**: Số test hoàn thành
- **Real-time Updates**: Dữ liệu cập nhật ngay lập tức

## 🛡️ Admin Protection

- Chỉ `huynhlytankhoa@gmail.com` có quyền admin
- Auto-redirect nếu không phải admin
- Access control ở cả client và server
- Protected routes với middleware
