import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender;
    
    let msg = `⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*\`Esempio:\`* *${usedPrefix + command} @user*`;
    if (!who) return m.reply(msg);

    try {
        let pp;
        let hasProfilePicture = true;
        
        try {
            pp = await conn.profilePictureUrl(who, 'image');
            if (!pp) throw 'Nessuna foto profilo trovata';
        } catch {
            hasProfilePicture = false;
        }

        if (!hasProfilePicture) {
            let notification = who === m.sender ? 
                'non hai una foto profilo 🤕' : 
                `@${who.split('@')[0]} non ha una foto profilo 🤕`;
            
            return m.reply(notification, null, { mentions: [who] });
        }

        let name = await conn.getName(who) || 'User';
        let effect = command.toLowerCase();
        let path;
        let isGif = false;
        let apiUrl = `https://some-random-api.com/canvas/`;
        let extraParams = '';

        const requiredTextEffects = ['lied', 'namecard', 'youtube-comment', 'dog'];
        if (requiredTextEffects.includes(effect) && !text.trim()) {
            let requiredMsg;
            switch (effect) {
                case 'lied': requiredMsg = 'Un nome'; break;
                case 'namecard': requiredMsg = 'Compleanno (es: 01/01/2000)'; break;
                case 'youtube-comment': requiredMsg = 'Testo commento'; break;
                case 'dog': requiredMsg = ''; break;
            }
            return m.reply(`🤕 Serve un testo per l'effetto ${effect}: ${requiredMsg}\nesempio: ${usedPrefix + command} [testo] @user`);
        }

        switch (effect) {
            case 'triggered': path = 'overlay/triggered'; isGif = true; break;
            case 'jail': path = 'overlay/jail'; break;
            case 'comunista': path = 'overlay/comrade'; break;
            case 'passed': path = 'overlay/passed'; break;
            case 'wasted': path = 'overlay/wasted'; break;
            case 'gay': path = 'overlay/gay'; break;
            case 'glass': path = 'overlay/glass'; break;
            case 'pixelate': path = 'filter/pixelate'; break;
            case 'greyscale': path = 'filter/greyscale'; break;
            case 'invert': path = 'filter/invert'; break;
            case 'sepia': path = 'filter/sepia'; break;
            case 'red': path = 'filter/red'; break;
            case 'green': path = 'filter/green'; break;
            case 'blue': path = 'filter/blue'; break;
            case 'simpcard': path = 'misc/simpcard'; break;
            case 'horny': path = 'misc/horny'; break;
            case 'lolice': path = 'misc/lolice'; break;
            case 'blur': path = 'filter/blur'; break;
            case 'blurple': path = 'filter/blurple'; break;
            case 'bisex': path = 'misc/bisexual'; break;
            case 'heart':
            case 'love': path = 'misc/heart'; break;
            case 'lesbian': path = 'misc/lesbian'; break;
            case 'lgbt': path = 'misc/lgbt'; break;
            case 'nonbinary': path = 'misc/nonbinary'; break;
            case 'tonikawa': path = 'misc/tonikawa'; break;
            case 'dog': path = 'misc/its-so-stupid'; extraParams = `&dog=${encodeURIComponent(text.trim())}`; break;
            case 'lied': path = 'misc/lied'; extraParams = `&username=${encodeURIComponent(name)}`; break;
            case 'namecard': path = 'misc/namecard'; extraParams = `&username=${encodeURIComponent(name)}&birthday=${encodeURIComponent(text.trim() || '01/01/2000')}`; break;
            case 'youtube-comment': path = 'misc/youtube-comment'; extraParams = `&username=${encodeURIComponent(name)}&comment=${encodeURIComponent(text.trim())}`; break;
            case 'petpet': apiUrl = `https://api.popcat.xyz/pet`; path = ''; extraParams = `?image=${encodeURIComponent(pp)}`; isGif = true; break;
            case 'wanted': apiUrl = `https://api.popcat.xyz/wanted`; path = ''; extraParams = `?image=${encodeURIComponent(pp)}`; break;
            default: throw 'Effect not supported';
        }
        
        if (path) {
            apiUrl += `${path}?avatar=${encodeURIComponent(pp)}${extraParams}`;
        } else {
            apiUrl += `${extraParams}`;
        }

        let res = await fetch(apiUrl);
        
        if (!res.ok) {
            let error = await res.text();
            throw `Errore API: ${res.status} - ${error}`;
        }
        
        let buffer = await res.arrayBuffer();
        if (!buffer || buffer.length < 100) throw 'Immagine non valida';

        let buf = Buffer.from(buffer);

        if (isGif) {
            await conn.sendMessage(m.chat, { // da fixare (?)
                sticker: buf,
                mentions: [who] 
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { 
                image: buf, 
                caption: '', 
                mentions: [who] 
            }, { quoted: m });
        }

    } catch (e) {
        console.error('Errore effect:', e);
        m.reply(`${global.errore}`);
    }
};

handler.help = ['wanted', 'wasted', 'triggered', 'jail', 'comunista', 'gay', 'glass', 'passed', 'greyscale', 'invert', 'sepia', 'red', 'green', 'blue', 'pixelate', 'simpcard', 'horny', 'lolice', 'blur', 'blurple', 'bisex', 'love', 'heart', 'dog', 'lesbian', 'lgbt', 'lied', 'namecard', 'nonbinary', 'tonikawa', 'youtube-comment', 'petpet'];
handler.tags = ['giochi'];
handler.command = /^(wanted|wasted|triggered|jail|comunista|gay|glass|passed|greyscale|invert|sepia|red|green|blue|pixelate|simpcard|horny|lolice|blur|blurple|bisex|love|heart|dog|lesbian|lgbt|lied|namecard|nonbinary|tonikawa|youtube-comment|petpet)$/i;
handler.limit = true;

export default handler;