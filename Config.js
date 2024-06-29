const fs = require('fs');
const chalk = require('chalk');
require('dotenv').config();

//contact details
global.ownernumber = [ process.env.OWNER_NUMBER || "919931122319"],
global.ownername = process.env.OWNER_NAME || "𓆩‎𝕮𝖔𝖘𝖒𝖎𝖈 𝕷𝖎𝖒𝖚𝖑𝖊✘𓆪",
global.ytname = "YT: LimuleBot.inc"
global.socialm = "GitHub: Limule3650"
global.location = "Indian"

global.botname = process.env.BOTNAME || "𝑫𝑬𝑨𝑻𝑯 𝑹𝑰𝑴𝑼𝑹𝑼",//name of the bot

//sticker details
global.stickername = process.env.STICKER || "𓆩𝕮𝖔𝖘𝖒𝖎𝖈 𝕷𝖎𝖒𝖚𝖑𝖊‎✘𓆪",
global.packname = 'Sticker By'
global.author = process.env.AUTHOR || "𓆩‎𝕮𝖔𝖘𝖒𝖎𝖈 𝕷𝖎𝖒𝖚𝖑𝖊✘𓆪",
//console view/theme
global.themeemoji = '🧩'
global.wm = "Limule Bot inc."

//theme link
global.link = 'https://whatsapp.com/channel/0029VahIcmX4o7qQ9GO2Pk0d'

//custom prefix
global.prefa = process.env.PREFIX || ".",

//false=disable and true=enable
global.welcome = process.env.WELCOME || "false", //auto welcome
global.autoRecording = false //auto recording
global.autoTyping = false //auto typing
global.autorecordtype = false //auto typing + recording
global.autoread = false //auto read messages
global.autobio = false //auto update bio
global.anti212 = true //auto block +212
global.autoread_status = false //auto view status/story



//reply messages
global.mess = {
    done: '🔞 *Here you go bro!* ',
    prem: '🚭 *OHAYO,bro this feature is for premium users*',
    admin: '💥 *Sucks, this feature is reserved for admins only*',
    botAdmin: '✋ *Tss, this feature can only be used when the bot is a group admin* ',
    owner: '🐦 *Remarque, this feature is reserved for the owner only*',
    group: '😹 *Remarque, this feature is exclusively for groups*',
    private: '😹 *Petit, this feature is exclusively for private chats*',
    wait: '💯 *Bro, in process...* ',    
    error: '🐦‍⬛ *Bro, there seems to be an error!*',
}

module.exports = {
ownernumber: global.ownernumber,
ownername: global.ownername,
sessionId: process.env.id,
AUTO_BLOCK : process.env.PM_BLOCKER,
STATUS_SAVER : "true",
ANTI_BOT:"true",
}


global.thumb = fs.readFileSync('./Gallery/thumb.jpg')

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update'${__filename}'`))
    delete require.cache[file]
    require(file)
})
