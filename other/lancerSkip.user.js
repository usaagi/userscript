// ==UserScript==
// @name        lancerSkip
// @description ランサーズ旧検索画面で変なクッションページを飛ばす
// @namespace   usagi2
// @include     https://www.lancers.jp/work/detail/*?proposeReferer=search.result
// @run-at      document-start
// @downloadURL https://raw.githubusercontent.com/usagi2/userscript/master/other/lancerSkip.user.js
// @version     0.1
// ==/UserScript==

location.replace(location.href.replace('?proposeReferer=search.result', '?purpose=lancer'));
