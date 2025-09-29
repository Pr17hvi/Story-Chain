import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Write from "./pages/Write";
import StoryDetail from "./pages/StoryDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:username" element={<Profile />} />

            {/* Protected routes */}
            <Route
              path="/write"
              element={
                <PrivateRoute>
                  <Write />
                </PrivateRoute>
              }
            />

            {/* Story detail */}
            <Route path="/stories/:id" element={<StoryDetail />} />

            {/* Catch-all route */}
            <Route
              path="*"
              element={
                <h2 className="text-center mt-10">404 - Page Not Found</h2>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
