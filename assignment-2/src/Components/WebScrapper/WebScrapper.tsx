import React from "react"
import { useState,useEffect } from "react";
const WebScrapper: React.FC = () => {
    const [ScrapperInput, setScrapperInput] = useState("");
    const WebScrapFunc = (inp : string) => {
        console.log("Pat1")
        setScrapperInput(inp)
        console.log(ScrapperInput)
        console.log("Pat2")
    }
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
       onClick={() => WebScrapFunc(ScrapperInput)} disabled={!ScrapperInput.trim()} >
        Scrape
      </button>
    </div>
  )
}

export default WebScrapper
