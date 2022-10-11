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
