let handler = async (m, { conn, command }) => {
  try {
    let thumbnailBuffer;

    try {
      const foto = await fetch('https://example.com/image.jpg');
      if (foto.ok) {
        thumbnailBuffer = await foto.arrayBuffer();
      }
    } catch (imgError) {
      console.log('Errore nel fetch dell\'immagine:', imgError.message);
      thumbnailBuffer = null;
    }

    
    if (command === 'vetrina') {
      const vetrina = {
        text: '‼',
        footer: '🉐',
        title: 'no switch',
        productList: [
          {
            title: 'mixo sprite e succo denso',
            products: [
              { productId: '30566830672964949' },
            ],
          },
        ],
        businessOwnerJid: '393514357738@s.whatsapp.net',
      };

      if (thumbnailBuffer) {
        vetrina.thumbnail = thumbnailBuffer;
      }

      await conn.sendMessage(m.chat, vetrina, { quoted: m });
    }

    
    else if (command === 'catalogo') {
      const fakeOrder = {
        order: {
          orderId: 'nonsocomesifa' + Math.floor(Math.random() * 1000),
          thumbnail: thumbnailBuffer,
          itemCount: '1',
          status: 'INQUIRY', 
          surface: 'CATALOG',
          message: 'Ordine per: mixo sprite e succo denso 🥤',
          orderTitle: "no switch - Ordine Speciale",
          sellerJid: '393514357738@s.whatsapp.net',
          token: 'AR6xBKbXZn0Xwmu76Ksyd7rnxI+Rx87HfinVlW4lwXa6JA==', 
          totalAmount1000: '15000', 
          totalCurrencyCode: 'EUR'
        }
      };

      await conn.sendMessage(m.chat, fakeOrder, { quoted: m });
    }

    
    else if (command === 'product') {
      const productMessage = {
        product: {
          productImage: thumbnailBuffer ? thumbnailBuffer : {
            url: 'https://example.com/image.jpg'
          },
          productId: '30566830672964949',
          title: 'mixo sprite e succo denso',
          description: 'sprite e succo denso',
          currencyCode: 'EUR',
          priceAmount1000: '15000',
          retailerId: 'NOSWITCH001',
          url: 'https://example.com',
          productImageCount: '1',
          firstImageId: 'img_001',
          salePriceAmount1000: '12000',
          signedUrl: 'https://example.com/signed'
        },
        businessOwnerJid: '393514357738@s.whatsapp.net'
      };

      await conn.sendMessage(m.chat, productMessage, { quoted: m });
    }

  } catch (error) {
    console.error('Errore nel comando:', error);
    await conn.reply(m.chat, `Errore durante l'invio del messaggio ${command}`, m);
  }
};

handler.command = /^(vetrina|catalogo|product)$/i;
handler.owner = true;
export default handler;
