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
                                                                                                        
                       CarlR MGUI - A powerful mgui discord bot made by CarlR                                                                                      
                           Bot initialized at ${currentDate.toLocaleString()}                                                                                  
  `);
  console.log(`-----------------------------------------------------------------------------------------------------------`);
  console.log(`[INFO]: Logged in as ${client.user.tag}!`);
  console.log(`[INFO]: Loaded 20 commands!`);
  console.log(`[CREDITS]: This bot was made by CarlR. Need help? Email me at developer.carlr@gmail.com!`);
  console.log(`[CREDITS]: This bot was made using Node.js and Discord.js!`)
  console.log(`[REPOSITORY]: https://github.com/notcarlrdev/CarlR-MGUI`)
  console.log(`-----------------------------------------------------------------------------------------------------------`);
};
