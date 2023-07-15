// ==UserScript==
// @name        株探ダイレクトPDF
// @description 株探内のPDFへのリンクを直接表示できるリンクに変換します。
// @namespace   usaagi
// @match       https://kabutan.jp/stock/news?code=*
// @match       https://kabutan.jp/stock/news/?code=*
// @match       https://kabutan.jp/disclosures/*
// @run-at      document-end
// @version     0.7
// ==/UserScript==

let links = document.querySelectorAll('a[href^="https://kabutan.jp/disclosures/pdf/"]');

for (let i = 0; i < links.length; i++) {
    links[i].setAttribute('href', links[i].getAttribute('href').replace('/kabutan.jp/disclosures/pdf/', '/tdnet-pdf.kabutan.jp/').replace(/\/$/, '.pdf'));
}
