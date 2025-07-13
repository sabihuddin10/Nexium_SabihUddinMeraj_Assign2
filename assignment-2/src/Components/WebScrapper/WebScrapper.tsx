import React, { useState } from "react";
import axios from "axios";
const WebScrapper: React.FC = () => {
  const [ScrapperInput, setScrapperInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ur");
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const WebScrap2Func = async () => {
    if (!ScrapperInput.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post(`${backendURL}/summarise`, {
        url: ScrapperInput,
        translate: translateEnabled,
        sourceLang,
        targetLang
      });

      console.log("✅ MongoDB Response:", response.data);
      alert("Saved to MongoDB!");
    } catch (err) {
      console.error("❌ Error saving to Mongo:", err);
      alert("Error saving to MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[90%] sm:w-[400px] md:w-[450px] lg:w-[500px] bg-white p-6 md:p-8 rounded-2xl border border-pink-400 shadow-lg flex flex-col items-center gap-6 
                    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <h2 className="text-2xl font-semibold text-gray-400 tracking-wide">Web Scraper</h2>

      <input
        className="w-full h-12 px-4 rounded-lg text-[#1e293b] bg-white border border-pink-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
        placeholder="Enter a URL to scrape (eg. www.google.com)"
        onChange={(e) => setScrapperInput(e.target.value)}
      />

      <button
        className="w-full h-12 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition duration-200"
        onClick={WebScrap2Func}
        disabled={!ScrapperInput.trim()}
      >
        {loading ? "Saving..." : "Scrape & Save"}
      </button>

      {/* Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="radio-translate"
          checked={translateEnabled}
          onChange={() => setTranslateEnabled(!translateEnabled)}
          className="accent-pink-500 w-4 h-4"
        />
        <label htmlFor="radio-translate" className="text-sm text-gray-600">
          Enable Translation
        </label>
      </div>

      {/* Translation Settings Section */}
      {translateEnabled && (
  <div className="w-full flex flex-col gap-4 p-4 border border-pink-400 rounded-lg shadow-sm transition">
    <h3 className="text-lg font-medium text-pink-500">Translation Settings</h3>

    <div className="flex flex-col md:flex-row gap-4">
      {/* Source Language */}
      <div className="flex flex-col flex-1">
        <label className="text-sm text-gray-500 mb-1">Source Language</label>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="h-10 px-3 rounded-lg border border-pink-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
        >
          <option value="en">English</option>
          <option value="auto">Auto Detect</option>
        </select>
      </div>

      {/* Target Language */}
      <div className="flex flex-col flex-1">
        <label className="text-sm text-gray-500 mb-1">Target Language</label>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="h-10 px-3 rounded-lg border border-pink-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
        >
          <option value="ur">Urdu</option>
          <option value="hi">Hindi</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default WebScrapper;
