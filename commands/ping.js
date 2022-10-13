const { LOCALE } = require("../util/config");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
    name: "ping",
    cooldown: 10,
    description: i18n.__("ping.description"),
    execute(message) {
        console.log("pong");
        message
            .reply(`Ping: ${Math.round(message.client.ws.ping)} ms!`)
            .catch(console.error);
    }
};
