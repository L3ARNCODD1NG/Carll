const { ApplicationCommandOptionType, Client, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const Game = require('../../models/Game');
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

    const currentDate = new Date();

    try {
      await interaction.deferReply({ ephemeral: true });

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
      }

      const denied = new EmbedBuilder()
      .setTitle('Access Denied')
      .setDescription('You do not have permission to run this command.')
      .setColor('#ff0000')
      .setTimestamp();

    const token = await Token.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

    if (!token) {
      interaction.editReply({
        embeds: [denied],
        ephemeral: true,
      });
      console.log(`[${getTimestamp()}][ACCESS DENIED]: ${interaction.user.tag} tried to run the command /check but they do not have access to this command.`);
      return;
    }

      let game = await Game.findOne({ guildId: interaction.guild.id });

      let gameFile = path.join(__dirname, `./games/${interaction.options.getString('games')}.rbxl`);

      const requestBody = {
        usernames: [`${interaction.options.getString('username')}`],
        excludeBannedUsers: true
      };

    const user = await axios.post("https://users.roblox.com/v1/usernames/users", requestBody);
    const userData = user.data.data[0];
    const userId = userData.id;
    const username = userData.displayName;

    const gameAPI = await axios.get(`https://games.roblox.com/v2/users/${userId}/games`);
    const gameData = gameAPI.data.data[0];
    const universeId = gameData.id;
    const placeId = gameData.rootPlace.id;

    const success = new EmbedBuilder()
    .setTitle(':tada: Your game is now published!')
    .setThumbnail(client.user.avatarURL())
    .setDescription('Your game has been published! You can now play it on Roblox!')
    .addFields({ name: 'Game / Theme', value: `You chose ${interaction.options.getString('games')}`, inline: false })
    .addFields({ name: 'Game Link', value: `[Click Here To Visit The Game](https://www.roblox.com/games/${interaction.options.getString('game-id')})`, inline: false })
    .setColor('#00FF00')
    .setTimestamp()
    .setFooter({ text: `Requested by ${interaction.user.tag}` })

    const failed = new EmbedBuilder()
    .setTitle('We encountered an error!')
    .setThumbnail('https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0')
    .setDescription('We encountered an error while publishing your game! Please try again later!')
    .setColor('#FF0000')
    .setTimestamp()
    .setFooter({ text: 'Project MGUI - CarlR#0001'})

    const loading = new EmbedBuilder()
    .setTitle('Publishing your game...')
    .setDescription('Please wait while we publish your game to Roblox!')
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
    .setColor('#FFFF00')

     // Request to publish the game
     const sendPublishRequest = async () => {
       axios.post(`https://apis.roblox.com/universes/v1/${universeId}/places/${placeId}/versions`, fs.readFileSync(gameFile),
        {
            params: {
                'versionType': 'Published'
            },
            headers: {
                'x-api-key': `${interaction.options.getString('api-key')}`,
                'Content-Type': 'application/octet-stream',
                'x-csrf-token': 'fetch',
            }
        }).then(async response => {
            interaction.editReply({ embeds: [loading] })
            await new Promise((resolve) => setTimeout(resolve, 10000));
            interaction.editReply({ embeds: [success] })
        }).catch(async err => {
            console.log(err);
            interaction.editReply({ embeds: [loading] })
            await new Promise((resolve) => setTimeout(resolve, 10000));
            interaction.editReply({ embeds: [failed] })
        })
      }

        // Save the game to the database
        game = new Game({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          games: interaction.options.getString('games'),
          apiKey: interaction.options.getString('api-key'),
          lastUpdate: currentDate.toLocaleString('en-US'),
        });

      sendPublishRequest();
      await game.save();
      console.log(`[${getTimestamp()}][GAME PUBLISHER]: ${interaction.user.tag} has published a game using our theme ${interaction.options.getString('games')}! (Game ID: ${placeId})`)
    } catch (error) {
      console.log(error);
    }
  },

  // remebmer to change command games value of options with the name of the game name in the games folder
  name: 'publish',
    description: 'Game publisher best suited for cellphone users.',
    options: [
      {
        name: 'api-key',
        description: 'Your API Key obtainable in roblox creator website.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'username',
        description: 'Your Roblox username.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'games',
        description: 'Choose what game do you want to publish.',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: 'Bloxfruit',
            value: 'bloxfruit'
          },
          {
            name: 'Snow v2',
            value: 'snow'
          },
        ],
      },
    ],
};
