// GuidePlugin.js
const PluginBase = require('./PluginBase');
const {default: axios} = require("axios");

const BASEURL = "https://arona.diyigemt.com/api/v1/image";
const IMAGEURL = "https://arona.cdn.diyigemt.com/image";

class GuidePlugin extends PluginBase {
    constructor() {
        super('GuidePlugin', '提供各种攻略');
        this.commands = [
            {command: '/攻略', description: '提供各种攻略'}
        ];
    }

    async executeCommand(data, command) {
        try {
            if (command[0] === '/攻略') {
                await this.getTrainerByKeyWord(data, command[1]);
            }
        } catch (error) {
            console.error(`[ERROR][${this.name}] Error executing command: ${error.message}`);
        }

    }

    async getTrainerByKeyWord(data, keyword) {
        try {
            const response = await this.fetchTrainerData(keyword);
            await this.handleTrainerResponse(data, response);
        } catch (error) {
            console.error(error);
            await this.sendReferenceMessage(data, "数据源异常，暂时无法使用", false);
        }
    }

    async fetchTrainerData(keyword) {
        return await axios.get(BASEURL, {
            params: {name: keyword}
        });
    }

    async handleTrainerResponse(data, response) {
        if (response.data.status === 101) {
            const msg = `没有找到与 ${response.data.keyword} 对应的信息，是否想要查找：\n - ${response.data.data.map(i => i.name).join('\n - ')}`;
            await this.sendReferenceMessage(data, msg, false);
        } else if (response.data.status === 200) {
            const url = IMAGEURL + response.data.data[0].path;
            await this.sendReferenceMessage(data, encodeURI(url), true);
        }
    }
}

module.exports = GuidePlugin;
