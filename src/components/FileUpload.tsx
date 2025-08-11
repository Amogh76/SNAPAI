import React, { useState, useRef } from "react";
import axios from "axios";
import ResultsDisplay from "./ResultsDisplay";

const presignEndpoint =
  "https://jt50w5zanb.execute-api.us-east-2.amazonaws.com/v1/GenerateUploadUrl";
const labelEndpoint =
  "https://ka3su04g4e.execute-api.us-east-2.amazonaws.com/v1/GetImageLabels";

type PresignResponse = { uploadUrl: string; key: string };

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState("");
  const [results, setResults] = useState<any | null>(null);
  const [showResults, setShowResults] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropRef = useRef<HTMLDivElement | null>(null);

  const validateImageFile = (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 8);
        const header = Array.from(arr)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
        const isPNG = header === "89 50 4e 47 0d 0a 1a 0a";
        const isJPEG = header.startsWith("ff d8 ff");
        resolve(isPNG || isJPEG);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const triggerFadeOut = () => {
    if (results) {
      setShowResults(false);
      setTimeout(() => {
        setResults(null);
      }, 400);
    } else {
      setResults(null);
    }
  };

  const handleFile = async (file: File) => {
    triggerFadeOut();

    const isValid = await validateImageFile(file);
    if (!isValid) {
      setError("Only real PNG and JPEG images are supported.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };
const handleDownload = () => {
  if (!results || !imageKey) return;

  const baseName = imageKey.replace(/\.[^/.]+$/, "");
  const blob = new Blob(
    [JSON.stringify(results, null, 2)],
    { type: "text/plain;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}-results.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleUpload = async () => {
  if (!selectedFile) return;
  triggerFadeOut();
  setLoading(true);
  setError("");

  try {
    const presignRes = await axios.get<PresignResponse>(presignEndpoint, {
      params: {
        contentType: selectedFile.type,
      },
    });

    const { uploadUrl, key } = presignRes.data;

    // ✅ Use the actual filename for display
    setImageKey(selectedFile.name);

    await axios.put(uploadUrl, selectedFile, {
      headers: {
        "Content-Type": selectedFile.type || "image/png",
      },
    });

    await new Promise((res) => setTimeout(res, 5000));

    const labelRes = await axios.get(labelEndpoint, {
      params: { key },
    });

    setResults(labelRes.data);
    setShowResults(true);
  } catch (err: any) {
    setError(err.response?.data?.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer mb-4 transition-all duration-300 shadow-md ${
          previewUrl
            ? "border-gray-400 bg-white"
            : "border-blue-400 bg-blue-50 animate-pulse"
        } hover:border-blue-500`}
      >
        <input
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          id="fileInput"
          onChange={handleFileChange}
        />
        <label htmlFor="fileInput" className="cursor-pointer block text-gray-700">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto mb-2 rounded-md"
            />
          ) : (
            "Drag & drop an image or click to select"
          )}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? (
          <span className="flex justify-center items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l4-4-4-4v4a12 12 0 00-12 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Upload & Analyze"
        )}
      </button>

      {error && (
        <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
      )}

      {results && (
        <div
          className={`transition-opacity duration-500 ${
            showResults ? "animate-fade-in" : "animate-fade-out"
          }`}
        >
          <ResultsDisplay imageKey={imageKey} results={results} />
        </div>



      )}

      {results && (
  <div className="mt-4">
    <button
      onClick={handleDownload}
      className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
    >
      Download Results as .txt
    </button>
  </div>
)}

    </>
  );
}

export default FileUpload;
