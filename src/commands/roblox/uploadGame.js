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
      console.log(`[${getTimestamp()}][ACCESS DENIED]: ${interaction.user.tag} tried to run the command /check but they do not have access to this command.`);
      return;
    }

    // Get the file attachment from the command.
    const file = interaction.options.getAttachment('file');

    // get the file's name and content
    const fileName = file.name;
    const fileContent = Buffer.from(file.raw);

    // create a new file in the games folder with the file's name
    fs.writeFileSync(path.join(__dirname, `./games/${fileName}`), fileContent);
     
    console.log(`[${getTimestamp()}][SUCCESS]: ${interaction.user.tag} uploaded a game file.`);
    } catch (error) {
      console.log(error);
    }
  },

  name: 'uploadgame',
    description: 'Uploads a game to the bot files.',
    options: [
      {
        name: 'file',
        description: 'The file you want to upload.',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.ManageGuild]
};
