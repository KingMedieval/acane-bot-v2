const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");
const {getGuildConfig} = require("../util/getGuildConfig");

i18n.setLocale(LOCALE);

module.exports = {
  name: "shuffle",
  description: i18n.__('shuffle.description'),
  async execute(message) {
    let guildConfig = await getGuildConfig(message.guild.id);
    const queue = message.client.queue.get(message.guild.id);
    i18n.setLocale(guildConfig[0]);

    if (!queue) return message.reply(i18n.__("shuffle.errorNotQueue")).catch(console.error);
    let canModify = canModifyQueue(message.member, guildConfig[1])
    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));


    let songs = queue.songs;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    queue.songs = songs;
    message.client.queue.set(message.guild.id, queue);
    queue.textChannel.send(i18n.__mf('shuffle.result', {author: message.author})).catch(console.error);
  }
};
