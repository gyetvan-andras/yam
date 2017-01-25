var fs = require('fs');
var request = require('request');
var console = process.console;
//中文
//hieroglyphs
var loaded = false;

var yam_fonts = [
	{
		group:"Default",
		isGoogle: false,
		items: [
			{
				name: "Arial",
				family: "NimbusSansLRegular",
				variants: [
					"regular","italic","800","800italic"
				]
			},
			{
				name: "Calibri",
				family: "CarlitoRegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Courier",
				family: "CousineRegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Comic",
				family: "ComicReliefRegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Garamond",
				family: "CormorantRegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Helvetica",
				family: "AileronRegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Monospace",
				family: "AnkaCoderRegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Times New Roman",
				family: "LinuxLibertineORegular",
				variants: [
					"regular","italic","700","700italic"
				]
			},
			{
				name: "Verdana",
				family: "Verdana",
				variants: [
					"regular","italic","700","700italic"
				]
			}
		]
	},
	{
		group:"中文 (Chinese)",//
		isGoogle: false,
		items: [
			{
				sample:"勘亭流繁",
				name:"Han Wang Kan Tang",
				family: "HanWangKanTang",
				variants: [
					"regular"
				]
			},
			{
				sample:"粗楷体简",
				name:"Kai Bold",
				family: "KaiBold",
				variants: [
					"regular"
				]
			},
			{
				sample:"新宋体",
				name:"Sim Sun",
				family: "SimSun",
				variants: [
					"regular"
				]
			},
			{
				sample:"行書繁",
				name:"Shin Su Medium",
				family: "ShinSuMedium",
				variants: [
					"regular"
				]
			},
			{
				sample:"細圓體繁",
				name:"Yen Light",
				family: "YenLight",
				variants: [
					"regular"
				]
			},
			{
				sample:"黑体",
				name:"Sim Hei",
				family: "SimHei",
				variants: [
					"regular"
				]
			},
			{
				sample:"顏楷體繁",
				name:"Yan Kai",
				family: "YanKai",
				variants: [
					"regular"
				]
			},
			{
				sample:"鋼筆行楷繁",
				name:"Xing Kai",
				family: "GB06",
				variants: [
					"regular"
				]
			},
			{
				sample:"超明體繁",
				name:"Ming Black",
				family: "MingBlack",
				variants: [
					"regular"
				]
			},
			{
				sample:"細明體繁",
				name:"Ming Light",
				family: "MingLight",
				variants: [
					"regular"
				]
			},
			{
				sample:"细新宋简",
				name:"Sin Song Thin",
				family: "SinSongThin",
				variants: [
					"regular"
				]
			},
			{
				sample:"楷體注音",
				name:"Kai Medium",
				family: "KaiMedium",
				variants: [
					"regular"
				]
			},
		]
	},
	{
		group:"日本の (Japanese)",//
		isGoogle: false,
		items: [
			{
				sample: "らぶ",
				name: "Love",
				family: "Love",
				variants: [
					"regular"
				]
			},
			{
				sample: "さざなみ明朝",
				name: "Sazanami Mincho",
				family: "SazanamiMincho",
				variants: [
					"regular"
				]
			},
			{
				sample: "大阪",
				name: "Osaka",
				family: "Osaka",
				variants: [
					"regular"
				]
			},
			{
				sample: "さなフォン",
				name: "Sana Fon",
				family: "Sana Fon",
				variants: [
					"regular"
				]
			},
			{
				sample: "殴り書き",
				name: "Nagurigaki",
				family: "nagurigaki",
				variants: [
					"regular"
				]
			},
			{
				sample: "海",
				name: "Sea",
				family: "Sea",
				variants: [
					"regular"
				]
			},
			{
				sample: "月",
				name: "Moon",
				family: "Moon",
				variants: [
					"regular"
				]
			},
			{
				sample: "剣",
				name: "Sword",
				family: "Sword",
				variants: [
					"regular"
				]
			},
			{
				sample: "はーと",
				name: "Heart",
				family: "Heart",
				variants: [
					"regular"
				]
			},
			{
				sample: "はーと",
				name: "Heart Zen",
				family: "HeartZen",
				variants: [
					"regular"
				]
			}
		]
	},
	{
		group:"Hieroglyphs",//
		isGoogle: false,
		items: [
			{
				name: "The Nile Song",
				family: "TheNileSong",
				variants: [
					"regular"
				]
			},
			{
				name: "Rosetta Stone",
				family: "RosettaStone",
				variants: [
					"regular"
				]
			},
			{
				family: "Hieroglify",
				variants: [
					"regular"
				]
			}
		]
	}
];

function retrieveGoogleFonts(cb) {
	request('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyD2RboBTkPWFIp0BskJ-p_AWSMVlM9ttsc', function (err, response, body) {
		if(err) {
			cb(err);
		} else if(response.statusCode !== 200) {
			var ex = new Errot("Invalid response:"+response.statusCode);
			cb(ex);
		} else {
			var fnts = JSON.parse(body);
			fnts.group = "Web Fonts";
			fnts.isGoogle =  true;
			fnts.items.sort(function(f1,f2){
				return f1.family.toLowerCase().localeCompare(f2.family.toLowerCase());
			});
			cb(null, fnts);
	     }
	});
}

function makeFontsArray(gfs, cb) {
	var ret = yam_fonts;
	ret.push(gfs);
	cb(null, ret);
}

function getFontsArray(cb) {
	var stat = fs.stat("./google.webfonts.json", function(err, stat) {
		if(err) {
			console.info("There is no downloaded google.webfonts.json");
			retrieveGoogleFonts(function(err, fnts) {
				if(err) {

				} else {
					var fnts_json = JSON.stringify(fnts);
					fs.writeFileSync("./google.webfonts.json", fnts_json);
					makeFontsArray(fnts, function(err, fnts_arr) {
						if(err) {

						} else {
							cb(null, fnts_arr);
						}
					});
				}
			});
		} else {
			console.dir(stat);
			var fnts_json = fs.readFileSync("./google.webfonts.json", "utf8");
			var fnts = JSON.parse(fnts_json);
			makeFontsArray(fnts, function(err, fnts_arr) {
				if(err) {

				} else {
					cb(null, fnts_arr);
				}
			});
		}
	});
}

exports.getFonts = function(user_id,cb) {
	if(!loaded) {
		getFontsArray(function(err,fnts) {
			if(err) {
				console.err(err);
				cb(err);			
			} else {
				loaded = true;
				cb(null, fnts);
			}
		});
	} else {
		cb(null, yam_fonts);
	}
};