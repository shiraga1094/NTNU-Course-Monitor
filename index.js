import { Client, GatewayIntentBits } from "discord.js";
import { validateEnv } from "./utils/validateEnv.js";
import { logCommand, logError, logSuccess } from "./utils/logger.js";
import { startMonitorSchedule } from "./services/monitor.js";
import { startCleanupSchedule } from "./utils/cleanup.js";
import { startScheduledReports } from "./services/scheduler.js";
import { botStats } from "./utils/stats.js";
import { config } from "./config.js";

try {
  validateEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

import * as pingCmd from "./commands/ping.js";
import * as helpCmd from "./commands/help.js";
import * as statusCmd from "./commands/status.js";
import * as infoCmd from "./commands/info.js";
import * as trackCmd from "./commands/track.js";
import * as untrackCmd from "./commands/untrack.js";
import * as listCmd from "./commands/list.js";
import * as notifyCmd from "./commands/notify.js";
import * as botstatsCmd from "./commands/botstats.js";
import * as scheduleCmd from "./commands/schedule.js";
import * as unscheduleCmd from "./commands/unschedule.js";

const commandHandlers = {
  ping: pingCmd,
  help: helpCmd,
  status: statusCmd,
  info: infoCmd,
  track: trackCmd,
  untrack: untrackCmd,
  list: listCmd,
  notify: notifyCmd,
  botstats: botstatsCmd,
  schedule: scheduleCmd,
  unschedule: unscheduleCmd
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  logSuccess(`Bot 已啟動 ${client.user.tag}`);
  startMonitorSchedule(client);
  startCleanupSchedule();
  startScheduledReports(client);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  logCommand(interaction);

  const handler = commandHandlers[interaction.commandName];
  if (handler && handler.execute) {
    try {
      await handler.execute(interaction);
      botStats.incrementCommands();
    } catch (error) {
      logError(`指令錯誤 cmd=${interaction.commandName} error=${error.message}`);
      botStats.incrementErrors();
      const reply = { content: "執行指令時發生錯誤", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
});

client.login(config.discord.token).catch(error => {
  logError(`Bot 登入失敗: ${error.message}`);
  process.exit(1);
});
