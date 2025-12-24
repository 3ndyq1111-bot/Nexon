let handler = async (m, { conn, command, usedPrefix }) => {
  if (command == 'testmenu') {
    const testListJson = JSON.stringify({
      title: "menu lista se va sborro",
      description: "lista lista lista",
      sections: [
        {
          title: "📁 vzzzzz",
          highlight_label: "che è questo?",
          rows: [
            {
              header: "🔹 abc",
              title: "pingzzzz",
              description: "Desc 1",
              id: usedPrefix + "ping"
            },
            {
              header: "🔹 aaaeweer",
              title: "speed",
              description: "Descrizione 2",
              id: usedPrefix + "speed"
            },
            {
              header: "🔹 broommmm",
              title: "info bottazzo",
              description: "Desc 3",
              id: usedPrefix + "infobot"
            }
          ]
        }
      ]
    })

    const interactiveMessage = {
      body: { text: 'se vedi questo godo' },
      footer: { text: "v" },
      header: {
        title: `🔧 *Test Menu Lista*`,
        subtitle: "Preview?",
        hasMediaAttachment: false
      },
      nativeFlowMessage: {
        buttons: [{
          name: "single_select",
          buttonParamsJson: testListJson
        }]
      }
    }

    const message = {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2
      },
      interactiveMessage
    }

    await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {})
  }
}

handler.command = ['testmenu']
handler.owner = true
export default handler