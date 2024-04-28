// ==UserScript==
// @name        株探決算タイトル強調
// @description 株探の決算速報ページの決算タイトルを強調表示します。
// @namespace   usaagi
// @match       https://kabutan.jp/news/
// @run-at      document-end
// @version     0.1
// ==/UserScript==

'use strict'

const highlightStrings = {
    '最高益': {color: 'green', weight: 'bold'},
    '上方修正': {color: 'green'},
    '増額': {color: 'green'},
    '増配': {color: 'green'},
    '増益': {color: 'green'},
    '減益': {color: 'red'},
    '減配': {color: 'red'},
    '下方修正': {color: 'red'},
    '一転赤字': {color: 'red', weight: 'bold'},
    '赤字転落': {color: 'red', weight: 'bold'},
    '赤字拡大': {color: 'red'},
    '\\d+\\.?\\d*倍': {color: 'black', size: '1.2em', weight: 'bold'},
}

const links = document.querySelectorAll('#news_contents > table.s_news_list tr td:nth-child(4) a')

for (const link of links) {
    for (const str in highlightStrings) {
        const regex = new RegExp(str, 'g')
        if (regex.test(link.textContent)) {
            const p = highlightStrings[str]
            const styledStr = `<span style="` + (p.color ? `color:${p.color};` : '') + (p.size ? `font-size: ${p.size};` : '') + (p.weight ? `font-weight: ${p.weight};` : '') + `">$&</span>`
            link.innerHTML = link.innerHTML.replace(regex, styledStr)
        }
    }
}
