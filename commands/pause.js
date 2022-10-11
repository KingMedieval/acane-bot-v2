const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "pause",
  description: i18n.__("pause.description"),
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(i18n.__("pause.errorNotQueue")).catch(console.error);
    if (canModify = canModifyQueue(message.member)) {
      if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
      if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
      if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: "ztmy"}));
    };

    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      return queue.textChannel
        .send(i18n.__mf("pause.result", { author: message.author }))
        .catch(console.error);
    }
  }
};
