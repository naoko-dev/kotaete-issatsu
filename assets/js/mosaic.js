// ヒーロー背景の「流れるモザイク」。
// 写真の代わりに、本ができるまでの紙もの（原稿用紙・表紙・質問カード・便箋…）を並べ、
// 列ごとに違う速さでゆっくり上へ流す。

const T = (s) => s.replace(/\d+/g, (d) => `<i class="tcy">${d}</i>`);

const photo = (sky, sea, land, cap) => `
  <div class="tile t-photo" style="--h:${200 + Math.round(Math.random() * 40)}px">
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="g${cap.length}${sky.slice(1)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="#EDE3CF"/></linearGradient></defs>
      <rect width="200" height="150" fill="url(#g${cap.length}${sky.slice(1)})"/>
      <path d="M0 92 Q50 84 100 90 T200 88 V150 H0z" fill="${sea}"/>
      <path d="M0 112 Q40 98 78 106 Q120 116 150 100 Q178 90 200 96 V150 H0z" fill="${land}"/>
      <circle cx="148" cy="40" r="11" fill="#F4E9CF" opacity=".85"/>
      <g fill="#3B332B" opacity=".75"><rect x="58" y="94" width="3" height="11" rx="1.5"/><circle cx="59.5" cy="91.5" r="2.4"/>
      <rect x="66" y="96" width="2.4" height="9" rx="1.2"/><circle cx="67.2" cy="94" r="2"/></g>
      <rect width="200" height="150" fill="#8A6A3C" opacity=".12"/>
    </svg>
    <span class="cap">${T(cap)}</span>
  </div>`;

const cover = (title, author, c, h) => `
  <div class="tile t-cover" style="--c:var(${c});--h:${h}px">
    <span class="v">${title}</span><span class="rule"></span><span class="au">${author}</span>
  </div>`;

const genko = (text, h) => `
  <div class="tile t-genko" style="--h:${h}px"><p>${T(text)}</p></div>`;

const qcard = (n, q, opts, on) => `
  <div class="tile t-q"><span class="l">質問 ${n}</span><span class="qq">${q}</span>
    ${opts.map((o, i) => `<span class="o${i === on ? " on" : ""}">${o}</span>`).join("")}</div>`;

const qans = (n, q, a) => `
  <div class="tile t-q"><span class="l">質問 ${n}</span><span class="qq">${q}</span><span class="ans">${a}</span></div>`;

const toc = (rows) => `
  <div class="tile t-toc"><div class="h">目次</div>
    ${rows.map((r, i) => `<div class="r"><b>第${i + 1}章</b>${r}</div>`).join("")}</div>`;

const letter = (text, h) => `
  <div class="tile t-letter" style="--h:${h}px"><p>${text}</p></div>`;

const pen = (h) => `
  <div class="tile t-pen" style="--h:${h}px">
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
      <g transform="rotate(-38 100 100)">
        <rect x="40" y="90" width="92" height="20" rx="10" fill="#15120F"/>
        <rect x="40" y="90" width="92" height="7" rx="3.5" fill="#fff" opacity=".08"/>
        <rect x="108" y="89" width="7" height="22" fill="#C9A45C"/>
        <rect x="50" y="86" width="44" height="4" rx="2" fill="#C9A45C"/>
        <path d="M132 92 L156 97 Q164 100 156 103 L132 108z" fill="#2A2420"/>
        <path d="M150 96 L176 100 L150 104z" fill="#D8B870"/>
        <path d="M156 100 H174" stroke="#8A6A2E" stroke-width=".8"/>
      </g>
      <path d="M28 170 C60 160 70 176 98 166 S140 158 170 168" fill="none" stroke="#E9D7A8" stroke-width="1.2" opacity=".5"/>
    </svg>
  </div>`;

const COLUMNS = [
  { dur: 92, delay: -20, tiles: [
    cover("海のみえる坂道", "森 しづ子", "--cloth-1", 290),
    qcard(1, "どんな本を書きたいですか。", ["自分史・回想録", "エッセイ・日々の暮らし", "家族に残す記録"], 0),
    genko("母の手は、いつも少しだけ冷たかった。", 300),
    photo("#C9D6D8", "#8FA7AA", "#B59E7A", "1978年 夏"),
    letter("拝啓<br>お変わりありませんか。<br>こちらはようやく、<br>梅が咲きました。", 210)
  ]},
  { dur: 118, delay: -64, tiles: [
    genko("19時に暖簾をしまおうとしたら、", 330),
    cover("喫茶 あかり", "小田野 直子", "--cloth-3", 270),
    toc(["雨の日の、2名さま", "40歳の、はじめて", "常連さんという家族", "閉める日のこと"]),
    pen(190),
    qans(4, "いちばん心に残っている場面は。", "開店して3日目、ひとりも来なかった――")
  ]},
  { dur: 100, delay: -38, tiles: [
    photo("#D9CDB6", "#A8B4A2", "#8E7858", "1964年 春"),
    qcard(7, "どんな語り口がお好きですか。", ["やわらかく、語りかけるように", "淡々と、静かに"], 0),
    cover("父の工具箱", "田村 公一", "--cloth-2", 300),
    genko("あの年の冬は、雪がよく降った。", 280),
    letter("おばあちゃんへ<br>本、ぜんぶ読みました。<br>知らないことばかりで、<br>泣いてしまいました。", 220)
  ]},
  { dur: 130, delay: -80, tiles: [
    qcard(2, "誰に読んでほしいですか。", ["子どもや孫、家族に", "同じ経験をした人に"], 0),
    cover("台所の窓から", "早川 はる", "--cloth-4", 260),
    photo("#E1D3BA", "#C6B18E", "#9C7F58", "1985年 秋"),
    genko("結婚して2年目の春、", 260),
    cover("旅の途中で", "三好 誠", "--cloth-5", 290)
  ]}
];

export function mountMosaic(el) {
  if (!el) return;
  el.innerHTML = COLUMNS.map(col => {
    const html = col.tiles.join("");
    // 同じ並びを2回つなげて、切れ目なくループさせる
    return `<div class="m-col"><div class="m-track" style="--dur:${col.dur}s;--delay:${col.delay}s">${html}${html}</div></div>`;
  }).join("");
}
