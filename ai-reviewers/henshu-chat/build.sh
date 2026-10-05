#!/bin/sh
# 校正者AI・竹内さんAIの指示書を1つにまとめて instructions.md を作り直す。
# どちらかの指示書を直したら、このフォルダで `sh build.sh` を実行する。
cd "$(dirname "$0")"
{
  cat header.md
  tail -n +2 ../kouseisha/instructions.md
  printf '\n---\n\n# 第3部 竹内さんAI\n\n（以下、竹内さんAIとして答えるときの詳しい指示）\n'
  tail -n +2 ../takeuchi-san/instructions.md
} > instructions.md
