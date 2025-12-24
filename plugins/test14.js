import Jimp from 'jimp';
export async function handler(m, { conn, participants }) {
  try { const jid = m.chat
    const image = await Jimp.read('https://i.ibb.co/hJW7WwxV/varebot.jpg');
image.resize(320, 320);
await conn.sendMessage(
    jid,
    {
        document: {
          url: 'https://i.ibb.co/hJW7WwxV/varebot.jpg'
       },
       mimetype: 'image/jpeg',
       jpegThumbnail: await image.getBufferAsync(Jimp.MIME_JPEG),
       caption: 'nochampagne',
       title: '*⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*',
       footer: 'vare ✧ bot',
       interactiveButtons: [
           {
               name: 'quick_reply',
               buttonParamsJson: JSON.stringify({
                   display_text: '🎐',
                   id: '.ping'
               })
           }
       ],
       hasMediaAttachment: false
    }
)
  } catch (e) {
    console.error("❌ Errore test:", e)
    m.reply("Errore test: " + e.message)
  }
}
handler.command = ["filee"]
export default handler