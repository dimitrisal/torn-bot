const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder()
		.setName('blame')
		.setDescription('Blame Someone')
		.addSubcommand(subcommand =>
			subcommand.setName('roulette')
				.setDescription('blame a random person!')
				.addStringOption(option =>
					option.setName('input')
					.setDescription('It is someones fault for')))
		.addSubcommand(subcommand =>
			subcommand.setName('usual')
				.setDescription('Blame the usual suspect!')
				.addStringOption(option =>
					option.setName('input')
						.setDescription('It is someones fault for'))),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('beaver').setDescription('Replies with Beaver facts!'),
	new SlashCommandBuilder().setName('update').setDescription('Update the role of the Ravagers!'),
	new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify')
		.addSubcommand(subcommand =>
			subcommand.setName('member')
				.setDescription('Verify a member')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('Which User?')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('me')
				.setDescription('Verify yourself')),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);