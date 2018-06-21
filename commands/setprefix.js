const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {

  if(!message.member.hasPermission("MANAGE_GUILD")) return
  if(!args[0]) return message.channel.send("Please specify something!")

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  prefixes[message.guild.id] = {
    prefixes: args[0]
  };

  fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
    if (err) console.log(err)
  });

}

exports.help = {
	name: "prefix",
	description: "change default prefix for masamiBot",
	usage: `ms!prefix !`
}
