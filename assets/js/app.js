import { mountMosaic } from "./mosaic.js";
import { parseDraft } from "./parse.js";
import { generate, isDemo } from "./api.js";
import { initAnalytics, track } from "./analytics.js";

const cfg = window.KOTAETE_CONFIG || {};
const $ = (id) => document.getElementById(id);

// 設問ファイルが読めなかったときの控え（data/questions.json と同じ内容）
const FALLBACK = {
  questions: [
    { id: "q1", text: "どんな本を書きたいですか。", hint: "いちばん近いものを、ひとつ選んでください。", type: "choice", required: true, choices: ["自分史・回想録", "エッセイ・日々の暮らし", "小説・物語", "家族に残す記録", "趣味や仕事で培ったこと"], example: "" },
    { id: "q2", text: "その本を、誰に読んでほしいですか。", hint: "読む人が決まると、文章の調子が決まります。", type: "choice", required: true, choices: ["子どもや孫、家族に", "同じ経験をした人に", "広く、たくさんの読者に", "まだ決めていない"], example: "" },
    { id: "q3", text: "本の中心に置きたいのは、どの時期のことですか。", hint: "ひと言で構いません。", type: "line", required: true, choices: [], example: "例：40代で始めた喫茶店のこと" },
    { id: "q4", text: "その中で、いちばん心に残っている場面を教えてください。", hint: "うまく書こうとしなくて大丈夫です。3行ほどで、思い出したまま。", type: "para", required: true, choices: [], example: "例：開店して3日目、ひとりも来なかった。19時に暖簾をしまおうとしたら、近所のご婦人が2名、傘をさして入ってきた。" },
    { id: "q5", text: "そのとき、どう感じましたか。", hint: "答えなくても、先へ進めます。", type: "para", required: false, choices: [], example: "例：ありがたいより先に、これで明日も店を開けられる、と思った。" },
    { id: "q6", text: "読んだ人に、何を持ち帰ってほしいですか。", hint: "本の芯になるところです。", type: "choice", required: true, choices: ["そんな時代があったと、知ってほしい", "あなたは一人じゃない、と伝えたい", "笑って、元気になってほしい", "ただ、覚えていてほしい"], example: "" },
    { id: "q7", text: "どんな語り口がお好きですか。", hint: "文章の温度が変わります。", type: "choice", required: true, choices: ["やわらかく、語りかけるように", "淡々と、静かに", "ユーモアをまじえて", "情景をていねいに描いて"], example: "" },
    { id: "q8", text: "お名前、またはペンネームは。", hint: "表紙に入るお名前です。あとで変えられます。", type: "line", required: false, choices: [], example: "例：小田野 直子" }
  ],
  output: { chapters: 6, openingChars: 1000, extra: "" }
};

let data = FALLBACK;
let answers = {};
let idx = 0;
let lastText = "";
let controller = null;

// ---------------------------------------------------------------- 起動
if (window.parent !== window) document.documentElement.classList.add("embedded");
initAnalytics();
mountMosaic($("mosaic"));
loadQuestions();
setupReveal();
setupHeader();
reportHeight();

async function loadQuestions() {
  try {
    const res = await fetch(cfg.questionsUrl || "data/questions.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    if (Array.isArray(json.questions) && json.questions.length) data = json;
  } catch { /* 控えの設問で動かす */ }
  const n = data.questions.length;
  document.querySelectorAll(".badge").forEach(b => { b.lastChild.textContent = `約10分・${n}つの質問に答えるだけ`; });
}

document.querySelectorAll("[data-start]").forEach((b, i) => {
  b.addEventListener("click", () => {
    track("kotaete_start", { place: b.closest(".site-head") ? "header" : b.closest(".cta-block") ? "bottom" : "hero" });
    startFlow();
  });
});

// ---------------------------------------------------------------- 画面切り替え
function show(view) {
  for (const id of ["landing", "flow", "result"]) $(id).hidden = id !== view;
  document.querySelector(".site-head [data-start]").hidden = view !== "landing";
  window.scrollTo(0, 0);
  reportHeight();
}

function startFlow() {
  answers = {};
  idx = 0;
  $("qTotal").textContent = data.questions.length;
  $("flowSteps").innerHTML = data.questions.map(() => "<li></li>").join("");
  show("flow");
  renderQuestion(1);
}

// ---------------------------------------------------------------- 質問
function renderQuestion(dir) {
  const q = data.questions[idx];
  const n = data.questions.length;

  $("qNum").textContent = idx + 1;
  $("qLabel").textContent = "質問 " + (idx + 1);
  $("qText").textContent = q.text || "";
  $("qHint").textContent = q.hint || "";
  $("qHint").hidden = !q.hint;
  $("qOptional").hidden = !!q.required || q.type === "choice";
  [...$("flowSteps").children].forEach((li, i) => {
    li.className = i < idx ? "done" : i === idx ? "now" : "";
  });

  $("backBtn").textContent = idx === 0 ? "入口にもどる" : "もどる";
  $("nextBtn").firstChild.textContent = idx === n - 1 ? "原稿をつくる" : "次へ";

  const ch = $("choices");
  const fw = $("freewrap");
  ch.innerHTML = "";
  fw.innerHTML = "";
  ch.hidden = q.type !== "choice";
  fw.hidden = q.type === "choice";

  if (q.type === "choice") {
    ch.setAttribute("aria-labelledby", "qText");
    q.choices.forEach((opt) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", answers[q.id] === opt ? "true" : "false");
      b.innerHTML = '<span class="dot"><svg viewBox="0 0 16 16"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg></span><span class="tx"></span>';
      b.querySelector(".tx").textContent = opt;
      b.addEventListener("click", () => {
        answers[q.id] = opt;
        [...ch.children].forEach(el => el.setAttribute("aria-checked", "false"));
        b.setAttribute("aria-checked", "true");
        updateNext();
      });
      ch.appendChild(b);
    });
  } else {
    const el = document.createElement(q.type === "para" ? "textarea" : "input");
    if (q.type !== "para") el.type = "text";
    el.id = "ans-" + q.id;
    el.setAttribute("aria-labelledby", "qText");
    el.placeholder = q.example || "";
    el.value = answers[q.id] || "";
    el.maxLength = 2000;
    fw.appendChild(el);
    let count = null;
    if (q.type === "para") {
      count = document.createElement("p");
      count.className = "char-count";
      fw.appendChild(count);
    }
    const sync = () => {
      answers[q.id] = el.value;
      if (count) count.textContent = el.value.length ? el.value.length + "字" : "";
      updateNext();
    };
    el.addEventListener("input", sync);
    if (q.type !== "para") el.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); $("nextBtn").click(); } });
    sync();
  }

  const card = $("qcard");
  card.classList.remove("enter", "enter-back");
  void card.offsetWidth;
  card.classList.add(dir < 0 ? "enter-back" : "enter");

  updateNext();
  track("kotaete_question_view", { question_no: idx + 1, question_id: q.id });
  reportHeight();
}

function updateNext() {
  const q = data.questions[idx];
  const v = String(answers[q.id] ?? "").trim();
  $("nextBtn").disabled = !!q.required && !v;
}

$("qcard").addEventListener("submit", (e) => e.preventDefault());

$("nextBtn").addEventListener("click", () => {
  if ($("nextBtn").disabled) return;
  if (idx < data.questions.length - 1) {
    idx++;
    window.scrollTo({ top: 0 });
    renderQuestion(1);
  } else {
    track("kotaete_complete", { questions: data.questions.length });
    show("result");
    runGenerate();
  }
});

$("backBtn").addEventListener("click", () => {
  if (idx === 0) { show("landing"); return; }
  idx--;
  window.scrollTo({ top: 0 });
  renderQuestion(-1);
});

// ---------------------------------------------------------------- 生成
const COVER_COLORS = ["--cloth-1", "--cloth-3", "--cloth-2"];

function authorName() {
  const q = data.questions.find(q => /名前|ペンネーム/.test(q.text || ""));
  return q ? String(answers[q.id] ?? "").trim() : "";
}

function render(text) {
  const d = parseDraft(text);

  if (d.titles.length) {
    $("secTitles").hidden = false;
    const ul = $("titlesList");
    const au = authorName();
    d.titles.slice(0, 3).forEach((t, i) => {
      let li = ul.children[i];
      if (!li) {
        li = document.createElement("li");
        li.className = "cover";
        li.innerHTML = `<div class="cover-face" style="--c:var(${COVER_COLORS[i % 3]})"><span class="ct"></span><span class="ca"></span><span class="num">No.${i + 1}</span></div><p class="cover-memo"><b></b><span></span></p>`;
        ul.appendChild(li);
      }
      setVertical(li.querySelector(".ct"), t.head);
      li.querySelector(".ca").textContent = au;
      li.querySelector(".cover-memo b").textContent = t.head;
      li.querySelector(".cover-memo span").textContent = t.memo;
    });
  }

  if (d.toc.length) {
    $("secToc").hidden = false;
    const ol = $("tocList");
    d.toc.forEach((c, i) => {
      let li = ol.children[i];
      if (!li) {
        li = document.createElement("li");
        li.innerHTML = '<span class="no"></span><span class="ti"></span><span class="memo"></span>';
        ol.appendChild(li);
      }
      li.querySelector(".no").textContent = c.no;
      li.querySelector(".ti").textContent = c.title;
      li.querySelector(".memo").textContent = c.memo;
    });
    while (ol.children.length > d.toc.length) ol.lastChild.remove();
  }

  if (d.body) {
    $("secBody").hidden = false;
    $("bodyText").textContent = d.body;
  }
}

// 縦書きの中の数字は、縦中横で1字ぶんに収める
function setVertical(el, text) {
  el.textContent = "";
  text.split(/(\d{1,3})/).forEach((part, i) => {
    if (!part) return;
    if (i % 2) { const s = document.createElement("i"); s.className = "tcy"; s.textContent = part; el.appendChild(s); }
    else el.appendChild(document.createTextNode(part));
  });
}

function setStatus(msg, busy) {
  $("status").hidden = !msg;
  $("statusText").textContent = msg || "";
  $("status").querySelector(".pen-dots").style.display = busy ? "" : "none";
}

function setHead(done) {
  $("resultEyebrow").textContent = done ? "YOUR BOOK" : "WRITING";
  $("resultTitle").innerHTML = done ? "あなたの本の、<em>はじまり</em>です。" : "あなたの本を、<em>書いています。</em>";
}

async function runGenerate() {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;

  ["secTitles", "secToc", "secBody", "genErr", "resultActions", "consult"].forEach(id => { $(id).hidden = true; });
  $("titlesList").innerHTML = "";
  $("tocList").innerHTML = "";
  $("bodyText").textContent = "";
  $("demoNote").hidden = !isDemo();
  lastText = "";
  setHead(false);
  setStatus("いただいたお話を読んでいます", true);

  try {
    const res = await generate({ questions: data.questions, output: data.output, answers }, {
      signal,
      onText: (full) => { setStatus("書いています", true); lastText = full; render(full); }
    });
    if (signal.aborted) return;
    lastText = res.text;
    render(res.text);
    setStatus("", false);
    setHead(true);
    if (res.truncated) showErr("長くなったため、途中で止まりました。「もう一度つくる」で書き直せます。");
    track("kotaete_generated", { demo: isDemo() });
  } catch (e) {
    if (e?.code === "cancelled" || signal.aborted) return;
    setStatus("", false);
    const code = e?.code || "upstream_error";
    track("kotaete_generate_error", { reason: code });
    if (code === "rate_limited") showErr("ただいま混み合っています。少し時間をおいて、「もう一度つくる」を押してください。");
    else if (code === "empty_completion") showErr("うまく書けませんでした。「最初からやり直す」で、書く質問にもう少し書き足してみてください。");
    else {
      if (e?.text) { lastText = e.text; render(e.text); }
      showErr("通信がうまくいきませんでした。「もう一度つくる」を押してください。");
    }
  }
  $("resultActions").hidden = false;
  $("saveBtn").hidden = !lastText;
  $("consult").hidden = !lastText;
  reportHeight();
}

function showErr(msg) {
  $("genErr").textContent = msg;
  $("genErr").hidden = false;
}

$("regenBtn").addEventListener("click", () => { track("kotaete_regenerate"); window.scrollTo({ top: 0 }); runGenerate(); });
$("restartBtn").addEventListener("click", () => { controller?.abort(); show("landing"); });

$("vertBtn").addEventListener("click", () => {
  const on = $("vertBtn").getAttribute("aria-pressed") !== "true";
  $("vertBtn").setAttribute("aria-pressed", String(on));
  $("vertBtn").textContent = on ? "横書きで読む" : "縦書きで読む";
  $("manuscript").classList.toggle("vert", on);
  reportHeight();
});

$("consultBtn").href = cfg.consultUrl || "#";
$("consultBtn").target = "_top";
$("consultBtn").addEventListener("click", () => track("kotaete_consult_click"));

// ---------------------------------------------------------------- 保存
$("saveBtn").addEventListener("click", () => {
  const d = parseDraft(lastText);
  const out = ["こたえて、一冊　構成案", "作成日：" + new Date().toLocaleDateString("ja-JP"), ""];
  if (d.titles.length) {
    out.push("■ タイトル案");
    d.titles.forEach((t, i) => out.push(`${i + 1}. ${t.head}${t.memo ? "　― " + t.memo : ""}`));
    out.push("");
  }
  if (d.toc.length) {
    out.push("■ 目次");
    d.toc.forEach(c => out.push(`${c.no}　${c.title}${c.memo ? "\n　　" + c.memo : ""}`));
    out.push("");
  }
  if (d.body) out.push("■ 冒頭の原稿", "", d.body, "");
  if (!d.titles.length && !d.toc.length && !d.body) out.push(lastText, "");
  out.push("――――――――――――", "聞き取りの記録");
  data.questions.forEach(q => out.push(`・${q.text}\n　${String(answers[q.id] ?? "").trim() || "（お答えなし）"}`));

  const blob = new Blob(["﻿" + out.join("\n")], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "こたえて一冊_構成案.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  track("kotaete_download");
});

// ---------------------------------------------------------------- 演出・埋め込み
function setupReveal() {
  const els = document.querySelectorAll(".step, .sample-copy, .sample-paper, .promise, .cta-block");
  els.forEach(el => el.classList.add("reveal"));
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -12% 0px" });
  els.forEach(el => io.observe(el));
}

function setupHeader() {
  const head = document.querySelector(".site-head");
  const onScroll = () => head.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// GLO の記事ページに iframe で埋め込んだとき、親ページに高さを知らせる。
// 親ページ側では message を受けて iframe の height を合わせる（README 参照）。
function reportHeight() {
  if (window.parent === window) return;
  requestAnimationFrame(() => {
    window.parent.postMessage({ type: "kotaete:height", height: document.documentElement.scrollHeight }, "*");
  });
}
if (window.parent !== window && "ResizeObserver" in window) {
  new ResizeObserver(() => reportHeight()).observe(document.body);
}
