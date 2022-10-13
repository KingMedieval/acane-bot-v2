const move = require("array-move");
const { LOCALE } = require("../util/config");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");
const {getGuildConfig} = require("../util/getGuildConfig");

i18n.setLocale(LOCALE);

module.exports = {
    name: "move",
    aliases: ["mv"],
    description: i18n.__("move.description"),
    async execute(message, args) {
        let guildConfig = await getGuildConfig(message.guild.id);
        const queue = message.client.queue.get(message.guild.id);
        i18n.setLocale(guildConfig[0]);

        if (!queue) return message.reply(i18n.__("move.errorNotQueue")).catch(console.error);
        let canModify = canModifyQueue(message.member, guildConfig[1])
        if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
        if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
        if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));


        if (!args.length) return message.reply(i18n.__mf("move.usagesReply", { prefix: message.client.prefix }));
        if (isNaN(args[0]) || args[0] <= 1)
            return message.reply(i18n.__mf("move.usagesReply", { prefix: message.client.prefix }));

        let song = queue.songs[args[0] - 1];

        queue.songs = move(queue.songs, args[0] - 1, args[1] == 1 ? 1 : args[1] - 1);
        queue.textChannel.send(
            i18n.__mf("move.result", {
                author: message.author,
                title: song.title,
                index: args[1] == 1 ? 1 : args[1]
            })
        );
    }
};
