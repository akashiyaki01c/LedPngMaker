import init, { svg_to_png } from "./wasm_without_fonts/pkg/ler_maker.js";

(() => {
	// init();

	let isInit = false;
	let fonts = null;

	async function initer() {
		if (isInit) {
			return;
		}
		isInit = true;
		await init();
		fonts = await getFonts();
		document.querySelector("#input-init").disabled = true;
		document.querySelector("#input-generate").disabled = false;
		document.querySelector("#input-init").value = "初期化済み";
	}
	document.querySelector("#input-init").addEventListener('click', initer);
	const params = new URL(decodeURIComponent(document.location.href)).searchParams;
	const directInitialize = params.get("directInitialize") || "false";
	if (directInitialize == "true") {
		initer();
	}

	function getTransformString(destJa, width, spacing) {
		function getLength(str) {
			let length = str.length * 24;
			const hankakuCount = (str.match(/[A-Za-z0-9\-･\(\)]/g) || []).length;
			console.log(spacing * (str.length-1));
			return length - (hankakuCount * 12) + spacing * (str.length-1);
		}

		const length = getLength(destJa);
		console.log(length);
		if (length <= width) {
			return "";
		}
		const scale = width / length;
		const translate = (length - width) / 2;
		const str = `transform="scale(${scale}, 1.0) translate(${translate}, 0.0)"`;
		console.log(str);

		return str;
	}

	function getSvgString() {
		const width = document.querySelector("#input-width").value;
		const height = 32;
		const destJa = document.querySelector("#input-dest-ja").value;
		const destJaSpacing = document.querySelector("#input-dest-ja-spacing").value;
		const destEn = document.querySelector("#input-dest-en").value.replace(/ /g, "_");
		const backgroundColor = document.querySelector("#input-bg-color").value;
		const foregroundColor = document.querySelector("#input-fg-color").value;
		const foregroundEnColor = document.querySelector("#input-en-color-change").checked ? document.querySelector("#input-dest-en-color").value : foregroundColor;
		const enableBorder = document.querySelector("#input-border").checked;
		const borderColor = document.querySelector("#input-border-color").value;
		const isMincho = document.querySelector("#input-is-mincho").checked;
		const isCompress = document.querySelector("#input-compress").checked;

		const borderString = enableBorder ? `style="stroke-width: 2; stroke: ${borderColor}; paint-order: stroke fill markers;"`: "";

		return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<rect 
		x="0" y="0" 
		width="${width}" height="${height}" 
		fill="${backgroundColor}"></rect>
	<text 
		font-family="XF_DotRoboto, ${isMincho ? "XF_jiskan24" : "XF_Palty"}" 
		text-anchor="middle" font-size="24" 
		x="${width/2}" y="${isMincho ? 22 : 21}" 
		fill="${foregroundColor}" 
		letter-spacing="${destJaSpacing}" 
		${borderString} 
		${isCompress ? getTransformString(destJa, width, destJaSpacing) : ""}>${destJa}</text>
	<text font-family="XF_Serio" text-anchor="middle" x="${width/2}" y="32" font-size="7" fill="${foregroundEnColor}" ${borderString}>${destEn}</text>
</svg>
		`;
	}
	function getMaskedSvgString(imgUrl) {
		const width = document.querySelector("#input-width").value;
		const height = 32;
		const scale = 5;

		const maskImageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAACpJREFUCNdtzDEVACAQgFDMZCf7N/guuh0rPFalAdVB1fkRhP2EsVzT8wIa4Bi3DxRfwwAAAABJRU5ErkJggg==`;

		let maskedString = "";


		/* for (let x = 0; x < width; x++) {
			maskedString += `<path d="M${x*scale},0 L${x*scale},${height*scale}" stroke="#000" stroke-width="2"></path>`;
		}
		for (let y = 0; y < height; y++) {
			maskedString += `<path d="M0,${y*scale} L${width*scale},${y*scale}" stroke="#000" stroke-width="2"></path>`;
		} */
		for (let x = 0; x < width; x++)
		for (let y = 0; y < height; y++) {
			maskedString += `<image href="${maskImageUrl}" width="${scale}" height="${scale}" x="${x*scale}" y="${y*scale}"></image>`;
		}

		return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width * scale} ${height * scale}">
	<defs>
		<filter
			id="MyFilter"
			filterUnits="userSpaceOnUse"
			x="0"
			y="0"
			width="${width*scale}"
			height="${height*scale}">

			<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />

			<feMerge>
				<feMergeNode in="blur" />
			</feMerge>

		</filter>
	</defs>
	<image href="${imgUrl}" x="0" y="0" width="${width*scale}" height="${height*scale}"></image>
	${maskedString}
	<image filter="url(#MyFilter)" opacity="0.2" style="mix-blend-mode: screen" href="${imgUrl}" x="0" y="0" width="${width*scale}" height="${height*scale}"></image>
</svg>
		`;
	}

	function uint8ArrayToBase64(uint8Array) {
		const decodeBinaryString = uint8Array => uint8Array.reduce(
			(binaryString, uint8) => binaryString + String.fromCharCode(uint8),
			'',
		);
		const binaryStringA = decodeBinaryString(uint8Array);
		const base64 = btoa(binaryStringA);
		
		return base64;
	}

	async function getFonts() {
		function base64encode(data){
			return btoa([...data].map(n => String.fromCharCode(n)).join(""));
		}		

		const url = [
			"https://cdn.jsdelivr.net/gh/akashiyaki01c/GenBitmap/output/GenBitmap.ttf",
			"https://cdn.jsdelivr.net/gh/akashiyaki01c/GenBitmap/output/XF_DotRoboto-24px.ttf",
			"https://cdn.jsdelivr.net/gh/akashiyaki01c/GenBitmap/output/XF_Serio.ttf"
		];
		
		const fontsData = await Promise.all(url.map(async url => {
			const buffer = await (await fetch(url, { cache: "force-cache" })).arrayBuffer();
			const arr = new Uint8Array(buffer);
			return [...arr]
		}));
		const base64edData = fontsData.map(v => base64encode(v)).join(";");
		console.log(base64edData);
		return base64edData;
	}

	async function getSvgUrl() {
		const svgString = getSvgString();
		const svgPng = svg_to_png(svgString, String(fonts));
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}
	async function getMaskedSvgUrl(imgUrl) {
		const svgString = getMaskedSvgString(imgUrl);
		const svgPng = svg_to_png(svgString, String(fonts));
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}

	document.querySelector("#input-generate").addEventListener('click', async v => {
		const svgUrl = await getSvgUrl();
		document.querySelector("#export-image").src = svgUrl;
		document.querySelector("#export-masked-image").src = await getMaskedSvgUrl(svgUrl);
	});
})();