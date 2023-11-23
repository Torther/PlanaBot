const PluginBase = require('./PluginBase');
const {default: axios} = require("axios");

const BASEURL = "https://arona.diyigemt.com/api/v2/image";
const IMAGEURL = "https://arona.cdn.diyigemt.com/image/s";

class GuidePlugin extends PluginBase {
    constructor() {
        super('GuidePlugin', '提供各种攻略');
        this.commands = [
            {command: '/攻略', description: '提供各种攻略'}
        ];
    }

    async executeCommand(data, command) {
        try {
            if (command[0] === '/攻略' && command[1]) {
                await this.getTrainerByKeyWord(data, command[1]);
            } else {
                await this.sendReferenceMessage(data, "请添加参数，如 /攻略 未花", false);
            }
        } catch (error) {
            console.error(`[ERROR][${this.name}] Error executing command: ${error.message}`);
        }
    }

    async getTrainerByKeyWord(data, keyword) {
        try {
            const response = await this.fetchTrainerData(keyword);
            await this.handleTrainerResponse(keyword, data, response.data);
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

    async handleTrainerResponse(keyword, data, {code, message, data: responseData}) {
        if (code === 200 && message === "OK") {
            if (responseData.length === 1) {
                const url = IMAGEURL + responseData[0].content;
                await this.sendReferenceMessage(data, encodeURI(url), true);
            } else {
                const msg = `没有找到与 ${keyword} 对应的信息，是否想要查找：\n - ${responseData.map(i => i.name).join('\n - ')}`;
                await this.sendReferenceMessage(data, msg, false);
            }
        } else {
            await this.sendReferenceMessage(data, "数据源异常，暂时无法使用", false);
        }
    }
}

module.exports = GuidePlugin;
