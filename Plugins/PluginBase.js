// PluginBase.js
class PluginBase {
    constructor(name, description) {
        this.name = name;
        this.description = description || '';
        this.commands = [];
    }

    async initialize(client) {
        if (!client) {
            console.error(`[${this.name}] Invalid client instance provided to the plugin.`);
            throw new Error(`[${this.name}] Invalid client instance provided to the plugin.`);
        }
        this.client = client;
        console.log(`[PLUGIN] ${this.name} 初始化完成`);
    }

    async executeCommand(data, command) {
        throw new Error(`[${this.name}] Method "executeCommand" must be implemented by subclass`);
    }

    async sendReferenceMessage(data, content, isImage) {
        let reply = await this.client.messageApi.postMessage(data.msg.channel_id, {
            [isImage ? 'image' : 'content']: content,
            msg_id: data.msg.id,
            message_reference: {
                message_id: data.msg.id
            }
        });
        console.log(reply.data)
        await console.log(`[MESSAGE] Reply to ${data.msg.author.username}(${data.msg.author.id}) : ${reply.data.content.length>0?reply.data.content:"[Image]"}`)
    }
}

module.exports = PluginBase;
