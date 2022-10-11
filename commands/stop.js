const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "stop",
  description: i18n.__('stop.description'),
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    let canModify;

    if (!queue) return message.reply(i18n.__("stop.errorNotQueue")).catch(console.error);
    //if (!canModifyQueue(message.member)) return message.reply(i18n.__("common.errorNotChannel"));

    if (canModify = canModifyQueue(message.member)) {
      if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
      if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
      if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: "ztmy"}));
    };

    queue.songs = [];
    queue.connection.dispatcher.end();
    queue.textChannel.send(i18n.__mf("stop.result", { author: message.author })).catch(console.error);
  }
};
