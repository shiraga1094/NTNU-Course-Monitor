import { loadSubs } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const uid = interaction.user.id;
  const subs = loadSubs();
  const mine = subs[uid];

  if (!mine || Object.keys(mine).length === 0) {
    await interaction.editReply("no tracked courses");
    return;
  }

  const lines = Object.values(mine).map(
    c => `${c.courseCode} ${c.year}-${c.term}`
  );

  await interaction.editReply(lines.join("\n"));
}
