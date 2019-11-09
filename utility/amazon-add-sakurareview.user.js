// ==UserScript==
// @name        amazonにサクラチェッカーのリンクを追加
// @description amazonにサクラチェッカーのリンクを追加する
// @namespace   usaagi
// @include     https://www.amazon.co.jp/*/dp/*
// @version     1.0
// @run-at      document-end
// ==/UserScript==

'use strict';

const elm = document.querySelector('#reviewsMedley > div > div.a-fixed-left-grid-col.a-col-left > div:nth-child(1) > h2');
const asin = document.getElementById('cerberus-data-metrics').getAttribute('data-asin')
elm.insertAdjacentHTML('beforeend', `<a href="https://sakura-checker.jp/search/${asin}/" target="_blank">🌸</a>`)
