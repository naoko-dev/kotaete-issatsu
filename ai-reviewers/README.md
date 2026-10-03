# AI小説の講評AI

GLOのAI小説を、社内の人の目線で読んでフィードバックしてくれるAIたちの置き場です。
1人につき1フォルダ。中身はどの人も同じ形です。

```
ai-reviewers/
  takeuchi-san/
    instructions.md       指示書（人物像・判断基準・話し方・返答の形）
    feedback-history.md   本人の過去コメント（原文）。判断のよりどころ
.claude/agents/
  takeuchi-san-ai.md      Claude Code から呼び出すための入口
```

| 名前 | 立場 | フォルダ |
|---|---|---|
| 竹内さんAI | 上司（AI小説の編集責任者） | `takeuchi-san/` |
| （2人目） | | |

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
