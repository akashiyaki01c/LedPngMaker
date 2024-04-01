import init, { svg_to_png } from "../wasm_without_fonts/pkg/ler_maker.js";

await init();

function uint8ArrayToBase64(uint8Array) {
	const decodeBinaryString = uint8Array => uint8Array.reduce(
		(binaryString, uint8) => binaryString + String.fromCharCode(uint8),
		'',
	);
	const binaryStringA = decodeBinaryString(uint8Array);
	const base64 = btoa(binaryStringA);
	
	return base64;
}
function pngToBase64Url(svgPng) {
	return `data:image/png;base64,${uint8ArrayToBase64(svgPng)}`;
}

async function convertLed() {
	/**
	 * @type {File}
	 */
	const file = document.querySelector("#input-file").files[0];
	const fileRaw = await file.arrayBuffer()
	const raw = new Uint8Array(fileRaw);
	const width = document.querySelector("#input-width").value;
	const height = document.querySelector("#input-height").value;
	const scale = 5;

	let maskedString = "";
	for (let x = 0; x < width; x++) {
		maskedString += `<path d="M${x*scale},0 L${x*scale},${height*scale}" stroke="#000" stroke-width="2"></path>`;
	}
	for (let y = 0; y < height; y++) {
		maskedString += `<path d="M0,${y*scale} L${width*scale},${y*scale}" stroke="#000" stroke-width="2"></path>`;
	}

	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width * scale} ${height * scale}">
	<image href="${pngToBase64Url(raw)}" x="0" y="0" width="${width*scale}" height="${height*scale}"></image>
	${maskedString}
</svg>`;
	console.log(svg);
	const png = svg_to_png(svg);
	const pngUrl = pngToBase64Url(png);
	document.querySelector("#output").src = pngUrl;
	document.querySelector("#output-raw").src = pngToBase64Url(raw);
}
document.querySelector("#input-button").addEventListener('click', convertLed);