import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const RootWrapper = () => {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <App />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RootWrapper />
  </React.StrictMode>
);
