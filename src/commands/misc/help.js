const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    try {
      await interaction.deferReply();

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
      }
    
      function getRandomColor() {
        const color = Math.floor(Math.random() * 16777215);
        return '#' + color.toString(16);
      }

      const denied = new EmbedBuilder()
      .setTitle('Access Denied')
      .setDescription('You do not have permission to run this command.')
      .setColor('#ff0000')
      .setTimestamp();

    const token = await Token.findOne({ userId: interaction.user.id });

    if (!token) {
      interaction.editReply({
        embeds: [denied],
        ephemeral: true,
      });
      console.log(`[${getTimestamp()}][ACCESS DENIED]: ${interaction.user.tag} tried to run the command /check but they do not have access to this command.`);
      return;
    }

        const embed = new EmbedBuilder()
          .setTitle('😁 PROJECT BOTBASED MGUI list of commands')
          .setDescription('This is the list of commands for the bot.')
          .setThumbnail(client.user.avatarURL())
            .addFields({ name: '🔨 Moderation', value: '`ban`, `kick`, `timeout`', inline: true }) 
            .addFields({ name: '🎮 Roblox', value: '`access`, `publish`, `setup`, `delete`, `check`, `generate`, `gamelookup`, `gpublish`', inline: true })
            .addFields({ name: '🔧 Misc', value: '`help`, `ping`, `uptime`, `credits`', inline: true })
            .addFields({ name: '🔗 Links', value: '[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=1106966401488527440&permissions=8&scope=bot) | [Support Server](https://join.carlr.dev) | [GitHub Repository](https://github.com/carlrsdc/PROJECT-BOTBASED-MGUI)', inline: true })
          .setFooter({ text: `Requested by: ${interaction.user.tag}`, iconURL: interaction.guild.iconURL() })
            .setColor(getRandomColor())
            .setTimestamp();
    
    interaction.editReply({ embeds: [embed] });
    console.log(`[${getTimestamp()}][HELP]: ${interaction.user.tag} requested the list of commands.`);
    } catch (error) {
      console.log(error);
    }
  },

  name: 'help',
    description: 'Shows the list of commands.',
}
