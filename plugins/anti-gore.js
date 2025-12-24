import { downloadContentFromMessage } from '@realvare/based'
let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!m.message) return true

    let chat = global.db.data.chats[m.chat]
    if (!chat.antigore) return true

    if (isAdmin || isOwner) return true

    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = { warn: 0 })

    const isMedia = m.message.imageMessage ||
                    m.message.videoMessage ||
                    m.message.stickerMessage

    if (!isMedia) return true

    if (!isBotAdmin) {
        console.log("Bot non admin → antigore non può cancellare/kickare")
        return true
    }

    try {
        let mediaBuffer, mimeType, fileName
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
        const msg = quoted ? (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage) :
                            (m.message.imageMessage || m.message.videoMessage || m.message.stickerMessage)

        if (!msg) return true
        let type;
        if (msg.mimetype?.includes('video')) {
            type = 'video';
        } else if (msg.mimetype?.includes('sticker')) {
            type = 'sticker';
        } else if (msg.mimetype?.includes('image')) {
            type = 'image';
        } else {
            return true;
        }
        const stream = await downloadContentFromMessage(msg, type);
        mediaBuffer = Buffer.from([]);
        for await (const chunk of stream) {
            mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
        }

        if (type === 'video') {
            mimeType = 'video/mp4'
            fileName = 'media.mp4'
        } else {
            mimeType = msg.mimetype || 'image/jpeg'
            fileName = 'media.jpg'
        }
        const SIGHTENGINE_USER = global.APIKeys.sightengine_user
        const SIGHTENGINE_SECRET = global.APIKeys.sightengine_secret
        const apiUrl = type === 'video' ? `https://api.sightengine.com/1.0/video/check-sync.json` : `https://api.sightengine.com/1.0/check.json`
        const models = 'gore'
        const formData = new FormData()
        formData.append('media', new Blob([mediaBuffer], { type: mimeType }), fileName)
        formData.append('models', models)
        formData.append('api_user', SIGHTENGINE_USER)
        formData.append('api_secret', SIGHTENGINE_SECRET)

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        })

        const result = await response.json()
        console.log('Risposta SightEngine:', result)

        if (result.status !== 'success') {
            console.log('Errore API:', result)
            return true
        }
        let gore
        if (type === 'video') {
            const frames = result.data?.frames || []
            gore = Math.max(...frames.map(f => f.gore?.prob || 0))
        } else {
            const goreData = result.gore || 0
            if (typeof goreData === 'object') {
                gore = goreData.prob || 0
            } else {
                gore = goreData
            }
        }
        const isHighRisk = gore > 0.5

        if (isHighRisk) {
            user.warn += 1
            const senderTag = m.sender.split('@')[0]
            await conn.sendMessage(m.chat, { delete: m.key })
            if (user.warn < 3) {
                await conn.sendMessage(m.chat, {
                    text: `*@${senderTag}* 🚫 Contenuto gore rilevato!\n\nAvvertimento *${user.warn}/3*`,
                    mentions: [m.sender]
                })
            } else {
                user.warn = 0
                await conn.sendMessage(m.chat, {
                    text: `*@${senderTag}* rimosso dal gruppo per contenuti gore ripetuti 👋`,
                    mentions: [m.sender]
                })
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            }
            return false
        }

    } catch (e) {
        console.error('Errore antigore:', e)
    }

    return true
}

export default handler
