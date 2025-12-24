let handler = async (m, { conn }) => {
  let dynamicButtons = [];
  let list = [
    ['d', [{ title: 'davverodavvero', rows: [{ header: 'x', title: 'D1', id: '4' }] }]]
  ];

  if (list && Array.isArray(list)) {
    list.forEach(lister => {
      dynamicButtons.push({
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: lister[0],
          sections: lister[1]
        })
      });
    });
  }

  const testCard = {
    image: { url: 'https://i.ibb.co/kVdFLyGL/sam.jpg' },
    title: 'based!!',
    body: 'redwine',
    footer: 'xxx',
    buttons: [
      {
          name: 'open_webview',
          buttonParamsJson: JSON.stringify({
            title: 'cliccaclicca',
            link: {
              url: 'https://varebot.netlify.app'
            }
          })
        },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Apri Link",
          url: "https://xxx.com"
        })
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "Copia Testo",
          copy_code: "https://xxx.com"
        })
      },
      ...dynamicButtons
    ]
  };

  await conn.sendMessage(
    m.chat,
    {
      text: 'Test card',
      title: '',
      footer: '',
      cards: [testCard]
    },
    { quoted: m }
  );
};

handler.command = ['ts'];
handler.register = true;

export default handler;