// ==UserScript==
// @name        株ツールバー
// @description 株関連サイトで便利なリンクをページ下部に表示します。
// @namespace   usagi2
// @include     https://stocks.finance.yahoo.co.jp/stocks/*/?code=*
// @include     https://textream.yahoo.co.jp/message/*/*
// @include     https://kabutan.jp/stock/*?code=*
// @include     https://kabutan.jp/news/?b=*
// @include     http://karauri.net/*/*
// @include     http://www.nikkei.com/markets/company/*?scode=*
// @include     http://www.morningstar.co.jp/StockInfo/info/*/*
// @include     http://shikiho.jp/tk/stock/info/*
// @include     http://www.ullet.com/*.html
// @version     0.7.1
// @run-at      document-end
// @downloadURL https://raw.githubusercontent.com/usagi2/userscript/master/kabu/KabutanDirectPDF.user.js
// ==/UserScript==

(function () {
'use strict';

const STYLE = 'padding: 5px; width: 100%; text-align: center; font-size: 14px;'

/**
 ツールバーを表示させるサイト
 (\d{4}) で銘柄コードを取得する
 頻度の高いサイトを最初に配置するとよし
 ※ ここにサイトを追加したら @include にも追加すること
 urlの指定方法:
  URLの . や ? などはエスケープすること。正規表現リテラルは / も。 前方後方一致の ^$ は必要に応じて指定
  例 http://sample.com/4565 の場合
  正規表現リテラル:   /http:\/\/sample\.com/(\d{4})/           / をエスケープするのでかなり見辛い
  文字列:             "http://sample\\.com/(\\d{4})"            \d などは \\d とすること
  テンプレート文字列: String.raw`http://sample\.com/(\d{4})`   最小限のエスケープで済む (必ず String.raw`` で囲む)
*/
const SITES = [
  {	// yahoo ファイナンス
    url: String.raw`https://stocks\.finance\.yahoo\.co\.jp/stocks/.*/\?code=(\d{4})`,
  },
  {   // yahoo textrem
    url: String.raw`https://textream\.yahoo\.co\.jp/message/\d+/(\d{4})(/|/.*)?$`,
  //    xpath: '//title',
  },
  {   // 株探
    url: String.raw`https://kabutan\.jp/stock/.*\?code=(\d{4})`,
  },
  {
    // 株探 > 決算速報からのリンクを通常の決算ページにリダイレクト (決算速報だとperなどが表示されないので)
    url: String.raw`^https://kabutan\.jp/news/\?b=(k[\d]*)$`,
    xpath: '//title',
    redirect: 'https://kabutan.jp/stock/news?code={code}&b={$1}'
  },
  {   // 空売り.net
    url: String.raw`http://karauri.net/(\d{4})/`,
  },
  {   // 日経
    url: String.raw`http://www\.nikkei\.com/markets/company/.*\?scode=(\d{4})`,
  },
  {   // モーニングスター
    url: String.raw`http://www\.morningstar\.co\.jp/StockInfo/info/.*/(\d{4})/`,
  },
  {   // 四季報
    url: String.raw`http://shikiho\.jp/tk/stock/info/(\d{4})`,
  },
  {   // 決算プロ
    url: String.raw`http://ke\.kabupro\.jp/xbrl/(\d{4})\.htm`,
  },
  {   // ullet
    url: String.raw`http://www\.ullet\.com/(\d{4})\.html`,
  },

  // TODO: 楽天証券 SBI証券 の追加
];


// ツールバーに表示させるサイト
const LINKS = [
  /*
  [ 'タイトル', 'URL ({code} が銘柄コードに置換)' ],
  [ '', '' ],
  */
  // 有名なとこ
  [ 'Y!',       'https://stocks.finance.yahoo.co.jp/stocks/detail/?code={code}' ],
  [ '掲示板',   'http://messages.yahoo.co.jp/?action=q&board={code}' ],
  [ '株探',     'https://kabutan.jp/stock/news?code={code}' ],
  // 業績・コンセンサス系
  [ 'IFIS',     'http://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report&bcode={code}' ],
  [ 'iMarket',  'http://tyn-imarket.com/stocks/search?query={code}' ], // NOTE: 過去数年分の四半期の業績が見れる
  [ 'Ullet',    'http://www.ullet.com/{code}.html' ],
  // 需給
  [ '空売り',   'http://karauri.net/{code}/' ],
  [ 'FISCO',    'https://web.fisco.jp/FiscoPFApl/CompanyTopWeb?brndCd=0{code}00' ],
  [ '株テク',   'http://www.kabutec.jp/company/fs_{code}.html' ],
  // 大株主
  [ 'EDINET',   'https://disclosure.edinet-fsa.go.jp/E01EW/BLMainController.jsp?uji.verb=W1E63010CXW1E6A010DSPSch&uji.bean=ee.bean.parent.EECommonSearchBean&TID=W1E63011&PID=W1E63010&SESSIONKEY=1436004792327&lgKbn=2&pkbn=0&skbn=0&dskb=&dflg=0&iflg=0&preId=1&row=100&idx=0&syoruiKanriNo=&mul={code}&fls=on&lpr=on&oth=on&cal=1&era=H&yer=&mon=&pfs=4' ],
  [ '株主プロ', 'http://www.kabupro.jp/code/{code}.htm' ],
  [ '大量保有', 'https://maonline.jp/shareholding_reports?utf8=%E2%9C%93&query%5Bfildate_gteq%5D=&query%5Bfildate_lteq%5D=&query%5Bisname_or_issyokencode_or_company_edname_or_company_cpname_cont%5D={code}&query%5Bcompany_edgyosyucode_in%5D%5B%5D=&query%5Bholdingname_or_holdingcode_cont%5D=' ],
  [ '有報速報', 'https://toushi.kankei.me/c/{code}' ],
  [ '決算プロ', 'http://ke.kabupro.jp/xbrl/{code}.htm' ],
  [ 'Mstar',    'http://portal.morningstarjp.com/StockInfo/info/index/{code}' ], // 指標
   // http://www.morningstar.co.jp/StockInfo/info/fund/{code}', // ファンド組入
  [ 'ロイター', 'http://jp.reuters.com/investing/quotes/detail?symbol={code}.T' ], // 業界平均perなど
  // 無効化中
  /*
  {
    title: 'ニュース(みんかぶ)',
    url: 'http://minkabu.jp/stock/{code}/news',
  },
  {
    // 直感型企業分析システム ValuationMatrix (更新されてない)
    title: '企業分析',
    url: 'http://valuationmatrix.com/companies/{code}',
  },
  */
  // TODO: 日証金の速報系
];


// 銘柄コードの取得
function getCode(siteinfo)
{
  let matches;

  if (siteinfo.xpath) {
    console.log('xpath:' + siteinfo.xpath);
    let result = document.evaluate(siteinfo.xpath, document, null, XPathResult.STRING_TYPE, null);
    if (result.stringValue) {
      console.log(result.stringValue);
      matches = /\d{4}/.exec(result.stringValue);
      console.log(matches);
      if (matches) {
        return matches[0];// (\d{4}) なら [1]
      }
    }
  } else {
    const reg = siteinfo.url instanceof RegExp ? siteinfo.url : new RegExp(siteinfo.url);

    matches = location.href.match(reg);

    for (let i = 1; i <= matches.length; i++) {
     if (/^\d{4}$/.test(matches[i])) {
         return matches[i];
     }
    }
  }

  return null;
}

function run(siteinfo)
{
  let code = getCode(siteinfo);

  if (!code) {
    console.error("銘柄コードが取得できない");
    return;
  }

  console.log('code: ' + code);

  if (siteinfo.redirect) {
    console.log('redirect');
    location.href = get_redirect_url(siteinfo, code);
  }

  let showLinks = [];
  for (let link of LINKS) {
    if (!link[0] || !link[1]) {
      continue;
    }

    if (link[1].indexOf(location.hostname) !== -1) {
      continue;
    }

    let url = replaceCode(link[1], code)
    showLinks.push(`<a href="${url}" target="_blank">${link[0]}</a>`);
  }

  let div = document.createElement('div');
  div.innerHTML = showLinks.join(' | ');
  div.setAttribute('style', STYLE);

  // 上部に表示させるには insertBefore 下部は appendChild
  document.body.appendChild(div, document.body.firstChild);
}


function get_redirect_url(siteinfo, code) {
  let matches = location.href.match(typeof siteinfo.url === 'object' ? siteinfo.url : new RegExp(siteinfo.url));
  let url = replaceCode(siteinfo.redirect, code);

  for (let i = 1; i <= matches.length; i++) {
    url = url.replace('{$' + i + '}', matches[i]);
  }

  return url;
}

function replaceCode(str, code) {
  return str.replace('{code}', code);
}

console.info(`株ツールバー: ${location.href}`);

for (let site of SITES) {
  if ((typeof site.url === 'string' && new RegExp(site.url).test(location.href))
    || (site.url instanceof RegExp && site.url.test(location.href))
    ) {
    console.log(`${site.url} と一致`);
    run(site);
    break;
  }
}


})();
