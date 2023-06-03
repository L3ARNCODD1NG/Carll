const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
const { mongodb, token } = require('../config.json');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongodb, { keepAlive: true });
    console.log('[MONGODB] Connected to database.');

    eventHandler(client);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

client.login(token);
