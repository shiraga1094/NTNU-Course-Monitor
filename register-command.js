import { REST, Routes } from "discord.js";
import "dotenv/config";
import { commands } from "./commands/definitions.js";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("Missing DISCORD_TOKEN");
}
if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error("Missing DISCORD_CLIENT_ID");
}
if (!process.env.DISCORD_GUILD_ID) {
  throw new Error("Missing DISCORD_GUILD_ID");
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function main() {
  console.log("Registering guild slash commands...");

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands.map(cmd => cmd.toJSON()) }
  );

  console.log("Guild slash commands registered");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
