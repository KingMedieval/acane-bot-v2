const { MessageEmbed } = require("discord.js");
const { LOCALE } = require("../util/config");
const i18n = require("i18n");
const { getGuildConfig } = require('../util/getGuildConfig');

i18n.setLocale(LOCALE);

module.exports = {
    name: "help",
    aliases: ["h"],
    description: i18n.__("help.description"),
    async execute(message) {
        let guildConfig = await getGuildConfig(message.guild.id);
        let commands = message.client.commands.array();
        i18n.setLocale(guildConfig[0]);
        let helpEmbed = new MessageEmbed()
            .setTitle(i18n.__mf("help.embedTitle", { botname: message.client.user.username }))
            .setDescription(i18n.__("help.embedDescription"))
            .setColor("#7e3dc7");

        commands.forEach((cmd) => {
            helpEmbed.addField(
                `\`${cmd.name}\` ${cmd.aliases ? `\`(${cmd.aliases})\`` : " "}`,
                i18n.__(`${cmd.name}.description`),
                true
            );
        });

        helpEmbed.setTimestamp();

        return message.channel.send(helpEmbed).catch(console.error);
    }
};
