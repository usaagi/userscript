// ==UserScript==
// @name        株ツールバー
// @description 株関連サイトで便利なリンクをページ最下部に表示します。
// @namespace   usaagi
// @match       https://finance.yahoo.co.jp/quote/*
// @match       https://kabutan.jp/stock/*?code=*
// @match       https://kabutan.jp/news/?&b=*
// @match       https://karauri.net/*/*
// @match       https://www.nikkei.com/markets/company/*?scode=*
// @match       https://www.morningstar.co.jp/StockInfo/info/*/*
// @match       https://shikiho.jp/tk/stock/info/*
// @match       https://irbank.net/*
// @match       http://www.ullet.com/*.html
// @version     1.1
// @run-at      document-end
// ==/UserScript==

'use strict'

const linkNewTab = true // リンクを新規タブで開く
const prefix = '_k-' // css prefix

/*
 ツールバーを表示させるサイト
 文字列内の{code}は銘柄コードにマッチする正規表現に置き換わります。
 String.raw`https://kabutan\.jp/stock/.*\?code={code}`
 
 注意点:
 頻度の高いサイト順に配置すること
 サイトを追加したら @match にも追加すること
 urlの指定方法:
  URLの . や ? などはエスケープすること。正規表現リテラルは / も。 前方後方一致の ^$ は必要に応じて指定
  例 http://sample.com/4565 の場合
  テンプレート文字列: String.raw`http://sample\.com/{code}` 最小限のエスケープ。必ず String.raw`` で囲む
         文字列: "http://sample\\.com/{code}"          .などは\\. とすること
  正規表現リテラル: /http:\/\/sample\.com/{code}/         /をエスケープするのでかなり見辛い

 xpathを指定するとURLからではなく該当要素から銘柄コードを取り出す
*/
const executionSites = [
    {    // Y!ファイナンス
        url: String.raw`https://finance\.yahoo\.co\.jp/quote/{code}.`, // ([0-9][0-9A-Y][0-9][0-9A-Y])\.`,
    },
    {    // Y!掲示板
        url: String.raw`https://finance\.yahoo\.co\.jp/cm/message/\d+/[\d\w]+(/.*)?$`,
        xpath: '//title',
    },
    {   // 株探
        url: String.raw`https://kabutan\.jp/stock/.*\?code={code}`,
    },
    {    // 株探 > 決算速報からのリンクを通常の決算ページにリダイレクト (決算速報だとperなどが表示されないので)
        url: String.raw`^https://kabutan\.jp/news/\?&b=(k[\d]*)$`,
        xpath: '//title',
        redirect: 'https://kabutan.jp/stock/news?code={code}&b={$1}'
    },
    {   // IR Bank
        url: String.raw`https://irbank\.net/{code}/?`,
    },
    {   // 空売り.net
        url: String.raw`https://karauri\.net/{code}/`,
    },
    {   // 日経
        url: String.raw`http://www\.nikkei\.com/markets/company/.*\?scode={code}`,
    },
    {   // マネックス銘柄スカウター
        url: String.raw`https://monex\.ifis\.co\.jp/index\.php\?sa=.*&bcode=([0-9][0-9A-Y][0-9][0-9A-Y])`,
    },
    {   // モーニングスター
        url: String.raw`http://www\.morningstar\.co\.jp/StockInfo/info/.*/([0-9][0-9A-Y][0-9][0-9A-Y])/`,
    },
    {   // 四季報
        url: String.raw`http://shikiho\.jp/tk/stock/info/{code}`,
    },
    {   // 決算プロ
        url: String.raw`http://ke\.kabupro\.jp/xbrl/{code}\.htm`,
    },
    {   // ullet
        url: String.raw`http://www\.ullet\.com/{code}\.html`,
    },
    // TODO: 楽天証券 SBI証券 の追加
]

/*
 リンクバーに表示させるサイト
 {code} が銘柄コードに置き換わります。
 またアロー関数を渡すこともできます(EDINETリンクを参照)
*/
const LINKS = [
    // 有名なとこ
    {
        label: 'Y!',
        submenu: [
            { label: 'Y!ファイナンス', url: 'https://stocks.finance.yahoo.co.jp/stocks/detail/?code={code}' },
            { label: 'Yahoo掲示板', url: 'https://finance.yahoo.co.jp/cm/rd/finance/{code}' }, // http://textream.yahoo.co.jp/rd/finance/{code}
            { label: '株主優待(東証のみ)', url: 'https://finance.yahoo.co.jp/quote/{code}.T/incentive' },
        ]
    },
    { label: '日経', url: 'https://www.nikkei.com/nkd/company/?scode={code}' },
    { label: '株探', url: 'https://kabutan.jp/stock/news?code={code}' },
    { label: '決算要約', url: 'https://minkabu.jp/stock/{code}/settlement_summary' },
    // [ 'IR BANK',  'https://irbank.net/{code}' },
    {
        label: '業績・コンセンサス',
        submenu: [
            { label: 'IFIS', url: 'https://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report&bcode={code}' },
            { label: '銘柄スカウター', url: 'https://monex.ifis.co.jp/index.php?sa=report_zaimu&bcode={code}' }, // マネックス銘柄スカウター (初回ログイン必須)
            { label: 'Ullet', url: 'http://www.ullet.com/{code}.html' },
            { label: 'バフェットコード', url: 'https://www.buffett-code.com/company/{code}' },
            { label: 'StockClip', url: 'https://www.stockclip.net/companies/{code}/performance' },
        ]
    },
    {
        label: '需給',
        submenu: [
            { label: 'IR BANK 空売り', url: 'https://irbank.net/{code}/short' },
            { label: '空売り.net', url: 'https://karauri.net/{code}/' },
            { label: '大量保有', url: 'https://maonline.jp/pro/shareholding_reports?utf8=%E2%9C%93&query%5Bfildate_gteq%5D=2018-05-21&query%5Bfildate_lteq%5D=2012-01-1&query%5Bisname_or_issyokencode_or_company_iscode_start%5D={code}&query%5Bcompany_edgyosyucode_in%5D%5B%5D=&query%5Bholdingname_or_holdingcode_start%5D=' },
        ],
    },

    { label: 'FISCO', url: 'https://web.fisco.jp/FiscoPFApl/CompanyTopWeb?brndCd=0{code}00' },
    { label: '株テク', url: 'http://www.kabutec.jp/company/fs_{code}.html' },  // EBITDAとか
    // 大株主
    { label: 'EDINET', url: (code) => 'https://disclosure2.edinet-fsa.go.jp/WEEE0030.aspx?' + btoa(`mul=${code}&ctf=off&fls=on&lpr=on&rpr=on&oth=on&yer=&mon=&pfs=6&ser=1&pag=1&sor=2`) },
    { label: '株主プロ', url: 'http://www.kabupro.jp/code/{code}.htm' },
    { label: '有報速報', url: 'https://toushi.kankei.me/search/{code}' },
    { label: 'Mstar', url: 'http://portal.morningstarjp.com/StockInfo/info/index/{code}' }, // 指標
    // http://www.morningstar.co.jp/StockInfo/info/fund/{code}', // ファンド組入
    // { label: 'ロイター', url: 'https://jp.reuters.com/markets/companies/{code}.T/key-metrics/valuation' },

    // 無効化中
    /*
    { label: 'ニュース(みんかぶ)', url: 'http://minkabu.jp/stock/{code}/news' },
    { label: '企業分析', url: 'http://valuationmatrix.com/companies/{code}' },   // 直感型企業分析システム ValuationMatrix (更新されてない)
    */
    // TODO: 日証金の速報系
    // { label: '優待', url: 'https://www.invest-jp.net/yuutai/detail/{code}' },
]

const isRegex = (value) => value instanceof RegExp
const replaceMatchCodePlaceholder = (str) => {
    return str.replace('{code}', String.raw`(\d[0-9A-DF-HJ-NP-UWXY]\d[0-9A-DF-HJ-NP-UWXY])`)
}

const replaceLinkPlaceholder = (str, code) => {
    return str.replace('{code}', code)
}

// 銘柄コードの取得
const getCode = (siteinfo) => {
    if (siteinfo.xpath) {
        let result = document.evaluate(siteinfo.xpath, document, null, XPathResult.STRING_TYPE, null)

        if (result.stringValue) {
            console.log(`result xpath: ${result.stringValue}`)
            const matches = /[0-9][0-9A-Y][0-9][0-9A-Y]/.exec(result.stringValue)
            console.log(matches)

            if (matches) {
                return matches[0]// (\d{4}) なら [1]
            }
        }
    } else {
        const reg = siteinfo.url instanceof RegExp ? siteinfo.url : new RegExp(siteinfo.url)

        const matches = location.href.match(reg)

        for (let i = 1; i <= matches.length; i++) {
            if (/^[0-9][0-9A-Y][0-9][0-9A-Y]$/.test(matches[i])) {
                return matches[i]
            }
        }
    }

    return null
}


const getRedirectUrl = (siteinfo, code) => {
    const matches = location.href.match(isRegex(siteinfo.url) ? siteinfo.url : new RegExp(siteinfo.url))
    let url = replaceLinkPlaceholder(siteinfo.redirect, code)

    for (let i = 1; i <= matches.length; i++) {
        url = url.replace('{$' + i + '}', matches[i])
    }

    return url
}

const main = (siteinfo) => {
    const code = getCode(siteinfo)

    if (!code) {
        console.error('銘柄コードが取得できません')
        return
    }

    console.log(`code: ${code}`)

    if (siteinfo.redirect) {
        console.log('redirect')
        location.replace(getRedirectUrl(siteinfo, code))
        return
    }

    insertCSS(`
    .${prefix}menu-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: white;
        z-index: 1000;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        text-align: center;
        font-size: 14px;
    }

    .${prefix}menu {
        list-style: none;
        padding: 0;
        display: flex;
        justify-content: center; /* 横方向の中央揃え */
        align-items: center;     /* 縦方向の中央揃え */
        gap: 0;
    }

    .${prefix}menu li {
        position: relative;

        /* 以下縦線をいれるために必要 */
        display: inline-block;
        padding: 10px;
    }

    /* 縦線をいれるために必要 */
    .${prefix}menu li:not(:last-child)::after {
        content: '|';
        position: absolute;
        right: -5px; /* 文字の間隔を調整 */
        top: 50%;
        transform: translateY(-50%);
    }

    .${prefix}menu a {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: black;
        white-space: nowrap;
        /* padding: 10px 10px; */
        
    }
    
    /* 訪問済みリンクの色を変えない */
    .${prefix}menu a:visited {
        color: inherit;
    }

    /* ▼マークを横に表示 */
    .${prefix}dropdown-arrow {
        font-size: 12px;
        margin-left: 5px;
    }

    /* 上方向に開くドロップダウン */
    .${prefix}dropdown-menu {
        display: none;
        position: absolute;
        bottom: 100%;
        left: 0;
        list-style: none;
        padding: 0;
        background: white;
        border: 1px solid #ccc;
        text-align: left;
    }

    .${prefix}dropdown:hover .${prefix}dropdown-menu {
        display: block;
    }

    .${prefix}dropdown-menu li {
        display: block;
    }
    `)
    render(code)
}

const render = (code) => {
    const resolvedUrl = (url) => typeof url === 'function' ? url(code) : replaceLinkPlaceholder(url, code)
        // 同じドメインの項目は非表示
    const isSameHostname = (url) => url.indexOf(location.hostname) !== -1

    let showItems = []
    for (const item of LINKS) {
        if (item.url) {
            item.url = resolvedUrl(item.url)
            
            if (isSameHostname(item.url)) {
                continue
            }
        }
        
        if (item.submenu) {
            item.submenu = item.submenu
            .map(subItem => {
                subItem.url = resolvedUrl(subItem.url)
                return subItem;
            })            
            .filter(subItem => !isSameHostname(subItem.url))
        }
        console.log(`${item.label} を追加 ${item.url}, ${item.submenu}`)
        showItems.push(item)
    }

    // リンク用のコンテナを作成
    const container = document.createElement('div')
    container.classList.add(`${prefix}menu-container`)
    container.innerHTML = generateMenuHTML(showItems)
    //document.body.style.paddingBottom = '60px' // 固定リンクの高さ分だけ余白を追加
    // document.body.prepend(container)
    document.body.appendChild(container)
}

function insertCSS(css) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

function generateMenuHTML(menuItems) {
    return `
    <ul class="${prefix}menu">
      ${menuItems.map(item => `
        <li class="${item.submenu ? `${prefix}dropdown` : ''}">
          <a href="${item.url || '#'}" target="${!item.submenu && linkNewTab ? '_blank' : ''}" rel="noreferrer">
            <span>${item.label}</span>${item.submenu ? `<span class="${prefix}dropdown-arrow">▲</span>` : ''}
          </a>
          ${item.submenu ? `
            <ul class="${prefix}dropdown-menu">
              ${item.submenu.map(subItem => `
                <li><a href="${subItem.url}" target="${linkNewTab ? '_blank' : ''}" rel="noreferrer">${subItem.label}</a></li>
              `).join('')}
            </ul>
          ` : ''}
        </li>
      `).join('')}
    </ul>
    `
}


console.info(`株ツールバー: ${location.href}`)

for (const site of executionSites) {
    if (typeof site.url === 'string') {
        const url = replaceMatchCodePlaceholder(site.url)
        console.log(`new url ${url}`)
        site.url = new RegExp(url)
    }

    if (site.url.test(location.href)) {
        main(site)
        break
    }
}
