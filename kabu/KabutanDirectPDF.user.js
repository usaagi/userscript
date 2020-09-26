// ==UserScript==
// @name        株探ダイレクトPDF
// @description 株探内のPDFを従来のように直接表示します。
// @namespace   usaagi
// @include     https://kabutan.jp/stock/news?code=*
// @include     https://kabutan.jp/stock/news/?code=*
// @include     https://kabutan.jp/disclosures/*
// @run-at      document-end
// @version     0.5
// ==/UserScript==

let links = document.querySelectorAll('a[href^="https://kabutan.jp/disclosures/pdf/"]');

for (let i = 0; i < links.length; i++) {
    links[i].setAttribute('href', links[i].getAttribute('href').replace('/kabutan.jp/disclosures/pdf/', '/pdf.kabutan.jp/tdnet/data/').replace(/\/$/, '.pdf'));
}

// pdf iframeページでリダイレクトする方式
// @include     http://kabutan.jp/disclosures/pdf/*/*/
// @run-at      document-start
/*
location.replace(location.href.replace('/kabutan.jp/disclosures/pdf/', '/pdf.kabutan.jp/tdnet/data/').replace(/\/$/, '.pdf'));
*/
