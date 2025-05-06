const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js'); // Added EmbedBuilder
require('dotenv').config();

class DiscordNotification {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.client.login(process.env.DISCORD_TOKEN).then(() => {
      console.log('Discord client logged in successfully!');
    }).catch(err => {
      console.error('Error logging in to Discord:', err);
    });
  }

  async killClient() {
    try {
      await this.client.destroy();
      console.log('Discord client destroyed successfully!');
    } catch (error) {
      console.error('Error destroying Discord client:', error);
    }
  }

  async ping() {
    try {
      const channelId = '1367197526079312014'; 
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || channel.type !== 0) { 
        console.error('Invalid channel ID or channel is not a text channel.');
        return;
      }

      await channel.send('@everyone');
    } catch (error) {
      console.error('Error sending ping to channel:', error);
    }
  }

  async sendToChannel(messageContent) {
    try {
      const channelId = '1367197526079312014';
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || channel.type !== 0) { 
        console.error('Invalid channel ID or channel is not a text channel.');
        return;
      }

      await channel.send(messageContent);
      console.log(`Message sent to channel ${channelId}`);
    } catch (error) {
      console.error('Error sending message to channel:', error);
    }
  }

  async sendEmbedToChannel(embedData) {
    if (!embedData) {
      embedData = {
        title: 'Default Title',
        description: 'Default Description',
        color: 0x0099ff, // Default color
        thumbnail: null,
        fields: [
          { name: 'Field 1', value: 'Value 1', inline: true },
          { name: 'Field 2', value: 'Value 2', inline: true },
        ],
        footer: 'Default Footer',
        footerIcon: null,
      }
    }
    try {
      const channelId = '1367197526079312014'; // Channel ID from .env
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || channel.type !== 0) { // Ensure it's a text channel
        console.error('Invalid channel ID or channel is not a text channel.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(embedData.title || 'Default Title')
        .setDescription(embedData.description || 'Default Description')
        .setColor(embedData.color || 0x0099ff) // Default color
        .setThumbnail(embedData.thumbnail || null)
        .addFields(
          ...(embedData.fields || [
            { name: 'Field 1', value: 'Value 1', inline: true },
            { name: 'Field 2', value: 'Value 2', inline: true },
          ])
        )
        .setFooter({
          text: embedData.footer || 'Default Footer',
          iconURL: embedData.footerIcon || null,
        })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log(`Embed sent to channel ${channelId}`);
    } catch (error) {
      console.error('Error sending embed to channel:', error);
    }
  }
}

module.exports = DiscordNotification;