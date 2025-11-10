import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Schools from "./schools";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/schools" element={<Schools />} />
      </Routes>
    </Router>
  );
}

export default App;
