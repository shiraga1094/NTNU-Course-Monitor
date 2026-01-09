# 部署指南

## 📦 部署前準備

### 1. 建立 Discord Bot

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 點擊「New Application」建立新應用
3. 在「Bot」頁面建立 Bot 並複製 Token
4. 在「OAuth2 > General」複製 Client ID
5. 在「OAuth2 > URL Generator」勾選：
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`
6. 使用生成的 URL 邀請 Bot 到你的伺服器

### 2. 取得 Guild ID

1. 在 Discord 中啟用開發者模式（設定 > 進階 > 開發者模式）
2. 右鍵點擊你的伺服器圖標
3. 選擇「複製伺服器 ID」

## 🐳 Docker 部署（推薦）

### 初次部署

```bash
# 1. 克隆專案
git clone <your-repo-url>
cd NTNU_Course_Monitor

# 2. 設定環境變數
cp .env.example .env
nano .env  # 或使用其他編輯器

# 3. 構建並啟動容器
docker-compose up -d

# 4. 註冊 Discord 指令（只需執行一次）
docker-compose exec ntnu-course-bot node register-command.js

# 5. 查看日誌確認運行狀態
docker-compose logs -f
```

### 日常管理

```bash
# 查看運行狀態
docker-compose ps

# 查看即時日誌
docker-compose logs -f

# 重啟服務
docker-compose restart

# 停止服務
docker-compose stop

# 停止並移除容器
docker-compose down

# 更新代碼後重新部署
git pull
docker-compose up -d --build
```

### 資料備份

```bash
# 備份訂閱資料
cp data/subscriptions.json subscriptions.backup.json

# 備份日誌
tar -czf logs-backup-$(date +%Y%m%d).tar.gz log/

# 還原資料
cp subscriptions.backup.json data/subscriptions.json
docker-compose restart
```

## 💻 本地部署

### Linux / macOS

```bash
# 1. 安裝 Node.js (v18+)
# Ubuntu/Debian:
sudo apt update
sudo apt install nodejs npm

# macOS (使用 Homebrew):
brew install node

# 2. 克隆並設定專案
git clone <your-repo-url>
cd NTNU_Course_Monitor
npm install

# 3. 設定環境變數
cp .env.example .env
nano .env

# 4. 註冊指令
node register-command.js

# 5. 啟動服務
npm start

# 或使用 PM2 管理（推薦）
npm install -g pm2
pm2 start index.js --name ntnu-course-bot
pm2 save
pm2 startup
```

### Windows

```powershell
# 1. 下載並安裝 Node.js
# https://nodejs.org/

# 2. 克隆並設定專案
git clone <your-repo-url>
cd NTNU_Course_Monitor
npm install

# 3. 設定環境變數
copy .env.example .env
notepad .env

# 4. 註冊指令
node register-command.js

# 5. 啟動服務
npm start

# 或使用 PM2 (需先安裝)
npm install -g pm2
pm2 start index.js --name ntnu-course-bot
```

## 🔧 進階配置

### 使用 PM2 管理（Linux/macOS）

```bash
# 安裝 PM2
npm install -g pm2

# 啟動服務
pm2 start index.js --name ntnu-course-bot

# 查看狀態
pm2 status

# 查看日誌
pm2 logs ntnu-course-bot

# 重啟
pm2 restart ntnu-course-bot

# 設定開機自動啟動
pm2 startup
pm2 save
```

### 使用 Systemd 服務（Linux）

建立 `/etc/systemd/system/ntnu-course-bot.service`:

```ini
[Unit]
Description=NTNU Course Monitor Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/NTNU_Course_Monitor
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

啟動服務：
```bash
sudo systemctl daemon-reload
sudo systemctl enable ntnu-course-bot
sudo systemctl start ntnu-course-bot
sudo systemctl status ntnu-course-bot
```

## 📊 監控與維護

### 日誌查看

```bash
# Docker
docker-compose logs -f

# 本地部署
tail -f log/bot.log

# PM2
pm2 logs ntnu-course-bot
```

### 健康檢查

```bash
# 檢查 Bot 是否在線
# 在 Discord 中執行 /ping

# 檢查容器狀態
docker-compose ps

# 檢查 PM2 狀態
pm2 status
```

### 定期維護

- 定期備份 `data/subscriptions.json`
- 監控磁碟空間（日誌檔案）
- 定期更新依賴：`npm update`
- 定期更新 Docker 映像：`docker-compose pull`

## 🚨 故障排除

### Bot 無法啟動

```bash
# 檢查環境變數
cat .env

# 檢查 Node.js 版本
node --version  # 應該是 v18+

# 檢查依賴是否完整安裝
npm install

# 查看錯誤日誌
tail -n 50 log/bot.log
```

### 指令無法使用

```bash
# 重新註冊指令
node register-command.js

# 或在 Docker 中
docker-compose exec ntnu-course-bot node register-command.js
```

### 效能問題

- 調整 `CHECK_INTERVAL` 增加監控間隔
- 調整 `PER_FETCH_DELAY` 增加請求延遲
- 檢查記憶體使用：`docker stats` 或 `pm2 monit`

## 🔄 更新流程

### Docker 部署

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### 本地部署

```bash
git pull
npm install
pm2 restart ntnu-course-bot
```

## 🔐 安全建議

1. **不要** 將 `.env` 檔案提交到 Git
2. 定期更換 Discord Bot Token
3. 限制 Bot 權限（只給必要權限）
4. 定期更新依賴以修補安全漏洞：`npm audit fix`
5. 使用防火牆保護伺服器
6. 定期備份重要資料

## 📧 技術支援

如遇問題，請提供：
- 錯誤訊息
- `log/bot.log` 的相關內容
- 環境資訊（OS, Node.js 版本）
- 部署方式（Docker / 本地）
