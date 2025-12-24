import axios from "axios";

async function generateVideo(prompt) {
    const REPLICATE_API_KEY = 'r8_bDHp3Q8CQOf7rzHsi9KFpBKcaouT1XJ1bq0bX'; // Your Replicate API key
    try {
        let attempts = 0;
        while (attempts < 3) {
            try {
                const enhancedPrompt = `${prompt}, high quality, 8 seconds, smooth motion, cinematic`;
                const response = await axios.post(
                    "https://api.replicate.com/v1/predictions",
                    {
                        version: "google/veo-3-fast-version-id", // Check replicate.com for exact version ID
                        input: { prompt: enhancedPrompt, duration: 8 }
                    },
                    { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } }
                );
                let prediction = response.data;
                while (prediction.status !== "succeeded" && prediction.status !== "failed") {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const statusRes = await axios.get(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                        headers: { Authorization: `Token ${REPLICATE_API_KEY}` }
                    });
                    prediction = statusRes.data;
                }
                if (prediction.status === "failed") throw new Error("Generation failed");
                const videoRes = await axios.get(prediction.output[0], { responseType: 'arraybuffer' });
                return Buffer.from(videoRes.data);
            } catch (error) {
                attempts++;
                if (attempts === 3) throw error;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        throw new Error('Errore nella generazione del video');
    }
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    if (!text) {
        return m.reply(`╭─『 🎥 *Generatore Video AI* 』
├ Usa: ${usedPrefix + command} <descrizione>
├ Esempio: ${usedPrefix + command} gatto che balla
│
├ *Limiti:*
├ • Free: 5 generazioni
├ • Premium: ∞ generazioni
╰───────────◈`);
    }
    if (!global.db.data.users[m.sender].videoaiUses) {
        global.db.data.users[m.sender].videoaiUses = 0;
    }
    const isPremium = global.db.data.users[m.sender].premium;
    if (!isOwner && !isPremium && global.db.data.users[m.sender].videoaiUses >= 5) {
        return m.reply(`╭─『 ❌ *Limite Raggiunto* 』
├ Hai utilizzato tutti i tentativi gratuiti!
├ 
├ *✨ Passa a Premium per avere:*
├ • Generazioni illimitate
├ • Risultati prioritari
├ • Qualità migliore
╰───────────◈`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const startTime = Date.now();

        const videoBuffer = await Promise.race([
            generateVideo(text),
            new Promise((_, reject) => setTimeout(() => reject(new Error('⌛ Timeout: la generazione ha impiegato troppo tempo')), 60000))
        ]);

        const endTime = Date.now();
        const timeElapsed = ((endTime - startTime) / 1000).toFixed(1);

        if (!isOwner && !isPremium) {
            global.db.data.users[m.sender].videoaiUses++;
        }

        const usesLeft = isPremium ? '∞' : (5 - global.db.data.users[m.sender].videoaiUses);

        await conn.sendMessage(
            m.chat,
            {
                video: videoBuffer,
                caption: `╭─『 🎥 *Video Generato* 』
├ ✨ *Prompt:* ${text}
├ ⏱️ *Tempo:* ${timeElapsed}s
├ 💫 *Generazioni:* ${usesLeft} rimaste
├ 👑 *Status:* ${isPremium ? 'Premium' : 'Free'}
╰───────────◈

◈ ━━ *vare ✧ bot* ━━ ◈`,
                gifPlayback: false,
                mimetype: 'video/mp4',
                fileName: 'generated_video.mp4'
            },
            { quoted: m }
        );

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('Errore:', error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`╭─『 ❌ *Errore Generazione* 』
├ • ${error.message}
├ • Riprova tra qualche minuto
├ • Usa un prompt diverso
╰──────────────────◈`);
    }
};
handler.help = ['videoai (testo)'];
handler.tags = ['strumenti', 'premium', 'ia', 'iavideo'];
handler.command = ['videoai', 'generavideo'];
handler.register = true;

export default handler;