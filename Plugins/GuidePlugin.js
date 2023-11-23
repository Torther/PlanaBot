// GuidePlugin.js
const PluginBase = require('./PluginBase');
const {default: axios} = require("axios");

class GuidePlugin extends PluginBase {
    constructor() {
        super('GuidePlugin', '提供各种攻略');
        this.commands = [
            {command: '/攻略', description: '提供各种攻略'}
        ];
    }

    async executeCommand(data, command) {
        if (command[0] === '/攻略') {
            await this.getTrainerByKeyWord(data, command[1]);
        }
    }

    async getTrainerByKeyWord(data, keyword) {
        const BASEURL = "https://arona.diyigemt.com/api/v1/image";
        const IMAGEURL = "https://arona.cdn.diyigemt.com/image";
        const response = await axios.get(BASEURL, {
            params: {
                name: keyword
            }
        }).catch(err => {
            console.error(err)
        })
        if (response.data.status === 101) {
            let msg = `没有找到与 ${keyword} 对应的信息，是否想要查找：`;
            response.data.data.forEach(i => {
                msg += "\n - " + i.name
            })
            await this.sendReferenceMessage(data, msg, false);
        } else if (response.data.status === 200) {
            const url = IMAGEURL + response.data.data[0].path;
            await this.sendReferenceMessage(data, encodeURI(url), true).catch(err => {
                console.error(err)
            })
        } else {
            await this.sendReferenceMessage(data, "数据源异常，暂时无法使用", false);
        }
    }
}

module.exports = GuidePlugin;
