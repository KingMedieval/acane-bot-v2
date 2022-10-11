const { LOCALE } = require("../util/config");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
    name: "invite",
    description: i18n.__('invite.description'),
    execute(message) {
        message.reply(i18n.__('invite.reply'));
        return message.member
            .send(`https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot`)
            .catch(console.error);
    }
};
