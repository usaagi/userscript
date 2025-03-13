// ==UserScript==
// @name        マネックススカウターのスクリーニング結果の銘柄コードを株探へのリンクにします
// @description マネックススカウターのスクリーニング結果の銘柄コードを株探へのリンクにします
// @namespace   usaagi
// @match       https://monex.ifis.co.jp/index.php?sa=screening*
// @run-at      document-end
// @version     1.0
// ==/UserScript==

'use strict'

const spans = document.querySelectorAll('#screening_result > div.results > div.lock_box table tr td:nth-child(2) > div:nth-child(2) > span:nth-child(1)')

spans.forEach(span => {
	// Check if the span contains the specific text
	// Create a new <a> element
	const link = document.createElement('a')
	link.href = `https://kabutan.jp/stock/news?code=${span.textContent.trim()}`
	link.textContent = span.textContent
    link.target = '_blank'

	span.parentNode.replaceChild(link, span)
})
