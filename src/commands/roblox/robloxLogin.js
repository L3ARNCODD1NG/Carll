const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const noblox = require('noblox.js');
const fun = require('funcaptcha');
const readline = require("readline")
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"

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

    // Get x-csrf-token
    const getXCSRFToken = async () => {
      try {
        const response = await axios.post('https://auth.roblox.com/v2/login', null, {
          headers: {
            'User-Agent': USER_AGENT,
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

    const csrf = await getXCSRFToken();
    const username = interaction.options.getString('username');
    const password = interaction.options.getString('password');

    const datas = {
      "ctype": "Username",
      "cvalue": username,
      "password": password,
      "captchaToken": null,
      "captchaProvider": "PROVIDER_ARKOSE_LABS"
    }

    const response = await axios.post('https://auth.roblox.com/v2/login', datas, {
      headers: {
        'User-Agent': USER_AGENT,
        'x-csrf-token': csrf,
      },
      validateStatus: (status) => status === 200 || status === 403, // Ignore 403 Forbidden
    })

    const fieldData = JSON.parse(Buffer.from(response.headers["rblx-challenge-metadata"], "base64"))
    console.log(response.headers["rblx-challenge-metadata"])
    const dataExchangeBlob = fieldData['dataExchangeBlob'];

    if (response.status === 403) {
      console.log(`[${getTimestamp()}][ROBLOX BLOB]: Ignoring 403 Forbidden error and continuing...`);
    }

    console.log(fieldData)

    fun.getToken({
      pkey: "476068BF-9607-4799-B53D-966BE98E2B81",
      data: {
        "blob": fieldData.dataExchangeBlob,
      },
      headers: {
        "User-Agent": USER_AGENT,
      },
      site: "https://www.roblox.com",
      location: "https://www.roblox.com/login" 
    }).then(async (token) => {
      let session = new fun.Session(token)
      let challenge = await session.getChallenge()
      console.log(`${session.getEmbedUrl()}`)
      console.log(`[${getTimestamp()}][FUNCAPTCHA]: ${interaction.user.tag} has been given a fun captcha challenge. (Variant: ${challenge.data.game_data.game_variant})`);

      const waves = 4;

      async function sendEmbedsSequentially() {
        for (let x = 1; x <= waves; x++) {
          const sequence = (x - 1) % 5 + 1; // Calculate the sequence within the range of 1 to 5
      
          if (sequence === 1 && x > 1) {
            // Send the loading embed when the sequence resets
            const loadingEmbed = new EmbedBuilder()
              .setTitle('Loading...')
              .setDescription('Please wait while the next wave is prepared.')
              .setColor(getRandomColor())
              .setTimestamp()
              .setFooter({ text: 'Powered by FunCaptcha' });
      
            await interaction.editReply({ embeds: [loadingEmbed], ephemeral: true });
            // Add a delay if needed before sending the next wave, e.g., using `await new Promise(resolve => setTimeout(resolve, 2000));`
          }
      
          const embed = new EmbedBuilder()
            .setTitle(`FunCaptcha (Wave: ${sequence}/${waves})`)
            .setDescription('Please complete the captcha below to login to your account.')
            .addFields({ name: 'Instructions', value: `${challenge.instruction}`, inline: true })
            .setImage(`https://client-api.arkoselabs.com/rtig/image?challenge=${sequence}&sessionToken=${challenge.data.session_token}&gameToken=${challenge.data.challengeID}`)
            .setColor(getRandomColor())
            .setTimestamp()
            .setFooter({ text: 'Powered by FunCaptcha' });
      
          await interaction.editReply({ embeds: [embed], ephemeral: true });
          // Add a delay if needed between each wave, e.g., using `await new Promise(resolve => setTimeout(resolve, 1000));`
        }
      }
      
      sendEmbedsSequentially();
      
  })

    } catch (error) {
      console.log(error);
      const errorembed = new EmbedBuilder()
        .setTitle(`:x: An error has occured: ${error.message}`)
        .setColor('#ff0000')
        .setThumbnail(client.user.avatarURL())

    interaction.editReply({ embeds: [errorembed], ephemeral: true });
    }
  },

  name: 'rlogin',
    description: 'Login account to roblox',
    options: [
        {
            name: 'username',
            description: 'Username of the account you want to login to',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'password',
            description: 'Password of the account you want to login to',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
}
