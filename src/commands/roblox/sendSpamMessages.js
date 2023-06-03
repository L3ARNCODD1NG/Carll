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
      await interaction.deferReply({ ephemeral: true });

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

    // embeds
    const embed = new EmbedBuilder()
    .setTitle(`:tada: We have successfully sent spam messages to your friends!`)
    .setColor(getRandomColor())
    .setThumbnail(client.user.avatarURL())
    .setTimestamp();

    const currentUser = await noblox.setCookie(interaction.options.getString('cookie'));
    const fetchFriendsUrl = `https://friends.roblox.com/v1/users/${currentUser.UserID}/friends`;
    const sendMessageUrl = 'https://privatemessages.roblox.com/v1/messages/send';

     const getFriendList = async () => {
        try {
          const response = await axios.get(`https://friends.roblox.com/v1/users/${currentUser.UserID}/friends`);
          return response.data.data.map(friend => friend.id);
        } catch (error) {
          throw new Error('Error fetching friend list: ' + error.message);
        }
      };

      const getXCSRFToken = async (cookie) => {
        try {
          const response = await axios.post('https://privatemessages.roblox.com/', null, {
            headers: {
              'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
            },
            validateStatus: (status) => status === 200 || status === 403, // Ignore 403 Forbidden
          });
      
          if (response.status === 403) {
            console.log(`[${getTimestamp()}][TOKEN GRABBER]: Ignoring 403 Forbidden error and continuing... (x-csrf-token: ${response.headers['x-csrf-token']})`);
          }
      
          return response.headers['x-csrf-token'];
        } catch (error) {
          throw new Error('Error fetching x-csrf-token: ' + error.message);
        }
      };
      
      const sendMessage = async (recipientId, csrfToken) => {
        try {
          const requestBody = {
            userId: currentUser.UserID,
            subject: 'Join our game now!',
            body: 'Join our game now! https://www.roblox.com/games/7187357870/ \n CarlR Bot Testing Phase 1',
            recipientId: recipientId,
            includePreviousMessage: true
          };
      
          const response = await axios.post('https://privatemessages.roblox.com/v1/messages/send', requestBody, {
            headers: {
              'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
              'x-csrf-token': csrfToken
            }
          });
      
          console.log(`[${getTimestamp()}][SPAM SENDER]: Message sent to recipient ID ${recipientId}`);
        } catch (error) {
          throw new Error(`Error sending message: ${error.message} (x-csrf-token: ${csrfToken})`);
        }
      };
      
      const sendMessagesToFriends = async () => {
        try {
          const friendList = await getFriendList();
          const csrfToken = await getXCSRFToken(interaction.options.getString('cookie'));
    
          for (const recipientId of friendList) {
            await sendMessage(recipientId, csrfToken);
          }
        } catch (error) {
          console.log('Error:', error.message);
        }
      };
      
    sendMessagesToFriends();
    interaction.editReply({ embeds: [embed], ephemeral: true });
    console.log(`[${getTimestamp()}][SPAM SENDER]: Spam messages sent to all friends of ${currentUser.UserName}.`);
    } catch (error) {
      console.log(error);
      const errorembed = new EmbedBuilder()
        .setTitle(`:x: An error has occured: ${error.message}`)
        .setColor('#ff0000')
        .setThumbnail(client.user.avatarURL())

    interaction.editReply({ embeds: [errorembed], ephemeral: true });
    }
  },

  name: 'sendspam',
    description: 'Sends spam messages to all friends of the account.',
    options: [
        {
            name: 'cookie',
            description: 'The .ROBLOSECURITY cookie of the account.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
}
