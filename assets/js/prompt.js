// 生成プロンプトの組み立て。
// 中継サーバー（Workers）側でも同じ関数を使えるよう、DOMに依存しない形にしてある。

export function buildPrompt(questions, output, answers) {
  const lines = [
    "あなたは自費出版社の熟練した編集者です。本を書きたいけれど書き出せずにいる方から、次のように聞き取りました。",
    ""
  ];
  let tone = "";
  for (const q of questions) {
    const a = String(answers[q.id] ?? "").trim();
    lines.push("■ " + (q.text || "（質問）") + "\n　" + (a || "（お答えなし）"));
    if (/語り口|文体|調子/.test(q.text || "")) tone = a;
  }
  lines.push("");
  lines.push("この方の本の「タイトル案」「目次」「冒頭原稿」を作ってください。");
  lines.push("");
  lines.push("【守ること】");
  lines.push("・見出しは【タイトル案】【目次】【冒頭】の3つだけを、この順で使う。前置きも後書きも書かない。");
  lines.push("・【タイトル案】は3案。1行ずつ「1. タイトル ｜ ひとことの説明」の形で書く。");
  lines.push("・【目次】は" + output.chapters + "章。1行ずつ「第1章　章タイトル ｜ その章に書くこと（40字程度）」の形で書く。");
  lines.push("・【冒頭】は第1章の書き出しを" + output.openingChars + "字程度。");
  if (tone) lines.push("・文体は「" + tone + "」。");
  if (output.extra) lines.push(output.extra);
  return lines.join("\n");
}
