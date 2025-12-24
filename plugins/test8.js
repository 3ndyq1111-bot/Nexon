let result = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    pollResult: {
      name: '> \`vare ✧ bot\`',
      values: [
        ['potrebbe servire???\n\nbbb\n\nbbb\n\nbbb\n\nbbb\n\nbbb\n\nbbb', 69],
        ['o forse no', 19],
        ['idk è carino', 8],
          ['o forse no']
      ]
    }
  }, { quoted: m });
}

result.command = ['bzz']
result.group = true
result.owner = true
export default result