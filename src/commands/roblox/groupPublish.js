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
      console.log(`[${getTimestamp()}][ACCESS DENIED]: ${interaction.user.tag} tried to run the command /check but they do not have access to this command.`);
      return;
    }

      const success = new EmbedBuilder()
        .setTitle('Your game is published!')
        .setThumbnail('https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0')
        .setDescription('Your game has been published! You can now play it on Roblox!')
        .addFields({ name: 'Game Link', value: `[Click Here To Visit The Game](https://www.roblox.com/games/${interaction.options.getString('game-id')})`, inline: false })
        .setColor('#00FF00')
        .setTimestamp()
        .setFooter({ text: 'Project MGUI - CarlR#0001'})

        const failed = new EmbedBuilder()
        .setTitle('We encountered an error!')
        .setThumbnail('https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0')
        .setDescription('We encountered an error while publishing your game! Please try again later!')
        .setColor('#FF0000')
        .setTimestamp()
        .setFooter({ text: 'Project MGUI - CarlR#0001'})

      let game = await Game.findOne({ guildId: interaction.guild.id });

      let gameFile = path.join(__dirname, `./games/${interaction.options.getString('game-key')}.rbxl`);

     // Request to publish the game
     const sendPublishRequest = async () => {
       axios.post(`https://apis.roblox.com/universes/v1/${interaction.options.getString('universe-id')}/places/${interaction.options.getString('game-id')}/versions`, fs.readFileSync(gameFile),
        {
            params: {
                'versionType': 'Published'
            },
            headers: {
                'x-api-key': `${interaction.options.getString('api-key')}`,
                'Content-Type': 'application/octet-stream',
                'x-csrf-token': 'fetch',
            }
        }).then(response => {
            console.log(response.headers);
            interaction.editReply({ embeds: [success] })
        }).catch(err => {
            console.log(err);
            interaction.editReply({ embeds: [failed] })
        })
      }

        // Save the game to the database
        game = new Game({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          games: interaction.options.getString('game-id'),
          apiKey: interaction.options.getString('api-key'),
          lastUpdate: currentDate.toLocaleString('en-US'),
        });

      sendPublishRequest();
      await game.save();
      console.log(`[${getTimestamp()}][GROUP GAME PUBLISHER]: ${interaction.user.tag} has published a game using our theme ${interaction.options.getString('game-key')}! (Game ID: ${interaction.options.getString('game-id')})`)
    } catch (error) {
      console.log(error);
    }
  },

  // remebmer to change command games value of options with the name of the game name in the games folder
  name: 'gamepublish',
    description: 'Group Game publisher best suited for cellphone users.',
    options: [
      {
        name: 'api-key',
        description: 'Your API Key obtainable in roblox creator website.',
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
            name: 'Theme Park Tycoon 2',
            value: 'tpt2'
          },
          {
            name: 'Adopt Me',
            value: 'adm'
          },
          {
            name: 'Jailbreak',
            value: 'jb'
          },
          {
            name: 'Tower of Hell',
            value: 'toh'
          },
          {
            name: 'Arsenal',
            value: 'arsenal'
          },
        ],
      },
      {
        name: 'universe-id',
        description: 'Your game universeID obtainable in roblox creator website.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'game-id',
        description: 'Your gameID obtainable in roblox creator / roblox website.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
};
