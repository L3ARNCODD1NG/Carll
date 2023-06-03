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

    const tut1 = new EmbedBuilder()
    .setTitle('How to obtain your Roblox API keys')
    .setThumbnail('https://i.pinimg.com/originals/56/b9/af/56b9af0fd3c116c9333cd87f1c731658.gif')
    .setDescription('1. Go to https://create.roblox.com/dashboard and sign in to your Roblox account.')
    .setColor(getRandomColor())
    .setTimestamp();

    const tut2 = new EmbedBuilder()
    .setTitle('How to obtain your Roblox API keys')
    .setThumbnail('https://i.pinimg.com/originals/56/b9/af/56b9af0fd3c116c9333cd87f1c731658.gif')
    .setDescription('2. Click on the credentials in creator dashboard.')
    .setImage('https://cdn.discordapp.com/attachments/1097883220290306128/1109098419110297671/image.png')
    .setColor(getRandomColor())
    .setTimestamp();

    const tut3 = new EmbedBuilder()
    .setTitle('How to obtain your Roblox API keys')
    .setThumbnail('https://i.pinimg.com/originals/56/b9/af/56b9af0fd3c116c9333cd87f1c731658.gif')
    .setDescription('3. Click create api key and name your api key. After that, go to Access Permissions and do exactly what the image below says.')
    .setImage('https://cdn.discordapp.com/attachments/1097883220290306128/1109099075095244941/image.png')
    .setColor(getRandomColor())
    .setTimestamp();

    const tut4 = new EmbedBuilder()
    .setTitle('How to obtain your Roblox API keys')
    .setThumbnail('https://i.pinimg.com/originals/56/b9/af/56b9af0fd3c116c9333cd87f1c731658.gif')
    .setDescription('4. Scroll down to Security options and add 0.0.0.0/0 to the accepted ip addresses. Always set the expiration to **NO EXPIRATION**. After that, click "Save & Generate" button.')
    .setImage('https://cdn.discordapp.com/attachments/1097883220290306128/1109099796389707796/image.png')
    .setColor(getRandomColor())
    .setTimestamp();

    const tut5 = new EmbedBuilder()
    .setTitle('How to obtain your Roblox API keys')
    .setThumbnail('https://i.pinimg.com/originals/56/b9/af/56b9af0fd3c116c9333cd87f1c731658.gif')
    .setDescription('5. You know have your Roblox API key! You can now use it to use the bot publisher.')
    .setColor(getRandomColor())
    .setTimestamp();

    const end = new EmbedBuilder()
    .setTitle('Finishing tutorial')
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
    .setDescription('You have finished the tutorial! You can now use the bot publisher.')
    .setColor(getRandomColor())
    
    interaction.editReply({ embeds: [tut1] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.editReply({ embeds: [tut2] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.editReply({ embeds: [tut3] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.editReply({ embeds: [tut4] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.editReply({ embeds: [tut5] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.editReply({ embeds: [end] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.deleteReply();

    } catch (error) {
      console.log(error);
    }
  },

  name: 'tutorial',
    description: 'Shows how to obtain api keys',
}
