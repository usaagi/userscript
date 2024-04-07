// ==UserScript==
// @name        株探pts前日比
// @description 株探のptsの前日比を追加します。
// @namespace   usaagi
// @match       https://kabutan.jp/stock/*?code=*
// @run-at      document-end
// @version     0.2
// ==/UserScript==

'use strict'

const getPrice = (selecter) => {
    const element = document.querySelector(selecter)

    if (!element) {
        throw new Error(`セレクター ${selecter} がない`)
    }

    let numberString = element.textContent.replace(/[^0-9.,]/g, '')

    if (!numberString) {
        return null
    }

    numberString = numberString.replace(/,/g, '')
    return Number(numberString)
}

const currentPrice = getPrice('#stockinfo_i1 > div.si_i1_2 > span.kabuka')
const ptsPrice = getPrice('#stockinfo_i1 > div.si_i1_3 > div.kabuka2')

if (currentPrice === null || ptsPrice === null) {
    return
}

const diffPrice = ptsPrice - currentPrice

if (diffPrice === 0) {
    return
}

const ratio = ((ptsPrice - currentPrice) / currentPrice) * 100
const sign = ratio > 0 ? '+' : ''
const element = document.querySelector('#stockinfo_i1 > div.si_i1_3 > div.kabuka3')

const newRatioElement = document.createElement('span')
newRatioElement.className = ratio > 0 ? 'up' : 'down'
newRatioElement.textContent = `(${sign}${ratio.toFixed(2)}%) `
element.insertBefore(newRatioElement, element.firstChild)

/*
const newDiffElement = document.createElement('span')
newDiffElement.className = ratio > 0 ? 'up' : 'down'
newDiffElement.textContent = `${sign}${diffPrice.toFixed(currentPrice > 5000 ? 0 : 1)} `
element.insertBefore(newDiffElement, element.firstChild)
*/
