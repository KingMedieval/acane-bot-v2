const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");
const {getGuildConfig} = require("../util/getGuildConfig");

i18n.setLocale(LOCALE);

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: i18n.__('resume.description'),
  async execute(message) {
    let guildConfig = await getGuildConfig(message.guild.id);
    const queue = message.client.queue.get(message.guild.id);
    i18n.setLocale(guildConfig[0]);

    if (!queue) return message.reply(i18n.__("resume.errorNotQueue")).catch(console.error);
    let canModify = canModifyQueue(message.member, guildConfig[1])
    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));


    if (!queue.playing) {
      queue.playing = true;
      queue.connection.dispatcher.resume();
      return queue.textChannel
        .send(i18n.__mf("resume.resultNotPlaying", { author: message.author }))
        .catch(console.error);
    }

    return message.reply(i18n.__("resume.errorPlaying")).catch(console.error);
  }
};
