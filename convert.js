import init, { svg_to_png } from "./wasm/pkg/ler_maker.js";

(async () => {
	// init();

	document.querySelector("#input-init").addEventListener('click', async v => {
		await init();
		document.querySelector("#input-init").disabled = true;
		document.querySelector("#input-generate").disabled = false;
		document.querySelector("#input-init").value = "初期化済み";
	});

	function getSvgString() {
		const width = document.querySelector("#input-width").value;
		const height = 32;
		const destJa = document.querySelector("#input-dest-ja").value;
		const destJaSpacing = document.querySelector("#input-dest-ja-spacing").value;
		const destEn = document.querySelector("#input-dest-en").value.replace(" ", "_");
		const backgroundColor = document.querySelector("#input-bg-color").value;
		const foregroundColor = document.querySelector("#input-fg-color").value;
		const enableBorder = document.querySelector("#input-border").checked;
		console.log(destEn);
		const borderColor = document.querySelector("#input-border-color").value;

		const borderString = enableBorder ? `style="stroke-width: 2; stroke: ${borderColor}; paint-order: stroke fill markers;"`: "";

		return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"></rect>
	<text font-family="Gen Bitmap" text-anchor="middle" font-size="24" x="${width/2}" y="21" fill="${foregroundColor}" letter-spacing="${destJaSpacing}" ${borderString}>${destJa}</text>
	<text font-family="LedEnglishBitmap" text-anchor="middle" x="${width/2}" y="32" font-size="7" fill="${foregroundColor}" ${borderString}>${destEn}</text>
</svg>
		`;
	}
	function getMaskedSvgString() {
		const width = document.querySelector("#input-width").value;
		const height = 32;
		const destJa = document.querySelector("#input-dest-ja").value;
		const destJaSpacing = document.querySelector("#input-dest-ja-spacing").value;
		const destEn = document.querySelector("#input-dest-en").value.replace(" ", "_");
		const backgroundColor = document.querySelector("#input-bg-color").value;
		const foregroundColor = document.querySelector("#input-fg-color").value;
		const enableBorder = document.querySelector("#input-border").checked;
		console.log(destEn);
		const borderColor = document.querySelector("#input-border-color").value;
		const scale = 5;

		const borderString = enableBorder ? `style="stroke-width: 2; stroke: ${borderColor}; paint-order: stroke fill markers;"`: "";

		let maskedString = "";
		for (let x = 0; x < width; x++) {
			maskedString += `<path d="M${x*scale},0 L${x*scale},${height*scale}" stroke="#000" stroke-width="2"></path>`;
		}
		for (let y = 0; y < height; y++) {
			maskedString += `<path d="M0,${y*scale} L${width*scale},${y*scale}" stroke="#000" stroke-width="2"></path>`;
		}

		return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width * scale} ${height * scale}">
	<rect x="0" y="0" width="${width * scale}" height="${height * scale}" fill="${backgroundColor}"></rect>
	<text font-family="Gen Bitmap" text-anchor="middle" font-size="${24 * scale}" x="${width/2 * scale}" y="${21 * scale}" fill="${foregroundColor}" letter-spacing="${destJaSpacing*scale}" ${borderString}>${destJa}</text>
	<text font-family="LedEnglishBitmap" text-anchor="middle" x="${width/2 * scale}" y="${32 * scale}" font-size="${7 * scale}" fill="${foregroundColor}" ${borderString}>${destEn}</text>
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
		const svgPng = svg_to_png(svgString);
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}
	function getMaskedSvgUrl() {
		const svgString = getMaskedSvgString();
		console.log(svgString);
		const svgPng = svg_to_png(svgString);
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}

	document.querySelector("#input-generate").addEventListener('click', v => {
		document.querySelector("#export-image").src = getSvgUrl();
		document.querySelector("#export-masked-image").src = getMaskedSvgUrl();
	});
})();