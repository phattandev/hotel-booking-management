# ----- Giai đoạn 1: Build -----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# [QUAN TRỌNG] Khai báo ARG để nhận biến từ lệnh docker build
ARG VITE_API_BASE_URL

# [QUAN TRỌNG] Gán giá trị ARG vào ENV để Vite có thể đọc được lúc build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Chạy lệnh build (Vite sẽ thay thế biến ENV vào code tại đây)
RUN npm run build

# ----- Giai đoạn 2: Serve -----
FROM nginx:alpine

# Copy file build
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]