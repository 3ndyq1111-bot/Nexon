import axios from "axios";
import { FormData } from "formdata-node";

async function editImage(prompt, base64Image) {
    const CLIPDROP_API_KEY = '453b051a0a1d345439e05a0caff4ee53ff407a5039edf18d36656c9e4931fe8b397a5656111c165a94a749d43e6c6ba0';
    try {
        let attempts = 0;
        while (attempts < 3) {
            try {
                const form = new FormData();
                form.append('prompt', prompt);
                form.append('image_file', Buffer.from(base64Image, 'base64'), { filename: 'image.jpg' });

                const response = await axios.post(
                    "https://clipdrop-api.co/reimagine/v1",
                    form,
                    {
                        headers: {
                            'x-api-key': CLIPDROP_API_KEY
                        },
                        responseType: 'arraybuffer'
                    }
                );
                return Buffer.from(response.data).toString('base64');
            } catch (error) {
                attempts++;
                if (attempts === 3) throw error;
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    } catch (error) {
        console.error('Detailed API Error:', error.response ? error.response.data : error.message);
        throw new Error('Errore nella modifica dell\'immagine');
    }
}
let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    if (!text || !m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image/')) {
        return m.reply(`╭─『 ✏️ *Editor Immagini AI* 』
├ Usa: Rispondi a un'immagine con ${usedPrefix + command} <istruzione>
├ Esempio: ${usedPrefix + command} trasformalo in cartoon
│
├ *Limiti:*
├ • Free: 5 modifiche
├ • Premium: ∞ modifiche
╰───────────◈`);
    }
    if (!global.db.data.users[m.sender].editaiUses) {
        global.db.data.users[m.sender].editaiUses = 0;
    }
    const isPremium = global.db.data.users[m.sender].premium;
    if (!isOwner && !isPremium && global.db.data.users[m.sender].editaiUses >= 5) {
        return m.reply(`╭─『 ❌ *Limite Raggiunto* 』
├ Hai utilizzato tutti i tentativi gratuiti!
├ 
├ *✨ Passa a Premium per avere:*
├ • Modifiche illimitate
├ • Risultati prioritari
├ • Qualità migliore
╰───────────◈`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const startTime = Date.now();

        const imageBuffer = await m.quoted.download();
        const base64Image = imageBuffer.toString('base64');

        const editedBase64 = await Promise.race([
            editImage(text, base64Image),
            new Promise((_, reject) => setTimeout(() => reject(new Error('⌛ Timeout: la modifica ha impiegato troppo tempo')), 45000))
        ]);

        const endTime = Date.now();
        const timeElapsed = ((endTime - startTime) / 1000).toFixed(1);

        if (!isOwner && !isPremium) {
            global.db.data.users[m.sender].editaiUses++;
        }

        const usesLeft = isPremium ? '∞' : (5 - global.db.data.users[m.sender].editaiUses);

        await conn.sendMessage(
            m.chat,
            {
                image: Buffer.from(editedBase64, 'base64'),
                caption: `╭─『 ✏️ *Immagine Modificata* 』
├ ✨ *Prompt:* ${text}
├ ⏱️ *Tempo:* ${timeElapsed}s
├ 💫 *Modifiche:* ${usesLeft} rimaste
├ 👑 *Status:* ${isPremium ? 'Premium' : 'Free'}
╰───────────◈

◈ ━━ *vare ✧ bot* ━━ ◈`,
                fileName: 'edited_image.png'
            },
            { quoted: m }
        );

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('Errore:', error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`╭─『 ❌ *Errore Modifica* 』
├ • ${error.message}
├ • Riprova tra qualche minuto
├ • Usa un prompt diverso
╰──────────────────◈`);
    }
};
handler.help = ['editai (istruzione su immagine quotata)'];
handler.tags = ['strumenti', 'premium', 'ia', 'iaedit'];
handler.command = ['editai', 'modificaimg'];
handler.register = true;

export default handler;
