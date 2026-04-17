import { Routes, Route } from "react-router";
import Home from "./pages/home/Home";
import ApiExample from "./pages/api-example/ApiExample";
import Stargaze from "./pages/stargaze/Stargaze";

// Defines which URL path corresponds to which page component.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Stargaze />} />
      <Route path="/home" element={<Home />} />
      <Route path="/api-example" element={<ApiExample />} />
    </Routes>
  );
}

export default App;
