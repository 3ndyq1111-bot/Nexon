let handler = async (m, { conn }) => {
  let jid = m.chat
await conn.sendMessage(jid, { text: 'soldi crescono dagli alberi, gli alberi nel mio giardino' }, { AI: true });
}
handler.command = /^test11$/i
export default handler