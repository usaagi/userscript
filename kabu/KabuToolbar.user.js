// ==UserScript==
// @name        株ツールバー
// @description 株関連サイトで便利なリンクを表示します。
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
// @version     0.6.7
// @run-at      document-end
// @downloadURL https://github.com/usagi2/userscript/raw/master/kabu/KabuToolbar.user.js
// ==/UserScript==

(function () {
'use strict';

/**
 * ツールバーを表示させるサイト
 * (\d{4}) で銘柄コードを取得する
 * 頻度の高いサイトを最初に配置するとよし
 * ※ ここにサイトを追加したら @include にも追加すること
 */
var SITES = [
  {	// yahoo ファイナンス
    url: /^https:\/\/stocks\.finance\.yahoo\.co\.jp\/stocks\/.*\/\?code=(\d{4})/,
  },
  {   // yahoo textrem
    url: /^https:\/\/textream\.yahoo\.co\.jp\/message\/\d+\/(\d{4})(\/|\/.*)?$/,
  //    xpath: '//title',
  },
  {   // 株探
    url: /^https:\/\/kabutan\.jp\/stock\/.*\?code=(\d{4})/,
  },
  {
    // 株探 > 決算速報からのリンクを通常の決算ページにリダイレクト (決算速報からだとperなどが表示されないので)
    url: /^https:\/\/kabutan\.jp\/news\/\?b=(k[\d]*)$/,
    xpath: '//title',
    redirect: 'https://kabutan.jp/stock/news?code={code}&b={$1}'
  },
  {   // 空売り.net
    url: /^http:\/\/karauri\.net\/(\d{4})\//, 
  },
  {   // 日経
    url: /^http:\/\/www\.nikkei\.com\/markets\/company\/.*\?scode=(\d{4})/,
  },
  {   // モーニングスター
    url: /^http:\/\/www\.morningstar\.co\.jp\/StockInfo\/info\/.*\/(\d{4})/,
  },
  {   // 四季報
    url: /^http:\/\/shikiho\.jp\/tk\/stock\/info\/(\d{4})/,
  },
  {   // 決算プロ
    url: /^http:\/\/ke\.kabupro\.jp\/xbrl\/(\d{4})\.htm/,
  },
  {   // ullet
    url: /^http:\/\/www\.ullet\.com\/(\d{4})\.html/,
  },
  
  // TODO: 楽天証券 SBI証券 の追加
];

/*
 ツールバーに表示させるサイト
*/
var LINKS = [
  /*
  {
    title: '',      // タイトル
    url: '',        // URL ({code} が銘柄コードに置換)
  },
  */
  // 有名なとこ
  {
    title: 'Yahoo!',
    url: 'https://stocks.finance.yahoo.co.jp/stocks/detail/?code={code}',
  },
  {
    title: 'ニュース(株探)',
    url: 'https://kabutan.jp/stock/news?code={code}',
  },
  // 業績・コンセンサス系
  {
    title: 'IFIS',
    url: 'http://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report&bcode={code}',
  },
  {
    // NOTE: 過去数年分の四半期の業績が見れる
    title: 'iMarket',
    url: 'http://tyn-imarket.com/stocks/search?query={code}',
  },
  {
    title: 'Ullet',
    url: 'http://www.ullet.com/{code}.html',
  },

  // 需給
  {
    title: '空売り',
    url: 'http://karauri.net/{code}/',
  },
  {
    title: 'FISCO',
    url: 'https://web.fisco.jp/FiscoPFApl/CompanyTopWeb?brndCd=0{code}00',
  },
  {
    title: '株テク',
    url: 'http://www.kabutec.jp/company/fs_{code}.html',
  },
  // 大株主
  {
    title: 'EDINET',
    url: 'https://disclosure.edinet-fsa.go.jp/E01EW/BLMainController.jsp?uji.verb=W1E63010CXW1E6A010DSPSch&uji.bean=ee.bean.parent.EECommonSearchBean&TID=W1E63011&PID=W1E63010&SESSIONKEY=1436004792327&lgKbn=2&pkbn=0&skbn=0&dskb=&dflg=0&iflg=0&preId=1&row=100&idx=0&syoruiKanriNo=&mul={code}&fls=on&lpr=on&oth=on&cal=1&era=H&yer=&mon=&pfs=4',
  },
  {
    title: '株主プロ',
    url: 'http://www.kabupro.jp/code/{code}.htm',
  },
  {   
    title: '大量保有報告書',
    url: 'https://maonline.jp/shareholding_reports?utf8=%E2%9C%93&query%5Bfildate_gteq%5D=&query%5Bfildate_lteq%5D=&query%5Bisname_or_issyokencode_or_company_edname_or_company_cpname_cont%5D={code}&query%5Bcompany_edgyosyucode_in%5D%5B%5D=&query%5Bholdingname_or_holdingcode_cont%5D=',
  },
  {
    title: '有報速報',
    url: 'https://toushi.kankei.me/c/{code}',
  },
  {
    title: '決算プロ',
    url: 'http://ke.kabupro.jp/xbrl/{code}.htm',
  },
  {
    title: 'モーニングスター',
    url: 'http://portal.morningstarjp.com/StockInfo/info/index/{code}', // 指標
    // http://www.morningstar.co.jp/StockInfo/info/fund/{code}', // ファンド組入
  },
  {
    title: 'ロイター(Per推移)',
    url: 'http://jp.reuters.com/investing/quotes/detail?symbol={code}.T',
  },
  
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

/**
* 銘柄コードの取得
* @param {object} siteinfo
* @return {string}
*/
function getCode(siteinfo)
{
  var matches;
  
  if (siteinfo.xpath) {
    console.log('xpath:' + siteinfo.xpath);
    var result = document.evaluate(siteinfo.xpath, document, null, XPathResult.STRING_TYPE, null);
    if (result.stringValue) {
      console.log(result.stringValue);
      matches = /\d{4}/.exec(result.stringValue);
      console.log(matches);
      if (matches) {
        return matches[0];// (\d{4}) なら [1]
      }
    }
  } else {
    matches = location.href.match(typeof siteinfo.url === 'object' ? siteinfo.url : new RegExp(siteinfo.url));
    
    for (var i = 1; i <= matches.length; i++) {
     if (/^\d{4}$/.test(matches[i])) {
         return matches[i];
     }
    }
  }
  
  return null;
}

function run(siteinfo)
{
  var code = getCode(siteinfo);
  
  if (!code) {
    console.log("銘柄コードが取得できない");
    return;
  }
  
  console.log('code: ' + code);
  
  if (siteinfo.redirect) {
    console.log('redirect');
    location.href = get_redirect_url(siteinfo, code);
  }
  
  var link = [];
  for (var i = 0; i < LINKS.length; i++) {
    
    if (LINKS[i].title && LINKS[i].url) {
      if (LINKS[i].url.indexOf(location.hostname) === -1) {
        link.push('<a href="' + LINKS[i].url.replace('{code}', code) + '" target="_blank">' + LINKS[i].title + '</a>');
      }
    }
  }
  
  var div = document.createElement('div');
  div.innerHTML = link.join(' | ');
  // style
  div.setAttribute('style', 'padding: 5px; width: 100%; text-align: center; font-size: 13px;');
  // 上部に表示させるには insertBefore 下部は appendChild
  document.body.appendChild(div, document.body.firstChild);
}


function get_redirect_url(siteinfo, code) {
  var matches = location.href.match(typeof siteinfo.url === 'object' ? siteinfo.url : new RegExp(siteinfo.url));
  var rurl = siteinfo.redirect.replace('{code}', code);
  
  for (var i = 1; i <= matches.length; i++) {
    rurl = rurl.replace('{$' + i + '}', matches[i]);
  }
  
  return rurl;
}


console.log('株ツールバー:' + location.href);
    
for (var i = 0; i < SITES.length; i++) {
  if ((typeof SITES[i].url === 'string' && (new RegExp(SITES[i].url)).test(location.href))
    || (typeof SITES[i].url === 'object' && SITES[i].url.test(location.href))
    ) {
    console.log(SITES[i].url + ' 一致');
    run(SITES[i]);
    break;
  }
}


})();
