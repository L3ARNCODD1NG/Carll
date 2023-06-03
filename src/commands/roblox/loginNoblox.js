const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const noblox = require('noblox.js');

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

        const currentUser = await noblox.setCookie(interaction.options.getString('cookie'));

        const embed = new EmbedBuilder()
        .setTitle(`:tada: You have successfully logged in to your account! ${currentUser.UserName} [${currentUser.UserID}]`)
        .setColor(getRandomColor())
        .setThumbnail(client.user.avatarURL())

    interaction.editReply({
        embeds: [embed],
        ephemeral: true,
    });
    } catch (error) {
      console.log(error);
      const errorembed = new EmbedBuilder()
        .setTitle(`:x: An error has occured: ${error.message}`)
        .setColor('#ff0000')
        .setThumbnail(client.user.avatarURL())

    interaction.editReply({ embeds: [errorembed], ephemeral: true });
    }
  },

  name: 'login',
    description: 'Login account to roblox',
    options: [
        {
            name: 'cookie',
            description: 'Cookie to login',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
}
