const handler = async (m, { conn }) => {
  const jid = m.chat

  await conn.sendMessage(
    jid,
    {
      text: 'heh',
      title: 'sono goated',
      subtitle: 'varebot',  
      footer: '❀',
      cards: [
        {
          image: { url: 'https://example.com/image.jpg' },
          title: 'Title',
          body: 'Body',
          footer: 'Footer',
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: 'Display Button',
                id: 'x'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Display Button',
                url: 'https://example.com'
              })
            }
          ]
        },
        {
          video: { url: 'https://example.com/video.mp4' },
          title: 'Title',
          body: 'Body',
          footer: 'Footer',
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: 'Display Button',
                id: 'x'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Display Button',
                url: 'https://example.com'
              })
            }
          ]
        }
      ]
    },
    { quoted: m }
  )
}

handler.command = ['sd']
handler.owner = true
export default handler
