// 原稿の生成。
// apiEndpoint があれば中継サーバーへ、なければ見本の文章を流す。
import { buildPrompt } from "./prompt.js";
import { demoDraft } from "./demo.js";

const cfg = window.KOTAETE_CONFIG || {};

export const isDemo = () => !cfg.apiEndpoint;

/**
 * @param {{questions:any[], output:any, answers:Object}} data
 * @param {{onText:(full:string)=>void, signal?:AbortSignal}} opt
 * @returns {Promise<{text:string, truncated:boolean}>}
 */
export async function generate(data, opt) {
  if (isDemo()) return streamDemo(demoDraft(data.questions, data.answers), opt);

  // 中継サーバーへは「答え」だけを送る。プロンプトは中継サーバー側で組み立てる
  // （ブラウザから任意の文章をAIに渡せないようにするため）。
  const res = await fetch(cfg.apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
    body: JSON.stringify({ answers: pickAnswers(data.questions, data.answers) }),
    signal: opt.signal
  });
  if (!res.ok || !res.body) {
    const err = new Error("http " + res.status);
    err.code = res.status === 429 ? "rate_limited" : "upstream_error";
    throw err;
  }
  return readSSE(res.body, opt.onText);
}

// ローカル確認用：組み立てたプロンプトを見られるようにしておく
export function previewPrompt(data) {
  return buildPrompt(data.questions, data.output, data.answers);
}

function pickAnswers(questions, answers) {
  const out = {};
  for (const q of questions) {
    const v = String(answers[q.id] ?? "").trim();
    if (v) out[q.id] = v.slice(0, 2000);
  }
  return out;
}

// Anthropic Messages API のストリーム形式（content_block_delta）と、
// 簡易形式（data: {"text":"..."}）のどちらでも読めるようにしておく。
async function readSSE(body, onText) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "", text = "", truncated = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let ev;
      try { ev = JSON.parse(payload); } catch { continue; }
      if (ev.type === "error" || ev.error) {
        const err = new Error("stream error");
        err.code = (ev.error && ev.error.type) === "rate_limit_error" ? "rate_limited" : "upstream_error";
        err.text = text;
        throw err;
      }
      const piece = ev.type === "content_block_delta" ? ev.delta?.text : ev.text;
      if (piece) { text += piece; onText(text); }
      if (ev.type === "message_delta" && ev.delta?.stop_reason === "max_tokens") truncated = true;
    }
  }
  if (!text.trim()) { const e = new Error("empty"); e.code = "empty_completion"; throw e; }
  return { text, truncated };
}

function streamDemo(full, opt) {
  return new Promise((resolve, reject) => {
    let i = 0;
    const wait = setTimeout(tick, 900);
    function tick() {
      if (opt.signal?.aborted) { const e = new Error("cancelled"); e.code = "cancelled"; return reject(e); }
      i = Math.min(full.length, i + 3 + Math.floor(Math.random() * 5));
      opt.onText(full.slice(0, i));
      if (i >= full.length) return resolve({ text: full, truncated: false });
      setTimeout(tick, 22);
    }
    opt.signal?.addEventListener("abort", () => clearTimeout(wait));
  });
}
