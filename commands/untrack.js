import { loadSubs, saveSubs } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const courseCode = interaction.options.getString("course_code");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

  const key = `${courseCode}-${year}-${term}`;
  const uid = interaction.user.id;
  const subs = loadSubs();

  if (subs[uid] && subs[uid][key]) {
    delete subs[uid][key];
    saveSubs(subs);
    await interaction.editReply(`untracked ${key}`);
  } else {
    await interaction.editReply("not tracked");
  }
}
