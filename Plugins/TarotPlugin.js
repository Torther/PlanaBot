const PluginBase = require('./PluginBase');
const sqlite3 = require('sqlite3');
const {promisify} = require('util');

class TarotPlugin extends PluginBase {
    constructor() {
        super('TarotPlugin', '抽一张BA风格的塔罗牌, 画师pixiv@Shi0n');
        this.commands = [{command: '/塔罗牌', description: '抽取一张塔罗牌'}];
        this.db = new sqlite3.Database(`${__dirname}/../Data/Plana/plana.db`); // 这里假设数据库文件为 tarot.db
    }

    async executeCommand(data, command) {
        try {
            if (command[0] === '/塔罗牌') {
                await this.drawAndSaveTarot(data);
            }
        } catch (error) {
            console.error(`[${this.name}] Error executing command: ${error.message}`);
        }
    }

    async drawAndSaveTarot(data) {
        const uid = data.msg.author.id
        try {
            const record = await this.getTarotRecord(uid);
            if (record) {
                await this.sendTarotResult(data, record.tarot, record.positive);
            } else {
                const {tarotIndex, positive} = this.drawTarot();
                await this.saveToDatabase(uid, tarotIndex, positive);
                await this.sendTarotResult(data, tarotIndex, positive);
            }
        } catch (error) {
            console.error(`[${this.name}] Error drawing and saving tarot: ${error.message}`);
        }
    }

    async getTarotRecord(uid) {
        const currentDate = getCurrentDateAsString();
        const query = `SELECT *
                       FROM TarotRecord
                       WHERE uid = ?
                         AND \`date\` = ?`;
        const runQuery = promisify(this.db.get.bind(this.db));
        try {
            return await runQuery(query, [uid, currentDate]);
        } catch (error) {
            throw error;
        }
    }

    drawTarot() {
        const tarotCount = 22;
        const tarotIndex = Math.floor(Math.random() * tarotCount) + 1;
        const positive = Math.round(Math.random());
        return {tarotIndex, positive};
    }


    async saveToDatabase(uid, tarot, positive) {
        const currentDate = getCurrentDateAsString();
        const insertQuery = `INSERT INTO TarotRecord (uid, date, tarot, positive)
                             VALUES (?, ?, ?, ?)`;
        const runQuery = promisify(this.db.run.bind(this.db));

        try {
            await runQuery(insertQuery, [uid, currentDate, tarot, positive]);
        } catch (error) {
            throw error;
        }
    }

    async sendTarotResult(data, tarot, positive) {
        const runQuery = promisify(this.db.get.bind(this.db));

        try {
            const row = await runQuery("SELECT * FROM Tarot WHERE id = ?", [tarot]);
            const positionText = positive === 1 ? "正位" : "逆位";
            const message = `看看${data.msg.author.username}抽到了什么：\n${row.name}(${positionText})\n${positive === 1 ? row.positive : row.negative}`;
            await this.sendReferenceMessage(data, message, false);

            // 继续进行其他操作...
        } catch (error) {
            const errorMessage = error.toString();
            await this.sendReferenceMessage(data, errorMessage, false);
        }
    }
}

function getCurrentDateAsString() {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '');
}

module.exports = TarotPlugin;
