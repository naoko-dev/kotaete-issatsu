# こたえて、一冊

質問に答えていくと、本の「タイトル案・目次・冒頭原稿」ができあがるサイトです。
GLO（ゴールドライフオンライン）の読者向け。企画の背景は [docs/HANDOFF-kotaete-issatsu.md](docs/HANDOFF-kotaete-issatsu.md) を参照。

ビルド不要の静的サイトです（HTML / CSS / JavaScript のみ）。GitHub Pages にそのまま置けます。

## ファイル構成

```
index.html              入口・質問・結果の3画面（1ページで切り替え）
assets/css/style.css    デザインのすべて
assets/js/config.js     ★公開前に書き換える設定（AI中継のURL・GA4・相談窓口）
assets/js/app.js        画面の進行
assets/js/mosaic.js     入口の背景で流れる紙もの（原稿用紙・表紙・質問カードなど）
assets/js/api.js        原稿の生成（中継サーバーへの接続／見本モード）
assets/js/prompt.js     生成プロンプトの組み立て（中継サーバー側でも同じものを使う）
assets/js/parse.js      生成結果を【タイトル案】【目次】【冒頭】に分ける
assets/js/demo.js       AIにつなぐ前の見本の文章
assets/js/analytics.js  GA4 のイベント計測
data/questions.json     設問（上司が確定したJSONに差し替える）
prototype/              Claudeアーティファクト版の試作（設問エディタはこちら）
```

## 手元で見る

JavaScript のモジュールを使っているので、ファイルを直接開くのではなく簡易サーバー経由で開きます。

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```

`config.js` の `apiEndpoint` が空のあいだは **見本モード** で動きます。AIは呼ばず、答えを少し差し込んだ見本の文章を流します（画面にも「見本です」と表示）。

## 設問を差し替える

1. 試作版（`prototype/`）の「設問をつくる」で編集し、「設定を書き出す」でJSONを出す
2. その内容で `data/questions.json` を上書きする

形式は試作版と同じです（`questions[]` と `output`）。

## デザインの方針

- 生成りの地（`#F6F4EF`）に、朱（`#E24A12`）の1色。強調は朱だけで行う
- 見出しは極太ゴシック（Zen Kaku Gothic New 900）、生成された原稿と「本」まわりだけ明朝（Shippori Mincho）
- 入口の背景は、原稿用紙・本の表紙・古い写真・質問カード・便箋などの「紙もの」が、列ごとに違う速さでゆっくり上へ流れる
- タイトル案は3冊の本の表紙として、縦書きで見せる
- 高齢の方向けに、本文17px・選択肢18px、押せる場所は大きく。`prefers-reduced-motion` では動きを止める

## AI中継サーバーとの約束（Cloudflare Workers で実装予定）

ブラウザからは **答えだけ** を送ります。プロンプトは中継サーバー側で組み立てます（任意の文章をAIに流されないようにするため）。

```
POST {apiEndpoint}
Content-Type: application/json

{ "answers": { "q1": "自分史・回想録", "q3": "40代で始めた喫茶店のこと", ... } }
```

- 返答は `text/event-stream`。Anthropic Messages API のストリームをそのまま中継すればよい
  （`content_block_delta` の `delta.text` を読みます。簡易形式 `data: {"text":"..."}` でも可）
- 混雑・回数制限のときは HTTP 429 を返すと「混み合っています」と表示
- 中継サーバーは `data/questions.json` と `assets/js/prompt.js` の `buildPrompt()` を使ってプロンプトを作る

## GLO の記事ページへの埋め込み

```html
<iframe id="kotaete" src="https://（公開先）/" style="width:100%;border:0;height:900px" loading="lazy" title="こたえて、一冊"></iframe>
<script>
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "kotaete:height") {
      document.getElementById("kotaete").style.height = e.data.height + "px";
    }
  });
</script>
```

埋め込まれているときは、ヘッダーやスマホの下部ボタンの固定表示を自動で外します。

## GA4 で送るイベント

| イベント | いつ | パラメータ |
|---|---|---|
| `kotaete_start` | はじめるを押した | `place`（hero / header / bottom） |
| `kotaete_question_view` | 質問を表示した | `question_no`, `question_id` |
| `kotaete_complete` | 最後の質問に答えた | `questions` |
| `kotaete_generated` | 原稿ができあがった | `demo` |
| `kotaete_generate_error` | 生成に失敗した | `reason` |
| `kotaete_download` | テキストで保存した | |
| `kotaete_regenerate` | もう一度つくる | |
| `kotaete_consult_click` | 出版の相談をする | |

完了率 ＝ `kotaete_complete` ÷ `question_view(question_no=1)`、離脱した質問番号は `question_view` の `question_no` 別の数で見られます。
