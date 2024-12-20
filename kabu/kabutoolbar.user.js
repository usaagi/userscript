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
// @version     0.9.9
// @run-at      document-end
// ==/UserScript==


'use strict';

const linkNewTab = true;

/**
 ツールバーを表示させるサイト
 (\d{4}) で銘柄コードを取得する
 頻度の高いサイト順に配置
 ※ ここにサイトを追加したら @include にも追加すること
 urlの指定方法:
  URLの . や ? などはエスケープすること。正規表現リテラルは / も。 前方後方一致の ^$ は必要に応じて指定
  例 http://sample.com/4565 の場合
  テンプレート文字列: String.raw`http://sample\.com/(\d{4})`   最小限のエスケープで済む (必ず String.raw`` で囲む)
  文字列:             "http://sample\\.com/(\\d{4})"           / のエスケープは不要だが \d などは \\d とすること
  正規表現リテラル:   /http:\/\/sample\.com/(\d{4})/           / をエスケープするのでかなり見辛い

 xpathを指定するとURLからではなく該当要素から銘柄コードを取り出す
*/
const SITES = [
	{	// yahoo ファイナンス
		url: String.raw`https://finance\.yahoo\.co\.jp/quote/([0-9][0-9A-Y][0-9][0-9A-Y])\.`,
	},
	{   // yahoo textrem
		url: String.raw`https://finance\.yahoo\.co\.jp/cm/message/\d+/[\d\w]+(/.*)?$`,
		xpath: '//title',
	},
	{   // 株探
		url: String.raw`https://kabutan\.jp/stock/.*\?code=([0-9][0-9A-Y][0-9][0-9A-Y])`,
	},
	{ // 株探 > 決算速報からのリンクを通常の決算ページにリダイレクト (決算速報だとperなどが表示されないので)
		url: String.raw`^https://kabutan\.jp/news/\?&b=(k[\d]*)$`,
		xpath: '//title',
		redirect: 'https://kabutan.jp/stock/news?code={code}&b={$1}'
	},
	{   // IR Bank
		url: String.raw`https://irbank.net/([0-9][0-9A-Y][0-9][0-9A-Y])/?`,
	},
	{   // 空売り.net
		url: String.raw`https://karauri.net/([0-9][0-9A-Y][0-9][0-9A-Y])/`,
	},
	{   // 日経
		url: String.raw`http://www\.nikkei\.com/markets/company/.*\?scode=([0-9][0-9A-Y][0-9][0-9A-Y])`,
	},
	{   // マネックス銘柄スカウター
		url: String.raw`https://monex\.ifis\.co\.jp/index\.php\?sa=.*&bcode=([0-9][0-9A-Y][0-9][0-9A-Y])`,
	},    
	{   // モーニングスター
		url: String.raw`http://www\.morningstar\.co\.jp/StockInfo/info/.*/([0-9][0-9A-Y][0-9][0-9A-Y])/`,
	},
	{   // 四季報
		url: String.raw`http://shikiho\.jp/tk/stock/info/([0-9][0-9A-Y][0-9][0-9A-Y])`,
	},
	{   // 決算プロ
		url: String.raw`http://ke\.kabupro\.jp/xbrl/([0-9][0-9A-Y][0-9][0-9A-Y])\.htm`,
	},
	{   // ullet
		url: String.raw`http://www\.ullet\.com/([0-9][0-9A-Y][0-9][0-9A-Y])\.html`,
	},
	// TODO: 楽天証券 SBI証券 の追加
];


// ツールバーに表示させるサイト
const LINKS = [
	// 有名なとこ
	[ 'Y!', 'https://stocks.finance.yahoo.co.jp/stocks/detail/?code={code}' ],
	[ 'Y板', 'https://finance.yahoo.co.jp/cm/rd/finance/{code}' ], // http://textream.yahoo.co.jp/rd/finance/{code}
	[ '日経', 'https://www.nikkei.com/nkd/company/?scode={code}' ],
	[ '株探', 'https://kabutan.jp/stock/news?code={code}' ],
	// 業績・コンセンサス系
	[ 'IFIS', 'https://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report&bcode={code}' ],
	[ 'iMarket', 'http://tyn-imarket.com/stocks/search?query={code}' ], // NOTE: 過去数年分の四半期の業績が見れる
	[ 'マSC', 'https://monex.ifis.co.jp/index.php?sa=report_zaimu&bcode={code}' ], // マネックス銘柄スカウター (初回ログイン必須)
	[ 'Ullet', 'http://www.ullet.com/{code}.html' ],
	[ 'BF', 'https://www.buffett-code.com/company/{code}' ],
	[ 'StockClip','https://www.stockclip.net/companies/{code}/performance'], 
	// [ 'IR BANK',  'https://irbank.net/{code}' ],
	// 需給
	[ '空売り', 'https://irbank.net/{code}/short'], // IR Bank
	// [ '空売り', 'https://karauri.net/{code}/' ],
	[ 'FISCO', 'https://web.fisco.jp/FiscoPFApl/CompanyTopWeb?brndCd=0{code}00' ],
	[ '株テク', 'http://www.kabutec.jp/company/fs_{code}.html' ],  // EBITDAとか
	// 大株主
	[ 'EDINET', (code) => 'https://disclosure2.edinet-fsa.go.jp/WEEE0030.aspx?' + btoa(`mul=${code}&ctf=off&fls=on&lpr=on&rpr=on&oth=on&yer=&mon=&pfs=6&ser=1&pag=1&sor=2`) ],
	[ '株主プロ', 'http://www.kabupro.jp/code/{code}.htm' ],
	[ '大量保有', 'https://maonline.jp/pro/shareholding_reports?utf8=%E2%9C%93&query%5Bfildate_gteq%5D=2018-05-21&query%5Bfildate_lteq%5D=2012-01-1&query%5Bisname_or_issyokencode_or_company_iscode_start%5D={code}&query%5Bcompany_edgyosyucode_in%5D%5B%5D=&query%5Bholdingname_or_holdingcode_start%5D=' ],
	[ '有報速報', 'https://toushi.kankei.me/search/{code}' ],
	[ 'Mstar', 'http://portal.morningstarjp.com/StockInfo/info/index/{code}' ], // 指標
	// http://www.morningstar.co.jp/StockInfo/info/fund/{code}', // ファンド組入
	[ 'ロイター', 'https://jp.reuters.com/markets/companies/{code}.T/key-metrics/valuation' ],
	
	// 無効化中
	/*
	[ 'ニュース(みんかぶ)', 'http://minkabu.jp/stock/{code}/news' ],
	[ '企業分析', 'http://valuationmatrix.com/companies/{code}' ],   // 直感型企業分析システム ValuationMatrix (更新されてない)
	*/
	// TODO: 日証金の速報系
	[ '優待', 'https://www.invest-jp.net/yuutai/detail/{code}' ],
];


// 銘柄コードの取得
const getCode = (siteinfo) => {
	let matches;

	if (siteinfo.xpath) {        
		let result = document.evaluate(siteinfo.xpath, document, null, XPathResult.STRING_TYPE, null);
		
		if (result.stringValue) {
			console.log(`result xpath: ${result.stringValue}`);
			matches = /[0-9][0-9A-Y][0-9][0-9A-Y]/.exec(result.stringValue);
			console.log(matches);
			
			if (matches) {
				return matches[0];// (\d{4}) なら [1]
			}
		}
	} else {
		const reg = siteinfo.url instanceof RegExp ? siteinfo.url : new RegExp(siteinfo.url);

		matches = location.href.match(reg);

		for (let i = 1; i <= matches.length; i++) {
			if (/^[0-9][0-9A-Y][0-9][0-9A-Y]$/.test(matches[i])) {
				return matches[i];
			}
		}
	}

	return null;
}

const replaceCode = (str, code) => {
	return str.replace('{code}', code);
}

const getRedirectUrl = (siteinfo, code) => {
	let matches = location.href.match(typeof siteinfo.url === 'object' ? siteinfo.url : new RegExp(siteinfo.url));
	let url = replaceCode(siteinfo.redirect, code);

	for (let i = 1; i <= matches.length; i++) {
		url = url.replace('{$' + i + '}', matches[i]);
	}

	return url;
}

const main = (siteinfo) => {
	let code = getCode(siteinfo);

	if (!code) {
		console.error("銘柄コードが取得できません");
		return;
	}

	console.log('code: ' + code);

	if (siteinfo.redirect) {
		console.log('redirect');
		location.replace(getRedirectUrl(siteinfo, code));
		return;
	}

	let showLinks = [];

	for (const [ title, url ] of LINKS) {
		const resolvedUrl = typeof url === 'function' ? url(code) : replaceCode(url, code);

		// 同じドメインの項目は非表示
		if (resolvedUrl.indexOf(location.hostname) !== -1) {
			continue;
		}

		showLinks.push(`<a href="${resolvedUrl}" ${linkNewTab ? 'target="_blank"' : ''} rel="noreferrer">${title}</a>`);
	}

	const div = document.createElement('div');
	div.innerHTML = showLinks.join(' | ');
	div.style.cssText = 'padding: 5px; width: 100%; text-align: center; font-size: 14px;';

	// リンク用のコンテナを作成
	const container = document.createElement('div');
	container.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background-color: white; z-index: 1000; padding: 5px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);';
	container.appendChild(div);

	document.body.style.paddingBottom = '50px';  // 固定リンクの高さ分だけ余白を追加
	// document.body.prepend(container);
	document.body.appendChild(container);
}


console.info(`株ツールバー: ${location.href}`);

for (let site of SITES) {
	if ((typeof site.url === 'string' && new RegExp(site.url).test(location.href)) ||
		(site.url instanceof RegExp && site.url.test(location.href))) {
		main(site);
		break;
	}
}
