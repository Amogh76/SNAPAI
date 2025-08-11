import React from "react";

interface Props {
  imageKey: string;
  results: {
    Labels?: { Name: string; Confidence: number }[];
    Celebrities?: string[];
    Faces?: string[];
  };
}

function ResultsDisplay({ imageKey, results }: Props) {
  const sortedLabels = results.Labels
    ? [...results.Labels].sort((a, b) => b.Confidence - a.Confidence)
    : [];

  const faceEmojiMap: Record<string, string> = {
    "Smiling": "😄",
    "Has beard": "🧔",
    "Has mustache": "👨‍🦰",
    "Wearing glasses": "👓",
  };

  const labelIconMap: Record<string, string> = {
    "Person": "🧍",
    "Face": "🙂",
    "Beard": "🧔",
    "Glasses": "👓",
    "Smile": "😄",
    "Orange": "🍊",
    "Food": "🍽️",
    "Fruit": "🍎",
    "Produce": "🥕",
  };

  const parseFaceAttribute = (attr: string) => {
    const match = attr.match(/^(.*?)( \(\d+\.\d+%\))?$/);
    if (!match) return attr;
    const [_, base, confidence] = match;
    const emoji = faceEmojiMap[base.trim()] || "🙂";
    return `${emoji} ${base}${confidence || ""}`;
  };

  // 🧠 Extract filename and fallback to original imageKey
  const getDisplayName = (key: string): string => {
    try {
      const fileName = key.split("/").pop() || key;
      const base = fileName.replace(/\.[^/.]+$/, ""); // strip .jpg, .png etc.
      return base;
    } catch {
      return key;
    }
  };

  const displayName = getDisplayName(imageKey);

  return (
    <div className="mt-6 transition-opacity duration-700 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
        Results for:{" "}
        <span className="text-blue-700">
          📄 <code>{displayName}</code>
        </span>
      </h2>

      {/* Labels */}
      <div className="mb-6">
        <p className="font-semibold text-gray-700 mb-2">
          Labels (sorted by confidence):
        </p>
        <ul className="space-y-2">
          {sortedLabels.length > 0 ? (
            sortedLabels.map((label, idx) => {
              const icon = labelIconMap[label.Name] || "🔍";
              const confidence = Math.round(label.Confidence);
              const color =
                confidence >= 80
                  ? "bg-green-600"
                  : confidence >= 50
                  ? "bg-yellow-600"
                  : "bg-red-600";

              return (
                <li key={idx} className="transition transform hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-sm shadow-sm ${color}`}
                      title={`Confidence: ${confidence}%`}
                    >
                      {icon} {label.Name}
                    </span>
                    <div className="flex-1 bg-gray-200 h-2 rounded">
                      <div
                        className={`${color} h-2 rounded transition-all duration-500`}
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right">
                      {confidence}%
                    </span>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-gray-500">No labels found</li>
          )}
        </ul>
      </div>

      {/* Celebrities */}
      {results.Celebrities && results.Celebrities.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Celebrities:</p>
          <ul className="flex flex-wrap gap-2">
            {results.Celebrities.map((celeb, idx) => (
              <li key={idx}>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm shadow-sm">
                  🌟 {celeb}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Faces */}
      {results.Faces && results.Faces.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Face Attributes:</p>
          <div className="flex flex-wrap gap-2">
            {results.Faces.map((attr, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-sm shadow-sm"
              >
                {parseFaceAttribute(attr)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
