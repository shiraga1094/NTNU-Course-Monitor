# NTNU Course Monitor Bot

> 警告：本專案與國立臺灣師範大學無正式關聯。課程資訊僅供參考，實際選課以學校官方系統為準。使用者須自行承擔所有使用風險。詳見完整免責聲明。

Discord Bot 用於監控台師大選課系統的課程人數變化，並即時通知用戶。

## 功能特色

- 即時查詢 - 查詢課程當前選課狀況
- 詳細資訊 - 顯示課程完整資訊（時間、教室、學分等）
- 智能通知（track）- 課程人數變化時自動通知（僅在狀態改變時觸發）
- 定時報告（schedule）- 設定定期自動回傳選課人數（初始化立即發送首次報告）
- 獨立服務 - track 和 schedule 完全獨立，可單獨使用或同時啟用
- Bot 狀態 - 查看 Bot 運行統計和系統狀態
- 彈性設定 - 可自訂通知偏好（雙向/僅未滿/僅滿人）、頻道通知支援
- 穩定可靠 - 內建重試機制和錯誤處理
- 容器化部署 - 支援 Docker 一鍵部署
- 自動清理 - 定期清理過期資料

## 專案結構

```
.
├── index.js                    # 主程式入口
├── config.js                   # 配置管理
├── register-command.js         # Discord 指令註冊
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
├── services/                  # 核心業務邏輯
│   ├── fetchOneCourse.js     # 課程資料抓取（API 介面）
│   ├── monitor.js            # 課程監控服務（track）
│   └── scheduler.js          # 定時報告服務（schedule）
├── utils/                     # 工具模組
│   ├── logger.js             # 日誌系統（彩色輸出、級別控制、日期輪替）
│   ├── storage.js            # 資料儲存
│   ├── validateEnv.js        # 環境變數驗證
│   ├── retry.js              # 重試機制
│   ├── cleanup.js            # 資料清理
│   └── stats.js              # 統計追蹤
├── data/                      # 資料目錄
│   ├── subscriptions.json    # 訂閱資料
│   └── tmp.json              # 暫存資料
└── log/                       # 日誌目錄
    └── bot-YYYY-MM-DD.log    # 按日期分割的日誌檔
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

## 環境變數說明

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
- `TZ` - 時區設定，預設 Asia/Taipei（UTC+8）
- `LOG_RETENTION_DAYS` - 日誌保留天數，預設 30
- `LOG_LEVEL` - 日誌級別（DEBUG/INFO/WARN/ERROR），預設 INFO

## 使用指令

### 基本指令
- `/ping` - 測試 bot 是否正常
- `/help` - 顯示完整使用說明

### 課程查詢
- `/status <開課序號> <學年> <學期>` - 查詢即時選課狀況
- `/info <開課序號> <學年> <學期>` - 顯示詳細課程資訊

### Track 服務（狀態變更通知）
- `/track <開課序號> <學年> <學期> [頻道ID]` - 訂閱課程狀態變更通知
  - 僅在滿人↔有名額變化時才通知
  - 可指定頻道接收通知，未指定則發送私訊
- `/untrack <開課序號> <學年> <學期>` - 取消狀態變更通知
- `/notify <開課序號> <學年> <學期> <模式>` - 設定通知偏好
  - `both` - 雙向通知（預設）
  - `available` - 僅在有名額時通知
  - `full` - 僅在滿人時通知

### Schedule 服務（定時報告）
- `/schedule <開課序號> <學年> <學期> <模式> [參數...]` - 設定定時課程報告
  - **間隔模式**：`mode:間隔模式 interval:30` - 每 30 分鐘報告一次
  - **固定時刻**：`mode:固定時刻 days:1,3,5 hour:9 minute:0` - 每週一三五 09:00 報告
  - days 格式：
    - 多個星期：`1,3,5`（週一、週三、週五）
    - 範圍：`0-6`（每天）、`1-5`（工作日）
    - 單一星期：`3`（週三）
    - 數字對應：0=日 1=一 2=二 3=三 4=四 5=五 6=六
  - 設定後立即發送首次報告
  - 可指定頻道接收報告，未指定則發送私訊
- `/unschedule <開課序號> <學年> <學期>` - 取消定時報告

### 訂閱管理
- `/list` - 列出所有訂閱（同時顯示 track 和 schedule 狀態）
- `/botstats` - 查看 Bot 運行統計資訊

### 範例
```bash
# 查詢課程狀況（使用開課序號）
/status 1001 114 1

# 訂閱狀態變更通知（僅在滿人↔有名額變化時通知）
/track 1001 114 1

# 設定定時報告 - 間隔模式（每 30 分鐘自動回報）
/schedule 1001 114 1 interval 30

# 設定定時報告 - 固定時刻（每週一三五 09:00 報告）
/schedule 1001 114 1 cron 1,3,5 9 0

# 設定定時報告 - 工作日每天 18:00 報告
/schedule 1001 114 1 cron 1-5 18 0

# 設定私訊通知模式
/notify 1001 114 1 available

# 設定頻道通知（到特定頻道）
/track 1001 114 1 123456789012345678

# 兩種服務可以同時使用
/track 1001 114 1                    # 變更時通知
/schedule 1001 114 1 interval 30     # 每 30 分鐘報告

# 查看所有訂閱
/list
```

### 注意事項
- 開課序號可在台師大選課系統的課程列表中找到，每個開課班級都有唯一的序號
- Schedule 支援兩種模式：
  - **間隔模式**：按固定時間間隔（分鐘）報告
  - **固定時刻**：每週特定日期和時間報告（支援自由組合星期幾）

## 系統架構

- **主程式** ([index.js](index.js)) - Discord bot 初始化和指令路由
- **Track 監控** ([services/monitor.js](services/monitor.js)) - 定期檢查課程狀態變化並發送通知
- **Schedule 排程** ([services/scheduler.js](services/scheduler.js)) - 獨立的定時報告系統（支援 interval 和 cron 兩種模式）
- **API 介面** ([services/fetchOneCourse.js](services/fetchOneCourse.js)) - 與台師大課程系統的介接層
- **清理模組** ([utils/cleanup.js](utils/cleanup.js)) - 定期清理過期資料和舊日誌
- **重試機制** ([utils/retry.js](utils/retry.js)) - 指數退避重試
- **日誌系統** ([utils/logger.js](utils/logger.js)) - 彩色分級日誌，支援按日期輪替和時區設定
- **統計追蹤** ([utils/stats.js](utils/stats.js)) - Bot 運行狀態統計

## Track vs Schedule 比較

| 功能 | Track（狀態變更通知） | Schedule（定時報告） |
|------|---------------------|---------------------|
| 觸發時機 | 僅在滿人↔有名額變化時 | 固定時間間隔或特定時刻 |
| 初始行為 | 無初始通知 | 設定後立即發送首次報告 |
| 適用場景 | 搶課、追蹤熱門課程 | 持續關注、數據記錄 |
| 模式選擇 | 單一監控模式 | 間隔模式 / 固定時刻模式 |
| 獨立性 | 完全獨立運作 | 完全獨立運作 |
| 可否同時使用 | 可以同時啟用兩種服務 | 可以同時啟用兩種服務 |

## 開發指南

### 新增指令

1. 在 [commands/definitions.js](commands/definitions.js) 新增指令定義
2. 建立 `commands/<指令名稱>.js`，export `execute` 函數
3. 在 [index.js](index.js) 的 `commandHandlers` 中註冊
4. 執行 `node register-command.js`

### 服務架構

- **services/** - 存放核心業務邏輯
  - `fetchOneCourse.js` - API 層，負責與台師大系統介接
  - `monitor.js` - Track 服務，監控課程狀態變化
  - `scheduler.js` - Schedule 服務，處理定時報告
- **commands/** - 存放 Discord 指令處理器
- **utils/** - 存放通用工具函數

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

## 免責聲明 / Disclaimer

**重要：使用本系統前請詳閱以下聲明**

### 資訊準確性
- 本系統提供之課程資訊僅供參考，實際課程內容、時間、地點、人數等資訊以**國立臺灣師範大學官方公告為準**
- 課程資料可能因系統延遲、網路問題或學校系統更新而有所誤差
- 開發者不保證資訊的即時性、準確性或完整性

### 使用者責任
- 使用者須**自行負責確認選課結果與課程安排**
- 建議使用者定期登入學校官方系統確認選課狀態
- 使用本系統不代表完成選課，實際選課結果以學校系統為準

### 隱私與安全
- 本系統僅儲存課程訂閱資訊與 Discord 用戶 ID
- 不會儲存或傳輸任何學校帳號密碼
- 請妥善保管 Discord Bot Token 和環境變數檔案
- 用戶資料儲存於本地 JSON 檔案，請自行做好資料備份

### 法律聲明
- **本專案與國立臺灣師範大學無任何正式關聯或合作關係**
- 本系統僅作為個人學習與技術研究用途
- 使用者應遵守台灣師範大學資訊使用規範
- 禁止使用本系統進行任何違法、濫用或干擾學校系統運作的行為

### 責任限制
- 開發者**不對因使用本系統而產生的任何直接或間接損失負責**，包括但不限於：
  - 選課失敗或錯誤
  - 資料遺失或損壞
  - 系統停機或服務中斷
  - 任何其他技術或非技術問題
- 本系統按「現狀」提供，不提供任何明示或暗示的保證

### 使用同意
**使用本系統即表示您已閱讀、理解並同意以上所有條款**

如不同意上述任何條款，請立即停止使用本系統。

---

## 授權 / License

MIT License

詳見 [LICENSE](LICENSE) 檔案。

### 使用建議
1. 僅供個人學習與參考使用
2. 商業使用前請先取得相關授權
3. 修改或分發時請保留原作者資訊與免責聲明
4. 遵守當地法律法規與學校規範
