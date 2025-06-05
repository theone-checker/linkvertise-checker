import React, { useState } from "react";

export default function Home() {
  // Minimum word counts for validation
  const MIN_TITLE_WORDS = 3;
  const MIN_SHORT_TITLE_WORDS = 2;
  const MIN_DESCRIPTION_WORDS = 10;

  // Forbidden policy-violation keywords (must match backend exactly)
  const forbiddenKeywords = [
    "crack",
    "keygen",
    "script",
    "mods",
    "cheat code",
    "cheat",
    "serial key",
    "license key",
    "activation code",
    "nulled",
    "warez",
    "hack tool",
    "cheat engine",
    "mod apk",
    "free robux",
    "free vbucks",
    "auto-clicker",
    "aimbot",
    "wallhack",
    "bypass",
    "injector",
    "exploit",
    "kill",
    "bomb",
    "terror",
    "murder",
    "massacre",
    "shooting",
    "attack plan",
    "hate speech",
    "racist",
    "nazi",
    "islamophobia",
    "anti-lgbt",
    "free money",
    "get rich quick",
    "earn $1000/day",
    "bitcoin giveaway",
    "claim prize",
    "click here to win",
    "survey bypass",
    "no human verification",
    "link unlocker",
    "fake generator",
    "password stealer",
    "leaked data",
    "database dump",
    "private info",
    "password list",
    "credit card dump",
    "ssn",
    "id scan",
  ];

  const [shortTitle, setShortTitle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resultShortTitle, setResultShortTitle] = useState("");
  const [resultTitle, setResultTitle] = useState("");
  const [resultDescription, setResultDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<"short" | "title" | "desc" | "">("");

  const WORKER_URL = "https://rewriteapi.snuggest-thunder.workers.dev/";

  // Count words by splitting on whitespace and filtering out empty strings
  const countWords = (text: string) =>
    text.trim().split(/\s+/).filter((w) => w).length;

  // Find all forbidden keywords present in text (case-insensitive)
  function findForbidden(text: string) {
    const lower = text.toLowerCase();
    return forbiddenKeywords.filter((kw) => lower.includes(kw));
  }

  function parseResult(resString: string) {
    // Expecting:
    // Short Title: ...
    // Title: ...
    // Description: ...
    const shortMatch = resString.match(/Short Title:\s*(.*)/);
    const titleMatch = resString.match(/Title:\s*(.*)/);
    const descMatch = resString.match(/Description:\s*([\s\S]*)/);

    setResultShortTitle(shortMatch ? shortMatch[1].trim() : "");
    setResultTitle(titleMatch ? titleMatch[1].trim() : "");
    setResultDescription(descMatch ? descMatch[1].trim() : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultShortTitle("");
    setResultTitle("");
    setResultDescription("");
    setCopiedField("");

    // Client-side policy violation checks, in the order: shortTitle → title → description
    const violShort = findForbidden(shortTitle);
    if (violShort.length) {
      setError(
        `Policy violation in Short Title: forbidden keyword(s) ${violShort
          .map((w) => `"${w}"`)
          .join(", ")}.`
      );
      return;
    }
    const violTitle = findForbidden(title);
    if (violTitle.length) {
      setError(
        `Policy violation in Title: forbidden keyword(s) ${violTitle
          .map((w) => `"${w}"`)
          .join(", ")}.`
      );
      return;
    }
    const violDesc = findForbidden(description);
    if (violDesc.length) {
      setError(
        `Policy violation in Description: forbidden keyword(s) ${violDesc
          .map((w) => `"${w}"`)
          .join(", ")}.`
      );
      return;
    }

    // Word-count validation (shortTitle → title → description)
    if (countWords(shortTitle) < MIN_SHORT_TITLE_WORDS) {
      setError(`Short title must be at least ${MIN_SHORT_TITLE_WORDS} words.`);
      return;
    }
    if (countWords(title) < MIN_TITLE_WORDS) {
      setError(`Title must be at least ${MIN_TITLE_WORDS} words.`);
      return;
    }
    if (countWords(description) < MIN_DESCRIPTION_WORDS) {
      setError(
        `Description must be at least ${MIN_DESCRIPTION_WORDS} words.`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortTitle, title, description }),
      });

      if (!res.ok) {
        // Attempt to parse JSON error from backend
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        if (data.error) {
          setError(data.error);
        } else {
          setError(`Error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      const data = await res.json();
      if (typeof data.result === "string") {
        parseResult(data.result);
      } else {
        setError("Unexpected format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Network error, please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, field: "short" | "title" | "desc") {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-orange-600 to-black">
      <div className="bg-gray-900 bg-opacity-95 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-800">
        {/* Linkvertise Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="https://linkvertise.com/assets/img/linkvertise_logo_big.svg"
            alt="Linkvertise Logo"
            className="h-10"
          />
        </div>

        <h1 className="text-2xl font-extrabold text-orange-400 mb-6 text-center tracking-tight">
          Linkvertise Checker ⚙️
        </h1>
        <p className="text-xl text-white mb-6 text-center tracking-tight">
          Made with love by Theone ❤️
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Short Title Field (first) */}
          <div>
            <label
              htmlFor="shortTitle"
              className="block text-orange-300 font-semibold mb-1"
            >
              Short Title
            </label>
            <input
              id="shortTitle"
              type="text"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              placeholder="Enter a short title"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Minimum {MIN_SHORT_TITLE_WORDS} words.
            </p>
          </div>

          {/* Title Field (second) */}
          <div>
            <label
              htmlFor="title"
              className="block text-orange-300 font-semibold mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your link title"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Minimum {MIN_TITLE_WORDS} words.
            </p>
          </div>

          {/* Description Field (third) */}
          <div>
            <label
              htmlFor="description"
              className="block text-orange-300 font-semibold mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your link description"
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm resize-none"
            ></textarea>
            <p className="mt-1 text-xs text-gray-400">
              Minimum {MIN_DESCRIPTION_WORDS} words.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-black font-bold py-2 rounded-lg shadow hover:bg-orange-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Check & Rewrite"}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 font-semibold mt-2 text-center text-sm">
              {error}
            </p>
          )}
        </form>

        {/* Result Boxes */}
        {(resultShortTitle || resultTitle || resultDescription) && (
          <div className="mt-6 space-y-3">
            {/* Short Title Result Box */}
            {resultShortTitle && (
              <div className="relative bg-gray-800 border border-orange-500 rounded-lg p-3">
                <button
                  onClick={() => handleCopy(resultShortTitle, "short")}
                  className="absolute top-2 right-2 text-gray-400 hover:text-orange-300 focus:outline-none"
                  aria-label="Copy Short Title"
                >
                  {/* Copy Icon (clipboard) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h8m-8-4h8m-8-4h8m-4 12h4a2 2 0 002-2V7a2 2 0 00-2-2h-4m-4 0H6a2 2 0 00-2 2v9a2 2 0 002 2h4"
                    />
                  </svg>
                </button>
                <h2 className="text-base font-semibold text-orange-400 mb-1">
                  Rewritten Short Title
                </h2>
                <p className="text-white text-sm">{resultShortTitle}</p>
                {copiedField === "short" && (
                  <span className="text-orange-300 text-xs mt-1 block">
                    Copied!
                  </span>
                )}
              </div>
            )}

            {/* Title Result Box */}
            {resultTitle && (
              <div className="relative bg-gray-800 border border-orange-500 rounded-lg p-3">
                <button
                  onClick={() => handleCopy(resultTitle, "title")}
                  className="absolute top-2 right-2 text-gray-400 hover:text-orange-300 focus:outline-none"
                  aria-label="Copy Title"
                >
                  {/* Copy Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h8m-8-4h8m-8-4h8m-4 12h4a2 2 0 002-2V7a2 2 0 00-2-2h-4m-4 0H6a2 2 0 00-2 2v9a2 2 0 002 2h4"
                    />
                  </svg>
                </button>
                <h2 className="text-base font-semibold text-orange-400 mb-1">
                  Rewritten Title
                </h2>
                <p className="text-white text-sm">{resultTitle}</p>
                {copiedField === "title" && (
                  <span className="text-orange-300 text-xs mt-1 block">
                    Copied!
                  </span>
                )}
              </div>
            )}

            {/* Description Result Box */}
            {resultDescription && (
              <div className="relative bg-gray-800 border border-orange-500 rounded-lg p-3">
                <button
                  onClick={() => handleCopy(resultDescription, "desc")}
                  className="absolute top-2 right-2 text-gray-400 hover:text-orange-300 focus:outline-none"
                  aria-label="Copy Description"
                >
                  {/* Copy Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h8m-8-4h8m-8-4h8m-4 12h4a2 2 0 002-2V7a2 2 0 00-2-2h-4m-4 0H6a2 2 0 00-2 2v9a2 2 0 002 2h4"
                    />
                  </svg>
                </button>
                <h2 className="text-base font-semibold text-orange-400 mb-1">
                  Rewritten Description
                </h2>
                <p className="text-white text-sm whitespace-pre-wrap">
                  {resultDescription}
                </p>
                {copiedField === "desc" && (
                  <span className="text-orange-300 text-xs mt-1 block">
                    Copied!
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
