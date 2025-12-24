const handler = async (m, { conn }) => {
  const jid = m.chat

  await conn.sendMessage(
    jid,
    {
      text: 'by samakavare', 
      interactiveButtons: [
        {
          name: 'payment_info',
          buttonParamsJson: JSON.stringify({
            payment_settings: [
              {
                type: 'pix_static_code',
                pix_static_code: {
                  merchant_name: 'samakavare',
                  key: 'samakavare@gmail.com',
                  key_type: 'EMAIL' 
                }
              }
            ]
          })
        }
      ]
    },
    { quoted: m }
  )
}

handler.command = ['pix']
handler.owner = true
export default handler