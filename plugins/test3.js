import path from 'path'

const handler = async (m, { conn }) => {
  const jid = m.chat
  const videoPath = path.join(process.cwd(), 'media/menu/menu3.mp4')

  await conn.sendMessage(jid, {
    video: { url: videoPath },
    ptv: true
  }, { quoted: m })
}

handler.command = ['ptv']
handler.owner = true
export default handler