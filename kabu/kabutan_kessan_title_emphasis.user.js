// ==UserScript==
// @name        株探決算タイトル強調
// @description 株探の決算速報ページの決算タイトルを強調表示します。
// @namespace   usaagi
// @match       https://kabutan.jp/news/
// @match       https://kabutan.jp/news/?page=*
// @run-at      document-end
// @version     0.2
// ==/UserScript==

'use strict'

const highlightStrings = {
    // positive
    '増額': {color: 'green'},
    '増配': {color: 'green'},
    '増益': {color: 'green'},
    '超過': {color: 'green'},
    '最高益': {color: 'green', weight: 'bold'},
    '上方修正': {color: 'green'},
    '\\d+\\.?\\d*倍': {color: 'black', size: '1.2em', weight: 'bold'},
    // negative
    '減益': {color: 'red'},
    '減配': {color: 'red'},
    '下方修正': {color: 'red'},
    '一転赤字': {color: 'red', weight: 'bold'},
    '赤字転落': {color: 'red', weight: 'bold'},
    '赤字拡大': {color: 'red'},
    '無配転落': {color: 'red'},
}

const createStyle = (p) => {
    let style = ''
    if (p.color) {
        style += `color:${p.color};`
    }
    if (p.size) {
        style += `font-size:${p.size};`
    }
    if (p.weight) {
        style += `font-weight:${p.weight};`
    }
    return style
}

const links = document.querySelectorAll('#news_contents > table.s_news_list tr td:nth-child(4) a')

for (const link of links) {
    for (const str in highlightStrings) {
        const regex = new RegExp(str, 'g')
        if (regex.test(link.textContent)) {
            const styledStr = '<span style="' + createStyle(highlightStrings[str]) + '">$&</span>'
            link.innerHTML = link.innerHTML.replace(regex, styledStr)
        }
    }
}
