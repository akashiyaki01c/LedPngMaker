import init, { svg_to_png } from "./wasm/pkg/ler_maker.js";

(() => {
	// init();

	let isInit = false;
	async function initer() {
		if (isInit) {
			return;
		}
		isInit = true;
		await init();
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

		const borderString = enableBorder ? `style="stroke-width: 2; stroke: ${borderColor}; paint-order: stroke fill markers;"`: "";

		return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"></rect>
	<text font-family="${isMincho ? "XF_jiskan24" : "Gen Bitmap"}" text-anchor="middle" font-size="24" x="${width/2}" y="${isMincho ? 22 : 21}" fill="${foregroundColor}" letter-spacing="${destJaSpacing}" ${borderString}>${destJa}</text>
	<text font-family="LedEnglishBitmap" text-anchor="middle" x="${width/2}" y="32" font-size="7" fill="${foregroundEnColor}" ${borderString}>${destEn}</text>
</svg>
		`;
	}
	function getMaskedSvgString(imgUrl) {
		const width = document.querySelector("#input-width").value;
		const height = 32;
		const scale = 5;

		let maskedString = "";
		for (let x = 0; x < width; x++) {
			maskedString += `<path d="M${x*scale},0 L${x*scale},${height*scale}" stroke="#000" stroke-width="2"></path>`;
		}
		for (let y = 0; y < height; y++) {
			maskedString += `<path d="M0,${y*scale} L${width*scale},${y*scale}" stroke="#000" stroke-width="2"></path>`;
		}

		return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width * scale} ${height * scale}">
	<image href="${imgUrl}" x="0" y="0" width="${width*scale}" height="${height*scale}"></image>
	${maskedString}
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

	function getSvgUrl() {
		const svgString = getSvgString();
		console.log(svgString);
		const svgPng = svg_to_png(svgString);
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}
	function getMaskedSvgUrl(imgUrl) {
		const svgString = getMaskedSvgString(imgUrl);
		const svgPng = svg_to_png(svgString);
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}

	document.querySelector("#input-generate").addEventListener('click', v => {
		const svgUrl = getSvgUrl();
		document.querySelector("#export-image").src = svgUrl;
		document.querySelector("#export-masked-image").src = getMaskedSvgUrl(svgUrl);
	});

	document.addEventListener('keydown', e => {
		console.log('keydown', e);
		/* switch (e.code) {
			case "KeyG":
				document.querySelector("#input-generate").click();
		} */
		if (document.querySelector("#input-realtime").checked) {
			document.querySelector("#input-generate").click();
		}
	});
})();