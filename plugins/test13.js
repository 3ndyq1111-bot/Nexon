import fs from "fs";
import crypto from "crypto";

let handler = async (m, { conn, command }) => {
  try {
    // 1. Carichiamo lo sticker per usarlo come thumbnail
    const stickerPath = "media/sticker/script.webp";
    const stickerBuffer = fs.readFileSync(stickerPath);
    
    if (command === "testquote") {
      // 2. Creiamo fake sticker message per il quote normale
      const fileSha256 = crypto.createHash('sha256').update(stickerBuffer).digest();
      const mediaKey = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const fakeStickerMsg = {
        key: {
          remoteJid: m.chat,
          fromMe: false,
          participant: "12014166644@c.us",
          id: "3EB0" + crypto.randomBytes(8).toString('hex').toUpperCase()
        },
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/" + crypto.randomBytes(20).toString('hex'),
            fileSha256: fileSha256,
            fileEncLength: stickerBuffer.length + Math.floor(Math.random() * 100),
            mediaKey: mediaKey,
            mimetype: "image/webp",
            height: 512,
            width: 512,
            directPath: "/v/t62.15575-24/" + crypto.randomBytes(15).toString('hex'),
            fileLength: stickerBuffer.length,
            mediaKeyTimestamp: timestamp,
            isAnimated: false,
            stickerSentTs: timestamp, 
            isAvatar: false
          }
        },
        messageTimestamp: timestamp,
        pushName: "vare",
        broadcast: false,
        participant: "12014166644@c.us"
      };
      
      await conn.sendMessage(
        m.chat,
        { text: "L" },
        { quoted: fakeStickerMsg }
      );
      
    } else if (command === "testpos") {
      let thumbnailBuffer;
      try {
        const response = await fetch('https://telegra.ph/file/ba01cc1e5bd64ca9d65ef.jpg');
        thumbnailBuffer = await response.arrayBuffer();
      } catch {
        thumbnailBuffer = stickerBuffer;
      }
      let quoted = {
        key: {
          participants: '12014166644@c.us',
          fromMe: false,
          id: 'FAKE-LOCATION-' + Date.now()
        },
        message: {
          locationMessage: {
            name: '📍 sggggg',
            jpegThumbnail: thumbnailBuffer,
            degreesLatitude: 45.4642,
            degreesLongitude: 9.1900,
            address: "Milano, Lombardia, Italia",
            vcard: 'BEGIN:VCARD\x0aVERSION:3.0\x0aN:;WhatsApp Bot;;;\x0aFN:WhatsApp Bot\x0aORG:WhatsApp\x0aTITLE:\x0aitem1.TEL;waid=0:+0\x0aitem1.X-ABLabel:WhatsApp\x0aX-WA-BIZ-DESCRIPTION:Bot Ufficiale\x0aX-WA-BIZ-NAME:WhatsApp\x0aEND:VCARD'
          }
        },
        participant: '12014166644@c.us'
      };
      
      await conn.sendMessage(
        m.chat,
        { text: "b9" },
        { quoted: quoted }
      );
    }
    
  } catch (error) {
    console.error(`Errore nel ${command}:`, error);
    await conn.sendMessage(m.chat, { text: `❌ Errore nel comando ${command}` });
  }
};

handler.command = ["testquote", "testpos"];
export default handler;