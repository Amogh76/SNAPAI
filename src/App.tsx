import React from "react";
import FileUpload from "./components/FileUpload";

function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-purple-200 overflow-x-hidden">
      {/* 🔄 Logo that flows with layout */}
      <div className="flex justify-center pt-12">
        <img
          src="/SNAP.png"
          alt="Logo"
          className="h-56 w-auto drop-shadow-lg"
        />
      </div>

      {/* 🟦 Centered upload card */}
      <div className="flex items-center justify-center px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
            Upload Image for SNAP to Analyze
          </h1>
          <FileUpload />
        </div>
      </div>
    </div>
  );
}

export default App;
