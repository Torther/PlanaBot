const fs = require('fs');
const yaml = require('js-yaml');
const {createOpenAPI, createWebsocket} = require('qq-guild-bot');
const PluginManager = require('./PluginManager');

const config = yaml.load(fs.readFileSync('./Config/Plana/config.yml', 'utf8'));
const client = createOpenAPI(config);
const ws = createWebsocket(config);

async function main() {
    try {
        const pluginManager = new PluginManager();
        pluginManager.loadPlugins(client);

        ws.on('READY', () => {
            console.log('[READY] Bot Started!');
        });

        ws.on('PUBLIC_GUILD_MESSAGES', (data) => {
            if (data.eventType === 'AT_MESSAGE_CREATE') {
                console.log(`[MESSAGE] Receive from ${data.msg.author.username}(${data.msg.author.id}) : ${data.msg.content}`)
                const command = data.msg.content.replace(/<@!.*?>\s*/, "").split(" ");
                pluginManager.executeCommand(data, command);
            }
        });
    } catch (error) {
        console.error(`An error occurred: ${error}`)
    }
}

void main();
