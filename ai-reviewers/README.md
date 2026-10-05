# AI小説の講評AI

GLOのAI小説を、社内の人の目線で読んでフィードバックしてくれるAIたちの置き場です。
1人につき1フォルダ。中身はどの人も同じ形です。

```
ai-reviewers/
  takeuchi-san/
    instructions.md       指示書（人物像・判断基準・話し方・返答の形）
    feedback-history.md   本人の過去コメント（原文）。判断のよりどころ
  kouseisha/
    instructions.md       校正者AIの指示書（点検項目・数字の照合・返答の形）
    settei-hyo-template.md  作品ごとの設定表のひな形。校正者AIが照合する「正解」
.claude/agents/
  takeuchi-san-ai.md      Claude Code から呼び出すための入口
  kouseisha-ai.md
```

| 名前 | 立場 | フォルダ |
|---|---|---|
| 竹内さんAI | 上司（AI小説の編集責任者） | `takeuchi-san/` |
| 校正者AI | 連載小説の校正者（つながり・設定の矛盾・数字の照合） | `kouseisha/` |

## 使い方

### A. Claude（claude.ai）の「プロジェクト」で使う ― いちばん手軽

1. claude.ai で新しいプロジェクトを作る（名前：竹内さんAI）
2. 「指示（カスタム指示）」に `takeuchi-san/instructions.md` の中身を全文貼り付ける
3. 「ナレッジ」に `takeuchi-san/feedback-history.md` を追加する
4. そのプロジェクトのチャットに原稿を貼るか添付して、「講評してください」と頼む

### B. Claude Code で使う

このリポジトリを開いた Claude Code で、

> 竹内さんAIに `原稿/第4弾.md` を講評してもらって

のように頼むと、`takeuchi-san-ai` が指示書と過去コメントを読んでから原稿を講評します。

### 校正者AIをプロジェクトで使う

1. 新しいプロジェクトを作る（名前：校正者AI）
2. 「指示」に `kouseisha/instructions.md` の中身を全文貼り付ける
3. 「コンテキスト」に、作品ごとの **設定表**（`settei-hyo-template.md` を埋めたもの）と、**確定した各回の原稿** を追加する
4. チャットに点検したい回の原稿を貼り、「第◯回を校正してください（最終回ではない）」と頼む
5. 1話確定するたびに、設定表を書き足し、確定原稿をコンテキストに追加する

## 育て方

- 竹内さんから新しいフィードバックをもらったら、`feedback-history.md` の末尾に**原文のまま**追記する（作品名と日付を添える）。
- そこから新しい判断基準が読み取れたら、`instructions.md` の「2. 物差し」に1項目足す。
- プロジェクト（A）で使っている場合は、貼り付けた指示とナレッジも差し替える。

## 2人目を追加するとき

1. `takeuchi-san/` をフォルダごとコピーして、新しい名前にする（例：`yamada-san/`）
2. `feedback-history.md` をその人のコメントに置き換える
3. `instructions.md` の人物像・物差し・話し方を、その人のコメントから書き直す
4. `.claude/agents/takeuchi-san-ai.md` をコピーして名前とパスを変える
5. 上の表に1行足す
