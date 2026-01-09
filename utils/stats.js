export const botStats = {
  startTime: Date.now(),
  notificationsSent: 0,
  commandsExecuted: 0,
  monitorLoopsCompleted: 0,
  errors: 0,
  lastMonitorTime: null,

  incrementNotifications() {
    this.notificationsSent++;
  },

  incrementCommands() {
    this.commandsExecuted++;
  },

  incrementMonitorLoops() {
    this.monitorLoopsCompleted++;
    this.lastMonitorTime = Date.now();
  },

  incrementErrors() {
    this.errors++;
  },

  getUptime() {
    const ms = Date.now() - this.startTime;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} 天 ${hours % 24} 小時 ${minutes % 60} 分`;
    } else if (hours > 0) {
      return `${hours} 小時 ${minutes % 60} 分`;
    } else if (minutes > 0) {
      return `${minutes} 分 ${seconds % 60} 秒`;
    } else {
      return `${seconds} 秒`;
    }
  },

  reset() {
    this.notificationsSent = 0;
    this.commandsExecuted = 0;
    this.monitorLoopsCompleted = 0;
    this.errors = 0;
  }
};
