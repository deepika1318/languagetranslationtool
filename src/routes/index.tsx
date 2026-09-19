import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  Loader2,
  Languages,
  X,
} from "lucide-react";
import { translateText } from "@/lib/translate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Polyglot — Instant Language Translator" },
      {
        name: "description",
        content:
          "Translate text between dozens of languages instantly. Type or paste text, pick a language, and get an accurate translation with copy and text-to-speech.",
      },
      { property: "og:title", content: "Polyglot — Instant Language Translator" },
      {
        property: "og:description",
        content:
          "Translate text between dozens of languages instantly with copy and text-to-speech.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TranslatorPage,
});

const LANGUAGES: { code: string; name: string; speech: string }[] = [
  { code: "auto", name: "Detect language", speech: "" },
  { code: "en", name: "English", speech: "en-US" },
  { code: "es", name: "Spanish", speech: "es-ES" },
  { code: "fr", name: "French", speech: "fr-FR" },
  { code: "de", name: "German", speech: "de-DE" },
  { code: "it", name: "Italian", speech: "it-IT" },
  { code: "pt", name: "Portuguese", speech: "pt-BR" },
  { code: "nl", name: "Dutch", speech: "nl-NL" },
  { code: "pl", name: "Polish", speech: "pl-PL" },
  { code: "ru", name: "Russian", speech: "ru-RU" },
  { code: "uk", name: "Ukrainian", speech: "uk-UA" },
  { code: "tr", name: "Turkish", speech: "tr-TR" },
  { code: "ar", name: "Arabic", speech: "ar-SA" },
  { code: "hi", name: "Hindi", speech: "hi-IN" },
  { code: "bn", name: "Bengali", speech: "bn-IN" },
  { code: "ta", name: "Tamil", speech: "ta-IN" },
  { code: "te", name: "Telugu", speech: "te-IN" },
  { code: "mr", name: "Marathi", speech: "mr-IN" },
  { code: "zh", name: "Chinese (Simplified)", speech: "zh-CN" },
  { code: "ja", name: "Japanese", speech: "ja-JP" },
  { code: "ko", name: "Korean", speech: "ko-KR" },
  { code: "vi", name: "Vietnamese", speech: "vi-VN" },
  { code: "th", name: "Thai", speech: "th-TH" },
  { code: "id", name: "Indonesian", speech: "id-ID" },
  { code: "sw", name: "Swahili", speech: "sw-KE" },
  { code: "el", name: "Greek", speech: "el-GR" },
  { code: "he", name: "Hebrew", speech: "he-IL" },
  { code: "sv", name: "Swedish", speech: "sv-SE" },
];

const MAX_CHARS = 5000;

function speechCode(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.speech || "en-US";
}

function TranslatorPage() {
  const runTranslate = useServerFn(translateText);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const doTranslate = async (text = input, src = sourceLang, tgt = targetLang) => {
    if (!text.trim()) {
      setOutput("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await runTranslate({
        data: { text, sourceLanguage: langName(src), targetLanguage: langName(tgt) },
      });
      setOutput(res.translated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const langName = (code: string) =>
    code === "auto" ? "auto" : LANGUAGES.find((l) => l.code === code)?.name ?? code;

  const swap = () => {
    if (sourceLang === "auto") return;
    const prevInput = input;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInput(output || prevInput);
    setOutput(prevInput && output ? prevInput : "");
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speak = () => {
    if (!output || speaking) return;
    const utterance = new SpeechSynthesisUtterance(output);
    utterance.lang = speechCode(targetLang);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Polyglot
            </h1>
            <p className="text-xs text-muted-foreground">
              Instant AI-powered translation
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Language bar */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={swap}
            disabled={sourceLang === "auto"}
            title="Swap languages"
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-input bg-card text-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {LANGUAGES.filter((l) => l.code !== "auto").map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Panels */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") doTranslate();
              }}
              placeholder="Enter text to translate…"
              className="min-h-56 w-full flex-1 resize-none rounded-t-xl bg-transparent p-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <div className="flex items-center gap-1">
                {input && (
                  <button
                    onClick={() => {
                      setInput("");
                      setOutput("");
                    }}
                    title="Clear"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {input.length} / {MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Output */}
          <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
            <div className="min-h-56 flex-1 overflow-y-auto rounded-t-xl p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Translating…</span>
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : output ? (
                <p className="whitespace-pre-wrap text-base text-foreground">{output}</p>
              ) : (
                <p className="text-base text-muted-foreground">
                  The translation will appear here
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 border-t border-border px-3 py-2">
              <button
                onClick={copyOutput}
                disabled={!output}
                title="Copy translation"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={speak}
                disabled={!output || speaking}
                title="Listen"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
              >
                <Volume2 className={`h-4 w-4 ${speaking ? "animate-pulse text-primary" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => doTranslate()}
          disabled={loading || !input.trim()}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Translating…
            </>
          ) : (
            "Translate"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Tip: press Ctrl+Enter (Cmd+Enter on Mac) to translate. Supports 28 languages.
        </p>
      </main>
    </div>
  );
}
