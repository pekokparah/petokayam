const { Client, Util } = require('discord.js');
const {prefix} = require("./config.json");
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const opus = require("node-opus");
const gyp = require("node-gyp");
const fs = require("fs");
const Discord = require("discord.js");


const client = new Client({ disableEveryone: true });

const youtube = new YouTube(process.env.YT_API);

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log(`${client.user.tag} Yo this ready!`));

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(prefix)) return undefined;
	
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(prefix.length)

	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
				var embed = new Discord.RichEmbed()
                                .setTitle("🎼 Paylist")
                                .setDescription(`**${playlist.title}** has been added to the queue`)
	                        .setColor("RANDOM")

                                 msg.channel.send(embed).then(msg => {msg.delete(10000)});
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					var embed = new Discord.RichEmbed()
                                .setTitle("🎺 Song Selection 🎻 ")
                                .setDescription(`${videos.map(video2 => `**${++index}** \`${video2.title}\` `).join('\n')}`)
	                        .setColor("RANDOM")
                                .setFooter("Please provide a value to select one of the search results ranging from 1-10.")

                                 msg.channel.send(embed).then(msg => {msg.delete(10000)});
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('No or invalid value entered, cancelling video selection.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 I could not obtain any search results.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'p') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
				var embed = new Discord.RichEmbed()
                                .setTitle("🎼 Paylist")
                                .setDescription(`**${playlist.title}** has been added to the queue`)
	                        .setColor("RANDOM")

                                 msg.channel.send(embed).then(msg => {msg.delete(10000)});
			
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					var embed = new Discord.RichEmbed()
                                .setTitle(" 🎶 Song Selection 🎤")
                                .setDescription(`${videos.map(video2 => `**${++index}** \`${video2.title}\` `).join('\n')}`)
	                        .setColor("RANDOM")
                                .setFooter("Please provide a value to select one of the search results ranging from 1-10.")

                                 msg.channel.send(embed).then(msg => {msg.delete(10000)});
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('No or invalid value entered, cancelling video selection.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 I could not obtain any search results.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could stop for you.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		msg.reply("**bot has been stopped !**");
		return undefined;
	} else if (command === 'volume') {
		if (!msg.member.voiceChannel) return msg.channel.send('**You are not in a voice channel! Use 1 - 100.**');
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		if (!args[1]) 
		                var embed = new Discord.RichEmbed()
                                .setTitle("🎛 Volume 🎛")
                                .setDescription(`The current volume is: **${serverQueue.volume}**`)
	                        .setColor("RANDOM")
                                 msg.channel.send(embed);

		serverQueue.volume = args[1];
		if (args[1] > 100)
		                var embed = new Discord.RichEmbed()
                                .setTitle("🎛 Volume 🎛")
                                .setDescription("**Your ear will bleeding! use 1 - 100 .**")
	                        .setColor("RANDOM")
                                 msg.channel.send(embed);

		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 100);
		return 
		                var embed = new Discord.RichEmbed()
                                .setTitle("🎛 Volume 🎛")
                                .setDescription(`I set the volume to: ${args[1]}`)
	                        .setColor("RANDOM")
                                 msg.channel.send(embed);

	} else if (command === 'np') {
		if (!serverQueue) return msg.channel.send('There is nothing playing.');		       
		                var embed = new Discord.RichEmbed()
                                .setTitle("📓 Song list 📓")
                                .setDescription(`${serverQueue.songs[0].title}`)
	                        .setColor("RANDOM")
                                 msg.channel.send(embed)
		
	} else if (command === 'queue') {
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
			        var embed = new Discord.RichEmbed()
                                .setTitle("Queue")
                                .setDescription(`${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`)
		                .setFooter(`**Now playing:** ${serverQueue.songs[0].title}`)
	                        .setColor("RANDOM")
                                 msg.channel.send(embed)
		
	} else if (command === 'prefixsss') {
		  if(!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send("🚫 **| You don't have `MANAGE_GUILD` perms.**");
  if(!args[0]) return msg.channel.send("Please specify something!")

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  prefixes[msg.guild.id] = {
    prefixes: args[0]
  };

  fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
    if (err) console.log(err)
  });

  let sEmbed = new Discord.RichEmbed()
  .setColor("#FF9900")
  .setTitle("Prefix Customization")
  .setColor("RANDOM")
  .addField(`Set to`, `\`${args[0]}\``);

  msg.channel.send(sEmbed);



       } else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
		                var embed = new Discord.RichEmbed()
                                .setTitle("Song Selection")
                                .setDescription(`⏸ Paused the music for you!`)
	                        .setColor("RANDOM")
                                 msg.channel.send(embed)
		}
		return msg.channel.send('There is nothing playing.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			        var embed = new Discord.RichEmbed()
                                .setTitle("Song Selection")
                                .setDescription(`▶ Resumed the music for you!`)
	                        .setColor("RANDOM")
                                 msg.channel.send(embed)
		}
		return msg.channel.send('There is nothing playing.');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 100,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

				 var embed = new Discord.RichEmbed()
                                .setTitle("💠 Yagami Music 💠")
                                .setDescription(`🎧 \`Start playing:\` **${song.title}**`)
				.setThumbnail(`https://i.ytimg.com/vi/${song.id}/default.jpg?width=80&height=60`)
	                        .setColor("RANDOM")
                                serverQueue.textChannel.send(embed)
                  
}

client.login(process.env.BOT_TOKEN);
