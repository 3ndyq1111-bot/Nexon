import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import crypto from 'crypto'
import { spawn } from 'child_process'
import fetch from 'node-fetch'
import webp from 'node-webpmux'
import { fileTypeFromBuffer } from 'file-type'
import fluent_ffmpeg from 'fluent-ffmpeg'
import uploadFile from './uploadFile.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmpDir = join(__dirname, '../temp')

// Utility per scaricare buffer
async function fetchBuffer(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`)
    return await res.buffer()
}

/**
 * Converte immagine/video in WebP usando FFmpeg (Metodo più affidabile)
 */
async function sticker6(img, url) {
    if (url) img = await fetchBuffer(url)
    const type = await fileTypeFromBuffer(img) || { mime: 'image/jpeg', ext: 'jpg' }
    
    const inp = join(tmpDir, `${Date.now()}.${type.ext}`)
    const out = join(tmpDir, `${Date.now()}.webp`)
    
    await fs.writeFile(inp, img)

    return new Promise((resolve, reject) => {
        const isVideo = /video/i.test(type.mime)
        const ff = fluent_ffmpeg(inp)
        
        if (isVideo) ff.inputFormat(type.ext)
        
        ff.on('error', async (err) => {
            await fs.unlink(inp).catch(() => {})
            reject(err)
        })
        .on('end', async () => {
            const buffer = await fs.readFile(out)
            await Promise.all([fs.unlink(inp), fs.unlink(out)]).catch(() => {})
            resolve(buffer)
        })
        .addOutputOptions([
            '-vcodec', 'libwebp',
            '-vf', "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
            '-lossless', '1',
            '-loop', '0',
            '-preset', 'default',
            '-an', '-vsync', '0'
        ])
        .toFormat('webp')
        .save(out)
    })
}

/**
 * Aggiunge i metadati EXIF (Packname & Author)
 */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
    const img = new webp.Image()
    const json = { 
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 
        'sticker-pack-name': packname, 
        'sticker-pack-publisher': author, 
        'emojis': categories, 
        ...extra 
    }
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length, 14, 4)
    
    await img.load(webpSticker)
    img.exif = exif
    return await img.save(null)
}

/**
 * Funzione principale con fallback
 */
async function sticker(img, url, packname, author, ...args) {
    let lastError
    const methods = [
        // Metodo 1: wa-sticker-formatter (molto pulito se installato)
        async () => {
            const { Sticker } = await import('wa-sticker-formatter')
            const s = new Sticker(img || url, { pack: packname, author, type: 'full' })
            return await s.toBuffer()
        },
        // Metodo 2: FFmpeg locale (sticker6)
        () => sticker6(img, url),
        // Metodo 3: API Esterna (Sticker3 - rimosso xteam perché spesso instabile, ma puoi rimetterlo)
    ]

    for (const method of methods) {
        try {
            let stiker = await method()
            if (stiker) {
                return await addExif(stiker, packname, author, ...args)
            }
        } catch (e) {
            lastError = e
            continue
        }
    }
    throw lastError || 'Errore nella creazione dello sticker'
}

export const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false
}

export { sticker, sticker6, addExif }