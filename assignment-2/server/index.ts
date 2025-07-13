import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url"; // ✅ Needed to define __dirname in ES modules
import dotenv from "dotenv";
dotenv.config();

// ✅ Fix __dirname for ESNext (Node ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
const uri = process.env.MONGO_DB_URL!;
const PORT = parseInt(process.env.PORT || "3001");
const dbName = "nexium-mongo";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: any;

// 🔁 Translate using Python script
async function translateText(text: string, from: string, to: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "translate.py");

    const python = spawn("python", [scriptPath, from, to, text], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, PYTHONIOENCODING: "utf-8" }, // ✅ Force UTF-8 from Python
    });

    let result = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error("🐍 Python error:", data.toString());
    });

    python.on("close", () => {
      if (result.startsWith("ERROR")) {
        console.warn("⚠️ Python translation error:", result);
        return resolve(null);
      }
      resolve(result.trim());
    });
  });
}

async function startServer() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ Connected to MongoDB");

    app.post("/summarise", async (req, res) => {
      const {
        url,
        translate: doTranslate = false,
        sourceLang = "auto",
        targetLang = "ur",
      } = req.body;

      if (!url) {
        return res.status(400).json({ error: "Missing URL" });
      }

      try {
        const finalUrl = url.startsWith("http") ? url : `https://${url}`;
        const response = await axios.get(finalUrl, { timeout: 10000 });
        const $ = cheerio.load(response.data);

        const contentText =
          $("article").text() ||
          $("main").text() ||
          $("section").text() ||
          $(".content").text() ||
          $("body").text();

        const fullText = contentText.replace(/\s+/g, " ").trim();

        let translationDetails = null;

        if (doTranslate && fullText) {
          const textToTranslate = fullText.slice(0, 500);
          const translated = await translateText(textToTranslate, sourceLang, targetLang);

          translationDetails = {
            from: sourceLang,
            to: targetLang,
            translatedContent: translated,
            ...(translated ? {} : { error: "Translation failed or unsupported" }),
          };
        }

        const result = await db.collection("blogs").insertOne({
          url: finalUrl,
          fullText,
          translationDetails,
        });

        res.json({
          message: "Saved",
          id: result.insertedId,
          preview: (translationDetails?.translatedContent || fullText).slice(0, 300) + "...",
        });

      } catch (err: any) {
        console.error("❌ Scraping or saving failed:", err.message || err);
        res.status(500).json({ error: "Failed to process or save blog data." });
      }
    });

    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message || err);
    process.exit(1);
  }
}

startServer();
