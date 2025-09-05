import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ImageGenerator() {
  const { t } = useTranslation();

  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [steps, setSteps] = useState(20);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [cfg, setCfg] = useState(7);
  const [seed, setSeed] = useState(""); // empty = random
  const [useBackendProxy, setUseBackendProxy] = useState(
    (import.meta.env.VITE_USE_BACKEND_PROXY || "false").toString() === "true"
  );
  const [apiBase, setApiBase] = useState(
    import.meta.env.VITE_SD_API_BASE || "/sdapi"
  );

  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const [imgBase64, setImgBase64] = useState(null);
  const [error, setError] = useState(null);

  const canGenerate = useMemo(
    () => prompt.trim().length > 0 && !loading,
    [prompt, loading]
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setImgBase64(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = {
        prompt: prompt.trim(),
        negative_prompt: negative.trim(),
        steps: Number(steps),
        width: Number(width),
        height: Number(height),
        cfg_scale: Number(cfg),
        seed: seed === "" ? -1 : Number(seed),
      };

      let res;
      if (useBackendProxy) {
        res = await fetch(`/api/generate-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: payload.prompt,
            negative_prompt: payload.negative_prompt,
            steps: payload.steps,
            width: payload.width,
            height: payload.height,
            cfg_scale: payload.cfg_scale,
            seed: seed === "" ? undefined : Number(seed),
          }),
          signal: controller.signal,
        });
      } else {
        const url = `${apiBase.replace(/\/$/, "")}/sdapi/v1/txt2img`;
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      }

      if (!res.ok) {
        // throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        throw new Error(t("connectionError"));
      }

      const data = await res.json();

      const base64 = useBackendProxy
        ? data?.imageBase64
        : data?.images?.[0];

      if (!base64) throw new Error(t("noImageReturnedCheckServerLogs"));

      setImgBase64(base64);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message || t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imgBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imgBase64}`;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `sd-image-${ts}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-semibold">{t("TextToImage")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <label className="block">
            <span className="text-sm font-medium">{t("prompt")}</span>
            <textarea
              className="mt-1 w-full rounded-2xl border p-3 focus:outline-none focus:ring"
              rows={4}
              placeholder="Blue-Eyes White Dragon yugioh card illustration, fantasy art, highly detailed"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">{t("negativePrompt")} ({t("optional")})</span>
            <textarea
              className="mt-1 w-full rounded-2xl border p-3 focus:outline-none focus:ring"
              rows={2}
              placeholder="blurry, low quality, watermark"
              value={negative}
              onChange={(e) => setNegative(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">{t("steps")}</span>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-2"
                min={1}
                max={50}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-sm">{t("width")}</span>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-2"
                min={256}
                step={64}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-sm">{t("height")}</span>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-2"
                min={256}
                step={64}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="text-sm">{t("cfg")}</span>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-2"
                min={1}
                max={15}
                step={0.5}
                value={cfg}
                onChange={(e) => setCfg(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="block md:col-span-2">
              <span className="text-sm">{t("seedBlankRandom")}</span>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border p-2"
                placeholder={t("leaveEmptyForRandom")}
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </label>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="use-backend"
                type="checkbox"
                className="h-4 w-4"
                checked={useBackendProxy}
                onChange={(e) => setUseBackendProxy(e.target.checked)}
                disabled
              />
              <label htmlFor="use-backend" className="text-sm">
                {t("use")} backend proxy (/api/generate-image)
              </label>
            </div>

            {!useBackendProxy && (
              <label className="block md:col-span-2">
                <span className="text-sm">{t("sdApiBase")}</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border p-2"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  placeholder="/sdapi"
                  disabled
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`rounded-2xl px-4 py-2 font-medium shadow ${
                canGenerate
                  ? "bg-black text-white hover:opacity-90"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? t("generating") + "..." : t("generate")}
            </button>
            {imgBase64 && (
              <button
                onClick={handleDownload}
                className="rounded-2xl px-4 py-2 font-medium shadow border"
              >
                {t("download")} PNG
              </button>
            )}
            {loading && (
              <button
                onClick={() => abortRef.current?.abort()}
                className="rounded-2xl px-4 py-2 font-medium shadow border"
              >
                {t("cancel")}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-3 sticky top-4">
            <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gray-50 flex items-center justify-center">
              {imgBase64 ? (
                <img
                  src={`data:image/png;base64,${imgBase64}`}
                  alt="Generated"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-sm text-gray-500 p-6 text-center">
                  {loading ? t("renderingImage") : t("yourImageWillAppearHere")}
                </div>
              )}
            </div>
            {/* <p className="mt-3 text-xs text-gray-500">
              Tip: If calling Automatic1111 directly from a hosted frontend (Netlify), CORS will block.
              Use the backend proxy mode to keep keys/services private and avoid CORS.
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}