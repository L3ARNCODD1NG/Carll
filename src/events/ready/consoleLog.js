// This event is called when the bot is ready and logged in.
module.exports = (client) => {
  const currentDate = new Date();
  console.log(`-----------------------------------------------------------------------------------------------------------`);
  console.log(`
   █████████                      ████  ███████████      ██████   ██████   █████████  █████  █████ █████
  ███░░░░░███                    ░░███ ░░███░░░░░███    ░░██████ ██████   ███░░░░░███░░███  ░░███ ░░███ 
 ███     ░░░   ██████   ████████  ░███  ░███    ░███     ░███░█████░███  ███     ░░░  ░███   ░███  ░███ 
░███          ░░░░░███ ░░███░░███ ░███  ░██████████      ░███░░███ ░███ ░███          ░███   ░███  ░███ 
░███           ███████  ░███ ░░░  ░███  ░███░░░░░███     ░███ ░░░  ░███ ░███    █████ ░███   ░███  ░███ 
░░███     ███ ███░░███  ░███      ░███  ░███    ░███     ░███      ░███ ░░███  ░░███  ░███   ░███  ░███ 
 ░░█████████ ░░████████ █████     █████ █████   █████    █████     █████ ░░█████████  ░░████████   █████
  ░░░░░░░░░   ░░░░░░░░ ░░░░░     ░░░░░ ░░░░░   ░░░░░    ░░░░░     ░░░░░   ░░░░░░░░░    ░░░░░░░░   ░░░░░ 
                                                                                                        
                  Project BotBased MGUI - A powerful mgui discord bot made by CarlR                                                                                      
                           Bot initialized at ${currentDate.toLocaleString()}                                                                                  
  `);
  console.log(`-----------------------------------------------------------------------------------------------------------`);
  console.log(`[INFO]: Logged in as ${client.user.tag}!`);
  console.log(`[INFO]: Bot is in 1 servers!`);
  console.log(`[INFO]: Loaded 14 commands!`);
  console.log(`[CREDITS]: This bot was made by CarlR. Need help? Email me at developer.carlr@gmail.com!`);
  console.log(`[CREDITS]: This bot was made using Node.js and Discord.js!`)
  console.log(`[REPOSITORY]: https://github.com/carlrsdc/PROJECT-BOTBASED-MGUI`)
  console.log(`-----------------------------------------------------------------------------------------------------------`);
};
