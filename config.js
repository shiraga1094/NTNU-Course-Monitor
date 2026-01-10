import "dotenv/config";

export const config = {
  // Discord 配置
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID
  },

  // 監控配置
  monitor: {
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60 * 1000, // 預設 60 秒
    perFetchDelay: parseInt(process.env.PER_FETCH_DELAY) || 2000,      // 預設 2 秒
  },

  // 重試配置
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS) || 3,
    initialDelay: parseInt(process.env.RETRY_INITIAL_DELAY) || 1000,
    maxDelay: parseInt(process.env.RETRY_MAX_DELAY) || 10000
  },

  // 路徑配置
  paths: {
    dataDir: "./data",
    logDir: "./log",
    subscriptions: "./data/subscriptions.json",
    tmp: "./data/tmp.json",
    log: "./log/bot.log"
  },

  // 清理配置
  cleanup: {
    tmpDataAge: parseInt(process.env.TMP_DATA_AGE_DAYS) || 7, // 預設保留 7 天
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL_HOURS) || 24 // 預設每 24 小時清理一次
  },

  // 日誌配置
  logging: {
    timezone: process.env.TZ || "Asia/Taipei", // 預設 UTC+8
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 30 // 預設保留 30 天
  },

  // NTNU 課程系統配置
  ntnu: {
    baseUrl: "https://courseap2.itc.ntnu.edu.tw",
    indexPath: "/acadmOpenCourse/index.jsp",
    apiPath: "/acadmOpenCourse/CofopdlCtrl"
  }
};
