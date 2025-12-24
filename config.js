import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'


const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

const moduleCache = new NodeCache({ stdTTL: 300 });

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

global.sam = ['393476686131',]
global.owner = [
  ['393476686131', 'sam', true],
  ['393511082922', 'gio', true],
  ['393392645292', 'mavko', true],
  ['67078163216', 'Felix', true],
  ['393514357738', 'vare', true],
]
global.mods = ['393476686131', '393511082922', '67078163216']
global.prems = ['393476686131', '393511082922', '67078163216']

/*⭑⭒━━━✦❘༻🩸 INFO BOT 🕊️༺❘✦━━━⭒⭑*/

global.nomepack = 'vare ✧ bot'
global.nomebot = '✧˚🩸 varebot 🕊️˚✧'
global.wm = 'vare ✧ bot'
global.autore = '𝐬𝐚𝐦'
global.dev = '⋆｡˚- 𝐬𝐚𝐦'
global.testobot = `༻⋆⁺₊𝓿𝓪𝓻𝓮𝓫𝓸𝓽₊⁺⋆༺`
global.versione = pkg.version
global.errore = '⚠️ *Errore inatteso!* Usa il comando `.segnala _errore_` per avvisare lo sviluppatore.'

/*⭑⭒━━━✦❘༻🌐 LINK 🌐༺❘✦━━━⭒⭑*/

global.repobot = 'https://github.com/realvare/varebot'
global.gruppo = 'https://chat.whatsapp.com/bysamakavare'
global.canale = 'https://whatsapp.com/channel/0029VbB41Sa1Hsq1JhsC1Z1z'
global.insta = 'https://www.instagram.com/samakavare'

/*⭑⭒━━━✦❘༻ MODULI ༺❘✦━━━⭒⭑*/

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

/*⭑⭒━━━✦❘🗝️ API KEYS 🌍༺❘✦━━━⭒⭑*/

global.APIKeys = {
    spotifyclientid: '35040f71028c408ca6b87357c6dc790b',
    spotifysecret: '20e14caf04174ba0b23f74f82f9ce748',
    browserless: '2SjJxAS8nqqgA2a5aad1bff7c035470f940cf34519c797b5b',
    screenshotone: '0SlqcK-0Bxje9w',
    screenshotone_default: 'u81CMBKVi5KcKQ',
    tmdb: '9083eb047fcfcc1838b28b1b91ac4cfb',
    gemini:'AIzaSyDG70wvOfP2e-qEX78wT9RGZ4kAGe0Q2r0',
    elevenlabs: 'sk_985407364f10492786318acdd6973310515fd8f6f3ea73cc',
    ocrspace: 'K85625827388957',
    assemblyai: 'ade0a7c1635f4a64bf7142c2e748a8bc',
    google: 'AIzaSyCu7ysbn0hYW4vTYPF48ybf4TgE-Z94IYI',
    googlex: 'AIzaSyCu7ysbn0hYW4vTYPF48ybf4TgE-Z94IYI',
    googleCX: '43df529608f5f40a6',
    genius: 'bHNaHVQZ8SmHXygkiPV21eQNzItohouPlA0q4EA60Bc6Ob7qc6wKSpDsP5yXtfML',
    replicate: 'r8_DMfECHYzgP39MOiIi8vQ1Sj9C78etsQ4bQ7rQ',
    unsplash: 'kRh4SsQBrC2y3ztOVWRjuWTszAReYdmPZsXrE6HL--w',
    removebg: 'FEx4CYmYN1QRQWD1mbZp87jV',
    openrouter: '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',
    sightengine_user: '560414128',
    sightengine_secret: '5hDxSmC58N8emC4rucumAoCceRdr9Q9b',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
}

/*⭑⭒━━━✦❘༻🪷 SISTEMA XP/EURO 💸༺❘✦━━━⭒⭑*/

global.multiplier = 1

/*⭑⭒━━━✦❘༻📦 RELOAD 📦༺❘✦━━━⭒⭑*/

let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href

const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  unwatchFile(filePath)
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'config.js' Aggiornato")))
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}

watchFile(filePath, reloadConfig)
