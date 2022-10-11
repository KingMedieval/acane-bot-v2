const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "volume",
  aliases: ["v"],
  description: i18n.__("volume.description"),
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(i18n.__("volume.errorNotQueue")).catch(console.error);
    if (canModify = canModifyQueue(message.member)) {
      if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
      if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
      if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: "ztmy"}));
    };

    if (!args[0]) return message.reply(i18n.__mf("volume.currentVolume", { volume: queue.volume })).catch(console.error);
    if (isNaN(args[0])) return message.reply(i18n.__("volume.errorNotNumber")).catch(console.error);
    if (Number(args[0]) > 100 || Number(args[0]) < 0)
      return message.reply(i18n.__("volume.errorNotValid")).catch(console.error);

    queue.volume = args[0];
    queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    return queue.textChannel.send(i18n.__mf("volume.result", { arg: args[0] })).catch(console.error);
  }
};
