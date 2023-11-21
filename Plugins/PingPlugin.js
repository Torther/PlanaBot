// PingPlugin.js
const PluginBase = require('./PluginBase');

class PingPlugin extends PluginBase {
    constructor() {
        super('PingPlugin', '简单的 ping/pong 插件');
        this.commands = [
            { command: '/ping', description: '测试机器人是否在线' }
        ];
    }

    async executeCommand(data, command) {
        if (command[0] === '/ping') {
            await this.sendReferenceMessage(data, 'pong!', false);
        }
    }
}

module.exports = PingPlugin;
