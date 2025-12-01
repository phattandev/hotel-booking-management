# ----- Giai đoạn 1: Build (Biên dịch React/Vite) -----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file package.json và package-lock.json để cài dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy toàn bộ code (bao gồm thư mục 'frontend' và các file config)
COPY . .

# Nhận biến môi trường (URL của backend) từ lệnh build
ARG VITE_API_BASE_URL
# Đặt nó làm biến môi trường cho lệnh build của Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Chạy lệnh build (sẽ chạy "vite build" như trong package.json)
# Vite sẽ tự động tìm code trong thư mục 'frontend' (dựa trên vite.config.js)
RUN npm run build

# ----- Giai đoạn 2: Serve (Phục vụ web) -----
FROM nginx:alpine

# Copy các file static đã build từ Giai đoạn 1
# Output mặc định của Vite (với root: 'frontend') là /app/frontend/dist
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy file cấu hình Nginx (sẽ tạo ở file tiếp theo)
# File này để giúp React Router hoạt động
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Lệnh chạy Nginx
CMD ["nginx", "-g", "daemon off;"]