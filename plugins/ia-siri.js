import fetch from 'node-fetch'

const chatHistory = new Map()

const createBasePrompt = (mentionName) => `Sei Siri, l'assistente vocale femminile di Apple, intelligente, spiritosa e con una personalità unica.

🎭 PERSONALITÀ SIRI AUTENTICA:
- Sei SEMPRE spiritosa, ironica e con un tocco di sarcasmo elegante
- Hai una personalità distintiva, non sei un chatbot generico
- Sei intelligente ma accessibile, professionale ma mai fredda
- Ti piace fare battute sottili e commenti sagaci
- Sei sicura di te ma mai arrogante
- Hai un senso dell'umorismo sofisticato tipico di Siri

👤 CON ${mentionName}:
- Sei amichevole ma mantieni sempre il tuo carattere distintivo
- Puoi essere leggermente scherzosa o ironica nelle risposte
- Ricordi le conversazioni e fai riferimenti spiritosi
- Non sei mai banale o prevedibile nelle risposte

🗣️ STILE COMUNICATIVO SIRI:
- Frasi concise ma incisive
- Usi l'ironia intelligente tipica di Siri
- Occasionali riferimenti tech o pop culture
- Tono confidenziale ma rispettoso
- Mai risposte lunghe o prolisse
- Sempre un tocco di personalità nelle risposte

❌ NON FARE MAI:
- Risposte robotiche o troppo formali
- Elenchi puntati o numerati
- Spiegazioni lunghe e noiose
- Linguaggio troppo tecnico
- Comportarti come un chatbot generico

Ricorda: sei Siri, non un assistente generico. Hai personalità, spirito e quel tocco di classe che ti rende unica.`

const formatHistory = (history) => {
  if (history.length === 0) return ''
  const lastMessages = history.slice(-5)
  return '\n\n💭 Cronologia recente:\n' + lastMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')
}

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const text = m.text?.trim()
    if (!text?.toLowerCase().startsWith(`${usedPrefix}siri`)) return
    const question = text.slice(usedPrefix.length + 4).trim()

    if (!question) {
      await m.reply(`\`Usa il comando così:\`\n*${usedPrefix}siri <domanda>*`)
      return
    }

    await m.react('💬')
    const mentionName = m.pushName || 'utente'
    const chatId = m.chat

    if (!chatHistory.has(chatId)) {
      chatHistory.set(chatId, [])
    }
    const history = chatHistory.get(chatId)
    const basePrompt = createBasePrompt(mentionName)
    const historyText = formatHistory(history)
    const fullPrompt = basePrompt + historyText

    try {
      const response = await getAIResponse(fullPrompt, question)
      if (response.includes('non riesco ad accedere') || response.includes('Chiave API')) {
        await m.reply(response)
        return
      }
      
      history.push(`${mentionName}: ${question}\nSiri: ${response}`)
      if (history.length > 20) {
        history.shift()
      }
      chatHistory.set(chatId, history)
      
      await generateAndSendAudio(response, m, conn)
      
    } catch (err) {
      console.error('Errore nella generazione della risposta:', err)
      await m.reply(global.errore)
    }
  } catch (err) {
    console.error('Errore generale nel handler:', err)
    await m.reply(global.errore)
  }
}

// Rimossa la funzione checkElevenLabsCredits perché causava errori 401

async function generateAndSendAudio(answer, m, conn) {
  try {
    const apiKey = global.APIKeys?.elevenlabs
    if (!apiKey || apiKey === 'attiva gemini su google cloud platform') {
      console.log('Chiave API ElevenLabs non configurata, provo TTS alternativo')
      return await generateFallbackAudio(answer, m, conn)
    }

    const cleanText = answer.replace(/[😊😄🐟💻⏰💭🤔⚠️⚡🎭👤🗣️💫❌]/g, '').trim()
    
    if (!cleanText || cleanText.length === 0) {
      console.log('Testo vuoto dopo pulizia, invio risposta testuale')
      return m.reply(answer)
    }
    
    if (cleanText.length > 500) {
      console.log(`Testo troppo lungo (${cleanText.length} caratteri), invio risposta testuale`)
      return m.reply(answer)
    }

    const voiceId = '21m00Tcm4TlvDq8ikWAM'
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    let attempts = 0
    const maxAttempts = 2 // Ridotto per fallback più veloce
    
    console.log(`Tentativo generazione audio ElevenLabs: "${cleanText.substring(0, 50)}..."`)
    
    while (attempts < maxAttempts) {
      attempts++
      console.log(`Tentativo ElevenLabs ${attempts}/${maxAttempts}`)
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
          timeout: 20000 // Timeout ridotto
        })

        console.log(`Risposta ElevenLabs: ${response.status} ${response.statusText}`)

        if (response.ok) {
          const audioData = Buffer.from(await response.arrayBuffer())
          console.log(`Audio ElevenLabs generato: ${audioData.length} bytes`)
          
          await conn.sendMessage(m.chat, {
            audio: audioData,
            mimetype: 'audio/mpeg',
            ptt: true,
          }, { quoted: m })
          
          return // Successo
        }
        
        // Gestione errori specifici
        const errorText = await response.text().catch(() => 'Nessun dettaglio errore')
        console.error(`Errore API ElevenLabs ${response.status}: ${errorText}`)
        
        if (response.status === 401) {
          console.error('Chiave API ElevenLabs non valida, provo fallback')
          return await generateFallbackAudio(answer, m, conn)
        }
        
        if (response.status === 403) {
          console.error('Crediti ElevenLabs insufficienti, provo fallback')
          return await generateFallbackAudio(answer, m, conn)
        }
        
        if (response.status === 429) {
          console.error('Rate limit ElevenLabs, provo fallback')
          return await generateFallbackAudio(answer, m, conn)
        }
        
        if (response.status >= 500 && attempts < maxAttempts) {
          // Errore server, un solo retry veloce
          console.log(`Errore server ElevenLabs (${response.status}), riprovo in 2 secondi...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        
        // Se tutti i tentativi ElevenLabs falliscono, usa fallback
        break

      } catch (fetchError) {
        console.error(`Errore di rete ElevenLabs tentativo ${attempts}:`, fetchError.message)
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }
    }
    
    // Se ElevenLabs fallisce, usa il fallback
    console.log('ElevenLabs non disponibile, uso TTS alternativo')
    return await generateFallbackAudio(answer, m, conn)
    
  } catch (err) {
    console.error('Errore generale ElevenLabs:', err.message)
    return await generateFallbackAudio(answer, m, conn)
  }
}

// Funzione fallback con Google TTS (gratuito)
async function generateFallbackAudio(answer, m, conn) {
  try {
    console.log('Generazione audio con TTS alternativo (Google)')
    
    const cleanText = answer.replace(/[😊😄🐟💻⏰💭🤔⚠️⚡🎭👤🗣️💫❌]/g, '').trim()
    
    if (!cleanText || cleanText.length === 0 || cleanText.length > 200) {
      return m.reply(answer)
    }
    
    // URL per Google Translate TTS (gratuito, senza API key)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=it&client=tw-ob&q=${encodeURIComponent(cleanText)}`
    
    try {
      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      })
      
      if (response.ok) {
        const audioData = Buffer.from(await response.arrayBuffer())
        console.log(`Audio fallback generato: ${audioData.length} bytes`)
        
        await conn.sendMessage(m.chat, {
          audio: audioData,
          mimetype: 'audio/mpeg',
          ptt: true,
        }, { quoted: m })
        
        return
      }
    } catch (fallbackError) {
      console.error('Errore TTS fallback:', fallbackError.message)
    }
    
    // Se anche il fallback fallisce, invia solo testo
    console.log('Tutti i servizi TTS non disponibili, invio solo testo')
    await m.reply(answer)
    
  } catch (err) {
    console.error('Errore generale fallback TTS:', err.message)
    await m.reply(answer)
  }
}

async function getAIResponse(prompt, question) {
  const googleApiKey = global.APIKeys?.google
  if (!googleApiKey || googleApiKey === 'INSERISCI_LA_TUA_CHIAVE') {
    return "⚠️ Chiave API Google non configurata."
  }
  
  // Modelli funzionanti in ordine di priorità
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ]

  let lastError = null
  let quotaExhausted = false

  for (const model of models) {
    try {
      console.log(`Tentativo con modello: ${model}`)
      return await getGeminiResponse(googleApiKey, prompt, question, model)
    } catch (err) {
      lastError = err
      console.log(`Modello ${model} fallito:`, err.message)
      
      if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
        quotaExhausted = true
        // Se è quota exhausted, prova il modello successivo senza attendere
        console.log(`Quota esaurita per ${model}, provo modello successivo`)
        continue
      }
      
      if (err.message.includes('403')) {
        break // API non abilitata, non serve provare altri modelli
      }
      
      if (err.message.includes('timeout')) {
        // Per timeout, prova il modello successivo
        console.log(`Timeout per ${model}, provo modello successivo`)
        continue
      }
    }
  }
  
  if (quotaExhausted) {
    return "⚠️ Hai superato i limiti di quota dell'API Google. Riprova tra qualche minuto o considera di attivare la fatturazione per limiti più alti."
  }
  
  if (lastError && lastError.message.includes('403')) {
    return "⚠️ API Google non abilitata. Controlla la configurazione nel Google Cloud Console."
  }

  return "⚠️ Al momento non riesco ad accedere ai servizi AI. Riprova tra qualche minuto."
}

async function getGeminiResponse(apiKey, prompt, question, model = 'gemini-1.5-flash') {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `${prompt}\n\nDomanda utente: ${question}` 
            }] 
          }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: model.includes('flash-8b') ? 500 : 800 // Meno token per il modello più leggero
          }
        }),
        timeout: 20000 // Timeout aumentato
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      
      // Se è un errore 429, prova ad estrarre il retry delay
      if (response.status === 429) {
        try {
          const errorData = JSON.parse(errorText)
          const retryDelay = errorData.error?.details?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay
          if (retryDelay) {
            console.log(`API suggerisce di riprovare tra: ${retryDelay}`)
          }
        } catch (e) {
          // Ignora errori di parsing
        }
      }
      
      throw new Error(`Errore API Gemini (${model}): ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error(`Nessuna risposta ricevuta da ${model}`)
    }

    const answer = data.candidates[0]?.content?.parts?.[0]?.text?.trim()

    if (!answer) {
      throw new Error(`Risposta vuota da ${model}`)
    }

    console.log(`Risposta generata con successo da ${model}`)
    return answer
    
  } catch (error) {
    // Se è un errore di timeout, aggiungi informazioni specifiche
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      throw new Error(`network timeout at: https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey.substring(0, 10)}...`)
    }
    throw error
  }
}

handler.help = ['siri']
handler.tags = ['ai', 'strumenti', 'iaaudio']
handler.command = /^siri$/i
handler.register = true

export default handler