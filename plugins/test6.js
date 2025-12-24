const handler = async (m, { conn }) => {
  const jid = m.chat
  await conn.sendMessage(
    jid,
    {
      text: 'got hit up w that blick',
      footer: 'vare ✧ bot',
      interactiveButtons: [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '🍥 Quick Reply',
            id: 'varebot'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: 'canale varebot 🉐',
            url: 'https://example.com',
            merchant_url: 'https://example.com'
          })
        },
        {
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: '📋 Copia link',
            copy_code: 'https://example.com'
          })
        },
        {
          name: 'cta_call',
          buttonParamsJson: JSON.stringify({
            display_text: '📞 Non chiamare pls',
            phone_number: '104'
          })
        },
        {
          name: 'cta_catalog',
          buttonParamsJson: JSON.stringify({
            business_phone_number: '393514357738'
          })
        },
        {
          name: 'cta_reminder',
          buttonParamsJson: JSON.stringify({
            display_text: '🕒 Imposta promemoria'
          })
        },
        {
          name: 'cta_cancel_reminder',
          buttonParamsJson: JSON.stringify({
            display_text: '❌ Cancella promemoria'
          })
        },
        {
          name: 'address_message',
          buttonParamsJson: JSON.stringify({
            display_text: '📍 Invia indirizzo'
          })
        },
        {
          name: 'send_location',
          buttonParamsJson: JSON.stringify({
            display_text: '📌 Invia posizione'
          })
        },
        {
          name: 'open_webview',
          buttonParamsJson: JSON.stringify({
            title: 'cliccaclicca',
            link: {
              in_app_webview: true,
              url: 'https://example.com'
            }
          })
        },
        {
          name: 'mpm',
          buttonParamsJson: JSON.stringify({
            product_id: '30566830672964949'
          })
        },
        {
          name: 'wa_payment_transaction_details',
          buttonParamsJson: JSON.stringify({
            transaction_id: '30566830672964949'
          })
        },
        {
          name: 'automated_greeting_message_view_catalog',
          buttonParamsJson: JSON.stringify({
            business_phone_number: '393514357738', 
            catalog_product_id: '30566830672964949'
          })
        },
        {
          name: 'galaxy_message',
          buttonParamsJson: JSON.stringify({
            mode: 'published',
            flow_message_version: '3',
            flow_token: '1:1307913409923914:293680f87029f5a13d1ec5e35e718af3',
            flow_id: '1307913409923914',
            flow_cta: '🌟 Avvia flusso varebot',
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'QUESTION_ONE',
              params: {
                user_id: '393514357738',
                referral: 'varebot_campaign'
              }
            },
            flow_metadata: {
              flow_json_version: '201',
              data_api_protocol: 'v2',
              flow_name: 'VareBot Lead Qualification [it]',
              data_api_version: 'v2',
              categories: ['Lead Generation', 'VareBot']
            }
          })
        },
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📝 lista',
            sections: [
              {
                title: 'varebot',
                highlight_label: 'goat',
                rows: [
                  {
                    header: 'SAM',
                    title: 'f zozzap',
                    description: '✧ - 令',
                    id: 'x'
                  },
                  {
                    header: 'b',
                    title: 'x',
                    description: 'sexx',
                    id: 'x'
                  },
                  {
                    header: 'A',
                    title: 'aids',
                    description: 'x',
                    id: 'x'
                  }
                ]
              }
            ]
          })
        }
      ]
    },
    { quoted: m }
  )
  setTimeout(async () => {
    await conn.sendMessage(
      jid,
      {
        location: { 
          degressLatitude: 45.5845,
          degressLongitude: 9.2744,
          name: 'sam dox'
        },
        caption: 'ecco dove si nasconde sam📍',
        subtitle: 'Ravenna, Italia',
        footer: 'vare ✧ bot',
        interactiveButtons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '📍 Interessante!',
              id: 'location_viewed'
            })
          },
          {
            name: 'send_location',
            buttonParamsJson: JSON.stringify({
              display_text: '📌 Condividi la tua posizione'
            })
          }
        ],
        hasMediaAttachment: false
      },
      { quoted: m }
    )
  }, 1500)
  setTimeout(async () => {
    await conn.sendMessage(
      jid,
      {
        product: {
          productImage: {
            url: 'https://i.ibb.co/kVdFLyGL/sam.jpg'
          },
          productId: 'x',
          title: 'VareBot',
          description: 'Unlock advanced features and premium support',
          currencyCode: 'EUR',
          priceAmount1000: '6900',
          retailerId: 'VareBot',
          url: 'https://example.com',
          productImageCount: 1
        },
        businessOwnerJid: '393514357738@s.whatsapp.net',
        caption: '❀',
        title: '@realvare/based',
        footer: 'vare ✧ bot',
        interactiveButtons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'bzzz',
              url: 'https://example.com',
              merchant_url: 'https://example.com'
            })
          }
        ],
        hasMediaAttachment: false
      },
      { quoted: m }
    )
  }, 1000)
}

handler.command = ['it']
handler.owner = true
export default handler
