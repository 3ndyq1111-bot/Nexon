import { readFileSync, writeFileSync, existsSync } from 'fs';
import NodeCache from 'node-cache';

/**
 * @type {import('@realvare/based')}
 */
const { initAuthCreds, BufferJSON, proto } = (await import('@realvare/based')).default;

const contactCache = new NodeCache({ stdTTL: 600 }); // Cache per nomi contatti, 10 min
const groupCache = new NodeCache({ stdTTL: 300 }); // Cache per metadati gruppi, 5 min

/**
 * @param {import('@realvare/based').WASocket | import('@realvare/based').WALegacySocket}
 */
function bind(conn) {
  if (!conn.ev) {
    console.warn('conn.ev is not defined, skipping store bind');
    return;
  }
  if (!conn.chats) conn.chats = {};

  /**
   * @param {import('@realvare/based').Contact[]|{contacts:import('@realvare/based').Contact[]}} contacts
   * @returns
   */
  function updateNameToDb(contacts) {
    if (!contacts) return;
    try {
      contacts = contacts.contacts || contacts;
      for (const contact of contacts) {
        const id = conn.decodeJid(contact.id);
        if (!id || id === 'status@broadcast') continue;
        contactCache.set(id, contact); // Cache contatto
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = { ...contact, id };
        conn.chats[id] = {
          ...chats,
          ...({
            ...contact, id, ...(id.endsWith('@g.us') ?
              { subject: contact.subject || contact.name || chats.subject || '' } :
              { name: contact.notify || contact.name || chats.name || chats.notify || '' }),
          } || {}),
        };
      }
    } catch (e) {
      console.error('Error in updateNameToDb:', e.message); // Migliorato error handling
    }
  }
  conn.ev.on('contacts.upsert', updateNameToDb);
  conn.ev.on('groups.update', updateNameToDb);
  conn.ev.on('contacts.set', updateNameToDb);
  conn.ev.on('chats.set', async ({ chats }) => {
    try {
      for (let { id, name, readOnly } of chats) {
        id = conn.decodeJid(id);
        if (!id || id === 'status@broadcast') continue;
        const isGroup = id.endsWith('@g.us');
        let chatData = conn.chats[id];
        if (!chatData) chatData = conn.chats[id] = { id };
        chatData.isChats = !readOnly;
        if (name) chatData[isGroup ? 'subject' : 'name'] = name;
        if (isGroup) {
          let metadata = groupCache.get(id); // Usa cache
          if (!metadata) {
            metadata = await conn.groupMetadata(id).catch(() => null);
            if (metadata) groupCache.set(id, metadata);
          }
          if (name || metadata?.subject) chatData.subject = name || metadata.subject;
          if (!metadata) continue;
          chatData.metadata = metadata;
        }
      }
    } catch (e) {
      console.error('Error in chats.set:', e.message);
    }
  });
  conn.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) {
    if (!id) return;
    id = conn.decodeJid(id);
    if (id === 'status@broadcast') return;
    if (!(id in conn.chats)) conn.chats[id] = { id };
    const chats = conn.chats[id];
    chats.isChats = true;
    let groupMetadata = groupCache.get(id); // Usa cache
    if (!groupMetadata) {
      groupMetadata = await conn.groupMetadata(id).catch(() => null);
      if (groupMetadata) groupCache.set(id, groupMetadata);
    }
    if (!groupMetadata) return;
    chats.subject = groupMetadata.subject;
    chats.metadata = groupMetadata;
  });

  conn.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
    try {
      for (const update of groupsUpdates) {
        const id = conn.decodeJid(update.id);
        if (!id || id === 'status@broadcast') continue;
        const isGroup = id.endsWith('@g.us');
        if (!isGroup) continue;
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = { id };
        chats.isChats = true;
        let metadata = groupCache.get(id); // Usa cache
        if (!metadata) {
          metadata = await conn.groupMetadata(id).catch(() => null);
          if (metadata) groupCache.set(id, metadata);
        }
        if (metadata) chats.metadata = metadata;
        if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject;
      }
    } catch (e) {
      console.error('Error in groups.update:', e.message);
    }
  });
  conn.ev.on('chats.upsert', function chatsUpsertPushToDb(chatsUpsert) {
    try {
      const { id, name } = chatsUpsert;
      if (!id || id === 'status@broadcast') return;
      conn.chats[id] = { ...(conn.chats[id] || {}), ...chatsUpsert, isChats: true };
      const isGroup = id.endsWith('@g.us');
      if (isGroup) conn.insertAllGroup().catch(() => null);
    } catch (e) {
      console.error('Error in chats.upsert:', e.message);
    }
  });
  conn.ev.on('presence.update', async function presenceUpdatePushToDb({ id, presences }) {
    try {
      const sender = Object.keys(presences)[0] || id;
      const _sender = conn.decodeJid(sender);
      const presence = presences[sender]['lastKnownPresence'] || 'composing';
      let chats = conn.chats[_sender];
      if (!chats) chats = conn.chats[_sender] = { id: sender };
      chats.presences = presence;
      if (id.endsWith('@g.us')) {
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = { id };
      }
    } catch (e) {
      console.error('Error in presence.update:', e.message);
    }
  });
}

const KEY_MAP = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory',
};

/**
 *
 * @param {String} filename
 * @param {import('pino').Logger} logger
 * @returns
 */
function useSingleFileAuthState(filename, logger) {
  let creds; let keys = {}; let saveCount = 0;
  // save the authentication state to a file
  const saveState = (forceSave) => {
    logger?.trace('saving auth state');
    saveCount++;
    if (forceSave || saveCount > 5) {
      try {
        writeFileSync(
            filename,
            // BufferJSON replacer utility saves buffers nicely
            JSON.stringify({ creds, keys }, BufferJSON.replacer, 2),
        );
      } catch (e) {
        console.error('Error saving auth state:', e.message); // Migliorato error handling
      }
      saveCount = 0;
    }
  };

  if (existsSync(filename)) {
    try {
      const result = JSON.parse(
          readFileSync(filename, { encoding: 'utf-8' }),
          BufferJSON.reviver,
      );
      creds = result.creds;
      keys = result.keys;
    } catch (e) {
      console.error('Error loading auth state:', e.message);
      creds = initAuthCreds();
      keys = {};
    }
  } else {
    creds = initAuthCreds();
    keys = {};
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type];
          return ids.reduce(
              (dict, id) => {
                let value = keys[key]?.[id];
                if (value) {
                  if (type === 'app-state-sync-key') {
                    value = proto.AppStateSyncKeyData.fromObject(value);
                  }
                  dict[id] = value;
                }
                return dict;
              }, {},
          );
        },
        set: (data) => {
          for (const _key in data) {
            const key = KEY_MAP[_key];
            keys[key] = keys[key] || {};
            Object.assign(keys[key], data[_key]);
          }
          saveState();
        },
      },
    },
    saveState,
  };
}
function loadMessage(jid, id = null) {
  let message = null;
  // If only 1 param, first param is assumed to be id not jid
  if (jid && !id) {
    id = jid;
    /** @type {(m: import('@realvare/based').proto.WebMessageInfo) => Boolean} */
    const filter = (m) => m.key?.id == id;
    const messages = {};
    const messageFind = Object.entries(messages)
        .find(([, msgs]) => {
          return msgs.find(filter);
        });
    message = messageFind?.[1]?.find(filter);
  } else {
    // @ts-ignore
    jid = jid?.decodeJid?.();
    const messages = {};
    if (!(jid in messages)) return null;
    message = messages[jid].find((m) => m.key.id == id);
  }
  return message ? message : null;
}
export default {
  bind,
  useSingleFileAuthState,
  loadMessage,
};