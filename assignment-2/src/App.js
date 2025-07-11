import NavBar from "./Components/NavBar/NavBar";
import WebWrapper from "./Components/WebWrapper/WebWrapper";
// import QuoteGenerator from "./components/QuoteGenerator/QuoteGenerator"
import WebScrapper from "./Components/WebScrapper/WebScrapper";
function App() {
    return (<>
    <WebWrapper>
       <NavBar />
       <WebScrapper />

    </WebWrapper>
    </>);
}
export default App;
