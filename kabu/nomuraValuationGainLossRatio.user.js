// ==UserScript==
// @name        野村證券 評価損益率
// @description 野村證券の信用取引返済注文画面に評価損益率を追加します。
// @namespace   usaagi
// @match       https://hometrade.nomura.co.jp/web/rmfTrdStkMgnLstSeparateAction.do
// @match       https://hometrade.nomura.co.jp/web/rmfTrdStkMgnLstSummaryAction.do
// @run-at      document-end
// @version     0.1
// ==/UserScript==


const page = document.querySelector('#tiles\\.RmfTrdStkMgnLstSeparate') ?? document.querySelector('#rmfTrdStkMgnLstWebDto')

if (!page) {
    return
}

const totalTable = page.querySelector('table > tbody') ?? document.querySelector('table > tbody')

const totalPositionAmountElm = totalTable.querySelector('tr:nth-of-type(1) td.txt-num');
const valuationGainLossPositionElm = totalTable.querySelector('tr:nth-of-type(2) td.txt-num span');

if (totalPositionAmountElm && valuationGainLossPositionElm) {
    const totalPositionAmount = convertToNumber(totalPositionAmountElm.textContent)
    const valuationGainLossPosition = convertToNumber(valuationGainLossPositionElm.textContent)
    let valuationGainLossRatio = (valuationGainLossPosition / totalPositionAmount)
    valuationGainLossRatio = (valuationGainLossRatio * 100).toFixed(2)

    const tr = document.createElement('tr')
    const th = document.createElement('th')
    th.textContent = '評価損益率'
    th.setAttribute('scope', 'row')
    th.classList.add('ttl-row')
    const td = document.createElement('td')
    td.classList.add('txt-num')
    const span = document.createElement('span')
    const sign = valuationGainLossRatio >= 0 ? '+' : ''
    span.className = valuationGainLossRatio >= 0 ? 'up' : 'down'
    span.textContent = `${sign}${valuationGainLossRatio}%`

    td.appendChild(span)
    tr.appendChild(th)
    tr.appendChild(td)
    totalTable.appendChild(tr)
}

const rows = page.querySelectorAll('div.js-disp-range1 > table > tbody > tr')
console.log(`rows: ${rows.length}`)

rows.forEach(row => {
    const seventhCell = row.querySelector('td:nth-child(7)') // row.cells[6]
    const ninthCell = row.querySelector('td:nth-child(9)') // row.cells[8]

    if (!seventhCell || !ninthCell) {
        return
    }
    const costPriceElm = seventhCell.querySelector('p:nth-child(1)') // 平均建単価 or 建単価 なので data-titleでは指定しない
    const currentValueElm = seventhCell.querySelector('p:nth-child(2)')
    if (!costPriceElm || !currentValueElm) {
        console.log(`建単価と現在値が取得できない ${costPriceElm} ${currentValueElm}`)
        return
    }

    const costPrice = convertToNumber(costPriceElm.textContent)
    const currentValue = convertToNumber(currentValueElm.textContent)
    let valuationGainLossRatio = (currentValue - costPrice) / costPrice * 100
    valuationGainLossRatio = Math.round(valuationGainLossRatio * 100) / 100

    const br = document.createElement('br')
    ninthCell.appendChild(br);

    const p = document.createElement('span')
    const sign = valuationGainLossRatio >= 0 ? '+' : ''
    p.className = valuationGainLossRatio >= 0 ? 'up' : 'down'
    p.textContent = `${sign}${valuationGainLossRatio}%`
    ninthCell.appendChild(p)
})

function convertStringToNumber(stringWithCommas) {
    return parseFloat(stringWithCommas.replace(/,/g, ''))
}

function convertToNumber(str) {
    str = str.replace(/,/g, '')

    let sign = 1
    if (str[0] === '+') {
        str = str.slice(1)
    } else if (str[0] === '-') {
        sign = -1
        str = str.slice(1)
    }
    const num = parseFloat(str);
    return num * sign;
}
