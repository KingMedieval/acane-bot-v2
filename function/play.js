const ytdl = require("ytdl-core-discord");
const { STAY_TIME, LOCALE } = require("../util/config");
const { getGuildConfig } = require("../util/getGuildConfig");
const { canModifyQueue } = require("../util/queue");
const i18n = require("i18n");
const fs = require("fs");


i18n.setLocale(LOCALE);

module.exports = {
    async play(song, message) {
        let guildConfig = await getGuildConfig(message.guild.id);
        const queue = message.client.queue.get(message.guild.id);
        i18n.setLocale(guildConfig[0]);
        let canModify = canModifyQueue(message.member, guildConfig[1])

        if (!song) {
            setTimeout(function () {
                if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
                queue.channel.leave();
                queue.textChannel.send(i18n.__("play.leaveChannel"));
            }, STAY_TIME * 1000);
            queue.textChannel.send(i18n.__("play.queueEnded")).catch(console.error);
            return message.client.queue.delete(message.guild.id);
        }

        let stream = null;
        let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

        try {
            if (song.url.includes("youtube.com")) {
                stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
            }
            else if (song.url.includes("deezer.com")) {
                console.log('deeznuts');
                stream = fs.createReadStream(`./sounds/${song.title}.ogg`);
                streamType = "ogg/opus";
            }
            else if (song.url.includes("bilibili.com")) {
                console.log('bili');
                stream = fs.createReadStream(`./bilibili/${song.url.slice(31, 43)}.ogg`);
                streamType = "ogg/opus";
            }
        } catch (error) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }

            console.error(error);
            return message.channel.send(
                i18n.__mf("play.queueError", { error: error.message ? error.message : error })
            );
        }

        queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

        const dispatcher = queue.connection
            .play(stream, { type: streamType })
            .on("finish", () => {
                if (collector && !collector.ended) collector.stop();

                if (queue.loop) {
                    // if loop is on, push the song back at the end of the queue
                    // so it can repeat endlessly
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    module.exports.play(queue.songs[0], message);
                } else {
                    // Recursively play the next song
                    queue.songs.shift();
                    module.exports.play(queue.songs[0], message);
                }
            })
            .on("error", (err) => {
                console.error(err);
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            });
        dispatcher.setVolumeLogarithmic(queue.volume / 100);

        try {
            var playingMessage = await queue.textChannel.send(
                i18n.__mf("play.startedPlaying", { title: song.title, url: song.url })
            );
            await playingMessage.react("???");
            await playingMessage.react("???");
            await playingMessage.react("????");
            await playingMessage.react("????");
            await playingMessage.react("????");
            await playingMessage.react("????");
            await playingMessage.react("???");
        } catch (error) {
            console.error(error);
        }

        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });

        collector.on("collect", (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);

            switch (reaction.emoji.name) {
                case "???":
                    queue.playing = true;
                    reaction.users.remove(user).catch(console.error);
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    queue.connection.dispatcher.end();
                    queue.textChannel.send(i18n.__mf("play.skipSong", { author: user })).catch(console.error);
                    collector.stop();
                    break;

                case "???":
                    reaction.users.remove(user).catch(console.error);
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    if (queue.playing) {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.pause(true);
                        queue.textChannel.send(i18n.__mf("play.pauseSong", { author: user })).catch(console.error);
                    } else {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.resume();
                        queue.textChannel.send(i18n.__mf("play.resumeSong", { author: user })).catch(console.error);
                    }
                    break;

                case "????":
                    reaction.users.remove(user).catch(console.error);
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    if (queue.volume <= 0) {
                        queue.volume = 100;
                        queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
                        queue.textChannel.send(i18n.__mf("play.unmutedSong", { author: user })).catch(console.error);
                    } else {
                        queue.volume = 0;
                        queue.connection.dispatcher.setVolumeLogarithmic(0);
                        queue.textChannel.send(i18n.__mf("play.mutedSong", { author: user })).catch(console.error);
                    }
                    break;

                case "????":
                    reaction.users.remove(user).catch(console.error);
                    if (queue.volume == 0) return;
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    if (queue.volume - 10 <= 0) queue.volume = 0;
                    else queue.volume = queue.volume - 10;
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel
                        .send(i18n.__mf("play.decreasedVolume", { author: user, volume: queue.volume }))
                        .catch(console.error);
                    break;

                case "????":
                    reaction.users.remove(user).catch(console.error);
                    if (queue.volume == 100) return;
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    if (queue.volume + 10 >= 100) queue.volume = 100;
                    else queue.volume = queue.volume + 10;
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel
                        .send(i18n.__mf("play.increasedVolume", { author: user, volume: queue.volume }))
                        .catch(console.error);
                    break;

                case "????":
                    reaction.users.remove(user).catch(console.error);
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    queue.loop = !queue.loop;
                    queue.textChannel
                        .send(
                            i18n.__mf("play.loopSong", {
                                author: user,
                                loop: queue.loop ? i18n.__("common.on") : i18n.__("common.off")
                            })
                        )
                        .catch(console.error);
                    break;

                case "???":
                    reaction.users.remove(user).catch(console.error);
                    if (canModify == "notVoice") return message.reply(i18n.__("common.errorNotChannel"));
                    if (canModify == "notSame") return message.reply(i18n.__("common.errorNotSame"));
                    if (canModify == "notRole") return message.reply(i18n.__mf("common.errorNotRole", {role: `${guildConfig[1]}`}));
                    queue.songs = [];
                    queue.textChannel.send(i18n.__mf("play.stopSong", { author: user })).catch(console.error);
                    try {
                        queue.connection.dispatcher.end();
                    } catch (error) {
                        console.error(error);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });

        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            if (playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 3000 }).catch(console.error);
            }
        });
    }
};
