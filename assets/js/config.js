/*
 * サイトの設定。公開前にここだけ書き換えます。
 *
 * apiEndpoint : AI中継サーバー（Cloudflare Workers）のURL。
 *               空のあいだは「見本の文章」で動きます（AIは呼びません）。
 * ga4Id       : GA4 の測定ID（G-XXXXXXX）。空なら計測しません。
 *               GLOの記事ページに iframe で埋め込む場合も、この中で計測します。
 * consultUrl  : 「出版の相談をする」ボタンの行き先。
 * questionsUrl: 設問ファイルの場所。上司が確定した JSON に差し替えます。
 */
window.KOTAETE_CONFIG = {
  apiEndpoint: "",
  ga4Id: "",
  consultUrl: "#",
  questionsUrl: "data/questions.json"
};
