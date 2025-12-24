import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `🎨 *Flux AI Generator*\n\n📝 *Per usare:* ${usedPrefix}${command} <descrizione>\n💡 *Esempio:* ${usedPrefix}${command} torta foresta nera con scritto "FLUX SCHNELL", fotografia alimentare, dinamica, dettagliata`, m);

    await m.react('🪄');

    try {
        
        const imageBuffer = await generateImageWithReplicate(text);

        if (imageBuffer) {
            await conn.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `『 📝 』 \`Prompt:\` *${text}*`,
                mentions: [m.sender]
            }, { quoted: m });
        }
    } catch (error) {
        await m.react('❌');
        conn.reply(m.chat, `${global.errore}`, m);
    }
};

handler.help = ['flux'];
handler.tags = ['strumenti', 'premium', 'ia', 'iaimmagini'];
handler.command = /^flux$/i;
handler.register = true

export default handler;

async function generateImageWithReplicate(query) {
    const apiKey = global.APIKeys.replicate;
    if (!apiKey) throw new Error("Chiave API di Replicate non configurata.");

    const modelVersion = "black-forest-labs/flux-schnell";

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api.replicate.com/v1/predictions',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                version: modelVersion,
                input: {
                    prompt: `ultra detailed, hyper realistic, cinematic lighting, high-resolution, masterpiece: ${query}`,
                    num_outputs: 1,
                    width: 1024,
                    height: 1024,
                    num_inference_steps: 4,
                    guidance_scale: 3.5,
                    seed: Math.floor(Math.random() * 1000000)
                }
            }),
            timeout: 30000
        });

        let prediction = response.data;
        const predictionId = prediction.id;

        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const pollResponse = await axios.get(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: { 'Authorization': `Token ${apiKey}` },
                    timeout: 30000
                }
            );
            prediction = pollResponse.data;

            if (prediction.status === 'succeeded' && prediction.output) {
                const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
                const imageResponse = await axios.get(imageUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 30000 
                });
                return Buffer.from(imageResponse.data, 'binary');
            }
            if (prediction.status === 'failed') {
                throw new Error('Generazione immagine fallita su Replicate');
            }
        }
        throw new Error("Timeout: generazione immagine troppo lenta.");
    } catch (error) {
        throw new Error(`Errore con Replicate API: ${error.response?.data?.detail || error.message}`);
    }
}