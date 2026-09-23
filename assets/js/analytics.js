// GA4 の計測。測定IDが空なら何もしない。
const cfg = window.KOTAETE_CONFIG || {};

export function initAnalytics() {
  if (!cfg.ga4Id) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", cfg.ga4Id, { page_referrer: document.referrer || undefined });
}

// 送るイベント
//   kotaete_start          はじめるを押した（place: どのボタンか）
//   kotaete_question_view  質問を表示した（question_no, question_id）
//   kotaete_complete       最後の質問に答え、生成を始めた
//   kotaete_generated      原稿ができあがった（demo: 見本かどうか）
//   kotaete_generate_error 生成に失敗した（reason）
//   kotaete_download       テキストで保存した
//   kotaete_regenerate     もう一度つくる
//   kotaete_consult_click  出版の相談をする
export function track(name, params = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, params);
}
