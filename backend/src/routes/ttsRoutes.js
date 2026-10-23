const express = require("express");
const router = express.Router();
const https = require("https");

/**
 * GET /api/tts
 * Query params:
 *   text: text to synthesize (e.g. "கவனிக்கவும், டோக்கன் எண்...")
 *   lang: language code ("ta" for Tamil, "en" for English, default "ta")
 */
router.get("/", (req, res) => {
  const { text, lang = "ta" } = req.query;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Text parameter is required" });
  }

  // Google TTS tw-ob client works reliably up to ~200 characters per request
  const cleanText = text.trim().slice(0, 250);
  const targetLang = lang === "en" ? "en" : "ta";

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    cleanText
  )}&tl=${targetLang}&client=tw-ob`;

  const request = https.get(
    googleUrl,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
        Accept: "*/*",
      },
    },
    (googleRes) => {
      if (googleRes.statusCode !== 200) {
        console.warn(`Upstream TTS returned status ${googleRes.statusCode}`);
        return res.status(googleRes.statusCode || 502).json({
          success: false,
          message: "Upstream TTS service returned non-200 status",
        });
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache audio for repeated tokens/phrases
      googleRes.pipe(res);
    }
  );

  request.on("error", (err) => {
    console.error("TTS upstream request error:", err.message);
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: "Failed to connect to speech synthesis upstream",
      });
    }
  });
});

module.exports = router;
