// PluginManager.js
const fs = require('fs');
const path = require('path');
const PluginBase = require('./Plugins/PluginBase');

class PluginManager {
    constructor() {
        this.plugins = [];
    }

    loadPlugins(client) {
        const pluginsDir = path.join(__dirname, 'Plugins');

        // 读取 Plugins 目录下的所有文件
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js') && file !== 'PluginBase.js');

        // 加载每个继承自 PluginBase 的插件
        for (const file of pluginFiles) {
            const pluginPath = path.join(pluginsDir, file);
            const plugin = require(pluginPath);
            if (plugin.prototype instanceof PluginBase) {
                this.loadPlugin(plugin, client);
            }
        }
    }

    async loadPlugin(plugin, client) {
        const instance = new plugin();
        try {
            await instance.initialize(client);
            this.plugins.push(instance);
            console.log(`[PLUGIN] ${instance.name} 加载成功`);
        } catch (error) {
            console.error(`[PLUGIN] ${instance.name} 加载失败: ${error.message}`);
        }
    }

    async executeCommand({msg: {channel_id, id, author}}, command, client) {
        let commandHandled = false;
        for (const plugin of this.plugins) {
            if (plugin.hasCommand(command[0])) {
                await plugin.executeCommand({msg: {channel_id, id, author}}, command);
                commandHandled = true;
                break;
            }
        }
        if (!commandHandled) {
            await this.handleDefaultCommand({msg: {channel_id, id, author}}, command, client);
        }
    }

    async handleDefaultCommand({msg: {channel_id, id, author}}, command, client) {
        const availableCommands = this.collectAvailableCommands();
        const errorMessage = `未匹配到命令：${command}\n当前可用命令列表：\n${availableCommands}`;

        let reply = await client.messageApi.postMessage(channel_id, {
            content: errorMessage,
            msg_id: id,
            message_reference: {message_id: id}
        });
        console.log(`[MESSAGE] Reply to ${author.username}(${author.id}) : ${reply.data.content}`);
    }

    collectAvailableCommands() {
        return this.plugins.map(plugin => plugin.getFormattedCommands()).join('');
    }

}

module.exports = PluginManager;
