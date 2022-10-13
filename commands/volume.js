const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");
const {getGuildConfig} = require("../util/getGuildConfig");

i18n.setLocale(LOCALE);

module.exports = {
  name: "volume",
  aliases: ["v"],
  description: i18n.__("volume.description"),
  async execute(message, args) {
    let guildConfig = await getGuildConfig(message.guild.id);
    const queue = message.client.queue.get(message.guild.id);
    i18n.setLocale(guildConfig[0]);

    if (!queue) return message.reply(i18n.__("volume.errorNotQueue")).catch(console.error);
    let canModify = canModifyQueue(message.member, guildConfig[1])
    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));

    if (!args[0]) return message.reply(i18n.__mf("volume.currentVolume", { volume: queue.volume })).catch(console.error);
    if (isNaN(args[0])) return message.reply(i18n.__("volume.errorNotNumber")).catch(console.error);
    if (Number(args[0]) > 100 || Number(args[0]) < 0)
      return message.reply(i18n.__("volume.errorNotValid")).catch(console.error);

    queue.volume = args[0];
    queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    return queue.textChannel.send(i18n.__mf("volume.result", { arg: args[0] })).catch(console.error);
  }
};
