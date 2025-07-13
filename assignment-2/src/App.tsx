import NavBar from "./Components/NavBar/NavBar.tsx"
import WebWrapper from "./Components/WebWrapper/WebWrapper.tsx"
// import QuoteGenerator from "./components/QuoteGenerator/QuoteGenerator"
import WebScrapper from "./Components/WebScrapper/WebScrapper.tsx"
function App() {
  return (
    <>
    <WebWrapper>
       <NavBar/>
       <WebScrapper/>

    </WebWrapper>
    </>
  )
}

export default App
