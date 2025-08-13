# TOEIC Practice Website

Nền tảng luyện thi TOEIC trực tuyến với đề thi thử, luyện nghe, luyện đọc và phân tích kết quả chi tiết.

## 🚀 Tính năng

- ✅ Trang Landing Page đẹp mắt
- ✅ Hệ thống đăng ký/đăng nhập với Firebase Auth  
- ✅ Dashboard tổng quan cho người dùng
- 🔄 Luyện nghe (Part 1-4) 
- 🔄 Luyện đọc (Part 5-7)
- 🔄 Đề thi thử mô phỏng
- 🔄 Luyện từ vựng & ngữ pháp
- 🔄 Phân tích kết quả & tiến độ

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Authentication**: Firebase Auth (Email, Google)
- **Database**: MongoDB với Mongoose
- **Deployment**: Vercel (recommended)

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd toeX
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình Environment Variables**

Tạo file `.env.local` và thêm các biến môi trường:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB
MONGODB_URI=mongodb://localhost:27017/toeic_practice

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

4. **Setup Firebase**
- Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
- Bật Authentication và chọn Email/Password + Google providers
- Copy config values vào `.env.local`

5. **Setup MongoDB**
- Cài đặt MongoDB locally hoặc sử dụng MongoDB Atlas
- Cập nhật `MONGODB_URI` trong `.env.local`

6. **Chạy development server**
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📁 Cấu trúc thư mục

```
src/
├── app/                 # App Router pages
│   ├── dashboard/       # Dashboard page
│   ├── login/          # Login page
│   ├── register/       # Register page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/         # React components
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utility libraries
│   └── firebase.ts    # Firebase configuration
└── types/             # TypeScript type definitions
    └── user.ts        # User-related types
```

## 🔗 Routes

- `/` - Landing page
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/dashboard` - Dashboard người dùng (cần đăng nhập)

## 📝 Roadmap

Xem chi tiết trong file [TOEIC_Project_Todo.md](./TOEIC_Project_Todo.md)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
