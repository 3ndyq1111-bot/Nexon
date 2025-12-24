import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const userName = m.pushName || 'Utente';

  let userProfilePicBuffer;
  try {
    const profilePicUrl = await conn.profilePictureUrl(m.sender, 'image');
    userProfilePicBuffer = await (await fetch(profilePicUrl)).arrayBuffer();
  } catch (e) {
    try {
      userProfilePicBuffer = await (await fetch(global.foto)).arrayBuffer();
    } catch (e2) {
      userProfilePicBuffer = Buffer.from([]);
    }
  }
  
  let dynamicContextInfo;
  if (global.fake && global.fake.contextInfo) {
    dynamicContextInfo = global.fake.contextInfo;
  } else {
    dynamicContextInfo = {
      externalAdReply: {
        title: "varebot",
        body: "Sistema di gestione funzioni",
        mediaType: 1,
        jpegThumbnail: userProfilePicBuffer.length > 0 ? userProfilePicBuffer : null
      }
    };
  }

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};
  if (!args.length) {
    const getStatus = (value) => value ? '✅' : '❌';
    
    let varebot = `
ㅤ⋆｡˚『 ╭ \`FUNZIONI ADMIN\` ╯ 』˚｡⋆
╭
│ 『 ${getStatus(chat.welcome)} 』 ➤  *\`welcome\`*
│ 『 ${getStatus(chat.goodbye)} 』 ➤  *\`addio\`*
│ 『 ${getStatus(chat.antispam)} 』 ➤  *\`antispam\`*
│ 『 ${getStatus(chat.antitoxic)} 』 ➤  *\`antitossici\`*
│ 『 ${getStatus(chat.antiBot)} 』 ➤  *\`antibot\`*
│ 『 ${getStatus(chat.antioneview)} 』 ➤  *\`antioneview\`*
│ 『 ${getStatus(chat.rileva)} 』 ➤  *\`rileva\`*
│ 『 ${getStatus(chat.porn)} 』 ➤  *\`antiporno\`*
│ 『 ${getStatus(chat.modoadmin)} 』 ➤  *\`soloadmin\`*
│ 『 ${getStatus(chat.autoresponder)} 』 ➤  *\`ia\`*
│ 『 ${getStatus(chat.antivoip)} 』 ➤  *\`antivoip\`*
│ 『 ${getStatus(chat.antiLink)} 』 ➤  *\`antilink\`*
│ 『 ${getStatus(chat.antiLink2)} 』 ➤  *\`antilinksocial\`*
│ 『 ${getStatus(chat.antiLinkUni)} 』 ➤  *\`antilinkuni\`*
│ 『 ${getStatus(chat.reaction)} 』 ➤  *\`reazioni\`*
│ 『 ${getStatus(chat.autolevelup)} 』 ➤  *\`autolivello\`*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n`;

    let ownerMessage = `
ㅤ⋆｡˚『 ╭ \`FUNZIONI CREATORE\` ╯ 』˚｡⋆
╭
│ 『 ${getStatus(bot.antiprivato)} 』 ➤  *\`antiprivato\`*
│ 『 ${getStatus(bot.soloCreatore)} 』 ➤  *\`solocreatore\`*
│ 『 ${getStatus(bot.jadibotmd)} 』 ➤  *\`subbots\`*
│ 『 ${getStatus(bot.restrict)} 』 ➤  *\`restrizioni\`*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    let finalMessage = varebot;
    if (isOwner || isROwner) {
      finalMessage += ownerMessage;
    }

    finalMessage += `
\n    『 📋 』 _*Esempio:*_
- \`${usedPrefix}attiva antilink ia welcome\`
- \`${usedPrefix}disattiva antilink\``;

    const fkontak_menu = {
      key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BotAssistant' },
      message: { 
        contactMessage: { 
          displayName: userName, 
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nitem1.X-ABLabel:📱 Cellulare\nitem1.TEL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nitem2.EMAIL;type=INTERNET:bot@whatsapp.com\nitem2.X-ABLabel:💌 Email\nEND:VCARD`,
          jpegThumbnail: userProfilePicBuffer
        }
      },
      participant: m.sender
    };
    
    return conn.sendMessage(m.chat, { text: finalMessage, contextInfo: dynamicContextInfo }, { quoted: fkontak_menu });
  }
  let results = [];
  for (let type of args.map(arg => arg.toLowerCase())) {
    let result = { type, status: '', success: false };

    switch (type) {
      case 'welcome':
      case 'benvenuto':
        if (!m.isGroup && !isOwner) {
          result.status = '『 ❌ 』 Comando valido solo nei gruppi';
          break;
        }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.welcome === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.welcome = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'goodbye':
      case 'addio':
        if (!m.isGroup && !isOwner) {
          result.status = '『 ❌ 』 Comando valido solo nei gruppi';
          break;
        }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.goodbye === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.goodbye = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antiprivato':
      case 'antipriv':
        if (!isOwner && !isROwner) {
          result.status = '『 ❌ 』 Richiede privilegi di proprietario';
          break;
        }
        if (bot.antiprivato === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        bot.antiprivato = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'restrict':
      case 'restrizioni':
        if (!isOwner && !isROwner) {
          result.status = '『 ❌ 』 Richiede privilegi di proprietario';
          break;
        }
        if (bot.restrict === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        bot.restrict = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antibot':
      case 'antibots':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antiBot === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antiBot = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antisubbots':
      case 'antisub':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antiBot2 === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antiBot2 = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antitoxic':
      case 'antitossici':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antitoxic === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antitoxic = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antivoip':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antivoip === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antivoip = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'modoadmin':
      case 'soloadmin':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.modoadmin === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.modoadmin = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'solocreatore':
      case 'solowner':
      case 'soloowner':
        if (!isROwner) {
          result.status = '『 ❌ 』 Richiede privilegi di proprietario';
          break;
        }
        if (bot.soloCreatore === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        bot.soloCreatore = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antioneview':
      case 'antiviewonce':
        if (!m.isGroup && !isOwner) {
          result.status = '『 ❌ 』 Comando valido solo nei gruppi';
          break;
        }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antioneview === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antioneview = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'reaction':
      case 'reazioni':
        if (!m.isGroup && !isOwner) {
          result.status = '『 ❌ 』 Comando valido solo nei gruppi';
          break;
        }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.reaction === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.reaction = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antilinkuni':
      case 'antilinkuniversale':
      case 'antilinktutto':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antiLinkUni === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antiLinkUni = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antilink2':
      case 'antilinkhard':
      case 'antilinksocial':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antiLink2 === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antiLink2 = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'autolevelup':
      case 'autolivello':
      case 'autolvl':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.autolevelup === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.autolevelup = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antispam':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antispam === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antispam = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

     case 'antiporn':
      case 'antiporno':
      case 'antiNSFW':  
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antiporno === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break; 
        }
        chat.antiporno = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'ia':
      case 'ai':  
        if (!m.isGroup && !isOwner) {
          result.status = '『 ❌ 』 Comando valido solo nei gruppi';
          break;
        }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.autoresponder === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.autoresponder = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'subbots':
        if (!isOwner && !isROwner) {
          result.status = '『 ❌ 』 Richiede privilegi di proprietario';
          break;
        }
        if (bot.jadibotmd === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        bot.jadibotmd = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'detect':
      case 'rileva':  
        if (!m.isGroup && !isOwner) {
          result.status = '『 ❌ 』 Comando valido solo nei gruppi';
          break;
        }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.rileva === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.rileva = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;

      case 'antilink':
      case 'nolink':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
          result.status = '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
          break;
        }
        if (chat.antiLink === isEnable) {
          result.status = `『 ⚠️ 』 Già ${isEnable ? 'attivo' : 'disattivato'}`;
          break;
        }
        chat.antiLink = isEnable;
        result.status = `『 ✅ 』 ${isEnable ? 'Attivato' : 'Disattivato'}`;
        result.success = true;
        break;
      default:
        result.status = '『 ❌ 』 Comando non riconosciuto';
        break;
    }
    results.push(result);
  }
  let summaryMessage = `『 🉐 』 \`Riepilogo modifiche:\`\n\n`;
  results.forEach(result => {
    summaryMessage += `- *\`${result.type}\`*${result.status}`;
  });

  const fkontak_confirm = {
    key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BotFunction' },
    message: { 
      contactMessage: { 
        displayName: userName, 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nitem1.X-ABLabel:📱 Cellulare\nitem1.TEL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nitem2.EMAIL;type=INTERNET:bot@whatsapp.com\nitem2.X-ABLabel:💌 Email\nEND:VCARD`,
        jpegThumbnail: userProfilePicBuffer
      }
    },
    participant: m.sender
  };

  await conn.sendMessage(m.chat, { text: summaryMessage, contextInfo: dynamicContextInfo }, { quoted: fkontak_confirm });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];
export default handler;
