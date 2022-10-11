const { MONGOURI } = require("./config");
const { MongoClient } = require('mongodb');
const client = new MongoClient(MONGOURI);
const { LOCALE, MUSICROLE, PREFIX, PRUNING } = require("./config")

exports.getGuildConfig = async (guildID) => {
    await client.connect();

    const guilddb = client.db('guildConfig');
    const guildColl = guilddb.collection('guilds');

    let guildConfig = await guildColl.findOne({"_id": `${guildID}`}).catch((error) => {
        return [LOCALE, MUSICROLE, PREFIX, PRUNING];
    });

    return [
        guildConfig ? guildConfig.LOCALE : LOCALE,
        guildConfig ? guildConfig.MUSICROLE : MUSICROLE,
        guildConfig ? guildConfig.PREFIX : PREFIX,
        guildConfig ? guildConfig.PRUNING : PRUNING,
    ];
}


/*
exports.canModifyQueue = async (member, role) => {

    await client.connect();
    console.log('Connected successfully to mongo server');
    const guilddb = client.db('guildConfig');
    const guildColl = guilddb.collection('guilds');
    const { channelID } = member.voice;
    const botChannel = member.guild.voice.channelID;
    let guildConfig = guildColl.findOne({"_id": guildID});

    console.log(channelID);
    console.log(botChannel);

    if(channelID == null) {
        console.log("not in voice");
        return "notVoice";
    }

    if (channelID !== botChannel) {
        console.log("not in same channel");
        return "notSame";
    }

    if (!member.roles.cache.some(role => role.name === guildConfig.MUSICROLE)) {
        console.log("not the right role");
        return "notRole";
    };
    console.log("success");
    return true;

};
*/
