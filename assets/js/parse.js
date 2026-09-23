// 生成された文章を【タイトル案】【目次】【冒頭】に分ける。
// ストリーミング中の書きかけの文章にも毎回かける前提。

export function parseDraft(t) {
  const re = /【\s*(タイトル案|目次|冒頭)\s*】/g;
  const marks = [];
  let m;
  while ((m = re.exec(t)) !== null) marks.push({ key: m[1], mark: m.index, start: m.index + m[0].length });
  const out = { titles: [], toc: [], body: "" };
  marks.forEach((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].mark : t.length;
    // 書きかけの見出し（「【冒」など）は次の節の頭なので、ここでは捨てる
    const chunk = t.slice(mk.start, end).replace(/【[^】\n]*$/, "").trim();
    if (mk.key === "タイトル案") out.titles = lines(chunk).map(l => splitPipe(l.replace(/^\s*\d+\s*[.．、)）]\s*/, "")));
    else if (mk.key === "目次") out.toc = lines(chunk).map(splitChapter);
    else out.body = chunk;
  });
  return out;
}

function lines(s) {
  return s.split("\n").map(l => l.trim()).filter(Boolean);
}

export function splitPipe(line) {
  const parts = line.split(/[｜|]/);
  return { head: (parts[0] || "").trim(), memo: parts.slice(1).join("｜").trim() };
}

function splitChapter(line) {
  const p = splitPipe(line);
  const m = p.head.match(/^(第\s*[0-9０-９一二三四五六七八九十]+\s*章)[\s　:：]*(.*)$/);
  return m ? { no: m[1].replace(/\s/g, ""), title: m[2].trim(), memo: p.memo }
           : { no: "", title: p.head, memo: p.memo };
}
