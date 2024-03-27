import init, { svg_to_png } from "./wasm/pkg/ler_maker.js";

(async () => {
	init();

	function getSvgString() {
		function textConvert(text, spacing) {
			const spacingText = " ".repeat(spacing);
			let chars = [];
			for (const ch of text) {
				chars.push(ch);
			}
			return chars.join(spacingText);
		}

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

	function uint8ArrayToBase64(uint8Array) {
		return btoa(String.fromCharCode(...uint8Array));
	}

	function getSvgUrl() {
		const svgString = getSvgString();
		const svgPng = svg_to_png(svgString);
		return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
	}

	document.querySelector("#input-generate").addEventListener('click', v => {
		document.querySelector("#export-image").src = getSvgUrl();
	});
})();