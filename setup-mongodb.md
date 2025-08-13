# MongoDB Setup Guide

## 1. Cài đặt MongoDB

### Option 1: MongoDB Local
1. Tải và cài đặt MongoDB Community Server từ https://www.mongodb.com/try/download/community
2. Khởi động MongoDB service
3. MongoDB sẽ chạy tại `mongodb://localhost:27017`

### Option 2: MongoDB Atlas (Cloud)
1. Đăng ký tài khoản tại https://www.mongodb.com/atlas
2. Tạo cluster miễn phí
3. Lấy connection string từ Atlas

## 2. Cấu hình Environment Variables

Thêm vào file `.env.local`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
# Hoặc cho Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toeX?retryWrites=true&w=majority
```

## 3. Test kết nối

1. Khởi động server: `npm run dev`
2. Truy cập: http://localhost:3000/database
3. Nếu kết nối thành công, bạn sẽ thấy database overview

## 4. Seed sample data

Để tạo dữ liệu mẫu, gọi API:
```bash
curl -X POST http://localhost:3000/api/seed
```

Hoặc truy cập: http://localhost:3000/api/seed qua browser với method POST

## 5. Collections được tạo

- `listeningQuestions` - Câu hỏi Listening
- `readingQuestions` - Câu hỏi Reading  
- `vocabulary` - Từ vựng
- `userProgress` - Tiến độ học của user

## Troubleshooting

1. **Connection refused**: Kiểm tra MongoDB service đã chạy chưa
2. **Authentication failed**: Kiểm tra username/password trong connection string
3. **Network error**: Kiểm tra firewall và network settings
