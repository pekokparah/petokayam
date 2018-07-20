const Discord = require("discord.js");
const music = new Discord.Client({disableEveryone: true});
music.commands = new Discord.Collection();
const {color} = require('./config.json');
const queue = new Map();




music.on('message', async message => {

    let prefix = '>';
    let msg = message.content.toLowerCase();
    let args = message.content.slice(prefix.length).trim().split(" ");
    let cmd = args.shift().toLowerCase();
    let sender = message.author;

    if (!msg.startsWith(prefix)) return;
    if (sender.bot) return;
    
    try {
        let commandFile = require(`./commands/${cmd}.js`); 
        commandFile.run(music, message, args, color, queue); 
    } catch(e) { 
        console.log(e.message); 
    } finally { 
        console.log(`${message.author.username} ran the command: ${cmd} on ${message.guild.name}`);
    }
});

music.login(process.env.TOKEN);

bot.on("ready", async () => {
    console.log(`Logged in as : ${bot.user.tag}`);
    console.log(`${bot.user.username} is ready!`)
                
    function randomStatus() {
        let status = [`Windy Lagi Oprasi Aku :3`, `Member Kita: ${bot.users.size.toLocaleString()}`, 'discord.io/MANIAC',]
          let rstatus = Math.floor(Math.random() * status.length);
        bot.user.setActivity(status[rstatus], {type: 'STREAMING', url: "https://www.twitch.tv/verterid"});
    }; setInterval(randomStatus, 20000)
    setInterval(() => {
        
  }, 1800000);
});
