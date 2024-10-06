import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Taxi from "./pages/taxi";
import Navbar from "./components/navbar";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/taxi" element={<Taxi />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
