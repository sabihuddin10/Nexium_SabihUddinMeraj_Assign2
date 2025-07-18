import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ✅ __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Supabase config
const PROJECT_URL = "https://kmekjienauqjktkzhukx.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZWtqaWVuYXVxamt0a3podWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3MTAwNSwiZXhwIjoyMDY4MDQ3MDA1fQ.WiJV-dsP27TICLivrfgIB9uCH9uhAhlEJbZ5XAEOxss";
const supabase = createClient(PROJECT_URL, API_KEY);

// ✅ Express app setup
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
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), "translate.py");

    const python = spawn("python", [scriptPath, from, to, text], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
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

    // ✅ POST /summarise endpoint
    app.post("/summarise", async (req, res) => {
      const {
        url,
        translate: doTranslate = false,
        summary: doSummary = false,
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
$("iframe, script, style, noscript, link, meta").remove(); 
        const contentText =
          $("article").text() ||
          $("main").text() ||
          $("section").text() ||
          $(".content").text() ||
          $("body").text();

        const fullText = contentText.replace(/\s+/g, " ").trim();
        let translationDetails = null;

        // ✅ Translate if requested
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

        // ✅ Save to MongoDB
        const result = await db.collection("blogs").insertOne({
          url: finalUrl,
          fullText,
          translationDetails,
        });

        // ✅ Simulate summary and save to Supabase
        let summaryResult = null;
        if (doSummary && fullText) {
          let summaryText = "";
          if (fullText.includes(".")) {
            summaryText = fullText.split(".").slice(0, 2).join(".") + ".";
          } else {
            summaryText = fullText.split(" ").slice(0, 50).join(" ") + "...";
          }
          summaryText = "Summary: " + summaryText;

          const { data, error } = await supabase
            .from("summaries")
            .insert([
              {
                url: finalUrl,
                summary: summaryText,
                created_at: new Date().toISOString(),
              },
            ])
            .select();

          if (error) {
            console.error("❌ Supabase insert error:", error);
          } else {
            summaryResult = {
              message: "Summary saved to Supabase",
              id: data?.[0]?.id,
            };
            console.log("✅ Supabase summary saved");
          }
        }

        // ✅ Final response
        res.json({
  message: "Saved",
  mongo: {
    id: result.insertedId,
    url: finalUrl,
    fullText,
    translationDetails,
  },
  supabase: summaryResult || null,
});

      } catch (err: any) {
        console.error("❌ Scraping or saving failed:", err.message || err);
        res.status(500).json({ error: "Failed to process or save blog data." });
      }
    });

    // ✅ GET /summaries endpoint
    app.get("/summaries", async (_req, res) => {
      try {
        const { data, error } = await supabase
          .from("summaries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Supabase fetch error:", error.message);
          return res.status(500).json({ error: "Failed to fetch summaries" });
        }

        res.json(data);
      } catch (err: any) {
        console.error("❌ Server error:", err.message);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // ✅ Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

startServer();