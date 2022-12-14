/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX, MUSICROLE, LOCALE, PRUNING } = require("./util/config");
const i18n = require("i18n");
const { MONGOURI } = require("./config");
const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient(MONGOURI);
const { getGuildConfig } = require('./util/getGuildConfig');


const client = new Client({
    disableMentions: "everyone",
    restTimeOffset: 0
});

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

i18n.configure({
    locales: ["en", "ko"],
    directory: join(__dirname, "locales"),
    defaultLocale: "en",
    retryInDefaultLocale: true,
    objectNotation: true,
    register: global,

    logWarnFn: function (msg) {
        console.log("warn", msg);
    },

    logErrorFn: function (msg) {
        console.log("error", msg);
    },

    missingKeyFn: function (locale, value) {
        return value;
    },

    mustacheConfig: {
        tags: ["{{", "}}"],
        disable: false
    }
});

/**
 * Client Events
 */
client.on("ready", () => {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`${PREFIX}help|made with ❤️ by tomo`, { type: "LISTENING" });
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(join(__dirname, "commands", `${file}`));
    client.commands.set(command.name, command);
    console.log(command);
};

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    let guildConfig = await getGuildConfig(message.guild.id);

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(guildConfig[2])})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply(i18n.__("common.errorCommand")).catch(console.error);
    }
});

client.on("guildCreate", async (guild) => {
    await mongoClient.connect();

    const guilddb = mongoClient.db('guildConfig');
    const guildColl = guilddb.collection('guilds');

    await guildColl.updateOne(
        {
            "_id": `${guild.id}`
        },
        {
            $set: {
                "guildName": `${guild.name}`,
                "PREFIX": `${PREFIX}`,
                "PRUNING": PRUNING,
                "LOCALE": `${LOCALE}`,
                "MUSICROLE": `${MUSICROLE}`
            }
        },
        {
            upsert: true //create a document if there is no document
        }).catch((error) => {
            console.log('Mongo error: ' + error);
    });
    console.log(`Joined new guild: ${guild.name}`);
});

client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name == '❌' && user.id != client.user.id) {
        if (reaction.message.author.id == client.user.id) {
            reaction.message.delete(reaction.message.lastMessageID);
        }
    }
});
