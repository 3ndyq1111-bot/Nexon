import fetch from "node-fetch";

let handler = async (m, { conn }) => {
  try {
    const coverUrl = "https://i.ibb.co/4nxpDtTS/shhh2.webp";
    const sticker1Url = "https://i.ibb.co/4nxpDtTS/shhh2.webp";

    // Scarica entrambi i buffer per consistenza
    console.log("Scaricando cover...");
    const coverBuffer = await (await fetch(coverUrl)).arrayBuffer();
    console.log("Cover scaricata:", coverBuffer.length, "bytes");

    console.log("Scaricando sticker 1...");
    const sticker1Buffer = await (await fetch(sticker1Url)).arrayBuffer();
    console.log("Sticker 1 scaricato:", sticker1Buffer.length, "bytes");

    await conn.sendMessage(m.chat, {
      stickerPack: {
        name: 'sam domina la fessa', 
        publisher: 'sto talento mi ha reso scontato', 
        description: '㌌ varebot', 
        cover: coverBuffer, // Buffer per la cover
        stickers: [
          {
            sticker: sticker1Buffer, // Buffer per lo sticker
            emojis: ['❤'],
            accessibilityLabel: 'Heart sticker',
            isLottie: false,
            isAnimated: false
          }
        ]
      }
    });
  } catch (error) {
    console.error("Errore nell'invio dello sticker pack:", error);
    console.error("Stack completo:", error.stack);
    m.reply("❌ Errore nell'invio dello sticker pack: " + error.message);
  }
};

handler.command = ["sp"];
export default handler;