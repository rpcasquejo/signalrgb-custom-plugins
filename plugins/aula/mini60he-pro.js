export function Name() { return "MINI 60 HE PRO"; }
export function VendorId() { return 0x0c45; }
export function ProductId() { return 0x80a2; }
export function Publisher() { return "seigR"; }
export function Documentation(){ return "troubleshooting/brand"; }
export function Size() { return [14,6]; }
export function DefaultScale() { return 5.0; }
export function DeviceType() { return "keyboard"; }
export function ControllableParameters() {
	return [
		// TODO: Remove this and
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"009bde"},
		// TODO: Remove this one and use Static Brights
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"009bde"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":lightingPresets, "default":"Canvas"},

		// hardware mode stuff
		{"property":"hardwareColor", "group":"lighting", "label":"Hardware Mode Color", "type":"color", "default":"009bde"},
		{"property":"hardwareBrightness", "group":"lighting", "label":"Hardware Mode Brightness", "min":"0", "max":"5", "type":"number", "default":"5"},
		{"property":"hardwareColorful", "group":"lighting", "label":"Hardware Mode Random", "type":"boolean", "default":"1"},
		{"property":"hardwareDirection", "group":"lighting", "label":"Hardware Mode Direction", "type":"combobox", "values":["Up/Left", "Down/Right"], "default":"Down/Right"},
	];
}

var hardwareMode = false;

export function onLightingModeChanged() {
	device.log("Lighting mode changed to " + LightingMode);
	if (LightingMode == "Canvas") {
		hardwareMode = false;
		return
	}

	hardwareMode = true;
}

const lightingPresets = [
	"Canvas",
	"Forced", // TODO: Remove this and use the Static Bright instead to save usb cycles

	// Aula modes, need to figure these out
	"[HW Mode] Static Bright",
	"[HW Mode] Single Point On",
	"[HW Mode] Single Point Off",
	"[HW Mode] Starry Sky",
	"[HW Mode] Snowfall",
	"[HW Mode] Floral Competition",
	"[HW Mode] Dynamic Breathing",
	"[HW Mode] Spectrum Cycle",
	"[HW Mode] Color Fountain",
	"[HW Mode] Colorful Interchange",
	"[HW Mode] Flowing with the Waves",
	"[HW Mode] Turning Peaks",
	"[HW Mode] One Touch to Fire",
	"[HW Mode] Two Birds with One Stone",
	"[HW Mode] Ripples Spread",
	"[HW Mode] Endless Flow",
	"[HW Mode] Layered Mountains",
	"[HW Mode] Gentle Rain and Wind",
	"[HW Mode] Back and Forth"
]

var vLedNames = [
	"Esc",   "1", "2", "3", "4", "5", "6", "7", "8", "9", "0","-_", "=+", "Backspace",
	"Tab",     "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]",       "\\",
	"Caps Lock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'",       "Enter",
	"Left Shift", "Z", "X", "C", "V", "B", "N", "M",",", ".", "/",      "Right Shift",
	"Left Ctrl","Left Win","Left Alt","Space", "Right Alt", "Menu", "Right Ctrl", "Fn"
];

var vLedPositions = [
	[0, 1],[1, 1],[2, 1],[3, 1],[4, 1],[5, 1],[6, 1],[7, 1],[8, 1],[9, 1],[10, 1],[11, 1],[12, 1],[13, 1],
	[0, 2],[1, 2],[2, 2],[3, 2],[4, 2],[5, 2],[6, 2],[7, 2],[8, 2],[9, 2],[10, 2],[11, 2],[12, 2],[13, 2],
	[0, 3],[1, 3],[2, 3],[3, 3],[4, 3],[5, 3],[6, 3],[7, 3],[8, 3],[9, 3],[10, 3],[11, 3],        [13, 3],
	[1, 4],       [2, 4],[3, 4],[4, 4],[5, 4],[6, 4],[7, 4],[8, 4],[9, 4],[10, 4],[11, 4],        [13, 4],
	[0, 5],[1, 5],[2, 5],                     [6, 5],                     [10, 5],[11, 5],[12, 5],[13, 5]
];

function formPacket(initial, sequence, shutdown = false) {
	var packet = initial;
	for (var idx = 0; idx < sequence.length; idx++) {
		var sequenceIndex = sequence[idx];
		var keyHex = vKeys[sequenceIndex];
		var packetStart = 8 + (4*idx);
		if (sequenceIndex == 100) {
			keyHex = 0x7f;
			rgbData = [0x00, 0x00, 0x00];
			packet[packetStart] = keyHex;
			packet[packetStart+1] = rgbData[0];
			packet[packetStart+2] = rgbData[1];
			packet[packetStart+3] = rgbData[2];
			continue
		}

		var posX = vLedPositions[sequenceIndex][0];
		var posY = vLedPositions[sequenceIndex][1];

		var rgbData;
		if(shutdown)
		{
			rgbData = hexToRgb(shutdownColor);
		}
		else if (LightingMode === "Forced")
		{
			rgbData = hexToRgb(forcedColor);
		}
		else
		{
			rgbData = device.color(posX, posY);
		}

		packet[packetStart] = keyHex;
		packet[packetStart+1] = rgbData[0];
		packet[packetStart+2] = rgbData[1];
		packet[packetStart+3] = rgbData[2];
	}

	var zeroPad = 0x00;
	var newPacket = [zeroPad].concat(packet);
	device.write(newPacket, 65);
}

function sendColors(shutdown = false) {
	formPacket(packet1, packet1Sequence);
	formPacket(packet2, packet2Sequence);
	formPacket(packet3, packet3Sequence);
	formPacket(packet4, packet4Sequence);
	formPacket(packet5, packet5Sequence);
}

const packet1 = [0xaa, 0x32, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00];
const packet2 = [0xaa, 0x32, 0x38, 0x38, 0x00, 0x00, 0x00, 0x00];
const packet3 = [0xaa, 0x32, 0x38, 0x70, 0x00, 0x00, 0x00, 0x00];
const packet4 = [0xaa, 0x32, 0x38, 0xa8, 0x00, 0x00, 0x00, 0x00];
const packet5 = [0xaa, 0x32, 0x38, 0xe0, 0x00, 0x00, 0x00, 0x00];
const packet6 = [0xaa, 0x32, 0x38, 0x18, 0x10, 0x00, 0x00, 0x00];

var vKeys = [
	0x00,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1b,0x1c,0x5c, // up until vKeys[13]
	0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2a,0x2b,0x2c,0x3c, // up until vKeys[27]
	0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x3b,0x4c,      // up until vKeys[40]
	0x40,0x41,0x42,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x4b,           // up until vKeys[52]
	0x50,0x51,0x52,0x53,0x54,0x56,0x57,0x55                                // up until vKeys[60]
];

const packet1Sequence = [
	0,14,28,41,53,
	1,15,29,42,54,
	2,16,30,43,
];

const packet2Sequence = [
	55,3,17,31,44,
	4,18,32,45,5,
	19,33,46,6,
]

const packet3Sequence = [
	20,34,47,56,7,
	21,35,48,8,22,
	36,49,9,23,
]

const packet4Sequence = [
	37,50,10,24,38,
	51,57,11,25,39,
	58,12,26,59,
]

const packet5Sequence = [
	13,27,40,52,60,
	100,100,100,100,100,
	100,100,100,100,
]

export function Initialize() {
	device.setControllableLeds(vLedNames, vLedPositions);
}

export function LedNames() {}

export function LedPositions() {}

export function Render() {
	if (hardwareMode == true) {
		return
	}

	sendColors();
	device.pause(1);
	// device.log(lightingPreset);
}

export function Shutdown() {}

function hexToRgb(hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	let colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);

	return colors;
}

export function Validate(endpoint) {
	return endpoint.interface === 2 && endpoint.usage === 0x0061 && endpoint.usage_page === 0xff68;
}

export function ImageUrl() { return "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Faulastar.com%2Fuploads%2Fallimg%2F20250718%2F1-250GQ4444XR.jpg&f=1&nofb=1&ipt=6f644492a23a51b0cd0bd7b31a5903b60215164653cb951147b47197d1d3362a"; }
