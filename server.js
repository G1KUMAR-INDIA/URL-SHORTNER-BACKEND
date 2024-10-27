import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import {nanoid} from 'nanoid'
import dotenv from 'dotenv'
import QRCode from 'qrcode'
dotenv.config()
const app = express();
app.use(cors())
app.use(express.json())
const PORT = process.env.PORT
const mongoURI=process.env.mongoURI
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB using Mongoose!"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    urlCode: { type: String, unique: true },
    qrCode: { type: String },
    date: { type: Date, default: Date.now },
});
app.post('/api/url/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const base = process.env.BASE_URL;
    const urlCode = nanoid(8);
    const shortUrl = `${base}/${urlCode}`;
  
    try {
      // Check if the URL already exists
      let url = await Url.findOne({ originalUrl });
      if (url) return res.json(url);
  
      // Generate QR code
      const qrCode = await QRCode.toDataURL(shortUrl);
  
      // Create new URL document
      url = new Url({ originalUrl, shortUrl, urlCode, qrCode });
      await url.save();
  
      res.json(url);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
});
  
app.get('/api/url/:code', async (req, res) => {
    try {
      const url = await Url.findOne({ urlCode: req.params.code });
      if (url) return res.redirect(url.originalUrl);
      res.status(404).json({ error: 'URL not found' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
const Url=mongoose.model('Url',urlSchema)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });