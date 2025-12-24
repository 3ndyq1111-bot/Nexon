import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `🎨 *Hyper-Flux 8-Step AI Generator*\n\n📝 *Per usare:* ${usedPrefix}${command} <descrizione>\n💡 *Esempio:* ${usedPrefix}${command} un cane sorridente con una maglietta bianca con la scritta "HYPER"`, m);

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
        console.error(error); // Log dell'errore per il debug
        conn.reply(m.chat, `⚠️ Si è verificato un errore durante la generazione dell'immagine. Dettagli: ${error.message}`, m);
    }
};

handler.help = ['hyperflux'];
handler.tags = ['strumenti', 'ia', 'iaimmagini'];
handler.command = /^(hyperflux|flux8)$/i; // Accetta sia hyperflux che flux8
handler.register = true;

export default handler;

async function generateImageWithReplicate(query) {
    const apiKey = global.APIKeys.replicate;
    if (!apiKey) throw new Error("Chiave API di Replicate non configurata.");

    // --- MODIFICA 1: Usa il modello e la versione corretta ---
    const modelVersion = "bytedance/hyper-flux-8step:81946b1e09b256c543b35f37333a30d0d02ee2cd8c4f77cd915873a1ca622bad";

    try {
        const startResponse = await axios({
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
                    aspect_ratio: "1:1",
                    output_format: "webp",
                    guidance_scale: 3.5,
                    output_quality: 90,
                    num_inference_steps: 8
                }
            }),
            timeout: 30000
        });

        let prediction = startResponse.data;
        const endpointUrl = prediction.urls.get;

        // Ciclo di polling per attendere il risultato
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const pollResponse = await axios.get(endpointUrl, {
                headers: { 'Authorization': `Token ${apiKey}` },
                timeout: 30000
            });
            prediction = pollResponse.data;
        }

        if (prediction.status === 'succeeded' && prediction.output) {
            const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
            const imageResponse = await axios.get(imageUrl, { 
                responseType: 'arraybuffer',
                timeout: 60000
            });
            return Buffer.from(imageResponse.data, 'binary');
        } else {
            throw new Error(`Generazione immagine fallita. Stato: ${prediction.status}. Errore: ${prediction.error}`);
        }

    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message;
        throw new Error(`Errore con Replicate API: ${errorMessage}`);
    }
}