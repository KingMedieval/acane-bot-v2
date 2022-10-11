exports.canModifyQueue = (member) => {

    const { channelID } = member.voice;

    const botChannel = member.guild.voice.channelID;

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

    if (!member.roles.cache.some(role => role.name === 'ztmy')) {
        console.log("not the right role");
        return "notRole";
    };
    console.log("success");
    return true;
};