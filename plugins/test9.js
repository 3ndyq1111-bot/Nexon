let handler = async (m, { conn, text }) => {
  try {
    const args = text ? text.split('|') : [];
    const note = args[0]?.trim() || 'pokahontas';
    let amount = args[1]?.trim() || '25000';
    const ildenaro = args[2]?.trim().toUpperCase() || 'EUR';
    let fromJid = args[3]?.trim() || m.sender;
    if (!/^\d+$/.test(amount)) amount = '25000';
    if (!fromJid.includes('@')) fromJid = fromJid + '@s.whatsapp.net';

    const paymentMessage = {
      payment: {
        note,
        ildenaro,
        offset: 0,
        amount,
        expiry: 0,
        from: fromJid,
        image: {
          placeholderArgb: "0xFF6A1B9A",
          textArgb: "0xFFFFFFFF",
          subtextArgb: "0xFFCE93D8"
        }
      }
    };

    await conn.sendMessage(m.chat, paymentMessage, { quoted: m });
  } catch (error) {
    console.error('Errore nel comando payment:', error);
    await conn.reply(m.chat, `${global.errore}`, m);
  }
};

handler.help = ['payment [nota|importo|valuta|mittente]'];
handler.tags = ['owner'];
handler.command = /^paymen2t$/i;
handler.owner = true;
export default handler;