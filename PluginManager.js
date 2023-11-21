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

    async executeCommand(data, command) {
        for (const plugin of this.plugins) {
            await plugin.executeCommand(data, command);
        }
    }
}

module.exports = PluginManager;
