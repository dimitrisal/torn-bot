// Require the necessary discord.js classes
const {
	Client,
	GatewayIntentBits,
	EmbedBuilder,
	ActivityType
} = require('discord.js');
const {
	token,
	guildId
} = require('./config.json');
const axios = require('axios');
var cron = require('node-cron');

//Public Torn Key API
const tornKey = "";
let userId;
let myRole;
let roleInDisc;
let exampleEmbed;
let ibbyz;
let hostGuild;
let beaver = require('./data/beaver');
// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildEmojisAndStickers],
});

// When the client is ready, run this code (only once). Change the activity to whatever you like
client.once('ready', () => {
	client.user.setPresence({
		activities: [{
			name: `with Exi's hammer`,
			type: ActivityType.Playing
		}],
	});
	console.log('Ready!');
});

client.on('ready', () => {
	console.log('constant ready')
	//every 30 min will run the update method
	cron.schedule('*/30 * * * *', () => {
		update();
	  });
});

//react to beaver master(Sabian)
client.on('messageCreate', async message => {
	if (message.author.id === '537368804662181888') {
		message.react('🦫').catch(console.error);
	}
});

//all interactions
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const {
		commandName,
	} = interaction;

	console.log(commandName);
	if (commandName === 'blame') {
		if (interaction.options.getSubcommand() === 'usual') {
			const string = interaction.options.getString('input');
			if (string) {
				await interaction.reply("It's Ibbyz fault for " + string);
			} else {
				await interaction.reply(`It's always Ibbyz fault`);
			}
		} else if (interaction.options.getSubcommand() === 'roulette') {
			let ravager = interaction.guild.roles.cache.find(role => role.name === 'Ravage');
			await interaction.guild.members.fetch()
			const roulleteString = interaction.options.getString('input');
			await interaction.deferReply();
			let noobs = interaction.guild.roles.cache.get(ravager.id).members.map(m => m.displayName.replace(/ *\[[^)]*\] */g, ""));
			noobs.push('Ibbyz');
			noobs.push('Ibbyz');
			noobs.unshift('Ibbyz');
			noobs.unshift('Ibbyz');
			const random = Math.floor(Math.random() * noobs.length);
			let fallGuy = noobs[random];
			if (fallGuy === "sKiTzO") {
				fallGuy = "Ibbyz";
			}
			if (roulleteString) {
				await interaction.editReply(`It's ${fallGuy} fault for ${roulleteString}`);
			} else {
				await interaction.editReply(`It's ${fallGuy} fault`);
			}
		}

	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'verify') {
		try {
			//Verify Command This works by checking the Role in Torn and the role In discord.
			//If there is a difference ex Ravager Role in game Ravage in disc then you need to add an IF command

			//!this is the default role that every user gets in Ravage discord, change it to your own
			const visitor = interaction.guild.roles.cache.find(role => role.name === 'Visitor');

			//!those are the ravage roles in discord
			const ravager = interaction.guild.roles.cache.find(role => role.name === 'Ravage');
			const ravagerLead = interaction.guild.roles.cache.find(role => role.name === 'Ravager Leadership');
			// eslint-disable-next-line no-unused-vars
			const ravagerElite = interaction.guild.roles.cache.find(role => role.name === 'Elite Ravager');
			const ravagerCommand = interaction.guild.roles.cache.find(role => role.name === 'Ravager Commander');

			if (interaction.options.getSubcommand() === 'me') {
				userId = interaction.user.id;
				//!Fill the tornKey above
				const res = await axios.get(`https://api.torn.com/user/${userId}?selections=&key=${tornKey}`);
				const tornUser = {
					name: `${res.data.name} [${res.data.player_id}]`,
					faction: res.data.faction.faction_name,
					role: res.data.faction.position,
				};
				console.log(tornUser);
				//!Change it to your faction name
				// This if checks if user is in faction. If not make it as a visitor
				if (tornUser.faction !== 'Ravage') {
					interaction.member.roles.set([visitor]).catch(console.error);
				} else {
					//Search for the role in discord based on the role in the faction
					myRole = interaction.guild.roles.cache.find(role => role.name === tornUser.role);
					//automatically makes them visitor + basic ravager role
					interaction.member.roles.set([visitor, ravager]).catch(console.error);
					roleInDisc = ravager;
					//if user has a higher ingame role than simple member/recruit / ravage then add that extra role as well. Add any extra "else if" , if needed
					if (tornUser.role !== 'Ravager' && tornUser.role !== 'Member' && tornUser.role !== 'Recruit') {
						//Custom name roles for ravage, change it to your own
						if (myRole.name === 'Co-leader' || myRole.name === 'Leader') {
							interaction.member.roles.set([visitor, ravager, ravagerLead]).catch(console.error);
							roleInDisc = ravagerLead;
							//Custom name roles for ravage, change it to your own
						} else if (tornUser.role === 'Ibbyz') {
							interaction.member.roles.set([visitor, ravager, ravagerCommand]).catch(console.error);
							roleInDisc = 'It is always his fault';
						} else {
							//! be sure that the role in faction has the same spelling as the one in disc
							interaction.member.roles.set([visitor, ravager, myRole]).catch(console.error);
							roleInDisc = myRole;
						}

					}

				}
				//Rename user THIS won't work for server owners!
				interaction.member.setNickname(tornUser.name).catch(console.error);
				const avatar = interaction.user.avatar;
				exampleEmbed = {
					color: 0x0099ff,
					title: 'Torn verification succeeded',
					description: `Torn: [${tornUser.name}](https://www.torn.com/profiles.php?XID=${tornUser.id})\nDiscord:<@${userId}>\nRoles Given :${roleInDisc}`,
					thumbnail: {
						url: `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`,
					},
				};

				await interaction.reply({
					embeds: [exampleEmbed]
				});
			} else {
				//!same code as above but it is made to verify the member with @
				userId = interaction.options.getUser('user').id;
				const res = await axios.get(`https://api.torn.com/user/${userId}?selections=&key=r3KGPDIeHCaxYKBb`);
				// console.log(res);
				const tornUser = {
					name: `${res.data.name} [${res.data.player_id}]`,
					faction: res.data.faction.faction_name,
					role: res.data.faction.position,
				};
				console.log(tornUser);
				if (tornUser.faction !== 'Ravage') {
					(await interaction.guild.members.fetch(userId)).set([visitor]).catch(console.error);
					roleInDisc = 'Visitor';
				} else {
					myRole = interaction.guild.roles.cache.find(role => role.name === tornUser.role);
					(await interaction.guild.members.fetch(userId)).roles.set([visitor, ravager]).catch(console.error);
					roleInDisc = ravager;
					if (tornUser.role !== 'Ravager' && tornUser.role !== 'Member' && tornUser.role !== 'Recruit') {
						if (tornUser.role === 'Co-leader' || tornUser.role === 'Leader') {
							(await interaction.guild.members.fetch(userId)).roles.set([visitor, ravager, ravagerLead]).catch(console.error);
							roleInDisc = ravagerLead;
						} else if (tornUser.role === 'Ibbyz') {
							(await interaction.guild.members.fetch(userId)).roles.set([visitor, ravager, ravagerCommand]).catch(console.error);
							ibbyz = ravagerCommand;
							ibbyz.name = 'It is always his fault';
							roleInDisc = ibbyz;

						} else {
							(await interaction.guild.members.fetch(userId)).roles.set([visitor, ravager, myRole]).catch(console.error);
							roleInDisc = myRole;

						}

					}

				}


				(await interaction.guild.members.fetch(userId)).setNickname(tornUser.name).catch(console.error);
				const avatar = interaction.options.getUser('user').avatar;
				exampleEmbed = {
					color: 0x0099ff,
					title: 'Torn verification succeeded',
					description: `Torn: [${tornUser.name}](https://www.torn.com/profiles.php?XID=${tornUser.id})\nDiscord:<@${userId}>\nRoles Given :${roleInDisc}`,
					thumbnail: {
						url: `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`,
					},
				};

				await interaction.reply({
					embeds: [exampleEmbed]
				});

			}


		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
			//this command is to kick members who left on demand
	} else if (commandName === 'update') {
		await interaction.guild.members.fetch() //cache all members in the server
		const ravager = interaction.guild.roles.cache.find(role => role.name === 'Ravage');
		//change it your leader's role
		const Markz0r = interaction.guild.roles.cache.find(role => role.name === 'Markz0r');
		let purge = 0;

		if (!interaction.member.roles.cache.has(Markz0r.id)) {
			await interaction.reply({
				content: 'Only Mark can execute this!',
				ephemeral: true,
			});
		} else {
			// eslint-disable-next-line no-unused-vars
			const ravagerElite = interaction.guild.roles.cache.find(role => role.name === 'Elite Ravager');
			let membersWithRole = interaction.guild.roles.cache.get(ravager.id).members;
			await interaction.deferReply({
				ephemeral: true
			});

			for (member of membersWithRole) {
				var res = await axios.get(`https://api.torn.com/user/${member.id}?selections=&key=r3KGPDIeHCaxYKBb`);
				if (res.data.faction) {
					if (res.data.faction.faction_name !== 'Ravage') {
						purge++;
						await (await interaction.guild.members.fetch(member.id)).roles.remove(ravager).catch(console.error);
						await (await interaction.guild.members.fetch(member.id)).roles.remove(ravagerElite).catch(console.error);
					}
				} else {
					purge++;
					await (await interaction.guild.members.fetch(member.id)).roles.remove(ravager).catch(console.error);
					await (await interaction.guild.members.fetch(member.id)).roles.remove(ravagerElite).catch(console.error);
				}
			}

			await interaction.editReply({
				content: `Purge completed a total of ${purge} where kicked`,
				ephemeral: true,
			});
		}

	}
	//beaver jokes
	if (commandName === 'beaver') {
		const random = Math.floor(Math.random() * beaver.length);
		let joke = beaver[random];
		await interaction.reply({
			content: joke.question,
		});

		setTimeout(() => {
			console.log("");
		}, 1000);

		await interaction.followUp({
			content: joke.answer,
		});

	}
});

//!this run every 30 minutes, same logic as verify but it add users / rename or kick 
async function update() {
	let purge = 0;
	let update = 0;
	let rename = 0;
	let newName;
	const hostGuild = client.guilds.cache.get(guildId);
	await hostGuild.members.fetch();
	const ravager = hostGuild.roles.cache.find(role => role.name === 'Ravage');
	const visitor = hostGuild.roles.cache.find(role => role.name === 'Visitor');
	const ravagerLead = hostGuild.roles.cache.find(role => role.name === 'Ravager Leadership');
	const ravagerCommand = hostGuild.roles.cache.find(role => role.name === 'Ravager Commander');

	let members = await hostGuild.members.cache.values()
	for (member of members) {
		if (hostGuild.members.guild.ownerId !== member.id) {
			let res = await axios.get(`https://api.torn.com/user/${member.id}?selections=&key=r3KGPDIeHCaxYKBb`);
			if (res.data.faction) {
				let tornUser = {
					name: `${res.data.name} [${res.data.player_id}]`,
					faction: res.data.faction.faction_name,
					role: res.data.faction.position,
				};
				if (member.nickname) {
					memberName = member.nickname.replace(/ *\[[^)]*\] */g, "");
					if (memberName !== res.data.name && member.nickname) {
						newName = tornUser.name;
						await (await hostGuild.members.fetch(member.id)).setNickname(newName).catch(console.error);
						rename++;
					}
				} else {
					newName = tornUser.name;
					await (await hostGuild.members.fetch(member.id)).setNickname(newName).catch(console.error);
					rename++;
				}
				if (tornUser.faction !== 'Ravage') {
					if (await (await hostGuild.members.fetch(member.id)).roles.cache.some(role => role.id === ravager.id)) {
						await (await hostGuild.members.fetch(member.id)).roles.set([visitor]).catch(console.error);
						purge++;
						console.log(member.nickname)
					}
				} else {
					if (!await (await hostGuild.members.fetch(member.id)).roles.cache.some(role => role.id === ravager.id)) {
						(await hostGuild.members.fetch(member.id)).roles.set([visitor, ravager]).catch(console.error);
						if (tornUser.role !== 'Ravager' && tornUser.role !== 'Member' && tornUser.role !== 'Recruit') {
							if (tornUser.role === 'Co-leader' || tornUser.role === 'Leader') {
								await (await hostGuild.members.fetch(member.id)).roles.add(ravagerLead).catch(console.error);
							} else if (tornUser.role === 'Ibbyz') {
								await (await hostGuild.members.fetch(member.id)).roles.add(ravagerCommand).catch(console.error);
							} else {
								myRole = hostGuild.roles.cache.find(role => role.name === tornUser.role);
								await (await interaction.guild.members.fetch(member.id)).roles.add(myRole).catch(console.error);
							}
							update++;
						}
					}
				}

			} else {
				if (await (await hostGuild.members.fetch(member.id)).roles.cache.some(role => role.id === ravager.id)) {
					//await (await hostGuild.members.fetch(member.id)).roles.set([visitor]).catch(console.error);
					console.log("I was about to kick: "+member.username)
					purge++;
				}
			}
		}
	}
	console.log({
		purge
	});
	console.log({
		update
	});
	console.log({
		rename
	});
}

// Login to Discord with your client's token
client.login(token);
