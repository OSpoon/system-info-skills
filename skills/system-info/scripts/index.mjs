import process$1 from "node:process";
import { statfs } from "node:fs/promises";
import os from "node:os";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region src/index.ts
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	function toArr(any) {
		return any == null ? [] : Array.isArray(any) ? any : [any];
	}
	function toVal(out, key, val, opts) {
		var x, old = out[key], nxt = !!~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : !!~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
		out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
	}
	module.exports = function(args, opts) {
		args = args || [];
		opts = opts || {};
		var k, arr, arg, name, val, out = { _: [] };
		var i = 0, j = 0, idx = 0, len = args.length;
		const alibi = opts.alias !== void 0;
		const strict = opts.unknown !== void 0;
		const defaults = opts.default !== void 0;
		opts.alias = opts.alias || {};
		opts.string = toArr(opts.string);
		opts.boolean = toArr(opts.boolean);
		if (alibi) for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i = 0; i < arr.length; i++) (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
		}
		for (i = opts.boolean.length; i-- > 0;) {
			arr = opts.alias[opts.boolean[i]] || [];
			for (j = arr.length; j-- > 0;) opts.boolean.push(arr[j]);
		}
		for (i = opts.string.length; i-- > 0;) {
			arr = opts.alias[opts.string[i]] || [];
			for (j = arr.length; j-- > 0;) opts.string.push(arr[j]);
		}
		if (defaults) for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i = 0; i < arr.length; i++) opts[name].push(arr[i]);
			}
		}
		const keys = strict ? Object.keys(opts.alias) : [];
		for (i = 0; i < len; i++) {
			arg = args[i];
			if (arg === "--") {
				out._ = out._.concat(args.slice(++i));
				break;
			}
			for (j = 0; j < arg.length; j++) if (arg.charCodeAt(j) !== 45) break;
			if (j === 0) out._.push(arg);
			else if (arg.substring(j, j + 3) === "no-") {
				name = arg.substring(j + 3);
				if (strict && !~keys.indexOf(name)) return opts.unknown(arg);
				out[name] = false;
			} else {
				for (idx = j + 1; idx < arg.length; idx++) if (arg.charCodeAt(idx) === 61) break;
				name = arg.substring(j, idx);
				val = arg.substring(++idx) || i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i];
				arr = j === 2 ? [name] : name;
				for (idx = 0; idx < arr.length; idx++) {
					name = arr[idx];
					if (strict && !~keys.indexOf(name)) return opts.unknown("-".repeat(j) + name);
					toVal(out, name, idx + 1 < arr.length || val, opts);
				}
			}
		}
		if (defaults) {
			for (k in opts.default) if (out[k] === void 0) out[k] = opts.default[k];
		}
		if (alibi) for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) out[arr.shift()] = out[k];
		}
		return out;
	};
})))(), 1);
const categories = [
	"os",
	"cpu",
	"memory",
	"disk",
	"network"
];
function isSystemInfoCategory(value) {
	return value === "all" || categories.includes(value);
}
function toGiB(bytes) {
	return Math.round(bytes / 1024 ** 3 * 100) / 100;
}
function getOsInfo() {
	return {
		hostname: os.hostname(),
		type: os.type(),
		platform: os.platform(),
		release: os.release(),
		version: os.version(),
		architecture: os.arch(),
		uptimeSeconds: Math.floor(os.uptime())
	};
}
function getCpuInfo() {
	const cpus = os.cpus();
	return {
		model: cpus[0]?.model ?? null,
		logicalCores: cpus.length,
		loadAverage: os.platform() === "win32" ? null : os.loadavg()
	};
}
function getMemoryInfo() {
	const totalBytes = os.totalmem();
	const availableBytes = os.freemem();
	const usedBytes = totalBytes - availableBytes;
	return {
		totalBytes,
		availableBytes,
		usedBytes,
		usedPercent: totalBytes ? Math.round(usedBytes / totalBytes * 1e3) / 10 : 0,
		totalGiB: toGiB(totalBytes),
		availableGiB: toGiB(availableBytes)
	};
}
async function getDiskInfo() {
	const path = process.cwd();
	try {
		const filesystem = await statfs(path);
		const totalBytes = filesystem.blocks * filesystem.bsize;
		const availableBytes = filesystem.bavail * filesystem.bsize;
		const usedBytes = totalBytes - availableBytes;
		return {
			path,
			totalBytes,
			availableBytes,
			usedBytes,
			usedPercent: totalBytes ? Math.round(usedBytes / totalBytes * 1e3) / 10 : 0,
			totalGiB: toGiB(totalBytes),
			availableGiB: toGiB(availableBytes)
		};
	} catch {
		return {
			path,
			available: false
		};
	}
}
function getNetworkInfo() {
	return {
		interfaces: Object.entries(os.networkInterfaces()).flatMap(([name, addresses]) => (addresses ?? []).map(({ address, netmask, family, cidr, internal }) => ({
			name,
			address,
			netmask,
			family,
			cidr,
			internal
		}))),
		internetConnectivityTested: false
	};
}
async function getSystemInfo(category) {
	if (category === "all") return {
		os: getOsInfo(),
		cpu: getCpuInfo(),
		memory: getMemoryInfo(),
		disk: await getDiskInfo(),
		network: getNetworkInfo()
	};
	switch (category) {
		case "os": return getOsInfo();
		case "cpu": return getCpuInfo();
		case "memory": return getMemoryInfo();
		case "disk": return getDiskInfo();
		case "network": return getNetworkInfo();
	}
}
//#endregion
//#region src/cli.ts
const args = (0, import_lib.default)(process$1.argv.slice(2));
const [category = "all", ...extra] = args._;
if (extra.length || Object.keys(args).some((key) => key !== "_") || !isSystemInfoCategory(category)) {
	console.error("Usage: system-info [os|cpu|memory|disk|network|all]");
	process$1.exitCode = 2;
} else console.log(JSON.stringify(await getSystemInfo(category), null, 2));
//#endregion
export {};
