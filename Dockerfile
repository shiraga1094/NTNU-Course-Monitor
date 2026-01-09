# 基於 Node.js 官方映像
FROM node:20-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package 文件
COPY package*.json ./

# 安裝依賴
RUN npm install --production

# 複製應用程式碼
COPY . .

# 建立資料和日誌目錄
RUN mkdir -p /app/data /app/log

# 設定環境變數
ENV NODE_ENV=production

# 啟動應用
CMD ["node", "index.js"]
