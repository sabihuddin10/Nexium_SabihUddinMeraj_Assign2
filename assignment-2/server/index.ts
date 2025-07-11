import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://nexium_sabihuddin106:sabih123@cluster0.u4h8geo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const dbName = "nexium-mongo";
let db:any;

async function startServer() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("✅ Connected to MongoDB");

        app.post("/summarise", async (req, res) => {
            const {
                url,
                translate = false,
                sourceLang = "en",
                targetLang = "ur",
            } = req.body;

            if (!url) {
                return res.status(400).json({ error: "Missing URL" });
            }

            try {
                const finalUrl = url.startsWith("http") ? url : `https://${url}`;
                const response = await axios.get(finalUrl, { timeout: 10000 });
                const $ = cheerio.load(response.data);

                // Use more specific targeting instead of entire <body>
                const contentText =
                    $("article").text() ||
                    $("main").text() ||
                    $("section").text() ||
                    $(".content").text() ||
                    $("body").text();

                const fullText = contentText.replace(/\s+/g, " ").trim();

                let translationDetails = null;

                if (translate) {
    try {
        const translationResp = await axios.post(
            "https://libretranslate.de/translate",
            {
                q: fullText.slice(0, 5000), // Limit to 5000 chars
                source: sourceLang,
                target: targetLang,
                format: "text",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const translatedText = translationResp.data?.translatedText;

        if (translatedText) {
            translationDetails = {
                from: sourceLang,
                to: targetLang,
                translatedContent: translatedText,
            };
        } else {
            console.warn("⚠️ Translation API returned empty content.");
        }
    } catch (translationError:any) {
        console.warn("⚠️ Translation failed:", translationError.message || translationError);
    }
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
            } catch (err:any) {
                console.error("❌ Error scraping or saving:", err.message || err);
                res.status(500).json({ error: "Failed to scrape or insert into MongoDB." });
            }
        });

        const PORT = 3001;
        app.listen(PORT, () => {
            console.log(`✅ Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

startServer();
