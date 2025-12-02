import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Drones from "./components/Drones";
import Operators from "./components/Operators";
import Deliveries from "./components/Deliveries";
import Packages from "./components/Packages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drones" element={<Drones />} />
        <Route path="/operators" element={<Operators />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/packages" element={<Packages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
