require('./Config')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const fss = require('fs-extra')
const moment = require('moment-timezone');
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const { exec, execSync } = require('child_process');
const Config = require('./Config.js');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./Gallery/lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./Gallery/lib/myfunc')
const { default: RimuruConnect, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, Browsers, getAggregateVotesInPollMessage, extractMessageContent, getContentType, normalizeMessageContent, downloadMediaMessage, getBinaryNodeChild, WAMediaUpload, getBinaryNodeChildren, generateWAMessage, WA_DEFAULT_EPHEMERAL} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const Pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const makeWASocket = require("@whiskeysockets/baileys").default
var sessionFolderPath = path.join(__dirname, '/session');
var sessionPath = path.join(sessionFolderPath, '/creds.json'); 
console.log(Config.sessionId);
Dec_Sess();

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})

async function Dec_Sess(){
execSync('rm -rf ' + sessionPath);
exec('rm -r ' + sessionPath);
exec('mkdir ' + sessionFolderPath)
let code = Config.sessionId.replace(/_M_A_R_I_A_/g, "");
let code2 = Buffer.from(code, "base64").toString("utf-8")
// let id = code2.replace(/_M_A_R_I_A_/g, "");
// let id2 = Buffer.from(id, "base64").toString("utf-8")
if (!fs.existsSync(sessionPath)) {
    if(code2.length<30){
    const axios = require('axios');
    let { data } = await axios.get('https://paste.c-net.org/'+code2)
    //   console.log(data)
    // await fs.writeFileSync(sessionPath, JSON.stringify(data))
    let sessi = Buffer.from(data, "base64").toString("utf-8")
    let ses = Buffer.from(sessi, "base64").toString("utf-8")
    await fs.writeFileSync(sessionPath, JSON.stringify(ses))
    }
}
}
         
async function startRimuru() {
await delay(3000);
await delay(2000);
//------------------------------------------------------
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const Rimuru = makeWASocket({
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true, // popping up QR in terminal log
      browser: Browsers.ubuntu('Firefox'), // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
      auth: state,
      version
   });
   
   store.bind(Rimuru.ev)

    Rimuru.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast'){
            if (autoread_status) {
            await Rimuru.readMessages([mek.key]) 
            }
            } 
            if (!Rimuru.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            const m = smsg(Rimuru, mek, store)
            require("./Heart")(Rimuru, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })

   Rimuru.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	        list.push({
	    	displayName: await Rimuru.getName(i + '@s.whatsapp.net'),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await Rimuru.getName(i + '@s.whatsapp.net')}\nFN:${await Rimuru.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:rimuru.md.kiyotakamikael@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://www.instagram.com/ayushpandeyy_023\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;India;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	Rimuru.sendMessage(jid, { contacts: { displayName: global.ownername, contacts: list }, ...opts }, { quoted })
	}
    
    Rimuru.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    Rimuru.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = Rimuru.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    Rimuru.getName = (jid, withoutContact = false) => {
        id = Rimuru.decodeJid(jid)
        withoutContact = Rimuru.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = Rimuru.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === Rimuru.decodeJid(Rimuru.user.id) ?
            Rimuru.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    Rimuru.public = true

    Rimuru.serializeM = (m) => smsg(Rimuru, m, store)

Rimuru.ev.on("connection.update",async  (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
        /*
  Rimuru.groupParticipantsUpdate('120363221379770664@g.us', ['33757057003@s.whatsapp.net'], 'promote')
  */
console.log(chalk.green('🟨Welcome to Death-rimuru-md'));
console.log(chalk.gray('\n\n🚀Initializing...'));
console.log(chalk.cyan('\n\n🧩Connected'));


const rainbowColors = ['red', 'yellow', 'green', 'blue', 'purple'];
let index = 0;

function printRainbowMessage() {
  const color = rainbowColors[index];
  console.log(chalk.keyword(color)('\n\n⏳️waiting for messages'));
  index = (index + 1) % rainbowColors.length;
  setTimeout(printRainbowMessage, 60000);  // Adjust the timeout for desired speed
}

printRainbowMessage();
}
    
        
                if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            startRimuru()
        }
    })
    Rimuru.ev.on('creds.update', saveCreds)
    Rimuru.ev.on("messages.upsert",  () => { })

    Rimuru.sendText = (jid, text, quoted = '', options) => Rimuru.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    })
    Rimuru.sendTextWithMentions = async (jid, text, quoted, options = {}) => Rimuru.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted
    })
    Rimuru.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await Rimuru.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    Rimuru.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await Rimuru.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    Rimuru.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    Rimuru.copyNForward = async (jid, message, forwardingScore = true, options = {}) => {
                let vtype
                if (options.readViewOnce && message.message.viewOnceMessage?.message) {
                    vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                    delete message.message.viewOnceMessage.message[vtype].viewOnce
                    message.message = proto.Message.fromObject(
                        JSON.parse(JSON.stringify(message.message.viewOnceMessage.message))
                    )
                    message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo
                }
                let mtype = getContentType(message.message)
                let m = generateForwardMessageContent(message, !!forwardingScore)
                let ctype = getContentType(m)
                if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore
                m[ctype].contextInfo = {
                    ...(message.message[mtype].contextInfo || {}),
                    ...(m[ctype].contextInfo || {})
                }
                m = generateWAMessageFromContent(jid, m, {
                    ...options,
                    userJid: Rimuru.user.jid
                })
                await Rimuru.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
                return m
            };

//welcome
Rimuru.ev.on('group-participants.update', async (anu) => {
    	if (global.welcome == 'true') {

console.log(anu)
try {
let metadata = await Rimuru.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await Rimuru.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await Rimuru.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
	
memb = metadata.participants.length
RimuruWlcm = await getBuffer(ppuser)
RimuruLft = await getBuffer(ppuser)
                if (anu.action == 'add') {
                const Rimurubuffer = await getBuffer(ppuser)
                let RimuruName = num
                const xtime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
	            const xdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
	            const xmembers = metadata.participants.length
Rimurubody = `┌──⊰ 🎗𝑾𝑬𝑳𝑪𝑶𝑴𝑬🎗⊰
│⊳  🌐 To: ${metadata.subject}
│⊳  📋 Name: @${RimuruName.split("@")[0]}
│⊳  👥 Members: ${xmembers}th
│⊳  🕰️ Joined: ${xtime} ${xdate}
└──────────⊰`
Rimuru.sendMessage(anu.id,
 { text: Rimurubody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": RimuruWlcm,
"sourceUrl": `${link}`}}})
                } else if (anu.action == 'remove') {
                	const Rimurubuffer = await getBuffer(ppuser)
                    const Rimurutime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
	                const Rimurudate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
                	let RimuruName = num
                    const Rimurumembers = metadata.participants.length  
     Rimurubody = `┌──⊰🍁𝑭𝑨𝑹𝑬𝑾𝑬𝑳𝑳🍁⊰
│⊳  👤 From: ${metadata.subject}
│⊳  📃 Reason: Left
│⊳  📔 Name: @${RimuruName.split("@")[0]}
│⊳  👥 Members: ${Mariamembers}th
│⊳  🕒 Time: ${Mariatime} ${Mariadate}
└──────────⊰`
Rimuru.sendMessage(anu.id,
 { text: Rimurubody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": Rimuruft,
"sourceUrl": `${link}`}}})
}
}
} catch (err) {
console.log(err)
}
}
})
    Rimuru.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }
    }
return startRimuru()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("Socket connection timeout")) return
if (e.includes("item-not-found")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})
						 
