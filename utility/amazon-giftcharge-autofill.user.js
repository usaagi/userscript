// ==UserScript==
// @name        amazonギフト券チャージページで自動で15円に設定する。
// @description 
// @namespace   usaagi
// @include     https://www.amazon.co.jp/gp/gc/create/*
// @version     1.0
// @run-at      document-end
// ==/UserScript==

'use strict';

const form = document.getElementById("gc-asv-manual-reload-amount")

setTimeout(() => {
    form.value = '15'    
    form.click() // 機能しない?
}, 1000)
    
        
