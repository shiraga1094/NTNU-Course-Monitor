# NTNU Course Monitor Bot

Discord Bot 用於監控台師大選課系統的課程人數變化，並即時通知用戶。

## 功能特色

- **即時查詢** - 查詢課程當前選課狀況
- **詳細資訊** - 顯示課程完整資訊（時間、教室、學分等）
- **智能通知** - 課程人數變化時自動通知
- **定時報告** - 設定定期自動回傳選課人數
- **Bot 狀態** - 查看 Bot 運行統計和系統狀態
- **彈性設定** - 可自訂通知偏好（雙向/僅未滿/僅滿人）
- **穩定可靠** - 內建重試機制和錯誤處理
- **容器化部署** - 支援 Docker 一鍵部署
- **自動清理** - 定期清理過期資料

## 專案結構

```
.
├── index.js                    # 主程式入口
├── monitor.js                  # 監控邏輯模組
├── scheduler.js                # 定時報告系統
├── config.js                   # 配置管理
├── register-command.js         # Discord 指令註冊
├── fetchOneCourse.js          # 課程資料抓取
├── package.json               
├── .env.example               # 環境變數範例
├── Dockerfile                 # Docker 映像定義
├── docker-compose.yml         # Docker Compose 配置
├── commands/                  # 指令處理器
│   ├── definitions.js        # 指令定義
│   ├── ping.js              
│   ├── help.js              
│   ├── status.js            
│   ├── info.js              
│   ├── track.js             
│   ├── untrack.js           
│   ├── list.js              
│   ├── notify.js            
│   ├── botstats.js           # Bot 狀態統計
│   ├── schedule.js           # 設定定時報告
│   └── unschedule.js         # 取消定時報告
├── utils/                     # 工具模組
│   ├── logger.js             # 日誌系統（彩色輸出、級別控制）
│   ├── storage.js            # 資料儲存
│   ├── validateEnv.js        # 環境變數驗證
│   ├── retry.js              # 重試機制
│   ├── cleanup.js            # 資料清理
│   └── stats.js              # 統計追蹤
├── data/                      # 資料目錄
│   ├── subscriptions.json    
│   └── tmp.json              
└── log/                       # 日誌目錄
    └── bot.log               
```

## 快速開始

### 方法 1：本地運行

1. **克隆專案**
```bash
git clone <your-repo-url>
cd NTNU_Course_Monitor
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數**
```bash
cp .env.example .env
# 編輯 .env 填入你的 Discord Bot Token 等資訊
```

4. **註冊指令**
```bash
node register-command.js
```

5. **啟動 Bot**
```bash
npm start
```

### 方法 2：Docker 部署（推薦）

1. **設定環境變數**
```bash
cp .env.example .env
# 編輯 .env 填入必要資訊
```

2. **啟動容器**
```bash
docker-compose up -d
```

3. **查看日誌**
```bash
docker-compose logs -f
```

4. **停止容器**
```bash
docker-compose down
```

## 📝 環境變數說明

必要變數（必須設定）：
- `DISCORD_TOKEN` - Discord Bot Token
- `DISCORD_CLIENT_ID` - Discord Client ID
- `DISCORD_GUILD_ID` - Discord Guild (伺服器) ID

可選變數（有預設值）：
- `CHECK_INTERVAL` - 監控間隔（毫秒），預設 60000（60秒）
- `PER_FETCH_DELAY` - 每次抓取延遲（毫秒），預設 2000
- `RETRY_MAX_ATTEMPTS` - 最大重試次數，預設 3
- `RETRY_INITIAL_DELAY` - 初始重試延遲（毫秒），預設 1000
- `RETRY_MAX_DELAY` - 最大重試延遲（毫秒），預設 10000
- `TMP_DATA_AGE_DAYS` - 暫存資料保留天數，預設 7
- `CLEANUP_INTERVAL_HOURS` - 清理間隔（小時），預設 24
- `LOG_LEVEL` - 日誌級別（DEBUG/INFO/WARN/ERROR），預設 INFO

## 🎮 使用指令

### 基本指令
- `/ping` - 測試 bot 是否正常
- `/help` - 顯示完整使用說明

### 課程查詢
- `/status <課程代碼> <學年> <學期>` - 查詢即時選課狀況
- `/info <課程代碼> <學年> <學期>` - 顯示詳細課程資訊

### 訂閱管理
- `/track <課程代碼> <學年> <學期>` - 訂閱課程通知
- `/untrack <課程代碼> <學年> <學期>` - 取消訂閱
- `/list` - 列出所有訂閱
- `/notify <課程代碼> <學年> <學期> <模式>` - 設定通知偏好
  - `both` - 雙向通知（預設）
  - `available` - 僅在有名額時通知
  - `full` - 僅在滿人時通知

### 範例
```
/status AEU0049 114 1
/track AEU0049 114 1
/notify AEU0049 114 1 available
```

## 🔧 開發指南

### 新增指令

1. 在 [commands/definitions.js](commands/definitions.js) 新增指令定義
2. 建立 `commands/<指令名稱>.js`，export `execute` 函數
3. 在 [index.js](index.js) 的 `commandHandlers` 中註冊
4. 執行 `node register-command.js`

### 日誌系統

```javascript
import { logDebug, logInfo, logWarn, logError, logSuccess } from "./utils/logger.js";

logDebug("除錯訊息");    // 灰色
logInfo("一般訊息");     // 藍色
logWarn("警告訊息");     // 黃色
logError("錯誤訊息");    // 紅色
logSuccess("成功訊息");  // 綠色
```

### 配置管理

所有配置集中在 [config.js](config.js)，透過環境變數或預設值設定。

## 系統架構

- **主程式** ([index.js](index.js)) - Discord bot 初始化和指令路由
- **監控模組** ([monitor.js](monitor.js)) - 定期檢查課程並發送通知
- **清理模組** ([utils/cleanup.js](utils/cleanup.js)) - 定期清理過期資料
- **重試機制** ([utils/retry.js](utils/retry.js)) - 指數退避重試
- **日誌系統** ([utils/logger.js](utils/logger.js)) - 彩色分級日誌

## 問題排查

### Bot 無法啟動
- 檢查 `.env` 是否正確設定
- 確認 Discord Token 有效
- 查看日誌檔案 `log/bot.log`

### 收不到通知
- 確認已用 `/track` 訂閱課程
- 檢查 Bot 是否有發送私訊的權限
- 查看日誌確認監控是否正常運行

### Docker 相關問題
```bash
# 重建映像
docker-compose build --no-cache

# 查看詳細日誌
docker-compose logs -f ntnu-course-bot

# 進入容器除錯
docker-compose exec ntnu-course-bot sh
```

## 授權

MIT License
