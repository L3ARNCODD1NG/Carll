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

    const token = await Token.findOne({ userId: interaction.user.id });

    if (!token) {
      interaction.editReply({
        embeds: [denied],
        ephemeral: true,
      });
      console.log(`[${getTimestamp()}][ACCESS DENIED]: ${interaction.user.tag} tried to run the command /publish but they do not have access to this command.`);
      return;
    }

    const game = await Game.findOne({ guildId: interaction.guild.id });

    const gameFile = path.join(__dirname, `./games/${interaction.options.getString('games')}.rbxlx`);

    // get x-csrf-token
    const getXCSRFToken = async () => {
      try {
        const response = await axios.post('https://auth.roblox.com/v2/login', null, {
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

    // Create game
    const CreateGame = async (csrf) => {
      try {
        const body = JSON.stringify({ "templatePlaceId": "379736082" });
        const response = await axios.post('https://apis.roblox.com/universes/v1/universes/create', body, {
          headers: {
            'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
            'x-csrf-token': csrf,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Roblox/WinInet',
          }
        });
        console.log(`[${getTimestamp()}][GAME PUBLISHER]: Game created! (gameId: ${response.data.rootPlaceId})`);
        return response;
      } catch (error) {
        throw new Error('Error creating user game: ' + error.message);
      }
    };

    // Upload game
    const uploadGame = async (csrf, placeId, success, failed, loading) => {
      const response = await axios.post(`https://data.roblox.com/Data/Upload.ashx?assetid=${placeId}`, fs.readFileSync(gameFile), {
        headers: {
          'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
          'X-CSRF-TOKEN': csrf,
          'Content-Type': 'application/xml',
          'User-Agent': 'Roblox/WinInet',
        }
      }).then(async response => {
        interaction.editReply({ embeds: [loading] });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log(`[${getTimestamp()}][GAME PUBLISHER]: Game uploaded! (gameId: ${placeId})`);
        interaction.editReply({ embeds: [success] });
      }).catch(async err => {
        interaction.editReply({ embeds: [loading] });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log(err);
        interaction.editReply({ embeds: [failed] });
      })
    }

    const sendRequests = async () => {
      try {
        const csrf = await getXCSRFToken(interaction.options.getString('cookie'));
        const cookie = interaction.options.getString('cookie');
        const response = await CreateGame(csrf, cookie);
        const placeId = response.data.rootPlaceId;
        const universeId = response.data.universeId;

        // Embeds
        const success = new EmbedBuilder()
        .setTitle(':tada: Your game is now published!')
        .setThumbnail(client.user.avatarURL())
        .setDescription('Your game has been published! You can now play it on Roblox! Please configure this game in creators hub to make it playable! The game is in **PRIVATE** so we fully suggest to configure your game.')
        .addFields({ name: 'Game / Theme Code', value: `You chose ${interaction.options.getString('games')}`, inline: true })
        .addFields({ name: 'Game Link', value: `[Click Here To Visit The Game](https://www.roblox.com/games/${placeId})`, inline: true })
        .addFields({ name: 'Configure Game', value: `[Click Here To Configure This Game](https://create.roblox.com/dashboard/creations/experiences/${universeId}/configure)`, inline: true })
        .setColor('#00FF00')
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` })

        const failed = new EmbedBuilder()
        .setTitle('We encountered an error!')
        .setThumbnail('https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0')
        .setDescription('We encountered an error while publishing your game! Please try again later!')
        .setColor('#FF0000')
        .setTimestamp()
        .setFooter({ text: 'Chronics Publisher'})

        const loading = new EmbedBuilder()
        .setTitle('Publishing your game...')
        .setDescription('Please wait while we publish your game to Roblox!')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
        .setColor('#FFFF00')
        
        await uploadGame(csrf, placeId, success, failed, loading);
      } catch (error) {
        console.log('Request Error:', error.message);
      }
    };

    // Final requests and interactions
      sendRequests();
      console.log(`[${getTimestamp()}][GAME PUBLISHER]: ${interaction.user.tag} has published a game using our theme ${interaction.options.getString('games')}!`)
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error has occurred. Please try again later.')
        .setColor('#ff0000')
        .setTimestamp();

      interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
      console.log(error);
    }
  },

  // remebmer to change command games value of options with the name of the game name in the games folder
  name: 'publish',
    description: 'Game publisher best suited for cellphone users.',
    options: [
      {
        name: 'cookie',
        description: 'Account cookie.',
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
            name: 'Adopt Me - Jungle V2',
            value: 'fuz7cikacaCa',
          },
          {
            name: 'Adopt Me V2',
            value: 'thIz4WrAchiJ',
          },
          {
            name: 'Bloxfruit',
            value: 'gixog32uHevU',
          },
          {
            name: 'Galaxy V2',
            value: 'c3hlFriswoD9',
          },
          {
            name: 'Horror V2',
            value: 'thisohAHOdR2',
          },
          {
            name: 'Lava V2',
            value: 'bi7hIM3tri3r',
          },
          {
            name: 'Limited V2',
            value: 'zi4IcHoBrosa',
          },
          {
            name: 'Pet Simulator X V2',
            value: 'bRlNiWra7Hus',
          },
          {
            name: 'Robux Theme - Bank',
            value: 'CHo4rufo0UfR',
          },
          {
            name: 'Snow V2',
            value: 'h4swldI6aspL',
          },
        ],
      },
    ],
};
