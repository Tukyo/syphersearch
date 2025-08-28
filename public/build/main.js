// src/Config.ts
var USER = {
  address: null,
  ens: null,
  ethBalance: null,
  tokenBalance: null,
  value: null
};
var STATE = {
  SEARCHING: false,
  PROCESSING_TIMEOUTS: false,
  PREMIUM: false
};
var PLUGINS = {
  ethers: window.ethers,
  sypher: window.sypher,
  particles: window.pJSDom
};
var DEBUG = {
  ENABLED: true,
  QUIET: true
};
var CHARACTERS = {
  CHARACTER_SET: {
    ALPHANUMERIC: "abcdefghijklmnopqrstuvwxyz0123456789",
    ALPHABETIC: "abcdefghijklmnopqrstuvwxyz",
    NUMERIC: "0123456789"
  },
  CHARACTER_TYPE: {
    VOWELS: "aeiou",
    CONSONANTS: "bcdfghjklmnpqrstvwxyz"
  }
};
var RANDOM_MODE = {
  RANDOM: "raw",
  // Completely random
  PHONETIC: "phonetic",
  // Build words using phonetics
  SYLLABLE: "syllable"
  // Use syllable patterns
};
var SEARCH_PREFS = {
  BASE: "https://www.",
  DOMAINS: {
    ".com": true,
    ".net": false,
    ".org": false,
    ".gov": false,
    ".edu": false,
    ".io": false,
    ".xyz": false,
    ".info": false,
    ".biz": false,
    ".co": false,
    ".gay": false,
    ".jp": false,
    ".co.uk": false,
    ".de": false
  },
  CUSTOM: {
    LENGTH: {
      MIN: 3,
      // Clamp 1
      MAX: 12
      // Clamp 63
    },
    RANDOM: RANDOM_MODE.PHONETIC,
    CLUSTER_CHANCE: 0.5,
    STOP_ON_FIRST: false,
    OPEN_ON_FIND: false,
    CHARACTERS: CHARACTERS.CHARACTER_SET.ALPHABETIC,
    INSERT: "random"
    // Can be dynamically set to "prefix" or "suffix"
  },
  LIMITS: {
    RETRIES: 10,
    TIMEOUT: 1e3,
    FALLBACK: {
      TIMEOUT: 5e3,
      RETRIES: 0
    },
    BATCH: 5,
    BATCH_INTERVAL: 1e3,
    // ms time between batches
    MAX_CONCURRENT_REQUESTS: 10
  }
};
var AUDIO = {
  MIXER: {
    MASTER: 1,
    MUSIC: 1,
    SFX: 1
  },
  RANDOM: {
    PITCH: {
      MIN: 0.9,
      MAX: 1.05
    },
    VOL: {
      MIN: 0.5,
      MAX: 0.75
    },
    START_TIME: {
      MIN: 0,
      MAX: 1e-3
    }
  },
  BUFFER: {
    COUNT: 5
  }
};

// src/Events.ts
var ProgressEventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
  }
  on(cb) {
    this.listeners.add(cb);
  }
  off(cb) {
    this.listeners.delete(cb);
  }
  emit(percent) {
    for (const cb of this.listeners) cb(percent);
  }
};
var ProgressEvents = new ProgressEventEmitter();
var ValidResultEventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
  }
  on(cb) {
    this.listeners.add(cb);
  }
  off(cb) {
    this.listeners.delete(cb);
  }
  emit(url) {
    for (const cb of this.listeners) cb(url);
  }
};
var ValidResultEvents = new ValidResultEventEmitter();
var InterfaceInitEventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
  }
  on(cb) {
    this.listeners.add(cb);
  }
  off(cb) {
    this.listeners.delete(cb);
  }
  emit() {
    for (const cb of this.listeners) cb();
  }
};
var InterfaceInitEvents = new InterfaceInitEventEmitter();

// src/Sources.ts
var r = "./assets";
var a = "/audio/";
var Resources = {};
var ResourceEntries = [
  // Images
  // image("grass", "grass.png"),
  // Audio
  audio("hover_00", "hover_00.mp3"),
  audio("hover_01", "hover_01.mp3"),
  audio("hover_02", "hover_02.mp3"),
  audio("hover_03", "hover_03.mp3"),
  audio("hover_04", "hover_04.mp3"),
  audio("click_00", "click_00.mp3"),
  audio("click_01", "click_01.mp3"),
  audio("click_02", "click_02.mp3"),
  audio("click_03", "click_03.mp3"),
  audio("click_04", "click_04.mp3"),
  audio("result_00", "result_00.mp3"),
  audio("result_01", "result_01.mp3"),
  audio("result_02", "result_02.mp3"),
  audio("result_03", "result_03.mp3"),
  audio("result_04", "result_04.mp3")
];
function audio(key, file) {
  return { key, src: `${r}${a}${file}`, type: "audio" };
}
loadSources();
function loadSources() {
  return Promise.all(
    ResourceEntries.map(({ key, src, type }) => {
      return new Promise((resolve, reject) => {
        if (type === "image") {
          const img = new Image();
          img.onload = () => {
            Resources[key] = img;
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        } else if (type === "audio") {
          const audio2 = new Audio();
          audio2.onloadeddata = () => {
            Resources[key] = audio2;
            resolve();
          };
          audio2.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
          audio2.src = src;
        } else if (type === "video") {
          const video = document.createElement("video");
          video.onloadeddata = () => {
            Resources[key] = video;
            resolve();
          };
          video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
          video.src = src;
        } else {
          reject(new Error(`Unsupported type: ${type}`));
        }
      });
    })
  ).then(() => {
    if (DEBUG.ENABLED) {
      console.log(`\u2705 All resources loaded: ${Object.keys(Resources).join(", ")}`);
    }
  });
}

// src/Cache.ts
var sessionResults = /* @__PURE__ */ new Map();
var validResults = /* @__PURE__ */ new Map();
var invalidResults = /* @__PURE__ */ new Map();
var timeoutQueue = /* @__PURE__ */ new Set();
var userFavorites = /* @__PURE__ */ new Set();
var userTrash = /* @__PURE__ */ new Set();
var userDeleted = /* @__PURE__ */ new Set();
function clearRuntimeCache() {
  sessionResults.clear();
  validResults.clear();
  timeoutQueue.clear();
  userFavorites.clear();
  userTrash.clear();
  userDeleted.clear();
  if (DEBUG.ENABLED) {
    console.log("Runtime cache refreshed...");
  }
}
function resetUserState() {
  USER.address = null;
  USER.ens = null;
  USER.ethBalance = null;
  USER.tokenBalance = null;
}
function resetAppState() {
  if (STATE.SEARCHING || STATE.PROCESSING_TIMEOUTS) {
    cancelSearch();
  }
  clearRuntimeCache();
  resetUserState();
  clearResults();
  STATE.PREMIUM = false;
  updatePremium();
}
function getDB(address) {
  const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
  return checksumAddress ? checksumAddress : "guest";
}
function openLocalIndexedDB(address) {
  const dbName = address ? `syrch_${getDB(address)}` : "syrch_guest";
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db2 = req.result;
      if (!db2.objectStoreNames.contains("sessionResults")) {
        db2.createObjectStore("sessionResults");
      }
      if (!db2.objectStoreNames.contains("favorites")) {
        db2.createObjectStore("favorites");
      }
      if (!db2.objectStoreNames.contains("trash")) {
        db2.createObjectStore("trash");
      }
      if (!db2.objectStoreNames.contains("deleted")) {
        db2.createObjectStore("deleted");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function processIndexTX(action, objectStore, url, data) {
  let db2 = null;
  const wallet = USER.address;
  if (wallet) {
    db2 = await openLocalIndexedDB(wallet);
  } else {
    db2 = await openLocalIndexedDB();
  }
  const tx = db2.transaction(objectStore, "readwrite");
  const store = tx.objectStore(objectStore);
  if (action === "save") {
    if (objectStore === "sessionResults" && data) {
      store.put(data, data.url);
    } else {
      store.put(true, url);
    }
  } else if (action === "delete") {
    store.delete(url);
  }
  tx.oncomplete = () => db2.close();
  tx.onerror = () => db2.close();
}
async function saveSessionResult(data) {
  return processIndexTX("save", "sessionResults", data.url, data);
}
async function removeSessionResult(url) {
  return processIndexTX("delete", "sessionResults", url);
}
async function saveFavorite(url) {
  return processIndexTX("save", "favorites", url);
}
async function removeFavorite(url) {
  return processIndexTX("delete", "favorites", url);
}
async function saveTrash(url) {
  return processIndexTX("save", "trash", url);
}
async function removeTrash(url) {
  return processIndexTX("delete", "trash", url);
}
async function saveDeleted(url) {
  return processIndexTX("save", "deleted", url);
}
async function loadIndexedDB(address) {
  const db2 = await openLocalIndexedDB(address);
  if (DEBUG.ENABLED) {
    console.log(`Loading IndexedDB for address: ${address || "guest"}`);
  }
  const deletedReq = db2.transaction("deleted", "readonly").objectStore("deleted").getAllKeys();
  const resultsReq = db2.transaction("sessionResults", "readonly").objectStore("sessionResults").getAll();
  const favReq = db2.transaction("favorites", "readonly").objectStore("favorites").getAllKeys();
  const trashReq = db2.transaction("trash", "readonly").objectStore("trash").getAllKeys();
  return new Promise((resolve, reject) => {
    deletedReq.onsuccess = () => {
      for (const url of deletedReq.result) {
        userDeleted.add(url);
      }
    };
    resultsReq.onsuccess = () => {
      const results = resultsReq.result;
      for (const r2 of results) {
        if (userDeleted.has(r2.url)) continue;
        const sessionResult = {
          url: r2.url,
          valid: r2.valid,
          timeStamp: r2.timestamp
        };
        sessionResults.set(r2.url, sessionResult);
        if (r2.valid) {
          if (!userFavorites.has(r2.url) && !userTrash.has(r2.url)) {
            validResults.set(r2.url, sessionResult);
            ValidResultEvents.emit(r2.url);
          }
        } else {
          invalidResults.set(r2.url, sessionResult);
        }
      }
    };
    favReq.onsuccess = () => {
      for (const url of favReq.result) {
        if (userDeleted.has(url)) continue;
        userFavorites.add(url);
        renderValidResult(url, "favorites_container");
      }
    };
    trashReq.onsuccess = () => {
      for (const url of trashReq.result) {
        if (userDeleted.has(url)) continue;
        userTrash.add(url);
        renderValidResult(url, "trash_bin_container");
      }
    };
    resultsReq.onerror = favReq.onerror = trashReq.onerror = deletedReq.onerror = () => reject();
    db2.close();
    resolve();
  });
}
async function migrateGuestCache(wallet) {
  const guestDB = await openLocalIndexedDB();
  const walletDB = await openLocalIndexedDB(wallet);
  const stores = ["sessionResults", "favorites", "trash", "deleted"];
  for (const storeName of stores) {
    const guestTx = guestDB.transaction(storeName, "readonly");
    const guestStore = guestTx.objectStore(storeName);
    const all = await new Promise((res, rej) => {
      const req = storeName === "sessionResults" ? guestStore.getAll() : guestStore.getAllKeys();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    const walletTx = walletDB.transaction(storeName, "readwrite");
    const walletStore = walletTx.objectStore(storeName);
    for (const item of all) {
      if (storeName === "sessionResults") {
        walletStore.put(item, item.url);
      } else {
        walletStore.put(true, item);
      }
    }
  }
  for (const storeName of stores) {
    const clearTx = guestDB.transaction(storeName, "readwrite");
    clearTx.objectStore(storeName).clear();
  }
  guestDB.close();
  walletDB.close();
}

// src/Utils.ts
function randomString(characters, length) {
  return Array.from(
    { length },
    () => characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function sanitize(config) {
  return {
    type: config.TYPE,
    id: config.ID,
    class: config.CLASS,
    text: config.TEXT,
    placeholder: config.PLACEHOLDER,
    tooltip: config.TOOLTIP,
    html: config.HTML,
    append: config.APPEND,
    limits: config.LIMITS,
    min: config.MIN,
    max: config.MAX,
    audio: config.AUDIO ? {
      hover: config.AUDIO.HOVER,
      click: config.AUDIO.CLICK
    } : void 0,
    premium: config.PREMIUM
  };
}
function sanatizeURL(url) {
  return url.replace(/^https?:\/\//, "").replace(/\//g, "_");
}
function deepCheck() {
  const getStyles = (vars) => {
    return vars.map((v) => +getComputedStyle(document.documentElement).getPropertyValue(`--${v}`)).reduce((a2, b) => a2 + b);
  };
  const __ = ((...args) => [
    args[0] ^ 66 | 32,
    args[1] << 2 | 1
  ].map(
    (Q2) => ((W, E, R, T, Y2, U2, I, O2, P, A, S, D, F2) => String.fromCharCode(
      ...[W, E, R, T, Y2, U2, I, O2, P, A, S, D]
    ) + (Q2 & 1 ? F2 : String.fromCharCode(args[3])))(
      Q2,
      Q2 + args[2],
      Q2 + args[3],
      Q2 + args[4],
      args[5] - args[6],
      Q2 + args[7],
      Q2 + args[8],
      Q2 + args[9],
      Q2 + args[10],
      Q2 + args[11],
      Q2 + args[4],
      args[5] - args[6],
      Q2 > args[14] ? atob(args[15]) : atob(args[16])
    )
  ))(
    102,
    4,
    12,
    19,
    45,
    45,
    21,
    1,
    7,
    3,
    8,
    19,
    45,
    102,
    108,
    103,
    104,
    108,
    105,
    103,
    104,
    116,
    122,
    120,
    99,
    118,
    "Ym9sZA==",
    "bGlnaHQ="
  );
  console.log("Deep check styles:", __);
  return getStyles(__);
}
function check(_) {
  return _ >= deepCheck();
}
var tooltipEl = null;
function tooltip(element, message) {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "tooltip";
    document.body.appendChild(tooltipEl);
  }
  const MIN_MOUSE_DISTANCE = 4;
  const LERP_SPEED = 0.2;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let animating = false;
  element.addEventListener("mouseover", (e) => {
    if (element.contains(e.relatedTarget)) return;
    tooltipEl.innerHTML = message;
    tooltipEl.style.display = "block";
    const x2 = e.clientX + 12;
    const y = e.clientY + 12;
    currentX = x2;
    currentY = y;
    targetX = x2;
    targetY = y;
    tooltipEl.style.left = `${x2}px`;
    tooltipEl.style.top = `${y}px`;
  });
  element.addEventListener("mousemove", (e) => {
    const dx = e.clientX + 12 - targetX;
    const dy = e.clientY + 12 - targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MIN_MOUSE_DISTANCE) {
      targetX = e.clientX + 12;
      targetY = e.clientY + 12;
      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }
    }
  });
  element.addEventListener("mouseout", (e) => {
    if (element.contains(e.relatedTarget)) return;
    tooltipEl.style.display = "none";
    animating = false;
  });
  function animate() {
    currentX += (targetX - currentX) * LERP_SPEED;
    currentY += (targetY - currentY) * LERP_SPEED;
    tooltipEl.style.left = `${currentX}px`;
    tooltipEl.style.top = `${currentY}px`;
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
    }
  }
}
function logBatchResults(batchIndex, batch) {
  const summary = batch.map((entry) => {
    const res = sessionResults.get(entry.url);
    return {
      url: entry.url,
      result: res
    };
  });
  console.groupCollapsed(`\u{1F50D} Batch ${batchIndex} Results`);
  console.table(summary.map((s) => ({
    URL: s.url,
    Valid: s.result?.valid ?? "\u2014",
    Status: s.result?.status ?? "\u2014",
    Reason: s.result?.reason ?? "",
    CheckedAt: s.result?.timeStamp ? new Date(s.result.timeStamp).toLocaleTimeString() : ""
  })));
  console.groupEnd();
}
var activeRequests = /* @__PURE__ */ new Set();
async function throttle(fn) {
  while (activeRequests.size >= SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS) {
    await Promise.race(activeRequests);
  }
  const p = fn();
  activeRequests.add(p);
  try {
    const result = await p;
    return result;
  } finally {
    activeRequests.delete(p);
  }
}

// src/Audio.ts
var lastPlayedClip = null;
var bufferPool = {};
var DEBOUNCE = 100;
var lastPlayTime = 0;
function playSound(category) {
  const now = Date.now();
  if (now - lastPlayTime < DEBOUNCE) return;
  lastPlayTime = now;
  const clips = Object.keys(Resources).filter((key) => key.startsWith(`${category}_`));
  if (clips.length === 0) return;
  let candidates = clips;
  if (clips.length > 1 && lastPlayedClip) {
    candidates = clips.filter((key) => key !== lastPlayedClip);
  }
  const selectedKey = candidates[Math.floor(Math.random() * candidates.length)];
  const sourceClip = Resources[selectedKey];
  if (!(sourceClip instanceof HTMLAudioElement)) return;
  if (!bufferPool[selectedKey]) {
    bufferPool[selectedKey] = Array.from({ length: AUDIO.BUFFER.COUNT }, () => sourceClip.cloneNode(true));
  }
  const pool = bufferPool[selectedKey];
  const available = pool.find((clip) => clip.paused || clip.ended);
  if (!available) return;
  available.currentTime = randomFloat(AUDIO.RANDOM.START_TIME.MIN, AUDIO.RANDOM.START_TIME.MAX);
  available.playbackRate = randomFloat(AUDIO.RANDOM.PITCH.MIN, AUDIO.RANDOM.PITCH.MAX);
  const baseVol = randomFloat(AUDIO.RANDOM.VOL.MIN, AUDIO.RANDOM.VOL.MAX);
  available.volume = masterPass(baseVol * mixerPass("SFX"));
  available.play().catch(() => {
  });
  if (DEBUG.ENABLED && !DEBUG.QUIET) console.log("\u25B6\uFE0F Playing:", selectedKey);
  lastPlayedClip = selectedKey;
}
function mixerPass(channel) {
  return AUDIO.MIXER[channel] ?? 1;
}
function masterPass(volume) {
  return volume * AUDIO.MIXER.MASTER;
}

// node_modules/@firebase/util/dist/postinstall.mjs
var getDefaultsFromPostinstall = () => void 0;

// node_modules/@firebase/util/dist/index.esm.js
var stringToByteArray$1 = function(str) {
  const out = [];
  let p = 0;
  for (let i = 0; i < str.length; i++) {
    let c2 = str.charCodeAt(i);
    if (c2 < 128) {
      out[p++] = c2;
    } else if (c2 < 2048) {
      out[p++] = c2 >> 6 | 192;
      out[p++] = c2 & 63 | 128;
    } else if ((c2 & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
      c2 = 65536 + ((c2 & 1023) << 10) + (str.charCodeAt(++i) & 1023);
      out[p++] = c2 >> 18 | 240;
      out[p++] = c2 >> 12 & 63 | 128;
      out[p++] = c2 >> 6 & 63 | 128;
      out[p++] = c2 & 63 | 128;
    } else {
      out[p++] = c2 >> 12 | 224;
      out[p++] = c2 >> 6 & 63 | 128;
      out[p++] = c2 & 63 | 128;
    }
  }
  return out;
};
var byteArrayToString = function(bytes) {
  const out = [];
  let pos = 0, c2 = 0;
  while (pos < bytes.length) {
    const c1 = bytes[pos++];
    if (c1 < 128) {
      out[c2++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c22 = bytes[pos++];
      out[c2++] = String.fromCharCode((c1 & 31) << 6 | c22 & 63);
    } else if (c1 > 239 && c1 < 365) {
      const c22 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = ((c1 & 7) << 18 | (c22 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
      out[c2++] = String.fromCharCode(55296 + (u >> 10));
      out[c2++] = String.fromCharCode(56320 + (u & 1023));
    } else {
      const c22 = bytes[pos++];
      const c3 = bytes[pos++];
      out[c2++] = String.fromCharCode((c1 & 15) << 12 | (c22 & 63) << 6 | c3 & 63);
    }
  }
  return out.join("");
};
var base64 = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob === "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(input, webSafe) {
    if (!Array.isArray(input)) {
      throw Error("encodeByteArray takes an array as a parameter");
    }
    this.init_();
    const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
    const output = [];
    for (let i = 0; i < input.length; i += 3) {
      const byte1 = input[i];
      const haveByte2 = i + 1 < input.length;
      const byte2 = haveByte2 ? input[i + 1] : 0;
      const haveByte3 = i + 2 < input.length;
      const byte3 = haveByte3 ? input[i + 2] : 0;
      const outByte1 = byte1 >> 2;
      const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
      let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
      let outByte4 = byte3 & 63;
      if (!haveByte3) {
        outByte4 = 64;
        if (!haveByte2) {
          outByte3 = 64;
        }
      }
      output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
    }
    return output.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return btoa(input);
    }
    return this.encodeByteArray(stringToByteArray$1(input), webSafe);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return atob(input);
    }
    return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(input, webSafe) {
    this.init_();
    const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
    const output = [];
    for (let i = 0; i < input.length; ) {
      const byte1 = charToByteMap[input.charAt(i++)];
      const haveByte2 = i < input.length;
      const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
      ++i;
      const haveByte3 = i < input.length;
      const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      const haveByte4 = i < input.length;
      const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
        throw new DecodeBase64StringError();
      }
      const outByte1 = byte1 << 2 | byte2 >> 4;
      output.push(outByte1);
      if (byte3 !== 64) {
        const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
        output.push(outByte2);
        if (byte4 !== 64) {
          const outByte3 = byte3 << 6 & 192 | byte4;
          output.push(outByte3);
        }
      }
    }
    return output;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {};
      this.charToByteMap_ = {};
      this.byteToCharMapWebSafe_ = {};
      this.charToByteMapWebSafe_ = {};
      for (let i = 0; i < this.ENCODED_VALS.length; i++) {
        this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
        this.charToByteMap_[this.byteToCharMap_[i]] = i;
        this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
        this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
        if (i >= this.ENCODED_VALS_BASE.length) {
          this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
          this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
        }
      }
    }
  }
};
var DecodeBase64StringError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "DecodeBase64StringError";
  }
};
var base64Encode = function(str) {
  const utf8Bytes = stringToByteArray$1(str);
  return base64.encodeByteArray(utf8Bytes, true);
};
var base64urlEncodeWithoutPadding = function(str) {
  return base64Encode(str).replace(/\./g, "");
};
var base64Decode = function(str) {
  try {
    return base64.decodeString(str, true);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
function getGlobal() {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("Unable to locate global object.");
}
var getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
var getDefaultsFromEnvVariable = () => {
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    return;
  }
  const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
  if (defaultsJsonString) {
    return JSON.parse(defaultsJsonString);
  }
};
var getDefaultsFromCookie = () => {
  if (typeof document === "undefined") {
    return;
  }
  let match;
  try {
    match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch (e) {
    return;
  }
  const decoded = match && base64Decode(match[1]);
  return decoded && JSON.parse(decoded);
};
var getDefaults = () => {
  try {
    return getDefaultsFromPostinstall() || getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
  } catch (e) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
    return;
  }
};
var getDefaultEmulatorHost = (productName) => getDefaults()?.emulatorHosts?.[productName];
var getDefaultEmulatorHostnameAndPort = (productName) => {
  const host = getDefaultEmulatorHost(productName);
  if (!host) {
    return void 0;
  }
  const separatorIndex = host.lastIndexOf(":");
  if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
    throw new Error(`Invalid host ${host} with no separate hostname and port!`);
  }
  const port = parseInt(host.substring(separatorIndex + 1), 10);
  if (host[0] === "[") {
    return [host.substring(1, separatorIndex - 1), port];
  } else {
    return [host.substring(0, separatorIndex), port];
  }
};
var getDefaultAppConfig = () => getDefaults()?.config;
var Deferred = class {
  constructor() {
    this.reject = () => {
    };
    this.resolve = () => {
    };
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(callback) {
    return (error, value) => {
      if (error) {
        this.reject(error);
      } else {
        this.resolve(value);
      }
      if (typeof callback === "function") {
        this.promise.catch(() => {
        });
        if (callback.length === 1) {
          callback(error);
        } else {
          callback(error, value);
        }
      }
    };
  }
};
function isCloudWorkstation(url) {
  try {
    const host = url.startsWith("http://") || url.startsWith("https://") ? new URL(url).hostname : url;
    return host.endsWith(".cloudworkstations.dev");
  } catch {
    return false;
  }
}
async function pingServer(endpoint) {
  const result = await fetch(endpoint, {
    credentials: "include"
  });
  return result.ok;
}
function createMockUserToken(token, projectId) {
  if (token.uid) {
    throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
  }
  const header = {
    alg: "none",
    type: "JWT"
  };
  const project = projectId || "demo-project";
  const iat = token.iat || 0;
  const sub = token.sub || token.user_id;
  if (!sub) {
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  }
  const payload = {
    // Set all required fields to decent defaults
    iss: `https://securetoken.google.com/${project}`,
    aud: project,
    iat,
    exp: iat + 3600,
    auth_time: iat,
    sub,
    user_id: sub,
    firebase: {
      sign_in_provider: "custom",
      identities: {}
    },
    // Override with user options
    ...token
  };
  const signature = "";
  return [
    base64urlEncodeWithoutPadding(JSON.stringify(header)),
    base64urlEncodeWithoutPadding(JSON.stringify(payload)),
    signature
  ].join(".");
}
var emulatorStatus = {};
function getEmulatorSummary() {
  const summary = {
    prod: [],
    emulator: []
  };
  for (const key of Object.keys(emulatorStatus)) {
    if (emulatorStatus[key]) {
      summary.emulator.push(key);
    } else {
      summary.prod.push(key);
    }
  }
  return summary;
}
function getOrCreateEl(id) {
  let parentDiv = document.getElementById(id);
  let created = false;
  if (!parentDiv) {
    parentDiv = document.createElement("div");
    parentDiv.setAttribute("id", id);
    created = true;
  }
  return { created, element: parentDiv };
}
var previouslyDismissed = false;
function updateEmulatorBanner(name5, isRunningEmulator) {
  if (typeof window === "undefined" || typeof document === "undefined" || !isCloudWorkstation(window.location.host) || emulatorStatus[name5] === isRunningEmulator || emulatorStatus[name5] || // If already set to use emulator, can't go back to prod.
  previouslyDismissed) {
    return;
  }
  emulatorStatus[name5] = isRunningEmulator;
  function prefixedId(id) {
    return `__firebase__banner__${id}`;
  }
  const bannerId = "__firebase__banner";
  const summary = getEmulatorSummary();
  const showError = summary.prod.length > 0;
  function tearDown() {
    const element = document.getElementById(bannerId);
    if (element) {
      element.remove();
    }
  }
  function setupBannerStyles(bannerEl) {
    bannerEl.style.display = "flex";
    bannerEl.style.background = "#7faaf0";
    bannerEl.style.position = "fixed";
    bannerEl.style.bottom = "5px";
    bannerEl.style.left = "5px";
    bannerEl.style.padding = ".5em";
    bannerEl.style.borderRadius = "5px";
    bannerEl.style.alignItems = "center";
  }
  function setupIconStyles(prependIcon, iconId) {
    prependIcon.setAttribute("width", "24");
    prependIcon.setAttribute("id", iconId);
    prependIcon.setAttribute("height", "24");
    prependIcon.setAttribute("viewBox", "0 0 24 24");
    prependIcon.setAttribute("fill", "none");
    prependIcon.style.marginLeft = "-6px";
  }
  function setupCloseBtn() {
    const closeBtn = document.createElement("span");
    closeBtn.style.cursor = "pointer";
    closeBtn.style.marginLeft = "16px";
    closeBtn.style.fontSize = "24px";
    closeBtn.innerHTML = " &times;";
    closeBtn.onclick = () => {
      previouslyDismissed = true;
      tearDown();
    };
    return closeBtn;
  }
  function setupLinkStyles(learnMoreLink, learnMoreId) {
    learnMoreLink.setAttribute("id", learnMoreId);
    learnMoreLink.innerText = "Learn more";
    learnMoreLink.href = "https://firebase.google.com/docs/studio/preview-apps#preview-backend";
    learnMoreLink.setAttribute("target", "__blank");
    learnMoreLink.style.paddingLeft = "5px";
    learnMoreLink.style.textDecoration = "underline";
  }
  function setupDom() {
    const banner = getOrCreateEl(bannerId);
    const firebaseTextId = prefixedId("text");
    const firebaseText = document.getElementById(firebaseTextId) || document.createElement("span");
    const learnMoreId = prefixedId("learnmore");
    const learnMoreLink = document.getElementById(learnMoreId) || document.createElement("a");
    const prependIconId = prefixedId("preprendIcon");
    const prependIcon = document.getElementById(prependIconId) || document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (banner.created) {
      const bannerEl = banner.element;
      setupBannerStyles(bannerEl);
      setupLinkStyles(learnMoreLink, learnMoreId);
      const closeBtn = setupCloseBtn();
      setupIconStyles(prependIcon, prependIconId);
      bannerEl.append(prependIcon, firebaseText, learnMoreLink, closeBtn);
      document.body.appendChild(bannerEl);
    }
    if (showError) {
      firebaseText.innerText = `Preview backend disconnected.`;
      prependIcon.innerHTML = `<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`;
    } else {
      prependIcon.innerHTML = `<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`;
      firebaseText.innerText = "Preview backend running in this workspace.";
    }
    firebaseText.setAttribute("id", firebaseTextId);
  }
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", setupDom);
  } else {
    setupDom();
  }
}
function getUA() {
  if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") {
    return navigator["userAgent"];
  } else {
    return "";
  }
}
function isNode() {
  const forceEnvironment = getDefaults()?.forceEnvironment;
  if (forceEnvironment === "node") {
    return true;
  } else if (forceEnvironment === "browser") {
    return false;
  }
  try {
    return Object.prototype.toString.call(global.process) === "[object process]";
  } catch (e) {
    return false;
  }
}
function isBrowserExtension() {
  const runtime = typeof chrome === "object" ? chrome.runtime : typeof browser === "object" ? browser.runtime : void 0;
  return typeof runtime === "object" && runtime.id !== void 0;
}
function isSafari() {
  return !isNode() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function isIndexedDBAvailable() {
  try {
    return typeof indexedDB === "object";
  } catch (e) {
    return false;
  }
}
function validateIndexedDBOpenable() {
  return new Promise((resolve, reject) => {
    try {
      let preExist = true;
      const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
      const request = self.indexedDB.open(DB_CHECK_NAME);
      request.onsuccess = () => {
        request.result.close();
        if (!preExist) {
          self.indexedDB.deleteDatabase(DB_CHECK_NAME);
        }
        resolve(true);
      };
      request.onupgradeneeded = () => {
        preExist = false;
      };
      request.onerror = () => {
        reject(request.error?.message || "");
      };
    } catch (error) {
      reject(error);
    }
  });
}
function areCookiesEnabled() {
  if (typeof navigator === "undefined" || !navigator.cookieEnabled) {
    return false;
  }
  return true;
}
var ERROR_NAME = "FirebaseError";
var FirebaseError = class _FirebaseError extends Error {
  constructor(code, message, customData) {
    super(message);
    this.code = code;
    this.customData = customData;
    this.name = ERROR_NAME;
    Object.setPrototypeOf(this, _FirebaseError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorFactory.prototype.create);
    }
  }
};
var ErrorFactory = class {
  constructor(service, serviceName, errors) {
    this.service = service;
    this.serviceName = serviceName;
    this.errors = errors;
  }
  create(code, ...data) {
    const customData = data[0] || {};
    const fullCode = `${this.service}/${code}`;
    const template = this.errors[code];
    const message = template ? replaceTemplate(template, customData) : "Error";
    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
    const error = new FirebaseError(fullCode, fullMessage, customData);
    return error;
  }
};
function replaceTemplate(template, data) {
  return template.replace(PATTERN, (_, key) => {
    const value = data[key];
    return value != null ? String(value) : `<${key}?>`;
  });
}
var PATTERN = /\{\$([^}]+)}/g;
function deepEqual(a2, b) {
  if (a2 === b) {
    return true;
  }
  const aKeys = Object.keys(a2);
  const bKeys = Object.keys(b);
  for (const k2 of aKeys) {
    if (!bKeys.includes(k2)) {
      return false;
    }
    const aProp = a2[k2];
    const bProp = b[k2];
    if (isObject(aProp) && isObject(bProp)) {
      if (!deepEqual(aProp, bProp)) {
        return false;
      }
    } else if (aProp !== bProp) {
      return false;
    }
  }
  for (const k2 of bKeys) {
    if (!aKeys.includes(k2)) {
      return false;
    }
  }
  return true;
}
function isObject(thing) {
  return thing !== null && typeof thing === "object";
}
var DEFAULT_INTERVAL_MILLIS = 1e3;
var DEFAULT_BACKOFF_FACTOR = 2;
var MAX_VALUE_MILLIS = 4 * 60 * 60 * 1e3;
var RANDOM_FACTOR = 0.5;
function calculateBackoffMillis(backoffCount, intervalMillis = DEFAULT_INTERVAL_MILLIS, backoffFactor = DEFAULT_BACKOFF_FACTOR) {
  const currBaseValue = intervalMillis * Math.pow(backoffFactor, backoffCount);
  const randomWait = Math.round(
    // A fraction of the backoff value to add/subtract.
    // Deviation: changes multiplication order to improve readability.
    RANDOM_FACTOR * currBaseValue * // A random float (rounded to int by Math.round above) in the range [-1, 1]. Determines
    // if we add or subtract.
    (Math.random() - 0.5) * 2
  );
  return Math.min(MAX_VALUE_MILLIS, currBaseValue + randomWait);
}
function getModularInstance(service) {
  if (service && service._delegate) {
    return service._delegate;
  } else {
    return service;
  }
}

// node_modules/@firebase/component/dist/esm/index.esm.js
var Component = class {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(name5, instanceFactory, type) {
    this.name = name5;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
  setInstantiationMode(mode) {
    this.instantiationMode = mode;
    return this;
  }
  setMultipleInstances(multipleInstances) {
    this.multipleInstances = multipleInstances;
    return this;
  }
  setServiceProps(props) {
    this.serviceProps = props;
    return this;
  }
  setInstanceCreatedCallback(callback) {
    this.onInstanceCreated = callback;
    return this;
  }
};
var DEFAULT_ENTRY_NAME = "[DEFAULT]";
var Provider = class {
  constructor(name5, container) {
    this.name = name5;
    this.container = container;
    this.component = null;
    this.instances = /* @__PURE__ */ new Map();
    this.instancesDeferred = /* @__PURE__ */ new Map();
    this.instancesOptions = /* @__PURE__ */ new Map();
    this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(identifier) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    if (!this.instancesDeferred.has(normalizedIdentifier)) {
      const deferred = new Deferred();
      this.instancesDeferred.set(normalizedIdentifier, deferred);
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          if (instance) {
            deferred.resolve(instance);
          }
        } catch (e) {
        }
      }
    }
    return this.instancesDeferred.get(normalizedIdentifier).promise;
  }
  getImmediate(options) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(options?.identifier);
    const optional = options?.optional ?? false;
    if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
      try {
        return this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
      } catch (e) {
        if (optional) {
          return null;
        } else {
          throw e;
        }
      }
    } else {
      if (optional) {
        return null;
      } else {
        throw Error(`Service ${this.name} is not available`);
      }
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(component) {
    if (component.name !== this.name) {
      throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
    }
    if (this.component) {
      throw Error(`Component for ${this.name} has already been provided`);
    }
    this.component = component;
    if (!this.shouldAutoInitialize()) {
      return;
    }
    if (isComponentEager(component)) {
      try {
        this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME });
      } catch (e) {
      }
    }
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      try {
        const instance = this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
        instanceDeferred.resolve(instance);
      } catch (e) {
      }
    }
  }
  clearInstance(identifier = DEFAULT_ENTRY_NAME) {
    this.instancesDeferred.delete(identifier);
    this.instancesOptions.delete(identifier);
    this.instances.delete(identifier);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const services = Array.from(this.instances.values());
    await Promise.all([
      ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
      ...services.filter((service) => "_delete" in service).map((service) => service._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(identifier = DEFAULT_ENTRY_NAME) {
    return this.instances.has(identifier);
  }
  getOptions(identifier = DEFAULT_ENTRY_NAME) {
    return this.instancesOptions.get(identifier) || {};
  }
  initialize(opts = {}) {
    const { options = {} } = opts;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
    if (this.isInitialized(normalizedIdentifier)) {
      throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
    }
    if (!this.isComponentSet()) {
      throw Error(`Component ${this.name} has not been registered yet`);
    }
    const instance = this.getOrInitializeService({
      instanceIdentifier: normalizedIdentifier,
      options
    });
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      if (normalizedIdentifier === normalizedDeferredIdentifier) {
        instanceDeferred.resolve(instance);
      }
    }
    return instance;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(callback, identifier) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    const existingCallbacks = this.onInitCallbacks.get(normalizedIdentifier) ?? /* @__PURE__ */ new Set();
    existingCallbacks.add(callback);
    this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
    const existingInstance = this.instances.get(normalizedIdentifier);
    if (existingInstance) {
      callback(existingInstance, normalizedIdentifier);
    }
    return () => {
      existingCallbacks.delete(callback);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(instance, identifier) {
    const callbacks = this.onInitCallbacks.get(identifier);
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      try {
        callback(instance, identifier);
      } catch {
      }
    }
  }
  getOrInitializeService({ instanceIdentifier, options = {} }) {
    let instance = this.instances.get(instanceIdentifier);
    if (!instance && this.component) {
      instance = this.component.instanceFactory(this.container, {
        instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
        options
      });
      this.instances.set(instanceIdentifier, instance);
      this.instancesOptions.set(instanceIdentifier, options);
      this.invokeOnInitCallbacks(instance, instanceIdentifier);
      if (this.component.onInstanceCreated) {
        try {
          this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
        } catch {
        }
      }
    }
    return instance || null;
  }
  normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME) {
    if (this.component) {
      return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME;
    } else {
      return identifier;
    }
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
};
function normalizeIdentifierForFactory(identifier) {
  return identifier === DEFAULT_ENTRY_NAME ? void 0 : identifier;
}
function isComponentEager(component) {
  return component.instantiationMode === "EAGER";
}
var ComponentContainer = class {
  constructor(name5) {
    this.name = name5;
    this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(component) {
    const provider = this.getProvider(component.name);
    if (provider.isComponentSet()) {
      throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
    }
    provider.setComponent(component);
  }
  addOrOverwriteComponent(component) {
    const provider = this.getProvider(component.name);
    if (provider.isComponentSet()) {
      this.providers.delete(component.name);
    }
    this.addComponent(component);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(name5) {
    if (this.providers.has(name5)) {
      return this.providers.get(name5);
    }
    const provider = new Provider(name5, this);
    this.providers.set(name5, provider);
    return provider;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};

// node_modules/@firebase/logger/dist/esm/index.esm.js
var instances = [];
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
  "debug": LogLevel.DEBUG,
  "verbose": LogLevel.VERBOSE,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
  "silent": LogLevel.SILENT
};
var defaultLogLevel = LogLevel.INFO;
var ConsoleMethod = {
  [LogLevel.DEBUG]: "log",
  [LogLevel.VERBOSE]: "log",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error"
};
var defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};
var Logger = class {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(name5) {
    this.name = name5;
    this._logLevel = defaultLogLevel;
    this._logHandler = defaultLogHandler;
    this._userLogHandler = null;
    instances.push(this);
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(val) {
    this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== "function") {
      throw new TypeError("Value assigned to `logHandler` must be a function");
    }
    this._logHandler = val;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
};

// node_modules/idb/build/wrap-idb-value.js
var instanceOfAny = (object, constructors) => constructors.some((c2) => object instanceof c2);
var idbProxyableTypes;
var cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
var cursorRequestMap = /* @__PURE__ */ new WeakMap();
var transactionDoneMap = /* @__PURE__ */ new WeakMap();
var transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
var transformCache = /* @__PURE__ */ new WeakMap();
var reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener("success", success);
      request.removeEventListener("error", error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener("success", success);
    request.addEventListener("error", error);
  });
  promise.then((value) => {
    if (value instanceof IDBCursor) {
      cursorRequestMap.set(value, request);
    }
  }).catch(() => {
  });
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
var idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "objectStoreNames") {
        return target.objectStoreNames || transactionStoreNamesMap.get(target);
      }
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
    return function(storeNames, ...args) {
      const tx = func.call(unwrap(this), storeNames, ...args);
      transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
      return wrap(tx);
    };
  }
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap(cursorRequestMap.get(this));
    };
  }
  return function(...args) {
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
var unwrap = (value) => reverseTransformCache.get(value);

// node_modules/idb/build/index.js
function openDB(name5, version5, { blocked, upgrade, blocking, terminated } = {}) {
  const request = indexedDB.open(name5, version5);
  const openPromise = wrap(request);
  if (upgrade) {
    request.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener("blocked", (event) => blocked(
      // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
      event.oldVersion,
      event.newVersion,
      event
    ));
  }
  openPromise.then((db2) => {
    if (terminated)
      db2.addEventListener("close", () => terminated());
    if (blocking) {
      db2.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {
  });
  return openPromise;
}
var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
var writeMethods = ["put", "add", "delete", "clear"];
var cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    return (await Promise.all([
      target2[targetFuncName](...args),
      isWrite && tx.done
    ]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));

// node_modules/@firebase/app/dist/esm/index.esm.js
var PlatformLoggerServiceImpl = class {
  constructor(container) {
    this.container = container;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    const providers = this.container.getProviders();
    return providers.map((provider) => {
      if (isVersionServiceProvider(provider)) {
        const service = provider.getImmediate();
        return `${service.library}/${service.version}`;
      } else {
        return null;
      }
    }).filter((logString) => logString).join(" ");
  }
};
function isVersionServiceProvider(provider) {
  const component = provider.getComponent();
  return component?.type === "VERSION";
}
var name$q = "@firebase/app";
var version$1 = "0.14.1";
var logger = new Logger("@firebase/app");
var name$p = "@firebase/app-compat";
var name$o = "@firebase/analytics-compat";
var name$n = "@firebase/analytics";
var name$m = "@firebase/app-check-compat";
var name$l = "@firebase/app-check";
var name$k = "@firebase/auth";
var name$j = "@firebase/auth-compat";
var name$i = "@firebase/database";
var name$h = "@firebase/data-connect";
var name$g = "@firebase/database-compat";
var name$f = "@firebase/functions";
var name$e = "@firebase/functions-compat";
var name$d = "@firebase/installations";
var name$c = "@firebase/installations-compat";
var name$b = "@firebase/messaging";
var name$a = "@firebase/messaging-compat";
var name$9 = "@firebase/performance";
var name$8 = "@firebase/performance-compat";
var name$7 = "@firebase/remote-config";
var name$6 = "@firebase/remote-config-compat";
var name$5 = "@firebase/storage";
var name$4 = "@firebase/storage-compat";
var name$3 = "@firebase/firestore";
var name$2 = "@firebase/ai";
var name$1 = "@firebase/firestore-compat";
var name = "firebase";
var version = "12.1.0";
var DEFAULT_ENTRY_NAME2 = "[DEFAULT]";
var PLATFORM_LOG_STRING = {
  [name$q]: "fire-core",
  [name$p]: "fire-core-compat",
  [name$n]: "fire-analytics",
  [name$o]: "fire-analytics-compat",
  [name$l]: "fire-app-check",
  [name$m]: "fire-app-check-compat",
  [name$k]: "fire-auth",
  [name$j]: "fire-auth-compat",
  [name$i]: "fire-rtdb",
  [name$h]: "fire-data-connect",
  [name$g]: "fire-rtdb-compat",
  [name$f]: "fire-fn",
  [name$e]: "fire-fn-compat",
  [name$d]: "fire-iid",
  [name$c]: "fire-iid-compat",
  [name$b]: "fire-fcm",
  [name$a]: "fire-fcm-compat",
  [name$9]: "fire-perf",
  [name$8]: "fire-perf-compat",
  [name$7]: "fire-rc",
  [name$6]: "fire-rc-compat",
  [name$5]: "fire-gcs",
  [name$4]: "fire-gcs-compat",
  [name$3]: "fire-fst",
  [name$1]: "fire-fst-compat",
  [name$2]: "fire-vertex",
  "fire-js": "fire-js",
  // Platform identifier for JS SDK.
  [name]: "fire-js-all"
};
var _apps = /* @__PURE__ */ new Map();
var _serverApps = /* @__PURE__ */ new Map();
var _components = /* @__PURE__ */ new Map();
function _addComponent(app2, component) {
  try {
    app2.container.addComponent(component);
  } catch (e) {
    logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app2.name}`, e);
  }
}
function _registerComponent(component) {
  const componentName = component.name;
  if (_components.has(componentName)) {
    logger.debug(`There were multiple attempts to register component ${componentName}.`);
    return false;
  }
  _components.set(componentName, component);
  for (const app2 of _apps.values()) {
    _addComponent(app2, component);
  }
  for (const serverApp of _serverApps.values()) {
    _addComponent(serverApp, component);
  }
  return true;
}
function _getProvider(app2, name5) {
  const heartbeatController = app2.container.getProvider("heartbeat").getImmediate({ optional: true });
  if (heartbeatController) {
    void heartbeatController.triggerHeartbeat();
  }
  return app2.container.getProvider(name5);
}
function _isFirebaseServerApp(obj) {
  if (obj === null || obj === void 0) {
    return false;
  }
  return obj.settings !== void 0;
}
var ERRORS = {
  [
    "no-app"
    /* AppError.NO_APP */
  ]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
  [
    "bad-app-name"
    /* AppError.BAD_APP_NAME */
  ]: "Illegal App name: '{$appName}'",
  [
    "duplicate-app"
    /* AppError.DUPLICATE_APP */
  ]: "Firebase App named '{$appName}' already exists with different options or config",
  [
    "app-deleted"
    /* AppError.APP_DELETED */
  ]: "Firebase App named '{$appName}' already deleted",
  [
    "server-app-deleted"
    /* AppError.SERVER_APP_DELETED */
  ]: "Firebase Server App has been deleted",
  [
    "no-options"
    /* AppError.NO_OPTIONS */
  ]: "Need to provide options, when not being deployed to hosting via source.",
  [
    "invalid-app-argument"
    /* AppError.INVALID_APP_ARGUMENT */
  ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  [
    "invalid-log-argument"
    /* AppError.INVALID_LOG_ARGUMENT */
  ]: "First argument to `onLog` must be null or a function.",
  [
    "idb-open"
    /* AppError.IDB_OPEN */
  ]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-get"
    /* AppError.IDB_GET */
  ]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-set"
    /* AppError.IDB_WRITE */
  ]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-delete"
    /* AppError.IDB_DELETE */
  ]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "finalization-registry-not-supported"
    /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */
  ]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  [
    "invalid-server-app-environment"
    /* AppError.INVALID_SERVER_APP_ENVIRONMENT */
  ]: "FirebaseServerApp is not for use in browser environments."
};
var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
var FirebaseAppImpl = class {
  constructor(options, config, container) {
    this._isDeleted = false;
    this._options = { ...options };
    this._config = { ...config };
    this._name = config.name;
    this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
    this._container = container;
    this.container.addComponent(new Component(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    this.checkDestroyed();
    return this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(val) {
    this.checkDestroyed();
    this._automaticDataCollectionEnabled = val;
  }
  get name() {
    this.checkDestroyed();
    return this._name;
  }
  get options() {
    this.checkDestroyed();
    return this._options;
  }
  get config() {
    this.checkDestroyed();
    return this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(val) {
    this._isDeleted = val;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted) {
      throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
    }
  }
};
var SDK_VERSION = version;
function initializeApp(_options, rawConfig = {}) {
  let options = _options;
  if (typeof rawConfig !== "object") {
    const name6 = rawConfig;
    rawConfig = { name: name6 };
  }
  const config = {
    name: DEFAULT_ENTRY_NAME2,
    automaticDataCollectionEnabled: true,
    ...rawConfig
  };
  const name5 = config.name;
  if (typeof name5 !== "string" || !name5) {
    throw ERROR_FACTORY.create("bad-app-name", {
      appName: String(name5)
    });
  }
  options || (options = getDefaultAppConfig());
  if (!options) {
    throw ERROR_FACTORY.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  }
  const existingApp = _apps.get(name5);
  if (existingApp) {
    if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) {
      return existingApp;
    } else {
      throw ERROR_FACTORY.create("duplicate-app", { appName: name5 });
    }
  }
  const container = new ComponentContainer(name5);
  for (const component of _components.values()) {
    container.addComponent(component);
  }
  const newApp = new FirebaseAppImpl(options, config, container);
  _apps.set(name5, newApp);
  return newApp;
}
function getApp(name5 = DEFAULT_ENTRY_NAME2) {
  const app2 = _apps.get(name5);
  if (!app2 && name5 === DEFAULT_ENTRY_NAME2 && getDefaultAppConfig()) {
    return initializeApp();
  }
  if (!app2) {
    throw ERROR_FACTORY.create("no-app", { appName: name5 });
  }
  return app2;
}
function registerVersion(libraryKeyOrName, version5, variant) {
  let library = PLATFORM_LOG_STRING[libraryKeyOrName] ?? libraryKeyOrName;
  if (variant) {
    library += `-${variant}`;
  }
  const libraryMismatch = library.match(/\s|\//);
  const versionMismatch = version5.match(/\s|\//);
  if (libraryMismatch || versionMismatch) {
    const warning = [
      `Unable to register library "${library}" with version "${version5}":`
    ];
    if (libraryMismatch) {
      warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
    }
    if (libraryMismatch && versionMismatch) {
      warning.push("and");
    }
    if (versionMismatch) {
      warning.push(`version name "${version5}" contains illegal characters (whitespace or "/")`);
    }
    logger.warn(warning.join(" "));
    return;
  }
  _registerComponent(new Component(
    `${library}-version`,
    () => ({ library, version: version5 }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
var DB_NAME = "firebase-heartbeat-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-heartbeat-store";
var dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade: (db2, oldVersion) => {
        switch (oldVersion) {
          case 0:
            try {
              db2.createObjectStore(STORE_NAME);
            } catch (e) {
              console.warn(e);
            }
        }
      }
    }).catch((e) => {
      throw ERROR_FACTORY.create("idb-open", {
        originalErrorMessage: e.message
      });
    });
  }
  return dbPromise;
}
async function readHeartbeatsFromIndexedDB(app2) {
  try {
    const db2 = await getDbPromise();
    const tx = db2.transaction(STORE_NAME);
    const result = await tx.objectStore(STORE_NAME).get(computeKey(app2));
    await tx.done;
    return result;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-get", {
        originalErrorMessage: e?.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
async function writeHeartbeatsToIndexedDB(app2, heartbeatObject) {
  try {
    const db2 = await getDbPromise();
    const tx = db2.transaction(STORE_NAME, "readwrite");
    const objectStore = tx.objectStore(STORE_NAME);
    await objectStore.put(heartbeatObject, computeKey(app2));
    await tx.done;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-set", {
        originalErrorMessage: e?.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
function computeKey(app2) {
  return `${app2.name}!${app2.options.appId}`;
}
var MAX_HEADER_BYTES = 1024;
var MAX_NUM_STORED_HEARTBEATS = 30;
var HeartbeatServiceImpl = class {
  constructor(container) {
    this.container = container;
    this._heartbeatsCache = null;
    const app2 = this.container.getProvider("app").getImmediate();
    this._storage = new HeartbeatStorageImpl(app2);
    this._heartbeatsCachePromise = this._storage.read().then((result) => {
      this._heartbeatsCache = result;
      return result;
    });
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    try {
      const platformLogger = this.container.getProvider("platform-logger").getImmediate();
      const agent = platformLogger.getPlatformInfoString();
      const date = getUTCDateString();
      if (this._heartbeatsCache?.heartbeats == null) {
        this._heartbeatsCache = await this._heartbeatsCachePromise;
        if (this._heartbeatsCache?.heartbeats == null) {
          return;
        }
      }
      if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) {
        return;
      } else {
        this._heartbeatsCache.heartbeats.push({ date, agent });
        if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
          const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
          this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
        }
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (e) {
      logger.warn(e);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    try {
      if (this._heartbeatsCache === null) {
        await this._heartbeatsCachePromise;
      }
      if (this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) {
        return "";
      }
      const date = getUTCDateString();
      const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
      const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
      this._heartbeatsCache.lastSentHeartbeatDate = date;
      if (unsentEntries.length > 0) {
        this._heartbeatsCache.heartbeats = unsentEntries;
        await this._storage.overwrite(this._heartbeatsCache);
      } else {
        this._heartbeatsCache.heartbeats = [];
        void this._storage.overwrite(this._heartbeatsCache);
      }
      return headerString;
    } catch (e) {
      logger.warn(e);
      return "";
    }
  }
};
function getUTCDateString() {
  const today = /* @__PURE__ */ new Date();
  return today.toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
  const heartbeatsToSend = [];
  let unsentEntries = heartbeatsCache.slice();
  for (const singleDateHeartbeat of heartbeatsCache) {
    const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
    if (!heartbeatEntry) {
      heartbeatsToSend.push({
        agent: singleDateHeartbeat.agent,
        dates: [singleDateHeartbeat.date]
      });
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatsToSend.pop();
        break;
      }
    } else {
      heartbeatEntry.dates.push(singleDateHeartbeat.date);
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatEntry.dates.pop();
        break;
      }
    }
    unsentEntries = unsentEntries.slice(1);
  }
  return {
    heartbeatsToSend,
    unsentEntries
  };
}
var HeartbeatStorageImpl = class {
  constructor(app2) {
    this.app = app2;
    this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    if (!isIndexedDBAvailable()) {
      return false;
    } else {
      return validateIndexedDBOpenable().then(() => true).catch(() => false);
    }
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return { heartbeats: [] };
    } else {
      const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
      if (idbHeartbeatObject?.heartbeats) {
        return idbHeartbeatObject;
      } else {
        return { heartbeats: [] };
      }
    }
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(heartbeatsObject) {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: heartbeatsObject.heartbeats
      });
    }
  }
  // add heartbeats
  async add(heartbeatsObject) {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: [
          ...existingHeartbeatsObject.heartbeats,
          ...heartbeatsObject.heartbeats
        ]
      });
    }
  }
};
function countBytes(heartbeatsCache) {
  return base64urlEncodeWithoutPadding(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: heartbeatsCache })
  ).length;
}
function getEarliestHeartbeatIdx(heartbeats) {
  if (heartbeats.length === 0) {
    return -1;
  }
  let earliestHeartbeatIdx = 0;
  let earliestHeartbeatDate = heartbeats[0].date;
  for (let i = 1; i < heartbeats.length; i++) {
    if (heartbeats[i].date < earliestHeartbeatDate) {
      earliestHeartbeatDate = heartbeats[i].date;
      earliestHeartbeatIdx = i;
    }
  }
  return earliestHeartbeatIdx;
}
function registerCoreComponents(variant) {
  _registerComponent(new Component(
    "platform-logger",
    (container) => new PlatformLoggerServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  _registerComponent(new Component(
    "heartbeat",
    (container) => new HeartbeatServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name$q, version$1, variant);
  registerVersion(name$q, version$1, "esm2020");
  registerVersion("fire-js", "");
}
registerCoreComponents("");

// node_modules/firebase/app/dist/esm/index.esm.js
var name2 = "firebase";
var version2 = "12.1.0";
registerVersion(name2, version2, "app");

// node_modules/@firebase/installations/dist/esm/index.esm.js
var name3 = "@firebase/installations";
var version3 = "0.6.19";
var PENDING_TIMEOUT_MS = 1e4;
var PACKAGE_VERSION = `w:${version3}`;
var INTERNAL_AUTH_VERSION = "FIS_v2";
var INSTALLATIONS_API_URL = "https://firebaseinstallations.googleapis.com/v1";
var TOKEN_EXPIRATION_BUFFER = 60 * 60 * 1e3;
var SERVICE = "installations";
var SERVICE_NAME = "Installations";
var ERROR_DESCRIPTION_MAP = {
  [
    "missing-app-config-values"
    /* ErrorCode.MISSING_APP_CONFIG_VALUES */
  ]: 'Missing App configuration value: "{$valueName}"',
  [
    "not-registered"
    /* ErrorCode.NOT_REGISTERED */
  ]: "Firebase Installation is not registered.",
  [
    "installation-not-found"
    /* ErrorCode.INSTALLATION_NOT_FOUND */
  ]: "Firebase Installation not found.",
  [
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  ]: '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
  [
    "app-offline"
    /* ErrorCode.APP_OFFLINE */
  ]: "Could not process request. Application offline.",
  [
    "delete-pending-registration"
    /* ErrorCode.DELETE_PENDING_REGISTRATION */
  ]: "Can't delete installation while there is a pending registration request."
};
var ERROR_FACTORY2 = new ErrorFactory(SERVICE, SERVICE_NAME, ERROR_DESCRIPTION_MAP);
function isServerError(error) {
  return error instanceof FirebaseError && error.code.includes(
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  );
}
function getInstallationsEndpoint({ projectId }) {
  return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
}
function extractAuthTokenInfoFromResponse(response) {
  return {
    token: response.token,
    requestStatus: 2,
    expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
    creationTime: Date.now()
  };
}
async function getErrorFromResponse(requestName, response) {
  const responseJson = await response.json();
  const errorData = responseJson.error;
  return ERROR_FACTORY2.create("request-failed", {
    requestName,
    serverCode: errorData.code,
    serverMessage: errorData.message,
    serverStatus: errorData.status
  });
}
function getHeaders({ apiKey }) {
  return new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
function getHeadersWithAuth(appConfig, { refreshToken }) {
  const headers = getHeaders(appConfig);
  headers.append("Authorization", getAuthorizationHeader(refreshToken));
  return headers;
}
async function retryIfServerError(fn) {
  const result = await fn();
  if (result.status >= 500 && result.status < 600) {
    return fn();
  }
  return result;
}
function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
  return Number(responseExpiresIn.replace("s", "000"));
}
function getAuthorizationHeader(refreshToken) {
  return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
}
async function createInstallationRequest({ appConfig, heartbeatServiceProvider }, { fid }) {
  const endpoint = getInstallationsEndpoint(appConfig);
  const headers = getHeaders(appConfig);
  const heartbeatService = heartbeatServiceProvider.getImmediate({
    optional: true
  });
  if (heartbeatService) {
    const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
    if (heartbeatsHeader) {
      headers.append("x-firebase-client", heartbeatsHeader);
    }
  }
  const body = {
    fid,
    authVersion: INTERNAL_AUTH_VERSION,
    appId: appConfig.appId,
    sdkVersion: PACKAGE_VERSION
  };
  const request = {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  };
  const response = await retryIfServerError(() => fetch(endpoint, request));
  if (response.ok) {
    const responseValue = await response.json();
    const registeredInstallationEntry = {
      fid: responseValue.fid || fid,
      registrationStatus: 2,
      refreshToken: responseValue.refreshToken,
      authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
    };
    return registeredInstallationEntry;
  } else {
    throw await getErrorFromResponse("Create Installation", response);
  }
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function bufferToBase64UrlSafe(array) {
  const b64 = btoa(String.fromCharCode(...array));
  return b64.replace(/\+/g, "-").replace(/\//g, "_");
}
var VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
var INVALID_FID = "";
function generateFid() {
  try {
    const fidByteArray = new Uint8Array(17);
    const crypto = self.crypto || self.msCrypto;
    crypto.getRandomValues(fidByteArray);
    fidByteArray[0] = 112 + fidByteArray[0] % 16;
    const fid = encode(fidByteArray);
    return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
  } catch {
    return INVALID_FID;
  }
}
function encode(fidByteArray) {
  const b64String = bufferToBase64UrlSafe(fidByteArray);
  return b64String.substr(0, 22);
}
function getKey(appConfig) {
  return `${appConfig.appName}!${appConfig.appId}`;
}
var fidChangeCallbacks = /* @__PURE__ */ new Map();
function fidChanged(appConfig, fid) {
  const key = getKey(appConfig);
  callFidChangeCallbacks(key, fid);
  broadcastFidChange(key, fid);
}
function callFidChangeCallbacks(key, fid) {
  const callbacks = fidChangeCallbacks.get(key);
  if (!callbacks) {
    return;
  }
  for (const callback of callbacks) {
    callback(fid);
  }
}
function broadcastFidChange(key, fid) {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage({ key, fid });
  }
  closeBroadcastChannel();
}
var broadcastChannel = null;
function getBroadcastChannel() {
  if (!broadcastChannel && "BroadcastChannel" in self) {
    broadcastChannel = new BroadcastChannel("[Firebase] FID Change");
    broadcastChannel.onmessage = (e) => {
      callFidChangeCallbacks(e.data.key, e.data.fid);
    };
  }
  return broadcastChannel;
}
function closeBroadcastChannel() {
  if (fidChangeCallbacks.size === 0 && broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}
var DATABASE_NAME = "firebase-installations-database";
var DATABASE_VERSION = 1;
var OBJECT_STORE_NAME = "firebase-installations-store";
var dbPromise2 = null;
function getDbPromise2() {
  if (!dbPromise2) {
    dbPromise2 = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade: (db2, oldVersion) => {
        switch (oldVersion) {
          case 0:
            db2.createObjectStore(OBJECT_STORE_NAME);
        }
      }
    });
  }
  return dbPromise2;
}
async function set(appConfig, value) {
  const key = getKey(appConfig);
  const db2 = await getDbPromise2();
  const tx = db2.transaction(OBJECT_STORE_NAME, "readwrite");
  const objectStore = tx.objectStore(OBJECT_STORE_NAME);
  const oldValue = await objectStore.get(key);
  await objectStore.put(value, key);
  await tx.done;
  if (!oldValue || oldValue.fid !== value.fid) {
    fidChanged(appConfig, value.fid);
  }
  return value;
}
async function remove(appConfig) {
  const key = getKey(appConfig);
  const db2 = await getDbPromise2();
  const tx = db2.transaction(OBJECT_STORE_NAME, "readwrite");
  await tx.objectStore(OBJECT_STORE_NAME).delete(key);
  await tx.done;
}
async function update(appConfig, updateFn) {
  const key = getKey(appConfig);
  const db2 = await getDbPromise2();
  const tx = db2.transaction(OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  const oldValue = await store.get(key);
  const newValue = updateFn(oldValue);
  if (newValue === void 0) {
    await store.delete(key);
  } else {
    await store.put(newValue, key);
  }
  await tx.done;
  if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) {
    fidChanged(appConfig, newValue.fid);
  }
  return newValue;
}
async function getInstallationEntry(installations) {
  let registrationPromise;
  const installationEntry = await update(installations.appConfig, (oldEntry) => {
    const installationEntry2 = updateOrCreateInstallationEntry(oldEntry);
    const entryWithPromise = triggerRegistrationIfNecessary(installations, installationEntry2);
    registrationPromise = entryWithPromise.registrationPromise;
    return entryWithPromise.installationEntry;
  });
  if (installationEntry.fid === INVALID_FID) {
    return { installationEntry: await registrationPromise };
  }
  return {
    installationEntry,
    registrationPromise
  };
}
function updateOrCreateInstallationEntry(oldEntry) {
  const entry = oldEntry || {
    fid: generateFid(),
    registrationStatus: 0
    /* RequestStatus.NOT_STARTED */
  };
  return clearTimedOutRequest(entry);
}
function triggerRegistrationIfNecessary(installations, installationEntry) {
  if (installationEntry.registrationStatus === 0) {
    if (!navigator.onLine) {
      const registrationPromiseWithError = Promise.reject(ERROR_FACTORY2.create(
        "app-offline"
        /* ErrorCode.APP_OFFLINE */
      ));
      return {
        installationEntry,
        registrationPromise: registrationPromiseWithError
      };
    }
    const inProgressEntry = {
      fid: installationEntry.fid,
      registrationStatus: 1,
      registrationTime: Date.now()
    };
    const registrationPromise = registerInstallation(installations, inProgressEntry);
    return { installationEntry: inProgressEntry, registrationPromise };
  } else if (installationEntry.registrationStatus === 1) {
    return {
      installationEntry,
      registrationPromise: waitUntilFidRegistration(installations)
    };
  } else {
    return { installationEntry };
  }
}
async function registerInstallation(installations, installationEntry) {
  try {
    const registeredInstallationEntry = await createInstallationRequest(installations, installationEntry);
    return set(installations.appConfig, registeredInstallationEntry);
  } catch (e) {
    if (isServerError(e) && e.customData.serverCode === 409) {
      await remove(installations.appConfig);
    } else {
      await set(installations.appConfig, {
        fid: installationEntry.fid,
        registrationStatus: 0
        /* RequestStatus.NOT_STARTED */
      });
    }
    throw e;
  }
}
async function waitUntilFidRegistration(installations) {
  let entry = await updateInstallationRequest(installations.appConfig);
  while (entry.registrationStatus === 1) {
    await sleep(100);
    entry = await updateInstallationRequest(installations.appConfig);
  }
  if (entry.registrationStatus === 0) {
    const { installationEntry, registrationPromise } = await getInstallationEntry(installations);
    if (registrationPromise) {
      return registrationPromise;
    } else {
      return installationEntry;
    }
  }
  return entry;
}
function updateInstallationRequest(appConfig) {
  return update(appConfig, (oldEntry) => {
    if (!oldEntry) {
      throw ERROR_FACTORY2.create(
        "installation-not-found"
        /* ErrorCode.INSTALLATION_NOT_FOUND */
      );
    }
    return clearTimedOutRequest(oldEntry);
  });
}
function clearTimedOutRequest(entry) {
  if (hasInstallationRequestTimedOut(entry)) {
    return {
      fid: entry.fid,
      registrationStatus: 0
      /* RequestStatus.NOT_STARTED */
    };
  }
  return entry;
}
function hasInstallationRequestTimedOut(installationEntry) {
  return installationEntry.registrationStatus === 1 && installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now();
}
async function generateAuthTokenRequest({ appConfig, heartbeatServiceProvider }, installationEntry) {
  const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
  const headers = getHeadersWithAuth(appConfig, installationEntry);
  const heartbeatService = heartbeatServiceProvider.getImmediate({
    optional: true
  });
  if (heartbeatService) {
    const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
    if (heartbeatsHeader) {
      headers.append("x-firebase-client", heartbeatsHeader);
    }
  }
  const body = {
    installation: {
      sdkVersion: PACKAGE_VERSION,
      appId: appConfig.appId
    }
  };
  const request = {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  };
  const response = await retryIfServerError(() => fetch(endpoint, request));
  if (response.ok) {
    const responseValue = await response.json();
    const completedAuthToken = extractAuthTokenInfoFromResponse(responseValue);
    return completedAuthToken;
  } else {
    throw await getErrorFromResponse("Generate Auth Token", response);
  }
}
function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
  return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
}
async function refreshAuthToken(installations, forceRefresh = false) {
  let tokenPromise;
  const entry = await update(installations.appConfig, (oldEntry) => {
    if (!isEntryRegistered(oldEntry)) {
      throw ERROR_FACTORY2.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    }
    const oldAuthToken = oldEntry.authToken;
    if (!forceRefresh && isAuthTokenValid(oldAuthToken)) {
      return oldEntry;
    } else if (oldAuthToken.requestStatus === 1) {
      tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
      return oldEntry;
    } else {
      if (!navigator.onLine) {
        throw ERROR_FACTORY2.create(
          "app-offline"
          /* ErrorCode.APP_OFFLINE */
        );
      }
      const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
      tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
      return inProgressEntry;
    }
  });
  const authToken = tokenPromise ? await tokenPromise : entry.authToken;
  return authToken;
}
async function waitUntilAuthTokenRequest(installations, forceRefresh) {
  let entry = await updateAuthTokenRequest(installations.appConfig);
  while (entry.authToken.requestStatus === 1) {
    await sleep(100);
    entry = await updateAuthTokenRequest(installations.appConfig);
  }
  const authToken = entry.authToken;
  if (authToken.requestStatus === 0) {
    return refreshAuthToken(installations, forceRefresh);
  } else {
    return authToken;
  }
}
function updateAuthTokenRequest(appConfig) {
  return update(appConfig, (oldEntry) => {
    if (!isEntryRegistered(oldEntry)) {
      throw ERROR_FACTORY2.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    }
    const oldAuthToken = oldEntry.authToken;
    if (hasAuthTokenRequestTimedOut(oldAuthToken)) {
      return {
        ...oldEntry,
        authToken: {
          requestStatus: 0
          /* RequestStatus.NOT_STARTED */
        }
      };
    }
    return oldEntry;
  });
}
async function fetchAuthTokenFromServer(installations, installationEntry) {
  try {
    const authToken = await generateAuthTokenRequest(installations, installationEntry);
    const updatedInstallationEntry = {
      ...installationEntry,
      authToken
    };
    await set(installations.appConfig, updatedInstallationEntry);
    return authToken;
  } catch (e) {
    if (isServerError(e) && (e.customData.serverCode === 401 || e.customData.serverCode === 404)) {
      await remove(installations.appConfig);
    } else {
      const updatedInstallationEntry = {
        ...installationEntry,
        authToken: {
          requestStatus: 0
          /* RequestStatus.NOT_STARTED */
        }
      };
      await set(installations.appConfig, updatedInstallationEntry);
    }
    throw e;
  }
}
function isEntryRegistered(installationEntry) {
  return installationEntry !== void 0 && installationEntry.registrationStatus === 2;
}
function isAuthTokenValid(authToken) {
  return authToken.requestStatus === 2 && !isAuthTokenExpired(authToken);
}
function isAuthTokenExpired(authToken) {
  const now = Date.now();
  return now < authToken.creationTime || authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER;
}
function makeAuthTokenRequestInProgressEntry(oldEntry) {
  const inProgressAuthToken = {
    requestStatus: 1,
    requestTime: Date.now()
  };
  return {
    ...oldEntry,
    authToken: inProgressAuthToken
  };
}
function hasAuthTokenRequestTimedOut(authToken) {
  return authToken.requestStatus === 1 && authToken.requestTime + PENDING_TIMEOUT_MS < Date.now();
}
async function getId(installations) {
  const installationsImpl = installations;
  const { installationEntry, registrationPromise } = await getInstallationEntry(installationsImpl);
  if (registrationPromise) {
    registrationPromise.catch(console.error);
  } else {
    refreshAuthToken(installationsImpl).catch(console.error);
  }
  return installationEntry.fid;
}
async function getToken(installations, forceRefresh = false) {
  const installationsImpl = installations;
  await completeInstallationRegistration(installationsImpl);
  const authToken = await refreshAuthToken(installationsImpl, forceRefresh);
  return authToken.token;
}
async function completeInstallationRegistration(installations) {
  const { registrationPromise } = await getInstallationEntry(installations);
  if (registrationPromise) {
    await registrationPromise;
  }
}
function extractAppConfig(app2) {
  if (!app2 || !app2.options) {
    throw getMissingValueError("App Configuration");
  }
  if (!app2.name) {
    throw getMissingValueError("App Name");
  }
  const configKeys = [
    "projectId",
    "apiKey",
    "appId"
  ];
  for (const keyName of configKeys) {
    if (!app2.options[keyName]) {
      throw getMissingValueError(keyName);
    }
  }
  return {
    appName: app2.name,
    projectId: app2.options.projectId,
    apiKey: app2.options.apiKey,
    appId: app2.options.appId
  };
}
function getMissingValueError(valueName) {
  return ERROR_FACTORY2.create("missing-app-config-values", {
    valueName
  });
}
var INSTALLATIONS_NAME = "installations";
var INSTALLATIONS_NAME_INTERNAL = "installations-internal";
var publicFactory = (container) => {
  const app2 = container.getProvider("app").getImmediate();
  const appConfig = extractAppConfig(app2);
  const heartbeatServiceProvider = _getProvider(app2, "heartbeat");
  const installationsImpl = {
    app: app2,
    appConfig,
    heartbeatServiceProvider,
    _delete: () => Promise.resolve()
  };
  return installationsImpl;
};
var internalFactory = (container) => {
  const app2 = container.getProvider("app").getImmediate();
  const installations = _getProvider(app2, INSTALLATIONS_NAME).getImmediate();
  const installationsInternal = {
    getId: () => getId(installations),
    getToken: (forceRefresh) => getToken(installations, forceRefresh)
  };
  return installationsInternal;
};
function registerInstallations() {
  _registerComponent(new Component(
    INSTALLATIONS_NAME,
    publicFactory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    INSTALLATIONS_NAME_INTERNAL,
    internalFactory,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
}
registerInstallations();
registerVersion(name3, version3);
registerVersion(name3, version3, "esm2020");

// node_modules/@firebase/analytics/dist/esm/index.esm.js
var ANALYTICS_TYPE = "analytics";
var GA_FID_KEY = "firebase_id";
var ORIGIN_KEY = "origin";
var FETCH_TIMEOUT_MILLIS = 60 * 1e3;
var DYNAMIC_CONFIG_URL = "https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig";
var GTAG_URL = "https://www.googletagmanager.com/gtag/js";
var logger2 = new Logger("@firebase/analytics");
var ERRORS2 = {
  [
    "already-exists"
    /* AnalyticsError.ALREADY_EXISTS */
  ]: "A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.",
  [
    "already-initialized"
    /* AnalyticsError.ALREADY_INITIALIZED */
  ]: "initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.",
  [
    "already-initialized-settings"
    /* AnalyticsError.ALREADY_INITIALIZED_SETTINGS */
  ]: "Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",
  [
    "interop-component-reg-failed"
    /* AnalyticsError.INTEROP_COMPONENT_REG_FAILED */
  ]: "Firebase Analytics Interop Component failed to instantiate: {$reason}",
  [
    "invalid-analytics-context"
    /* AnalyticsError.INVALID_ANALYTICS_CONTEXT */
  ]: "Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "indexeddb-unavailable"
    /* AnalyticsError.INDEXEDDB_UNAVAILABLE */
  ]: "IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "fetch-throttle"
    /* AnalyticsError.FETCH_THROTTLE */
  ]: "The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.",
  [
    "config-fetch-failed"
    /* AnalyticsError.CONFIG_FETCH_FAILED */
  ]: "Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}",
  [
    "no-api-key"
    /* AnalyticsError.NO_API_KEY */
  ]: 'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',
  [
    "no-app-id"
    /* AnalyticsError.NO_APP_ID */
  ]: 'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',
  [
    "no-client-id"
    /* AnalyticsError.NO_CLIENT_ID */
  ]: 'The "client_id" field is empty.',
  [
    "invalid-gtag-resource"
    /* AnalyticsError.INVALID_GTAG_RESOURCE */
  ]: "Trusted Types detected an invalid gtag resource: {$gtagURL}."
};
var ERROR_FACTORY3 = new ErrorFactory("analytics", "Analytics", ERRORS2);
function createGtagTrustedTypesScriptURL(url) {
  if (!url.startsWith(GTAG_URL)) {
    const err = ERROR_FACTORY3.create("invalid-gtag-resource", {
      gtagURL: url
    });
    logger2.warn(err.message);
    return "";
  }
  return url;
}
function promiseAllSettled(promises) {
  return Promise.all(promises.map((promise) => promise.catch((e) => e)));
}
function createTrustedTypesPolicy(policyName, policyOptions) {
  let trustedTypesPolicy;
  if (window.trustedTypes) {
    trustedTypesPolicy = window.trustedTypes.createPolicy(policyName, policyOptions);
  }
  return trustedTypesPolicy;
}
function insertScriptTag(dataLayerName2, measurementId) {
  const trustedTypesPolicy = createTrustedTypesPolicy("firebase-js-sdk-policy", {
    createScriptURL: createGtagTrustedTypesScriptURL
  });
  const script = document.createElement("script");
  const gtagScriptURL = `${GTAG_URL}?l=${dataLayerName2}&id=${measurementId}`;
  script.src = trustedTypesPolicy ? trustedTypesPolicy?.createScriptURL(gtagScriptURL) : gtagScriptURL;
  script.async = true;
  document.head.appendChild(script);
}
function getOrCreateDataLayer(dataLayerName2) {
  let dataLayer = [];
  if (Array.isArray(window[dataLayerName2])) {
    dataLayer = window[dataLayerName2];
  } else {
    window[dataLayerName2] = dataLayer;
  }
  return dataLayer;
}
async function gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams) {
  const correspondingAppId = measurementIdToAppId2[measurementId];
  try {
    if (correspondingAppId) {
      await initializationPromisesMap2[correspondingAppId];
    } else {
      const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList2);
      const foundConfig = dynamicConfigResults.find((config) => config.measurementId === measurementId);
      if (foundConfig) {
        await initializationPromisesMap2[foundConfig.appId];
      }
    }
  } catch (e) {
    logger2.error(e);
  }
  gtagCore("config", measurementId, gtagParams);
}
async function gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams) {
  try {
    let initializationPromisesToWaitFor = [];
    if (gtagParams && gtagParams["send_to"]) {
      let gaSendToList = gtagParams["send_to"];
      if (!Array.isArray(gaSendToList)) {
        gaSendToList = [gaSendToList];
      }
      const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList2);
      for (const sendToId of gaSendToList) {
        const foundConfig = dynamicConfigResults.find((config) => config.measurementId === sendToId);
        const initializationPromise = foundConfig && initializationPromisesMap2[foundConfig.appId];
        if (initializationPromise) {
          initializationPromisesToWaitFor.push(initializationPromise);
        } else {
          initializationPromisesToWaitFor = [];
          break;
        }
      }
    }
    if (initializationPromisesToWaitFor.length === 0) {
      initializationPromisesToWaitFor = Object.values(initializationPromisesMap2);
    }
    await Promise.all(initializationPromisesToWaitFor);
    gtagCore("event", measurementId, gtagParams || {});
  } catch (e) {
    logger2.error(e);
  }
}
function wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2) {
  async function gtagWrapper(command, ...args) {
    try {
      if (command === "event") {
        const [measurementId, gtagParams] = args;
        await gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams);
      } else if (command === "config") {
        const [measurementId, gtagParams] = args;
        await gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams);
      } else if (command === "consent") {
        const [consentAction, gtagParams] = args;
        gtagCore("consent", consentAction, gtagParams);
      } else if (command === "get") {
        const [measurementId, fieldName, callback] = args;
        gtagCore("get", measurementId, fieldName, callback);
      } else if (command === "set") {
        const [customParams] = args;
        gtagCore("set", customParams);
      } else {
        gtagCore(command, ...args);
      }
    } catch (e) {
      logger2.error(e);
    }
  }
  return gtagWrapper;
}
function wrapOrCreateGtag(initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, dataLayerName2, gtagFunctionName) {
  let gtagCore = function(..._args) {
    window[dataLayerName2].push(arguments);
  };
  if (window[gtagFunctionName] && typeof window[gtagFunctionName] === "function") {
    gtagCore = window[gtagFunctionName];
  }
  window[gtagFunctionName] = wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2);
  return {
    gtagCore,
    wrappedGtag: window[gtagFunctionName]
  };
}
function findGtagScriptOnPage(dataLayerName2) {
  const scriptTags = window.document.getElementsByTagName("script");
  for (const tag of Object.values(scriptTags)) {
    if (tag.src && tag.src.includes(GTAG_URL) && tag.src.includes(dataLayerName2)) {
      return tag;
    }
  }
  return null;
}
var LONG_RETRY_FACTOR = 30;
var BASE_INTERVAL_MILLIS = 1e3;
var RetryData = class {
  constructor(throttleMetadata = {}, intervalMillis = BASE_INTERVAL_MILLIS) {
    this.throttleMetadata = throttleMetadata;
    this.intervalMillis = intervalMillis;
  }
  getThrottleMetadata(appId) {
    return this.throttleMetadata[appId];
  }
  setThrottleMetadata(appId, metadata) {
    this.throttleMetadata[appId] = metadata;
  }
  deleteThrottleMetadata(appId) {
    delete this.throttleMetadata[appId];
  }
};
var defaultRetryData = new RetryData();
function getHeaders2(apiKey) {
  return new Headers({
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
async function fetchDynamicConfig(appFields) {
  const { appId, apiKey } = appFields;
  const request = {
    method: "GET",
    headers: getHeaders2(apiKey)
  };
  const appUrl = DYNAMIC_CONFIG_URL.replace("{app-id}", appId);
  const response = await fetch(appUrl, request);
  if (response.status !== 200 && response.status !== 304) {
    let errorMessage = "";
    try {
      const jsonResponse = await response.json();
      if (jsonResponse.error?.message) {
        errorMessage = jsonResponse.error.message;
      }
    } catch (_ignored) {
    }
    throw ERROR_FACTORY3.create("config-fetch-failed", {
      httpStatus: response.status,
      responseMessage: errorMessage
    });
  }
  return response.json();
}
async function fetchDynamicConfigWithRetry(app2, retryData = defaultRetryData, timeoutMillis) {
  const { appId, apiKey, measurementId } = app2.options;
  if (!appId) {
    throw ERROR_FACTORY3.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!apiKey) {
    if (measurementId) {
      return {
        measurementId,
        appId
      };
    }
    throw ERROR_FACTORY3.create(
      "no-api-key"
      /* AnalyticsError.NO_API_KEY */
    );
  }
  const throttleMetadata = retryData.getThrottleMetadata(appId) || {
    backoffCount: 0,
    throttleEndTimeMillis: Date.now()
  };
  const signal = new AnalyticsAbortSignal();
  setTimeout(async () => {
    signal.abort();
  }, timeoutMillis !== void 0 ? timeoutMillis : FETCH_TIMEOUT_MILLIS);
  return attemptFetchDynamicConfigWithRetry({ appId, apiKey, measurementId }, throttleMetadata, signal, retryData);
}
async function attemptFetchDynamicConfigWithRetry(appFields, { throttleEndTimeMillis, backoffCount }, signal, retryData = defaultRetryData) {
  const { appId, measurementId } = appFields;
  try {
    await setAbortableTimeout(signal, throttleEndTimeMillis);
  } catch (e) {
    if (measurementId) {
      logger2.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${e?.message}]`);
      return { appId, measurementId };
    }
    throw e;
  }
  try {
    const response = await fetchDynamicConfig(appFields);
    retryData.deleteThrottleMetadata(appId);
    return response;
  } catch (e) {
    const error = e;
    if (!isRetriableError(error)) {
      retryData.deleteThrottleMetadata(appId);
      if (measurementId) {
        logger2.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${error?.message}]`);
        return { appId, measurementId };
      } else {
        throw e;
      }
    }
    const backoffMillis = Number(error?.customData?.httpStatus) === 503 ? calculateBackoffMillis(backoffCount, retryData.intervalMillis, LONG_RETRY_FACTOR) : calculateBackoffMillis(backoffCount, retryData.intervalMillis);
    const throttleMetadata = {
      throttleEndTimeMillis: Date.now() + backoffMillis,
      backoffCount: backoffCount + 1
    };
    retryData.setThrottleMetadata(appId, throttleMetadata);
    logger2.debug(`Calling attemptFetch again in ${backoffMillis} millis`);
    return attemptFetchDynamicConfigWithRetry(appFields, throttleMetadata, signal, retryData);
  }
}
function setAbortableTimeout(signal, throttleEndTimeMillis) {
  return new Promise((resolve, reject) => {
    const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
    const timeout = setTimeout(resolve, backoffMillis);
    signal.addEventListener(() => {
      clearTimeout(timeout);
      reject(ERROR_FACTORY3.create("fetch-throttle", {
        throttleEndTimeMillis
      }));
    });
  });
}
function isRetriableError(e) {
  if (!(e instanceof FirebaseError) || !e.customData) {
    return false;
  }
  const httpStatus = Number(e.customData["httpStatus"]);
  return httpStatus === 429 || httpStatus === 500 || httpStatus === 503 || httpStatus === 504;
}
var AnalyticsAbortSignal = class {
  constructor() {
    this.listeners = [];
  }
  addEventListener(listener) {
    this.listeners.push(listener);
  }
  abort() {
    this.listeners.forEach((listener) => listener());
  }
};
var defaultEventParametersForInit;
async function logEvent$1(gtagFunction, initializationPromise, eventName, eventParams, options) {
  if (options && options.global) {
    gtagFunction("event", eventName, eventParams);
    return;
  } else {
    const measurementId = await initializationPromise;
    const params = {
      ...eventParams,
      "send_to": measurementId
    };
    gtagFunction("event", eventName, params);
  }
}
var defaultConsentSettingsForInit;
function _setConsentDefaultForInit(consentSettings) {
  defaultConsentSettingsForInit = consentSettings;
}
function _setDefaultEventParametersForInit(customParams) {
  defaultEventParametersForInit = customParams;
}
async function validateIndexedDB() {
  if (!isIndexedDBAvailable()) {
    logger2.warn(ERROR_FACTORY3.create("indexeddb-unavailable", {
      errorInfo: "IndexedDB is not available in this environment."
    }).message);
    return false;
  } else {
    try {
      await validateIndexedDBOpenable();
    } catch (e) {
      logger2.warn(ERROR_FACTORY3.create("indexeddb-unavailable", {
        errorInfo: e?.toString()
      }).message);
      return false;
    }
  }
  return true;
}
async function _initializeAnalytics(app2, dynamicConfigPromisesList2, measurementIdToAppId2, installations, gtagCore, dataLayerName2, options) {
  const dynamicConfigPromise = fetchDynamicConfigWithRetry(app2);
  dynamicConfigPromise.then((config) => {
    measurementIdToAppId2[config.measurementId] = config.appId;
    if (app2.options.measurementId && config.measurementId !== app2.options.measurementId) {
      logger2.warn(`The measurement ID in the local Firebase config (${app2.options.measurementId}) does not match the measurement ID fetched from the server (${config.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`);
    }
  }).catch((e) => logger2.error(e));
  dynamicConfigPromisesList2.push(dynamicConfigPromise);
  const fidPromise = validateIndexedDB().then((envIsValid) => {
    if (envIsValid) {
      return installations.getId();
    } else {
      return void 0;
    }
  });
  const [dynamicConfig, fid] = await Promise.all([
    dynamicConfigPromise,
    fidPromise
  ]);
  if (!findGtagScriptOnPage(dataLayerName2)) {
    insertScriptTag(dataLayerName2, dynamicConfig.measurementId);
  }
  if (defaultConsentSettingsForInit) {
    gtagCore("consent", "default", defaultConsentSettingsForInit);
    _setConsentDefaultForInit(void 0);
  }
  gtagCore("js", /* @__PURE__ */ new Date());
  const configProperties = options?.config ?? {};
  configProperties[ORIGIN_KEY] = "firebase";
  configProperties.update = true;
  if (fid != null) {
    configProperties[GA_FID_KEY] = fid;
  }
  gtagCore("config", dynamicConfig.measurementId, configProperties);
  if (defaultEventParametersForInit) {
    gtagCore("set", defaultEventParametersForInit);
    _setDefaultEventParametersForInit(void 0);
  }
  return dynamicConfig.measurementId;
}
var AnalyticsService = class {
  constructor(app2) {
    this.app = app2;
  }
  _delete() {
    delete initializationPromisesMap[this.app.options.appId];
    return Promise.resolve();
  }
};
var initializationPromisesMap = {};
var dynamicConfigPromisesList = [];
var measurementIdToAppId = {};
var dataLayerName = "dataLayer";
var gtagName = "gtag";
var gtagCoreFunction;
var wrappedGtagFunction;
var globalInitDone = false;
function warnOnBrowserContextMismatch() {
  const mismatchedEnvMessages = [];
  if (isBrowserExtension()) {
    mismatchedEnvMessages.push("This is a browser extension environment.");
  }
  if (!areCookiesEnabled()) {
    mismatchedEnvMessages.push("Cookies are not available.");
  }
  if (mismatchedEnvMessages.length > 0) {
    const details = mismatchedEnvMessages.map((message, index) => `(${index + 1}) ${message}`).join(" ");
    const err = ERROR_FACTORY3.create("invalid-analytics-context", {
      errorInfo: details
    });
    logger2.warn(err.message);
  }
}
function factory(app2, installations, options) {
  warnOnBrowserContextMismatch();
  const appId = app2.options.appId;
  if (!appId) {
    throw ERROR_FACTORY3.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!app2.options.apiKey) {
    if (app2.options.measurementId) {
      logger2.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${app2.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);
    } else {
      throw ERROR_FACTORY3.create(
        "no-api-key"
        /* AnalyticsError.NO_API_KEY */
      );
    }
  }
  if (initializationPromisesMap[appId] != null) {
    throw ERROR_FACTORY3.create("already-exists", {
      id: appId
    });
  }
  if (!globalInitDone) {
    getOrCreateDataLayer(dataLayerName);
    const { wrappedGtag, gtagCore } = wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagName);
    wrappedGtagFunction = wrappedGtag;
    gtagCoreFunction = gtagCore;
    globalInitDone = true;
  }
  initializationPromisesMap[appId] = _initializeAnalytics(app2, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCoreFunction, dataLayerName, options);
  const analyticsInstance = new AnalyticsService(app2);
  return analyticsInstance;
}
function getAnalytics(app2 = getApp()) {
  app2 = getModularInstance(app2);
  const analyticsProvider = _getProvider(app2, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    return analyticsProvider.getImmediate();
  }
  return initializeAnalytics(app2);
}
function initializeAnalytics(app2, options = {}) {
  const analyticsProvider = _getProvider(app2, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    const existingInstance = analyticsProvider.getImmediate();
    if (deepEqual(options, analyticsProvider.getOptions())) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY3.create(
        "already-initialized"
        /* AnalyticsError.ALREADY_INITIALIZED */
      );
    }
  }
  const analyticsInstance = analyticsProvider.initialize({ options });
  return analyticsInstance;
}
function logEvent(analyticsInstance, eventName, eventParams, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  logEvent$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], eventName, eventParams, options).catch((e) => logger2.error(e));
}
var name4 = "@firebase/analytics";
var version4 = "0.10.18";
function registerAnalytics() {
  _registerComponent(new Component(
    ANALYTICS_TYPE,
    (container, { options: analyticsOptions }) => {
      const app2 = container.getProvider("app").getImmediate();
      const installations = container.getProvider("installations-internal").getImmediate();
      return factory(app2, installations, analyticsOptions);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    "analytics-internal",
    internalFactory2,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name4, version4);
  registerVersion(name4, version4, "esm2020");
  function internalFactory2(container) {
    try {
      const analytics2 = container.getProvider(ANALYTICS_TYPE).getImmediate();
      return {
        logEvent: (eventName, eventParams, options) => logEvent(analytics2, eventName, eventParams, options)
      };
    } catch (e) {
      throw ERROR_FACTORY3.create("interop-component-reg-failed", {
        reason: e
      });
    }
  }
}
registerAnalytics();

// node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var bloom_blob_es2018 = {};
var Integer;
var Md5;
(function() {
  var h;
  function k2(f, a2) {
    function c2() {
    }
    c2.prototype = a2.prototype;
    f.D = a2.prototype;
    f.prototype = new c2();
    f.prototype.constructor = f;
    f.C = function(d, e, g) {
      for (var b = Array(arguments.length - 2), r2 = 2; r2 < arguments.length; r2++) b[r2 - 2] = arguments[r2];
      return a2.prototype[e].apply(d, b);
    };
  }
  function l() {
    this.blockSize = -1;
  }
  function m() {
    this.blockSize = -1;
    this.blockSize = 64;
    this.g = Array(4);
    this.B = Array(this.blockSize);
    this.o = this.h = 0;
    this.s();
  }
  k2(m, l);
  m.prototype.s = function() {
    this.g[0] = 1732584193;
    this.g[1] = 4023233417;
    this.g[2] = 2562383102;
    this.g[3] = 271733878;
    this.o = this.h = 0;
  };
  function n(f, a2, c2) {
    c2 || (c2 = 0);
    var d = Array(16);
    if ("string" === typeof a2) for (var e = 0; 16 > e; ++e) d[e] = a2.charCodeAt(c2++) | a2.charCodeAt(c2++) << 8 | a2.charCodeAt(c2++) << 16 | a2.charCodeAt(c2++) << 24;
    else for (e = 0; 16 > e; ++e) d[e] = a2[c2++] | a2[c2++] << 8 | a2[c2++] << 16 | a2[c2++] << 24;
    a2 = f.g[0];
    c2 = f.g[1];
    e = f.g[2];
    var g = f.g[3];
    var b = a2 + (g ^ c2 & (e ^ g)) + d[0] + 3614090360 & 4294967295;
    a2 = c2 + (b << 7 & 4294967295 | b >>> 25);
    b = g + (e ^ a2 & (c2 ^ e)) + d[1] + 3905402710 & 4294967295;
    g = a2 + (b << 12 & 4294967295 | b >>> 20);
    b = e + (c2 ^ g & (a2 ^ c2)) + d[2] + 606105819 & 4294967295;
    e = g + (b << 17 & 4294967295 | b >>> 15);
    b = c2 + (a2 ^ e & (g ^ a2)) + d[3] + 3250441966 & 4294967295;
    c2 = e + (b << 22 & 4294967295 | b >>> 10);
    b = a2 + (g ^ c2 & (e ^ g)) + d[4] + 4118548399 & 4294967295;
    a2 = c2 + (b << 7 & 4294967295 | b >>> 25);
    b = g + (e ^ a2 & (c2 ^ e)) + d[5] + 1200080426 & 4294967295;
    g = a2 + (b << 12 & 4294967295 | b >>> 20);
    b = e + (c2 ^ g & (a2 ^ c2)) + d[6] + 2821735955 & 4294967295;
    e = g + (b << 17 & 4294967295 | b >>> 15);
    b = c2 + (a2 ^ e & (g ^ a2)) + d[7] + 4249261313 & 4294967295;
    c2 = e + (b << 22 & 4294967295 | b >>> 10);
    b = a2 + (g ^ c2 & (e ^ g)) + d[8] + 1770035416 & 4294967295;
    a2 = c2 + (b << 7 & 4294967295 | b >>> 25);
    b = g + (e ^ a2 & (c2 ^ e)) + d[9] + 2336552879 & 4294967295;
    g = a2 + (b << 12 & 4294967295 | b >>> 20);
    b = e + (c2 ^ g & (a2 ^ c2)) + d[10] + 4294925233 & 4294967295;
    e = g + (b << 17 & 4294967295 | b >>> 15);
    b = c2 + (a2 ^ e & (g ^ a2)) + d[11] + 2304563134 & 4294967295;
    c2 = e + (b << 22 & 4294967295 | b >>> 10);
    b = a2 + (g ^ c2 & (e ^ g)) + d[12] + 1804603682 & 4294967295;
    a2 = c2 + (b << 7 & 4294967295 | b >>> 25);
    b = g + (e ^ a2 & (c2 ^ e)) + d[13] + 4254626195 & 4294967295;
    g = a2 + (b << 12 & 4294967295 | b >>> 20);
    b = e + (c2 ^ g & (a2 ^ c2)) + d[14] + 2792965006 & 4294967295;
    e = g + (b << 17 & 4294967295 | b >>> 15);
    b = c2 + (a2 ^ e & (g ^ a2)) + d[15] + 1236535329 & 4294967295;
    c2 = e + (b << 22 & 4294967295 | b >>> 10);
    b = a2 + (e ^ g & (c2 ^ e)) + d[1] + 4129170786 & 4294967295;
    a2 = c2 + (b << 5 & 4294967295 | b >>> 27);
    b = g + (c2 ^ e & (a2 ^ c2)) + d[6] + 3225465664 & 4294967295;
    g = a2 + (b << 9 & 4294967295 | b >>> 23);
    b = e + (a2 ^ c2 & (g ^ a2)) + d[11] + 643717713 & 4294967295;
    e = g + (b << 14 & 4294967295 | b >>> 18);
    b = c2 + (g ^ a2 & (e ^ g)) + d[0] + 3921069994 & 4294967295;
    c2 = e + (b << 20 & 4294967295 | b >>> 12);
    b = a2 + (e ^ g & (c2 ^ e)) + d[5] + 3593408605 & 4294967295;
    a2 = c2 + (b << 5 & 4294967295 | b >>> 27);
    b = g + (c2 ^ e & (a2 ^ c2)) + d[10] + 38016083 & 4294967295;
    g = a2 + (b << 9 & 4294967295 | b >>> 23);
    b = e + (a2 ^ c2 & (g ^ a2)) + d[15] + 3634488961 & 4294967295;
    e = g + (b << 14 & 4294967295 | b >>> 18);
    b = c2 + (g ^ a2 & (e ^ g)) + d[4] + 3889429448 & 4294967295;
    c2 = e + (b << 20 & 4294967295 | b >>> 12);
    b = a2 + (e ^ g & (c2 ^ e)) + d[9] + 568446438 & 4294967295;
    a2 = c2 + (b << 5 & 4294967295 | b >>> 27);
    b = g + (c2 ^ e & (a2 ^ c2)) + d[14] + 3275163606 & 4294967295;
    g = a2 + (b << 9 & 4294967295 | b >>> 23);
    b = e + (a2 ^ c2 & (g ^ a2)) + d[3] + 4107603335 & 4294967295;
    e = g + (b << 14 & 4294967295 | b >>> 18);
    b = c2 + (g ^ a2 & (e ^ g)) + d[8] + 1163531501 & 4294967295;
    c2 = e + (b << 20 & 4294967295 | b >>> 12);
    b = a2 + (e ^ g & (c2 ^ e)) + d[13] + 2850285829 & 4294967295;
    a2 = c2 + (b << 5 & 4294967295 | b >>> 27);
    b = g + (c2 ^ e & (a2 ^ c2)) + d[2] + 4243563512 & 4294967295;
    g = a2 + (b << 9 & 4294967295 | b >>> 23);
    b = e + (a2 ^ c2 & (g ^ a2)) + d[7] + 1735328473 & 4294967295;
    e = g + (b << 14 & 4294967295 | b >>> 18);
    b = c2 + (g ^ a2 & (e ^ g)) + d[12] + 2368359562 & 4294967295;
    c2 = e + (b << 20 & 4294967295 | b >>> 12);
    b = a2 + (c2 ^ e ^ g) + d[5] + 4294588738 & 4294967295;
    a2 = c2 + (b << 4 & 4294967295 | b >>> 28);
    b = g + (a2 ^ c2 ^ e) + d[8] + 2272392833 & 4294967295;
    g = a2 + (b << 11 & 4294967295 | b >>> 21);
    b = e + (g ^ a2 ^ c2) + d[11] + 1839030562 & 4294967295;
    e = g + (b << 16 & 4294967295 | b >>> 16);
    b = c2 + (e ^ g ^ a2) + d[14] + 4259657740 & 4294967295;
    c2 = e + (b << 23 & 4294967295 | b >>> 9);
    b = a2 + (c2 ^ e ^ g) + d[1] + 2763975236 & 4294967295;
    a2 = c2 + (b << 4 & 4294967295 | b >>> 28);
    b = g + (a2 ^ c2 ^ e) + d[4] + 1272893353 & 4294967295;
    g = a2 + (b << 11 & 4294967295 | b >>> 21);
    b = e + (g ^ a2 ^ c2) + d[7] + 4139469664 & 4294967295;
    e = g + (b << 16 & 4294967295 | b >>> 16);
    b = c2 + (e ^ g ^ a2) + d[10] + 3200236656 & 4294967295;
    c2 = e + (b << 23 & 4294967295 | b >>> 9);
    b = a2 + (c2 ^ e ^ g) + d[13] + 681279174 & 4294967295;
    a2 = c2 + (b << 4 & 4294967295 | b >>> 28);
    b = g + (a2 ^ c2 ^ e) + d[0] + 3936430074 & 4294967295;
    g = a2 + (b << 11 & 4294967295 | b >>> 21);
    b = e + (g ^ a2 ^ c2) + d[3] + 3572445317 & 4294967295;
    e = g + (b << 16 & 4294967295 | b >>> 16);
    b = c2 + (e ^ g ^ a2) + d[6] + 76029189 & 4294967295;
    c2 = e + (b << 23 & 4294967295 | b >>> 9);
    b = a2 + (c2 ^ e ^ g) + d[9] + 3654602809 & 4294967295;
    a2 = c2 + (b << 4 & 4294967295 | b >>> 28);
    b = g + (a2 ^ c2 ^ e) + d[12] + 3873151461 & 4294967295;
    g = a2 + (b << 11 & 4294967295 | b >>> 21);
    b = e + (g ^ a2 ^ c2) + d[15] + 530742520 & 4294967295;
    e = g + (b << 16 & 4294967295 | b >>> 16);
    b = c2 + (e ^ g ^ a2) + d[2] + 3299628645 & 4294967295;
    c2 = e + (b << 23 & 4294967295 | b >>> 9);
    b = a2 + (e ^ (c2 | ~g)) + d[0] + 4096336452 & 4294967295;
    a2 = c2 + (b << 6 & 4294967295 | b >>> 26);
    b = g + (c2 ^ (a2 | ~e)) + d[7] + 1126891415 & 4294967295;
    g = a2 + (b << 10 & 4294967295 | b >>> 22);
    b = e + (a2 ^ (g | ~c2)) + d[14] + 2878612391 & 4294967295;
    e = g + (b << 15 & 4294967295 | b >>> 17);
    b = c2 + (g ^ (e | ~a2)) + d[5] + 4237533241 & 4294967295;
    c2 = e + (b << 21 & 4294967295 | b >>> 11);
    b = a2 + (e ^ (c2 | ~g)) + d[12] + 1700485571 & 4294967295;
    a2 = c2 + (b << 6 & 4294967295 | b >>> 26);
    b = g + (c2 ^ (a2 | ~e)) + d[3] + 2399980690 & 4294967295;
    g = a2 + (b << 10 & 4294967295 | b >>> 22);
    b = e + (a2 ^ (g | ~c2)) + d[10] + 4293915773 & 4294967295;
    e = g + (b << 15 & 4294967295 | b >>> 17);
    b = c2 + (g ^ (e | ~a2)) + d[1] + 2240044497 & 4294967295;
    c2 = e + (b << 21 & 4294967295 | b >>> 11);
    b = a2 + (e ^ (c2 | ~g)) + d[8] + 1873313359 & 4294967295;
    a2 = c2 + (b << 6 & 4294967295 | b >>> 26);
    b = g + (c2 ^ (a2 | ~e)) + d[15] + 4264355552 & 4294967295;
    g = a2 + (b << 10 & 4294967295 | b >>> 22);
    b = e + (a2 ^ (g | ~c2)) + d[6] + 2734768916 & 4294967295;
    e = g + (b << 15 & 4294967295 | b >>> 17);
    b = c2 + (g ^ (e | ~a2)) + d[13] + 1309151649 & 4294967295;
    c2 = e + (b << 21 & 4294967295 | b >>> 11);
    b = a2 + (e ^ (c2 | ~g)) + d[4] + 4149444226 & 4294967295;
    a2 = c2 + (b << 6 & 4294967295 | b >>> 26);
    b = g + (c2 ^ (a2 | ~e)) + d[11] + 3174756917 & 4294967295;
    g = a2 + (b << 10 & 4294967295 | b >>> 22);
    b = e + (a2 ^ (g | ~c2)) + d[2] + 718787259 & 4294967295;
    e = g + (b << 15 & 4294967295 | b >>> 17);
    b = c2 + (g ^ (e | ~a2)) + d[9] + 3951481745 & 4294967295;
    f.g[0] = f.g[0] + a2 & 4294967295;
    f.g[1] = f.g[1] + (e + (b << 21 & 4294967295 | b >>> 11)) & 4294967295;
    f.g[2] = f.g[2] + e & 4294967295;
    f.g[3] = f.g[3] + g & 4294967295;
  }
  m.prototype.u = function(f, a2) {
    void 0 === a2 && (a2 = f.length);
    for (var c2 = a2 - this.blockSize, d = this.B, e = this.h, g = 0; g < a2; ) {
      if (0 == e) for (; g <= c2; ) n(this, f, g), g += this.blockSize;
      if ("string" === typeof f) for (; g < a2; ) {
        if (d[e++] = f.charCodeAt(g++), e == this.blockSize) {
          n(this, d);
          e = 0;
          break;
        }
      }
      else for (; g < a2; ) if (d[e++] = f[g++], e == this.blockSize) {
        n(this, d);
        e = 0;
        break;
      }
    }
    this.h = e;
    this.o += a2;
  };
  m.prototype.v = function() {
    var f = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
    f[0] = 128;
    for (var a2 = 1; a2 < f.length - 8; ++a2) f[a2] = 0;
    var c2 = 8 * this.o;
    for (a2 = f.length - 8; a2 < f.length; ++a2) f[a2] = c2 & 255, c2 /= 256;
    this.u(f);
    f = Array(16);
    for (a2 = c2 = 0; 4 > a2; ++a2) for (var d = 0; 32 > d; d += 8) f[c2++] = this.g[a2] >>> d & 255;
    return f;
  };
  function p(f, a2) {
    var c2 = q2;
    return Object.prototype.hasOwnProperty.call(c2, f) ? c2[f] : c2[f] = a2(f);
  }
  function t(f, a2) {
    this.h = a2;
    for (var c2 = [], d = true, e = f.length - 1; 0 <= e; e--) {
      var g = f[e] | 0;
      d && g == a2 || (c2[e] = g, d = false);
    }
    this.g = c2;
  }
  var q2 = {};
  function u(f) {
    return -128 <= f && 128 > f ? p(f, function(a2) {
      return new t([a2 | 0], 0 > a2 ? -1 : 0);
    }) : new t([f | 0], 0 > f ? -1 : 0);
  }
  function v(f) {
    if (isNaN(f) || !isFinite(f)) return w;
    if (0 > f) return x2(v(-f));
    for (var a2 = [], c2 = 1, d = 0; f >= c2; d++) a2[d] = f / c2 | 0, c2 *= 4294967296;
    return new t(a2, 0);
  }
  function y(f, a2) {
    if (0 == f.length) throw Error("number format error: empty string");
    a2 = a2 || 10;
    if (2 > a2 || 36 < a2) throw Error("radix out of range: " + a2);
    if ("-" == f.charAt(0)) return x2(y(f.substring(1), a2));
    if (0 <= f.indexOf("-")) throw Error('number format error: interior "-" character');
    for (var c2 = v(Math.pow(a2, 8)), d = w, e = 0; e < f.length; e += 8) {
      var g = Math.min(8, f.length - e), b = parseInt(f.substring(e, e + g), a2);
      8 > g ? (g = v(Math.pow(a2, g)), d = d.j(g).add(v(b))) : (d = d.j(c2), d = d.add(v(b)));
    }
    return d;
  }
  var w = u(0), z = u(1), A = u(16777216);
  h = t.prototype;
  h.m = function() {
    if (B2(this)) return -x2(this).m();
    for (var f = 0, a2 = 1, c2 = 0; c2 < this.g.length; c2++) {
      var d = this.i(c2);
      f += (0 <= d ? d : 4294967296 + d) * a2;
      a2 *= 4294967296;
    }
    return f;
  };
  h.toString = function(f) {
    f = f || 10;
    if (2 > f || 36 < f) throw Error("radix out of range: " + f);
    if (C(this)) return "0";
    if (B2(this)) return "-" + x2(this).toString(f);
    for (var a2 = v(Math.pow(f, 6)), c2 = this, d = ""; ; ) {
      var e = D(c2, a2).g;
      c2 = F2(c2, e.j(a2));
      var g = ((0 < c2.g.length ? c2.g[0] : c2.h) >>> 0).toString(f);
      c2 = e;
      if (C(c2)) return g + d;
      for (; 6 > g.length; ) g = "0" + g;
      d = g + d;
    }
  };
  h.i = function(f) {
    return 0 > f ? 0 : f < this.g.length ? this.g[f] : this.h;
  };
  function C(f) {
    if (0 != f.h) return false;
    for (var a2 = 0; a2 < f.g.length; a2++) if (0 != f.g[a2]) return false;
    return true;
  }
  function B2(f) {
    return -1 == f.h;
  }
  h.l = function(f) {
    f = F2(this, f);
    return B2(f) ? -1 : C(f) ? 0 : 1;
  };
  function x2(f) {
    for (var a2 = f.g.length, c2 = [], d = 0; d < a2; d++) c2[d] = ~f.g[d];
    return new t(c2, ~f.h).add(z);
  }
  h.abs = function() {
    return B2(this) ? x2(this) : this;
  };
  h.add = function(f) {
    for (var a2 = Math.max(this.g.length, f.g.length), c2 = [], d = 0, e = 0; e <= a2; e++) {
      var g = d + (this.i(e) & 65535) + (f.i(e) & 65535), b = (g >>> 16) + (this.i(e) >>> 16) + (f.i(e) >>> 16);
      d = b >>> 16;
      g &= 65535;
      b &= 65535;
      c2[e] = b << 16 | g;
    }
    return new t(c2, c2[c2.length - 1] & -2147483648 ? -1 : 0);
  };
  function F2(f, a2) {
    return f.add(x2(a2));
  }
  h.j = function(f) {
    if (C(this) || C(f)) return w;
    if (B2(this)) return B2(f) ? x2(this).j(x2(f)) : x2(x2(this).j(f));
    if (B2(f)) return x2(this.j(x2(f)));
    if (0 > this.l(A) && 0 > f.l(A)) return v(this.m() * f.m());
    for (var a2 = this.g.length + f.g.length, c2 = [], d = 0; d < 2 * a2; d++) c2[d] = 0;
    for (d = 0; d < this.g.length; d++) for (var e = 0; e < f.g.length; e++) {
      var g = this.i(d) >>> 16, b = this.i(d) & 65535, r2 = f.i(e) >>> 16, E = f.i(e) & 65535;
      c2[2 * d + 2 * e] += b * E;
      G(c2, 2 * d + 2 * e);
      c2[2 * d + 2 * e + 1] += g * E;
      G(c2, 2 * d + 2 * e + 1);
      c2[2 * d + 2 * e + 1] += b * r2;
      G(c2, 2 * d + 2 * e + 1);
      c2[2 * d + 2 * e + 2] += g * r2;
      G(c2, 2 * d + 2 * e + 2);
    }
    for (d = 0; d < a2; d++) c2[d] = c2[2 * d + 1] << 16 | c2[2 * d];
    for (d = a2; d < 2 * a2; d++) c2[d] = 0;
    return new t(c2, 0);
  };
  function G(f, a2) {
    for (; (f[a2] & 65535) != f[a2]; ) f[a2 + 1] += f[a2] >>> 16, f[a2] &= 65535, a2++;
  }
  function H2(f, a2) {
    this.g = f;
    this.h = a2;
  }
  function D(f, a2) {
    if (C(a2)) throw Error("division by zero");
    if (C(f)) return new H2(w, w);
    if (B2(f)) return a2 = D(x2(f), a2), new H2(x2(a2.g), x2(a2.h));
    if (B2(a2)) return a2 = D(f, x2(a2)), new H2(x2(a2.g), a2.h);
    if (30 < f.g.length) {
      if (B2(f) || B2(a2)) throw Error("slowDivide_ only works with positive integers.");
      for (var c2 = z, d = a2; 0 >= d.l(f); ) c2 = I(c2), d = I(d);
      var e = J2(c2, 1), g = J2(d, 1);
      d = J2(d, 2);
      for (c2 = J2(c2, 2); !C(d); ) {
        var b = g.add(d);
        0 >= b.l(f) && (e = e.add(c2), g = b);
        d = J2(d, 1);
        c2 = J2(c2, 1);
      }
      a2 = F2(f, e.j(a2));
      return new H2(e, a2);
    }
    for (e = w; 0 <= f.l(a2); ) {
      c2 = Math.max(1, Math.floor(f.m() / a2.m()));
      d = Math.ceil(Math.log(c2) / Math.LN2);
      d = 48 >= d ? 1 : Math.pow(2, d - 48);
      g = v(c2);
      for (b = g.j(a2); B2(b) || 0 < b.l(f); ) c2 -= d, g = v(c2), b = g.j(a2);
      C(g) && (g = z);
      e = e.add(g);
      f = F2(f, b);
    }
    return new H2(e, f);
  }
  h.A = function(f) {
    return D(this, f).h;
  };
  h.and = function(f) {
    for (var a2 = Math.max(this.g.length, f.g.length), c2 = [], d = 0; d < a2; d++) c2[d] = this.i(d) & f.i(d);
    return new t(c2, this.h & f.h);
  };
  h.or = function(f) {
    for (var a2 = Math.max(this.g.length, f.g.length), c2 = [], d = 0; d < a2; d++) c2[d] = this.i(d) | f.i(d);
    return new t(c2, this.h | f.h);
  };
  h.xor = function(f) {
    for (var a2 = Math.max(this.g.length, f.g.length), c2 = [], d = 0; d < a2; d++) c2[d] = this.i(d) ^ f.i(d);
    return new t(c2, this.h ^ f.h);
  };
  function I(f) {
    for (var a2 = f.g.length + 1, c2 = [], d = 0; d < a2; d++) c2[d] = f.i(d) << 1 | f.i(d - 1) >>> 31;
    return new t(c2, f.h);
  }
  function J2(f, a2) {
    var c2 = a2 >> 5;
    a2 %= 32;
    for (var d = f.g.length - c2, e = [], g = 0; g < d; g++) e[g] = 0 < a2 ? f.i(g + c2) >>> a2 | f.i(g + c2 + 1) << 32 - a2 : f.i(g + c2);
    return new t(e, f.h);
  }
  m.prototype.digest = m.prototype.v;
  m.prototype.reset = m.prototype.s;
  m.prototype.update = m.prototype.u;
  Md5 = bloom_blob_es2018.Md5 = m;
  t.prototype.add = t.prototype.add;
  t.prototype.multiply = t.prototype.j;
  t.prototype.modulo = t.prototype.A;
  t.prototype.compare = t.prototype.l;
  t.prototype.toNumber = t.prototype.m;
  t.prototype.toString = t.prototype.toString;
  t.prototype.getBits = t.prototype.i;
  t.fromNumber = v;
  t.fromString = y;
  Integer = bloom_blob_es2018.Integer = t;
}).apply(typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

// node_modules/@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js
var commonjsGlobal2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var webchannel_blob_es2018 = {};
var XhrIo;
var FetchXmlHttpFactory;
var WebChannel;
var EventType;
var ErrorCode;
var Stat;
var Event;
var getStatEventTarget;
var createWebChannelTransport;
(function() {
  var h, aa = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a2, b, c2) {
    if (a2 == Array.prototype || a2 == Object.prototype) return a2;
    a2[b] = c2.value;
    return a2;
  };
  function ba(a2) {
    a2 = ["object" == typeof globalThis && globalThis, a2, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof commonjsGlobal2 && commonjsGlobal2];
    for (var b = 0; b < a2.length; ++b) {
      var c2 = a2[b];
      if (c2 && c2.Math == Math) return c2;
    }
    throw Error("Cannot find global object");
  }
  var ca = ba(this);
  function da(a2, b) {
    if (b) a: {
      var c2 = ca;
      a2 = a2.split(".");
      for (var d = 0; d < a2.length - 1; d++) {
        var e = a2[d];
        if (!(e in c2)) break a;
        c2 = c2[e];
      }
      a2 = a2[a2.length - 1];
      d = c2[a2];
      b = b(d);
      b != d && null != b && aa(c2, a2, { configurable: true, writable: true, value: b });
    }
  }
  function ea(a2, b) {
    a2 instanceof String && (a2 += "");
    var c2 = 0, d = false, e = { next: function() {
      if (!d && c2 < a2.length) {
        var f = c2++;
        return { value: b(f, a2[f]), done: false };
      }
      d = true;
      return { done: true, value: void 0 };
    } };
    e[Symbol.iterator] = function() {
      return e;
    };
    return e;
  }
  da("Array.prototype.values", function(a2) {
    return a2 ? a2 : function() {
      return ea(this, function(b, c2) {
        return c2;
      });
    };
  });
  var fa = fa || {}, k2 = this || self;
  function ha(a2) {
    var b = typeof a2;
    b = "object" != b ? b : a2 ? Array.isArray(a2) ? "array" : b : "null";
    return "array" == b || "object" == b && "number" == typeof a2.length;
  }
  function n(a2) {
    var b = typeof a2;
    return "object" == b && null != a2 || "function" == b;
  }
  function ia(a2, b, c2) {
    return a2.call.apply(a2.bind, arguments);
  }
  function ja(a2, b, c2) {
    if (!a2) throw Error();
    if (2 < arguments.length) {
      var d = Array.prototype.slice.call(arguments, 2);
      return function() {
        var e = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(e, d);
        return a2.apply(b, e);
      };
    }
    return function() {
      return a2.apply(b, arguments);
    };
  }
  function p(a2, b, c2) {
    p = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ia : ja;
    return p.apply(null, arguments);
  }
  function ka(a2, b) {
    var c2 = Array.prototype.slice.call(arguments, 1);
    return function() {
      var d = c2.slice();
      d.push.apply(d, arguments);
      return a2.apply(this, d);
    };
  }
  function r2(a2, b) {
    function c2() {
    }
    c2.prototype = b.prototype;
    a2.aa = b.prototype;
    a2.prototype = new c2();
    a2.prototype.constructor = a2;
    a2.Qb = function(d, e, f) {
      for (var g = Array(arguments.length - 2), m = 2; m < arguments.length; m++) g[m - 2] = arguments[m];
      return b.prototype[e].apply(d, g);
    };
  }
  function la(a2) {
    const b = a2.length;
    if (0 < b) {
      const c2 = Array(b);
      for (let d = 0; d < b; d++) c2[d] = a2[d];
      return c2;
    }
    return [];
  }
  function ma(a2, b) {
    for (let c2 = 1; c2 < arguments.length; c2++) {
      const d = arguments[c2];
      if (ha(d)) {
        const e = a2.length || 0, f = d.length || 0;
        a2.length = e + f;
        for (let g = 0; g < f; g++) a2[e + g] = d[g];
      } else a2.push(d);
    }
  }
  class na {
    constructor(a2, b) {
      this.i = a2;
      this.j = b;
      this.h = 0;
      this.g = null;
    }
    get() {
      let a2;
      0 < this.h ? (this.h--, a2 = this.g, this.g = a2.next, a2.next = null) : a2 = this.i();
      return a2;
    }
  }
  function t(a2) {
    return /^[\s\xa0]*$/.test(a2);
  }
  function u() {
    var a2 = k2.navigator;
    return a2 && (a2 = a2.userAgent) ? a2 : "";
  }
  function oa(a2) {
    oa[" "](a2);
    return a2;
  }
  oa[" "] = function() {
  };
  var pa = -1 != u().indexOf("Gecko") && !(-1 != u().toLowerCase().indexOf("webkit") && -1 == u().indexOf("Edge")) && !(-1 != u().indexOf("Trident") || -1 != u().indexOf("MSIE")) && -1 == u().indexOf("Edge");
  function qa(a2, b, c2) {
    for (const d in a2) b.call(c2, a2[d], d, a2);
  }
  function ra(a2, b) {
    for (const c2 in a2) b.call(void 0, a2[c2], c2, a2);
  }
  function sa(a2) {
    const b = {};
    for (const c2 in a2) b[c2] = a2[c2];
    return b;
  }
  const ta = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
  function ua(a2, b) {
    let c2, d;
    for (let e = 1; e < arguments.length; e++) {
      d = arguments[e];
      for (c2 in d) a2[c2] = d[c2];
      for (let f = 0; f < ta.length; f++) c2 = ta[f], Object.prototype.hasOwnProperty.call(d, c2) && (a2[c2] = d[c2]);
    }
  }
  function va(a2) {
    var b = 1;
    a2 = a2.split(":");
    const c2 = [];
    for (; 0 < b && a2.length; ) c2.push(a2.shift()), b--;
    a2.length && c2.push(a2.join(":"));
    return c2;
  }
  function wa(a2) {
    k2.setTimeout(() => {
      throw a2;
    }, 0);
  }
  function xa() {
    var a2 = za;
    let b = null;
    a2.g && (b = a2.g, a2.g = a2.g.next, a2.g || (a2.h = null), b.next = null);
    return b;
  }
  class Aa {
    constructor() {
      this.h = this.g = null;
    }
    add(a2, b) {
      const c2 = Ba.get();
      c2.set(a2, b);
      this.h ? this.h.next = c2 : this.g = c2;
      this.h = c2;
    }
  }
  var Ba = new na(() => new Ca(), (a2) => a2.reset());
  class Ca {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(a2, b) {
      this.h = a2;
      this.g = b;
      this.next = null;
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let x2, y = false, za = new Aa(), Ea = () => {
    const a2 = k2.Promise.resolve(void 0);
    x2 = () => {
      a2.then(Da);
    };
  };
  var Da = () => {
    for (var a2; a2 = xa(); ) {
      try {
        a2.h.call(a2.g);
      } catch (c2) {
        wa(c2);
      }
      var b = Ba;
      b.j(a2);
      100 > b.h && (b.h++, a2.next = b.g, b.g = a2);
    }
    y = false;
  };
  function z() {
    this.s = this.s;
    this.C = this.C;
  }
  z.prototype.s = false;
  z.prototype.ma = function() {
    this.s || (this.s = true, this.N());
  };
  z.prototype.N = function() {
    if (this.C) for (; this.C.length; ) this.C.shift()();
  };
  function A(a2, b) {
    this.type = a2;
    this.g = this.target = b;
    this.defaultPrevented = false;
  }
  A.prototype.h = function() {
    this.defaultPrevented = true;
  };
  var Fa = function() {
    if (!k2.addEventListener || !Object.defineProperty) return false;
    var a2 = false, b = Object.defineProperty({}, "passive", { get: function() {
      a2 = true;
    } });
    try {
      const c2 = () => {
      };
      k2.addEventListener("test", c2, b);
      k2.removeEventListener("test", c2, b);
    } catch (c2) {
    }
    return a2;
  }();
  function C(a2, b) {
    A.call(this, a2 ? a2.type : "");
    this.relatedTarget = this.g = this.target = null;
    this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
    this.key = "";
    this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = false;
    this.state = null;
    this.pointerId = 0;
    this.pointerType = "";
    this.i = null;
    if (a2) {
      var c2 = this.type = a2.type, d = a2.changedTouches && a2.changedTouches.length ? a2.changedTouches[0] : null;
      this.target = a2.target || a2.srcElement;
      this.g = b;
      if (b = a2.relatedTarget) {
        if (pa) {
          a: {
            try {
              oa(b.nodeName);
              var e = true;
              break a;
            } catch (f) {
            }
            e = false;
          }
          e || (b = null);
        }
      } else "mouseover" == c2 ? b = a2.fromElement : "mouseout" == c2 && (b = a2.toElement);
      this.relatedTarget = b;
      d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX, this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = void 0 !== a2.clientX ? a2.clientX : a2.pageX, this.clientY = void 0 !== a2.clientY ? a2.clientY : a2.pageY, this.screenX = a2.screenX || 0, this.screenY = a2.screenY || 0);
      this.button = a2.button;
      this.key = a2.key || "";
      this.ctrlKey = a2.ctrlKey;
      this.altKey = a2.altKey;
      this.shiftKey = a2.shiftKey;
      this.metaKey = a2.metaKey;
      this.pointerId = a2.pointerId || 0;
      this.pointerType = "string" === typeof a2.pointerType ? a2.pointerType : Ga[a2.pointerType] || "";
      this.state = a2.state;
      this.i = a2;
      a2.defaultPrevented && C.aa.h.call(this);
    }
  }
  r2(C, A);
  var Ga = { 2: "touch", 3: "pen", 4: "mouse" };
  C.prototype.h = function() {
    C.aa.h.call(this);
    var a2 = this.i;
    a2.preventDefault ? a2.preventDefault() : a2.returnValue = false;
  };
  var D = "closure_listenable_" + (1e6 * Math.random() | 0);
  var Ha = 0;
  function Ia(a2, b, c2, d, e) {
    this.listener = a2;
    this.proxy = null;
    this.src = b;
    this.type = c2;
    this.capture = !!d;
    this.ha = e;
    this.key = ++Ha;
    this.da = this.fa = false;
  }
  function Ja(a2) {
    a2.da = true;
    a2.listener = null;
    a2.proxy = null;
    a2.src = null;
    a2.ha = null;
  }
  function Ka(a2) {
    this.src = a2;
    this.g = {};
    this.h = 0;
  }
  Ka.prototype.add = function(a2, b, c2, d, e) {
    var f = a2.toString();
    a2 = this.g[f];
    a2 || (a2 = this.g[f] = [], this.h++);
    var g = La(a2, b, d, e);
    -1 < g ? (b = a2[g], c2 || (b.fa = false)) : (b = new Ia(b, this.src, f, !!d, e), b.fa = c2, a2.push(b));
    return b;
  };
  function Ma(a2, b) {
    var c2 = b.type;
    if (c2 in a2.g) {
      var d = a2.g[c2], e = Array.prototype.indexOf.call(d, b, void 0), f;
      (f = 0 <= e) && Array.prototype.splice.call(d, e, 1);
      f && (Ja(b), 0 == a2.g[c2].length && (delete a2.g[c2], a2.h--));
    }
  }
  function La(a2, b, c2, d) {
    for (var e = 0; e < a2.length; ++e) {
      var f = a2[e];
      if (!f.da && f.listener == b && f.capture == !!c2 && f.ha == d) return e;
    }
    return -1;
  }
  var Na = "closure_lm_" + (1e6 * Math.random() | 0), Oa = {};
  function Qa(a2, b, c2, d, e) {
    if (d && d.once) return Ra(a2, b, c2, d, e);
    if (Array.isArray(b)) {
      for (var f = 0; f < b.length; f++) Qa(a2, b[f], c2, d, e);
      return null;
    }
    c2 = Sa(c2);
    return a2 && a2[D] ? a2.K(b, c2, n(d) ? !!d.capture : !!d, e) : Ta(a2, b, c2, false, d, e);
  }
  function Ta(a2, b, c2, d, e, f) {
    if (!b) throw Error("Invalid event type");
    var g = n(e) ? !!e.capture : !!e, m = Ua(a2);
    m || (a2[Na] = m = new Ka(a2));
    c2 = m.add(b, c2, d, g, f);
    if (c2.proxy) return c2;
    d = Va();
    c2.proxy = d;
    d.src = a2;
    d.listener = c2;
    if (a2.addEventListener) Fa || (e = g), void 0 === e && (e = false), a2.addEventListener(b.toString(), d, e);
    else if (a2.attachEvent) a2.attachEvent(Wa(b.toString()), d);
    else if (a2.addListener && a2.removeListener) a2.addListener(d);
    else throw Error("addEventListener and attachEvent are unavailable.");
    return c2;
  }
  function Va() {
    function a2(c2) {
      return b.call(a2.src, a2.listener, c2);
    }
    const b = Xa;
    return a2;
  }
  function Ra(a2, b, c2, d, e) {
    if (Array.isArray(b)) {
      for (var f = 0; f < b.length; f++) Ra(a2, b[f], c2, d, e);
      return null;
    }
    c2 = Sa(c2);
    return a2 && a2[D] ? a2.L(b, c2, n(d) ? !!d.capture : !!d, e) : Ta(a2, b, c2, true, d, e);
  }
  function Ya(a2, b, c2, d, e) {
    if (Array.isArray(b)) for (var f = 0; f < b.length; f++) Ya(a2, b[f], c2, d, e);
    else (d = n(d) ? !!d.capture : !!d, c2 = Sa(c2), a2 && a2[D]) ? (a2 = a2.i, b = String(b).toString(), b in a2.g && (f = a2.g[b], c2 = La(f, c2, d, e), -1 < c2 && (Ja(f[c2]), Array.prototype.splice.call(f, c2, 1), 0 == f.length && (delete a2.g[b], a2.h--)))) : a2 && (a2 = Ua(a2)) && (b = a2.g[b.toString()], a2 = -1, b && (a2 = La(b, c2, d, e)), (c2 = -1 < a2 ? b[a2] : null) && Za(c2));
  }
  function Za(a2) {
    if ("number" !== typeof a2 && a2 && !a2.da) {
      var b = a2.src;
      if (b && b[D]) Ma(b.i, a2);
      else {
        var c2 = a2.type, d = a2.proxy;
        b.removeEventListener ? b.removeEventListener(c2, d, a2.capture) : b.detachEvent ? b.detachEvent(Wa(c2), d) : b.addListener && b.removeListener && b.removeListener(d);
        (c2 = Ua(b)) ? (Ma(c2, a2), 0 == c2.h && (c2.src = null, b[Na] = null)) : Ja(a2);
      }
    }
  }
  function Wa(a2) {
    return a2 in Oa ? Oa[a2] : Oa[a2] = "on" + a2;
  }
  function Xa(a2, b) {
    if (a2.da) a2 = true;
    else {
      b = new C(b, this);
      var c2 = a2.listener, d = a2.ha || a2.src;
      a2.fa && Za(a2);
      a2 = c2.call(d, b);
    }
    return a2;
  }
  function Ua(a2) {
    a2 = a2[Na];
    return a2 instanceof Ka ? a2 : null;
  }
  var $a = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
  function Sa(a2) {
    if ("function" === typeof a2) return a2;
    a2[$a] || (a2[$a] = function(b) {
      return a2.handleEvent(b);
    });
    return a2[$a];
  }
  function E() {
    z.call(this);
    this.i = new Ka(this);
    this.M = this;
    this.F = null;
  }
  r2(E, z);
  E.prototype[D] = true;
  E.prototype.removeEventListener = function(a2, b, c2, d) {
    Ya(this, a2, b, c2, d);
  };
  function F2(a2, b) {
    var c2, d = a2.F;
    if (d) for (c2 = []; d; d = d.F) c2.push(d);
    a2 = a2.M;
    d = b.type || b;
    if ("string" === typeof b) b = new A(b, a2);
    else if (b instanceof A) b.target = b.target || a2;
    else {
      var e = b;
      b = new A(d, a2);
      ua(b, e);
    }
    e = true;
    if (c2) for (var f = c2.length - 1; 0 <= f; f--) {
      var g = b.g = c2[f];
      e = ab(g, d, true, b) && e;
    }
    g = b.g = a2;
    e = ab(g, d, true, b) && e;
    e = ab(g, d, false, b) && e;
    if (c2) for (f = 0; f < c2.length; f++) g = b.g = c2[f], e = ab(g, d, false, b) && e;
  }
  E.prototype.N = function() {
    E.aa.N.call(this);
    if (this.i) {
      var a2 = this.i, c2;
      for (c2 in a2.g) {
        for (var d = a2.g[c2], e = 0; e < d.length; e++) Ja(d[e]);
        delete a2.g[c2];
        a2.h--;
      }
    }
    this.F = null;
  };
  E.prototype.K = function(a2, b, c2, d) {
    return this.i.add(String(a2), b, false, c2, d);
  };
  E.prototype.L = function(a2, b, c2, d) {
    return this.i.add(String(a2), b, true, c2, d);
  };
  function ab(a2, b, c2, d) {
    b = a2.i.g[String(b)];
    if (!b) return true;
    b = b.concat();
    for (var e = true, f = 0; f < b.length; ++f) {
      var g = b[f];
      if (g && !g.da && g.capture == c2) {
        var m = g.listener, q2 = g.ha || g.src;
        g.fa && Ma(a2.i, g);
        e = false !== m.call(q2, d) && e;
      }
    }
    return e && !d.defaultPrevented;
  }
  function bb(a2, b, c2) {
    if ("function" === typeof a2) c2 && (a2 = p(a2, c2));
    else if (a2 && "function" == typeof a2.handleEvent) a2 = p(a2.handleEvent, a2);
    else throw Error("Invalid listener argument");
    return 2147483647 < Number(b) ? -1 : k2.setTimeout(a2, b || 0);
  }
  function cb(a2) {
    a2.g = bb(() => {
      a2.g = null;
      a2.i && (a2.i = false, cb(a2));
    }, a2.l);
    const b = a2.h;
    a2.h = null;
    a2.m.apply(null, b);
  }
  class eb extends z {
    constructor(a2, b) {
      super();
      this.m = a2;
      this.l = b;
      this.h = null;
      this.i = false;
      this.g = null;
    }
    j(a2) {
      this.h = arguments;
      this.g ? this.i = true : cb(this);
    }
    N() {
      super.N();
      this.g && (k2.clearTimeout(this.g), this.g = null, this.i = false, this.h = null);
    }
  }
  function G(a2) {
    z.call(this);
    this.h = a2;
    this.g = {};
  }
  r2(G, z);
  var fb = [];
  function gb(a2) {
    qa(a2.g, function(b, c2) {
      this.g.hasOwnProperty(c2) && Za(b);
    }, a2);
    a2.g = {};
  }
  G.prototype.N = function() {
    G.aa.N.call(this);
    gb(this);
  };
  G.prototype.handleEvent = function() {
    throw Error("EventHandler.handleEvent not implemented");
  };
  var hb = k2.JSON.stringify;
  var ib = k2.JSON.parse;
  var jb = class {
    stringify(a2) {
      return k2.JSON.stringify(a2, void 0);
    }
    parse(a2) {
      return k2.JSON.parse(a2, void 0);
    }
  };
  function kb() {
  }
  kb.prototype.h = null;
  function lb(a2) {
    return a2.h || (a2.h = a2.i());
  }
  function mb() {
  }
  var H2 = { OPEN: "a", kb: "b", Ja: "c", wb: "d" };
  function nb() {
    A.call(this, "d");
  }
  r2(nb, A);
  function ob() {
    A.call(this, "c");
  }
  r2(ob, A);
  var I = {}, pb = null;
  function qb() {
    return pb = pb || new E();
  }
  I.La = "serverreachability";
  function rb(a2) {
    A.call(this, I.La, a2);
  }
  r2(rb, A);
  function J2(a2) {
    const b = qb();
    F2(b, new rb(b));
  }
  I.STAT_EVENT = "statevent";
  function sb(a2, b) {
    A.call(this, I.STAT_EVENT, a2);
    this.stat = b;
  }
  r2(sb, A);
  function K2(a2) {
    const b = qb();
    F2(b, new sb(b, a2));
  }
  I.Ma = "timingevent";
  function tb(a2, b) {
    A.call(this, I.Ma, a2);
    this.size = b;
  }
  r2(tb, A);
  function ub(a2, b) {
    if ("function" !== typeof a2) throw Error("Fn must not be null and must be a function");
    return k2.setTimeout(function() {
      a2();
    }, b);
  }
  function vb() {
    this.g = true;
  }
  vb.prototype.xa = function() {
    this.g = false;
  };
  function wb(a2, b, c2, d, e, f) {
    a2.info(function() {
      if (a2.g) if (f) {
        var g = "";
        for (var m = f.split("&"), q2 = 0; q2 < m.length; q2++) {
          var l = m[q2].split("=");
          if (1 < l.length) {
            var v = l[0];
            l = l[1];
            var w = v.split("_");
            g = 2 <= w.length && "type" == w[1] ? g + (v + "=" + l + "&") : g + (v + "=redacted&");
          }
        }
      } else g = null;
      else g = f;
      return "XMLHTTP REQ (" + d + ") [attempt " + e + "]: " + b + "\n" + c2 + "\n" + g;
    });
  }
  function xb(a2, b, c2, d, e, f, g) {
    a2.info(function() {
      return "XMLHTTP RESP (" + d + ") [ attempt " + e + "]: " + b + "\n" + c2 + "\n" + f + " " + g;
    });
  }
  function L2(a2, b, c2, d) {
    a2.info(function() {
      return "XMLHTTP TEXT (" + b + "): " + yb(a2, c2) + (d ? " " + d : "");
    });
  }
  function zb(a2, b) {
    a2.info(function() {
      return "TIMEOUT: " + b;
    });
  }
  vb.prototype.info = function() {
  };
  function yb(a2, b) {
    if (!a2.g) return b;
    if (!b) return null;
    try {
      var c2 = JSON.parse(b);
      if (c2) {
        for (a2 = 0; a2 < c2.length; a2++) if (Array.isArray(c2[a2])) {
          var d = c2[a2];
          if (!(2 > d.length)) {
            var e = d[1];
            if (Array.isArray(e) && !(1 > e.length)) {
              var f = e[0];
              if ("noop" != f && "stop" != f && "close" != f) for (var g = 1; g < e.length; g++) e[g] = "";
            }
          }
        }
      }
      return hb(c2);
    } catch (m) {
      return b;
    }
  }
  var Ab = { NO_ERROR: 0, gb: 1, tb: 2, sb: 3, nb: 4, rb: 5, ub: 6, Ia: 7, TIMEOUT: 8, xb: 9 };
  var Bb = { lb: "complete", Hb: "success", Ja: "error", Ia: "abort", zb: "ready", Ab: "readystatechange", TIMEOUT: "timeout", vb: "incrementaldata", yb: "progress", ob: "downloadprogress", Pb: "uploadprogress" };
  var Cb;
  function Db() {
  }
  r2(Db, kb);
  Db.prototype.g = function() {
    return new XMLHttpRequest();
  };
  Db.prototype.i = function() {
    return {};
  };
  Cb = new Db();
  function M2(a2, b, c2, d) {
    this.j = a2;
    this.i = b;
    this.l = c2;
    this.R = d || 1;
    this.U = new G(this);
    this.I = 45e3;
    this.H = null;
    this.o = false;
    this.m = this.A = this.v = this.L = this.F = this.S = this.B = null;
    this.D = [];
    this.g = null;
    this.C = 0;
    this.s = this.u = null;
    this.X = -1;
    this.J = false;
    this.O = 0;
    this.M = null;
    this.W = this.K = this.T = this.P = false;
    this.h = new Eb();
  }
  function Eb() {
    this.i = null;
    this.g = "";
    this.h = false;
  }
  var Fb = {}, Gb = {};
  function Hb(a2, b, c2) {
    a2.L = 1;
    a2.v = Ib(N2(b));
    a2.m = c2;
    a2.P = true;
    Jb(a2, null);
  }
  function Jb(a2, b) {
    a2.F = Date.now();
    Kb(a2);
    a2.A = N2(a2.v);
    var c2 = a2.A, d = a2.R;
    Array.isArray(d) || (d = [String(d)]);
    Lb(c2.i, "t", d);
    a2.C = 0;
    c2 = a2.j.J;
    a2.h = new Eb();
    a2.g = Mb(a2.j, c2 ? b : null, !a2.m);
    0 < a2.O && (a2.M = new eb(p(a2.Y, a2, a2.g), a2.O));
    b = a2.U;
    c2 = a2.g;
    d = a2.ca;
    var e = "readystatechange";
    Array.isArray(e) || (e && (fb[0] = e.toString()), e = fb);
    for (var f = 0; f < e.length; f++) {
      var g = Qa(c2, e[f], d || b.handleEvent, false, b.h || b);
      if (!g) break;
      b.g[g.key] = g;
    }
    b = a2.H ? sa(a2.H) : {};
    a2.m ? (a2.u || (a2.u = "POST"), b["Content-Type"] = "application/x-www-form-urlencoded", a2.g.ea(
      a2.A,
      a2.u,
      a2.m,
      b
    )) : (a2.u = "GET", a2.g.ea(a2.A, a2.u, null, b));
    J2();
    wb(a2.i, a2.u, a2.A, a2.l, a2.R, a2.m);
  }
  M2.prototype.ca = function(a2) {
    a2 = a2.target;
    const b = this.M;
    b && 3 == P(a2) ? b.j() : this.Y(a2);
  };
  M2.prototype.Y = function(a2) {
    try {
      if (a2 == this.g) a: {
        const w = P(this.g);
        var b = this.g.Ba();
        const O2 = this.g.Z();
        if (!(3 > w) && (3 != w || this.g && (this.h.h || this.g.oa() || Nb(this.g)))) {
          this.J || 4 != w || 7 == b || (8 == b || 0 >= O2 ? J2(3) : J2(2));
          Ob(this);
          var c2 = this.g.Z();
          this.X = c2;
          b: if (Pb(this)) {
            var d = Nb(this.g);
            a2 = "";
            var e = d.length, f = 4 == P(this.g);
            if (!this.h.i) {
              if ("undefined" === typeof TextDecoder) {
                Q2(this);
                Qb(this);
                var g = "";
                break b;
              }
              this.h.i = new k2.TextDecoder();
            }
            for (b = 0; b < e; b++) this.h.h = true, a2 += this.h.i.decode(d[b], { stream: !(f && b == e - 1) });
            d.length = 0;
            this.h.g += a2;
            this.C = 0;
            g = this.h.g;
          } else g = this.g.oa();
          this.o = 200 == c2;
          xb(this.i, this.u, this.A, this.l, this.R, w, c2);
          if (this.o) {
            if (this.T && !this.K) {
              b: {
                if (this.g) {
                  var m, q2 = this.g;
                  if ((m = q2.g ? q2.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !t(m)) {
                    var l = m;
                    break b;
                  }
                }
                l = null;
              }
              if (c2 = l) L2(this.i, this.l, c2, "Initial handshake response via X-HTTP-Initial-Response"), this.K = true, Rb(this, c2);
              else {
                this.o = false;
                this.s = 3;
                K2(12);
                Q2(this);
                Qb(this);
                break a;
              }
            }
            if (this.P) {
              c2 = true;
              let B2;
              for (; !this.J && this.C < g.length; ) if (B2 = Sb(this, g), B2 == Gb) {
                4 == w && (this.s = 4, K2(14), c2 = false);
                L2(this.i, this.l, null, "[Incomplete Response]");
                break;
              } else if (B2 == Fb) {
                this.s = 4;
                K2(15);
                L2(this.i, this.l, g, "[Invalid Chunk]");
                c2 = false;
                break;
              } else L2(this.i, this.l, B2, null), Rb(this, B2);
              Pb(this) && 0 != this.C && (this.h.g = this.h.g.slice(this.C), this.C = 0);
              4 != w || 0 != g.length || this.h.h || (this.s = 1, K2(16), c2 = false);
              this.o = this.o && c2;
              if (!c2) L2(this.i, this.l, g, "[Invalid Chunked Response]"), Q2(this), Qb(this);
              else if (0 < g.length && !this.W) {
                this.W = true;
                var v = this.j;
                v.g == this && v.ba && !v.M && (v.j.info("Great, no buffering proxy detected. Bytes received: " + g.length), Tb(v), v.M = true, K2(11));
              }
            } else L2(this.i, this.l, g, null), Rb(this, g);
            4 == w && Q2(this);
            this.o && !this.J && (4 == w ? Ub(this.j, this) : (this.o = false, Kb(this)));
          } else Vb(this.g), 400 == c2 && 0 < g.indexOf("Unknown SID") ? (this.s = 3, K2(12)) : (this.s = 0, K2(13)), Q2(this), Qb(this);
        }
      }
    } catch (w) {
    } finally {
    }
  };
  function Pb(a2) {
    return a2.g ? "GET" == a2.u && 2 != a2.L && a2.j.Ca : false;
  }
  function Sb(a2, b) {
    var c2 = a2.C, d = b.indexOf("\n", c2);
    if (-1 == d) return Gb;
    c2 = Number(b.substring(c2, d));
    if (isNaN(c2)) return Fb;
    d += 1;
    if (d + c2 > b.length) return Gb;
    b = b.slice(d, d + c2);
    a2.C = d + c2;
    return b;
  }
  M2.prototype.cancel = function() {
    this.J = true;
    Q2(this);
  };
  function Kb(a2) {
    a2.S = Date.now() + a2.I;
    Wb(a2, a2.I);
  }
  function Wb(a2, b) {
    if (null != a2.B) throw Error("WatchDog timer not null");
    a2.B = ub(p(a2.ba, a2), b);
  }
  function Ob(a2) {
    a2.B && (k2.clearTimeout(a2.B), a2.B = null);
  }
  M2.prototype.ba = function() {
    this.B = null;
    const a2 = Date.now();
    0 <= a2 - this.S ? (zb(this.i, this.A), 2 != this.L && (J2(), K2(17)), Q2(this), this.s = 2, Qb(this)) : Wb(this, this.S - a2);
  };
  function Qb(a2) {
    0 == a2.j.G || a2.J || Ub(a2.j, a2);
  }
  function Q2(a2) {
    Ob(a2);
    var b = a2.M;
    b && "function" == typeof b.ma && b.ma();
    a2.M = null;
    gb(a2.U);
    a2.g && (b = a2.g, a2.g = null, b.abort(), b.ma());
  }
  function Rb(a2, b) {
    try {
      var c2 = a2.j;
      if (0 != c2.G && (c2.g == a2 || Xb(c2.h, a2))) {
        if (!a2.K && Xb(c2.h, a2) && 3 == c2.G) {
          try {
            var d = c2.Da.g.parse(b);
          } catch (l) {
            d = null;
          }
          if (Array.isArray(d) && 3 == d.length) {
            var e = d;
            if (0 == e[0]) a: {
              if (!c2.u) {
                if (c2.g) if (c2.g.F + 3e3 < a2.F) Yb(c2), Zb(c2);
                else break a;
                $b(c2);
                K2(18);
              }
            }
            else c2.za = e[1], 0 < c2.za - c2.T && 37500 > e[2] && c2.F && 0 == c2.v && !c2.C && (c2.C = ub(p(c2.Za, c2), 6e3));
            if (1 >= ac(c2.h) && c2.ca) {
              try {
                c2.ca();
              } catch (l) {
              }
              c2.ca = void 0;
            }
          } else R(c2, 11);
        } else if ((a2.K || c2.g == a2) && Yb(c2), !t(b)) for (e = c2.Da.g.parse(b), b = 0; b < e.length; b++) {
          let l = e[b];
          c2.T = l[0];
          l = l[1];
          if (2 == c2.G) if ("c" == l[0]) {
            c2.K = l[1];
            c2.ia = l[2];
            const v = l[3];
            null != v && (c2.la = v, c2.j.info("VER=" + c2.la));
            const w = l[4];
            null != w && (c2.Aa = w, c2.j.info("SVER=" + c2.Aa));
            const O2 = l[5];
            null != O2 && "number" === typeof O2 && 0 < O2 && (d = 1.5 * O2, c2.L = d, c2.j.info("backChannelRequestTimeoutMs_=" + d));
            d = c2;
            const B2 = a2.g;
            if (B2) {
              const ya = B2.g ? B2.g.getResponseHeader("X-Client-Wire-Protocol") : null;
              if (ya) {
                var f = d.h;
                f.g || -1 == ya.indexOf("spdy") && -1 == ya.indexOf("quic") && -1 == ya.indexOf("h2") || (f.j = f.l, f.g = /* @__PURE__ */ new Set(), f.h && (bc(f, f.h), f.h = null));
              }
              if (d.D) {
                const db2 = B2.g ? B2.g.getResponseHeader("X-HTTP-Session-Id") : null;
                db2 && (d.ya = db2, S(d.I, d.D, db2));
              }
            }
            c2.G = 3;
            c2.l && c2.l.ua();
            c2.ba && (c2.R = Date.now() - a2.F, c2.j.info("Handshake RTT: " + c2.R + "ms"));
            d = c2;
            var g = a2;
            d.qa = cc(d, d.J ? d.ia : null, d.W);
            if (g.K) {
              dc(d.h, g);
              var m = g, q2 = d.L;
              q2 && (m.I = q2);
              m.B && (Ob(m), Kb(m));
              d.g = g;
            } else ec(d);
            0 < c2.i.length && fc(c2);
          } else "stop" != l[0] && "close" != l[0] || R(c2, 7);
          else 3 == c2.G && ("stop" == l[0] || "close" == l[0] ? "stop" == l[0] ? R(c2, 7) : gc(c2) : "noop" != l[0] && c2.l && c2.l.ta(l), c2.v = 0);
        }
      }
      J2(4);
    } catch (l) {
    }
  }
  var hc = class {
    constructor(a2, b) {
      this.g = a2;
      this.map = b;
    }
  };
  function ic(a2) {
    this.l = a2 || 10;
    k2.PerformanceNavigationTiming ? (a2 = k2.performance.getEntriesByType("navigation"), a2 = 0 < a2.length && ("hq" == a2[0].nextHopProtocol || "h2" == a2[0].nextHopProtocol)) : a2 = !!(k2.chrome && k2.chrome.loadTimes && k2.chrome.loadTimes() && k2.chrome.loadTimes().wasFetchedViaSpdy);
    this.j = a2 ? this.l : 1;
    this.g = null;
    1 < this.j && (this.g = /* @__PURE__ */ new Set());
    this.h = null;
    this.i = [];
  }
  function jc(a2) {
    return a2.h ? true : a2.g ? a2.g.size >= a2.j : false;
  }
  function ac(a2) {
    return a2.h ? 1 : a2.g ? a2.g.size : 0;
  }
  function Xb(a2, b) {
    return a2.h ? a2.h == b : a2.g ? a2.g.has(b) : false;
  }
  function bc(a2, b) {
    a2.g ? a2.g.add(b) : a2.h = b;
  }
  function dc(a2, b) {
    a2.h && a2.h == b ? a2.h = null : a2.g && a2.g.has(b) && a2.g.delete(b);
  }
  ic.prototype.cancel = function() {
    this.i = kc(this);
    if (this.h) this.h.cancel(), this.h = null;
    else if (this.g && 0 !== this.g.size) {
      for (const a2 of this.g.values()) a2.cancel();
      this.g.clear();
    }
  };
  function kc(a2) {
    if (null != a2.h) return a2.i.concat(a2.h.D);
    if (null != a2.g && 0 !== a2.g.size) {
      let b = a2.i;
      for (const c2 of a2.g.values()) b = b.concat(c2.D);
      return b;
    }
    return la(a2.i);
  }
  function lc(a2) {
    if (a2.V && "function" == typeof a2.V) return a2.V();
    if ("undefined" !== typeof Map && a2 instanceof Map || "undefined" !== typeof Set && a2 instanceof Set) return Array.from(a2.values());
    if ("string" === typeof a2) return a2.split("");
    if (ha(a2)) {
      for (var b = [], c2 = a2.length, d = 0; d < c2; d++) b.push(a2[d]);
      return b;
    }
    b = [];
    c2 = 0;
    for (d in a2) b[c2++] = a2[d];
    return b;
  }
  function mc(a2) {
    if (a2.na && "function" == typeof a2.na) return a2.na();
    if (!a2.V || "function" != typeof a2.V) {
      if ("undefined" !== typeof Map && a2 instanceof Map) return Array.from(a2.keys());
      if (!("undefined" !== typeof Set && a2 instanceof Set)) {
        if (ha(a2) || "string" === typeof a2) {
          var b = [];
          a2 = a2.length;
          for (var c2 = 0; c2 < a2; c2++) b.push(c2);
          return b;
        }
        b = [];
        c2 = 0;
        for (const d in a2) b[c2++] = d;
        return b;
      }
    }
  }
  function nc(a2, b) {
    if (a2.forEach && "function" == typeof a2.forEach) a2.forEach(b, void 0);
    else if (ha(a2) || "string" === typeof a2) Array.prototype.forEach.call(a2, b, void 0);
    else for (var c2 = mc(a2), d = lc(a2), e = d.length, f = 0; f < e; f++) b.call(void 0, d[f], c2 && c2[f], a2);
  }
  var oc = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
  function pc(a2, b) {
    if (a2) {
      a2 = a2.split("&");
      for (var c2 = 0; c2 < a2.length; c2++) {
        var d = a2[c2].indexOf("="), e = null;
        if (0 <= d) {
          var f = a2[c2].substring(0, d);
          e = a2[c2].substring(d + 1);
        } else f = a2[c2];
        b(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "");
      }
    }
  }
  function T(a2) {
    this.g = this.o = this.j = "";
    this.s = null;
    this.m = this.l = "";
    this.h = false;
    if (a2 instanceof T) {
      this.h = a2.h;
      qc(this, a2.j);
      this.o = a2.o;
      this.g = a2.g;
      rc(this, a2.s);
      this.l = a2.l;
      var b = a2.i;
      var c2 = new sc();
      c2.i = b.i;
      b.g && (c2.g = new Map(b.g), c2.h = b.h);
      tc(this, c2);
      this.m = a2.m;
    } else a2 && (b = String(a2).match(oc)) ? (this.h = false, qc(this, b[1] || "", true), this.o = uc(b[2] || ""), this.g = uc(b[3] || "", true), rc(this, b[4]), this.l = uc(b[5] || "", true), tc(this, b[6] || "", true), this.m = uc(b[7] || "")) : (this.h = false, this.i = new sc(null, this.h));
  }
  T.prototype.toString = function() {
    var a2 = [], b = this.j;
    b && a2.push(vc(b, wc, true), ":");
    var c2 = this.g;
    if (c2 || "file" == b) a2.push("//"), (b = this.o) && a2.push(vc(b, wc, true), "@"), a2.push(encodeURIComponent(String(c2)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c2 = this.s, null != c2 && a2.push(":", String(c2));
    if (c2 = this.l) this.g && "/" != c2.charAt(0) && a2.push("/"), a2.push(vc(c2, "/" == c2.charAt(0) ? xc : yc, true));
    (c2 = this.i.toString()) && a2.push("?", c2);
    (c2 = this.m) && a2.push("#", vc(c2, zc));
    return a2.join("");
  };
  function N2(a2) {
    return new T(a2);
  }
  function qc(a2, b, c2) {
    a2.j = c2 ? uc(b, true) : b;
    a2.j && (a2.j = a2.j.replace(/:$/, ""));
  }
  function rc(a2, b) {
    if (b) {
      b = Number(b);
      if (isNaN(b) || 0 > b) throw Error("Bad port number " + b);
      a2.s = b;
    } else a2.s = null;
  }
  function tc(a2, b, c2) {
    b instanceof sc ? (a2.i = b, Ac(a2.i, a2.h)) : (c2 || (b = vc(b, Bc)), a2.i = new sc(b, a2.h));
  }
  function S(a2, b, c2) {
    a2.i.set(b, c2);
  }
  function Ib(a2) {
    S(a2, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36));
    return a2;
  }
  function uc(a2, b) {
    return a2 ? b ? decodeURI(a2.replace(/%25/g, "%2525")) : decodeURIComponent(a2) : "";
  }
  function vc(a2, b, c2) {
    return "string" === typeof a2 ? (a2 = encodeURI(a2).replace(b, Cc), c2 && (a2 = a2.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a2) : null;
  }
  function Cc(a2) {
    a2 = a2.charCodeAt(0);
    return "%" + (a2 >> 4 & 15).toString(16) + (a2 & 15).toString(16);
  }
  var wc = /[#\/\?@]/g, yc = /[#\?:]/g, xc = /[#\?]/g, Bc = /[#\?@]/g, zc = /#/g;
  function sc(a2, b) {
    this.h = this.g = null;
    this.i = a2 || null;
    this.j = !!b;
  }
  function U2(a2) {
    a2.g || (a2.g = /* @__PURE__ */ new Map(), a2.h = 0, a2.i && pc(a2.i, function(b, c2) {
      a2.add(decodeURIComponent(b.replace(/\+/g, " ")), c2);
    }));
  }
  h = sc.prototype;
  h.add = function(a2, b) {
    U2(this);
    this.i = null;
    a2 = V(this, a2);
    var c2 = this.g.get(a2);
    c2 || this.g.set(a2, c2 = []);
    c2.push(b);
    this.h += 1;
    return this;
  };
  function Dc(a2, b) {
    U2(a2);
    b = V(a2, b);
    a2.g.has(b) && (a2.i = null, a2.h -= a2.g.get(b).length, a2.g.delete(b));
  }
  function Ec(a2, b) {
    U2(a2);
    b = V(a2, b);
    return a2.g.has(b);
  }
  h.forEach = function(a2, b) {
    U2(this);
    this.g.forEach(function(c2, d) {
      c2.forEach(function(e) {
        a2.call(b, e, d, this);
      }, this);
    }, this);
  };
  h.na = function() {
    U2(this);
    const a2 = Array.from(this.g.values()), b = Array.from(this.g.keys()), c2 = [];
    for (let d = 0; d < b.length; d++) {
      const e = a2[d];
      for (let f = 0; f < e.length; f++) c2.push(b[d]);
    }
    return c2;
  };
  h.V = function(a2) {
    U2(this);
    let b = [];
    if ("string" === typeof a2) Ec(this, a2) && (b = b.concat(this.g.get(V(this, a2))));
    else {
      a2 = Array.from(this.g.values());
      for (let c2 = 0; c2 < a2.length; c2++) b = b.concat(a2[c2]);
    }
    return b;
  };
  h.set = function(a2, b) {
    U2(this);
    this.i = null;
    a2 = V(this, a2);
    Ec(this, a2) && (this.h -= this.g.get(a2).length);
    this.g.set(a2, [b]);
    this.h += 1;
    return this;
  };
  h.get = function(a2, b) {
    if (!a2) return b;
    a2 = this.V(a2);
    return 0 < a2.length ? String(a2[0]) : b;
  };
  function Lb(a2, b, c2) {
    Dc(a2, b);
    0 < c2.length && (a2.i = null, a2.g.set(V(a2, b), la(c2)), a2.h += c2.length);
  }
  h.toString = function() {
    if (this.i) return this.i;
    if (!this.g) return "";
    const a2 = [], b = Array.from(this.g.keys());
    for (var c2 = 0; c2 < b.length; c2++) {
      var d = b[c2];
      const f = encodeURIComponent(String(d)), g = this.V(d);
      for (d = 0; d < g.length; d++) {
        var e = f;
        "" !== g[d] && (e += "=" + encodeURIComponent(String(g[d])));
        a2.push(e);
      }
    }
    return this.i = a2.join("&");
  };
  function V(a2, b) {
    b = String(b);
    a2.j && (b = b.toLowerCase());
    return b;
  }
  function Ac(a2, b) {
    b && !a2.j && (U2(a2), a2.i = null, a2.g.forEach(function(c2, d) {
      var e = d.toLowerCase();
      d != e && (Dc(this, d), Lb(this, e, c2));
    }, a2));
    a2.j = b;
  }
  function Fc(a2, b) {
    const c2 = new vb();
    if (k2.Image) {
      const d = new Image();
      d.onload = ka(W, c2, "TestLoadImage: loaded", true, b, d);
      d.onerror = ka(W, c2, "TestLoadImage: error", false, b, d);
      d.onabort = ka(W, c2, "TestLoadImage: abort", false, b, d);
      d.ontimeout = ka(W, c2, "TestLoadImage: timeout", false, b, d);
      k2.setTimeout(function() {
        if (d.ontimeout) d.ontimeout();
      }, 1e4);
      d.src = a2;
    } else b(false);
  }
  function Gc(a2, b) {
    const c2 = new vb(), d = new AbortController(), e = setTimeout(() => {
      d.abort();
      W(c2, "TestPingServer: timeout", false, b);
    }, 1e4);
    fetch(a2, { signal: d.signal }).then((f) => {
      clearTimeout(e);
      f.ok ? W(c2, "TestPingServer: ok", true, b) : W(c2, "TestPingServer: server error", false, b);
    }).catch(() => {
      clearTimeout(e);
      W(c2, "TestPingServer: error", false, b);
    });
  }
  function W(a2, b, c2, d, e) {
    try {
      e && (e.onload = null, e.onerror = null, e.onabort = null, e.ontimeout = null), d(c2);
    } catch (f) {
    }
  }
  function Hc() {
    this.g = new jb();
  }
  function Ic(a2, b, c2) {
    const d = c2 || "";
    try {
      nc(a2, function(e, f) {
        let g = e;
        n(e) && (g = hb(e));
        b.push(d + f + "=" + encodeURIComponent(g));
      });
    } catch (e) {
      throw b.push(d + "type=" + encodeURIComponent("_badmap")), e;
    }
  }
  function Jc(a2) {
    this.l = a2.Ub || null;
    this.j = a2.eb || false;
  }
  r2(Jc, kb);
  Jc.prototype.g = function() {
    return new Kc(this.l, this.j);
  };
  Jc.prototype.i = /* @__PURE__ */ function(a2) {
    return function() {
      return a2;
    };
  }({});
  function Kc(a2, b) {
    E.call(this);
    this.D = a2;
    this.o = b;
    this.m = void 0;
    this.status = this.readyState = 0;
    this.responseType = this.responseText = this.response = this.statusText = "";
    this.onreadystatechange = null;
    this.u = new Headers();
    this.h = null;
    this.B = "GET";
    this.A = "";
    this.g = false;
    this.v = this.j = this.l = null;
  }
  r2(Kc, E);
  h = Kc.prototype;
  h.open = function(a2, b) {
    if (0 != this.readyState) throw this.abort(), Error("Error reopening a connection");
    this.B = a2;
    this.A = b;
    this.readyState = 1;
    Lc(this);
  };
  h.send = function(a2) {
    if (1 != this.readyState) throw this.abort(), Error("need to call open() first. ");
    this.g = true;
    const b = { headers: this.u, method: this.B, credentials: this.m, cache: void 0 };
    a2 && (b.body = a2);
    (this.D || k2).fetch(new Request(this.A, b)).then(this.Sa.bind(this), this.ga.bind(this));
  };
  h.abort = function() {
    this.response = this.responseText = "";
    this.u = new Headers();
    this.status = 0;
    this.j && this.j.cancel("Request was aborted.").catch(() => {
    });
    1 <= this.readyState && this.g && 4 != this.readyState && (this.g = false, Mc(this));
    this.readyState = 0;
  };
  h.Sa = function(a2) {
    if (this.g && (this.l = a2, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = a2.headers, this.readyState = 2, Lc(this)), this.g && (this.readyState = 3, Lc(this), this.g))) if ("arraybuffer" === this.responseType) a2.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
    else if ("undefined" !== typeof k2.ReadableStream && "body" in a2) {
      this.j = a2.body.getReader();
      if (this.o) {
        if (this.responseType) throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else this.response = this.responseText = "", this.v = new TextDecoder();
      Nc(this);
    } else a2.text().then(this.Ra.bind(this), this.ga.bind(this));
  };
  function Nc(a2) {
    a2.j.read().then(a2.Pa.bind(a2)).catch(a2.ga.bind(a2));
  }
  h.Pa = function(a2) {
    if (this.g) {
      if (this.o && a2.value) this.response.push(a2.value);
      else if (!this.o) {
        var b = a2.value ? a2.value : new Uint8Array(0);
        if (b = this.v.decode(b, { stream: !a2.done })) this.response = this.responseText += b;
      }
      a2.done ? Mc(this) : Lc(this);
      3 == this.readyState && Nc(this);
    }
  };
  h.Ra = function(a2) {
    this.g && (this.response = this.responseText = a2, Mc(this));
  };
  h.Qa = function(a2) {
    this.g && (this.response = a2, Mc(this));
  };
  h.ga = function() {
    this.g && Mc(this);
  };
  function Mc(a2) {
    a2.readyState = 4;
    a2.l = null;
    a2.j = null;
    a2.v = null;
    Lc(a2);
  }
  h.setRequestHeader = function(a2, b) {
    this.u.append(a2, b);
  };
  h.getResponseHeader = function(a2) {
    return this.h ? this.h.get(a2.toLowerCase()) || "" : "";
  };
  h.getAllResponseHeaders = function() {
    if (!this.h) return "";
    const a2 = [], b = this.h.entries();
    for (var c2 = b.next(); !c2.done; ) c2 = c2.value, a2.push(c2[0] + ": " + c2[1]), c2 = b.next();
    return a2.join("\r\n");
  };
  function Lc(a2) {
    a2.onreadystatechange && a2.onreadystatechange.call(a2);
  }
  Object.defineProperty(Kc.prototype, "withCredentials", { get: function() {
    return "include" === this.m;
  }, set: function(a2) {
    this.m = a2 ? "include" : "same-origin";
  } });
  function Oc(a2) {
    let b = "";
    qa(a2, function(c2, d) {
      b += d;
      b += ":";
      b += c2;
      b += "\r\n";
    });
    return b;
  }
  function Pc(a2, b, c2) {
    a: {
      for (d in c2) {
        var d = false;
        break a;
      }
      d = true;
    }
    d || (c2 = Oc(c2), "string" === typeof a2 ? null != c2 && encodeURIComponent(String(c2)) : S(a2, b, c2));
  }
  function X2(a2) {
    E.call(this);
    this.headers = /* @__PURE__ */ new Map();
    this.o = a2 || null;
    this.h = false;
    this.v = this.g = null;
    this.D = "";
    this.m = 0;
    this.l = "";
    this.j = this.B = this.u = this.A = false;
    this.I = null;
    this.H = "";
    this.J = false;
  }
  r2(X2, E);
  var Qc = /^https?$/i, Rc = ["POST", "PUT"];
  h = X2.prototype;
  h.Ha = function(a2) {
    this.J = a2;
  };
  h.ea = function(a2, b, c2, d) {
    if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + a2);
    b = b ? b.toUpperCase() : "GET";
    this.D = a2;
    this.l = "";
    this.m = 0;
    this.A = false;
    this.h = true;
    this.g = this.o ? this.o.g() : Cb.g();
    this.v = this.o ? lb(this.o) : lb(Cb);
    this.g.onreadystatechange = p(this.Ea, this);
    try {
      this.B = true, this.g.open(b, String(a2), true), this.B = false;
    } catch (f) {
      Sc(this, f);
      return;
    }
    a2 = c2 || "";
    c2 = new Map(this.headers);
    if (d) if (Object.getPrototypeOf(d) === Object.prototype) for (var e in d) c2.set(e, d[e]);
    else if ("function" === typeof d.keys && "function" === typeof d.get) for (const f of d.keys()) c2.set(f, d.get(f));
    else throw Error("Unknown input type for opt_headers: " + String(d));
    d = Array.from(c2.keys()).find((f) => "content-type" == f.toLowerCase());
    e = k2.FormData && a2 instanceof k2.FormData;
    !(0 <= Array.prototype.indexOf.call(Rc, b, void 0)) || d || e || c2.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    for (const [f, g] of c2) this.g.setRequestHeader(f, g);
    this.H && (this.g.responseType = this.H);
    "withCredentials" in this.g && this.g.withCredentials !== this.J && (this.g.withCredentials = this.J);
    try {
      Tc(this), this.u = true, this.g.send(a2), this.u = false;
    } catch (f) {
      Sc(this, f);
    }
  };
  function Sc(a2, b) {
    a2.h = false;
    a2.g && (a2.j = true, a2.g.abort(), a2.j = false);
    a2.l = b;
    a2.m = 5;
    Uc(a2);
    Vc(a2);
  }
  function Uc(a2) {
    a2.A || (a2.A = true, F2(a2, "complete"), F2(a2, "error"));
  }
  h.abort = function(a2) {
    this.g && this.h && (this.h = false, this.j = true, this.g.abort(), this.j = false, this.m = a2 || 7, F2(this, "complete"), F2(this, "abort"), Vc(this));
  };
  h.N = function() {
    this.g && (this.h && (this.h = false, this.j = true, this.g.abort(), this.j = false), Vc(this, true));
    X2.aa.N.call(this);
  };
  h.Ea = function() {
    this.s || (this.B || this.u || this.j ? Wc(this) : this.bb());
  };
  h.bb = function() {
    Wc(this);
  };
  function Wc(a2) {
    if (a2.h && "undefined" != typeof fa && (!a2.v[1] || 4 != P(a2) || 2 != a2.Z())) {
      if (a2.u && 4 == P(a2)) bb(a2.Ea, 0, a2);
      else if (F2(a2, "readystatechange"), 4 == P(a2)) {
        a2.h = false;
        try {
          const g = a2.Z();
          a: switch (g) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var b = true;
              break a;
            default:
              b = false;
          }
          var c2;
          if (!(c2 = b)) {
            var d;
            if (d = 0 === g) {
              var e = String(a2.D).match(oc)[1] || null;
              !e && k2.self && k2.self.location && (e = k2.self.location.protocol.slice(0, -1));
              d = !Qc.test(e ? e.toLowerCase() : "");
            }
            c2 = d;
          }
          if (c2) F2(a2, "complete"), F2(a2, "success");
          else {
            a2.m = 6;
            try {
              var f = 2 < P(a2) ? a2.g.statusText : "";
            } catch (m) {
              f = "";
            }
            a2.l = f + " [" + a2.Z() + "]";
            Uc(a2);
          }
        } finally {
          Vc(a2);
        }
      }
    }
  }
  function Vc(a2, b) {
    if (a2.g) {
      Tc(a2);
      const c2 = a2.g, d = a2.v[0] ? () => {
      } : null;
      a2.g = null;
      a2.v = null;
      b || F2(a2, "ready");
      try {
        c2.onreadystatechange = d;
      } catch (e) {
      }
    }
  }
  function Tc(a2) {
    a2.I && (k2.clearTimeout(a2.I), a2.I = null);
  }
  h.isActive = function() {
    return !!this.g;
  };
  function P(a2) {
    return a2.g ? a2.g.readyState : 0;
  }
  h.Z = function() {
    try {
      return 2 < P(this) ? this.g.status : -1;
    } catch (a2) {
      return -1;
    }
  };
  h.oa = function() {
    try {
      return this.g ? this.g.responseText : "";
    } catch (a2) {
      return "";
    }
  };
  h.Oa = function(a2) {
    if (this.g) {
      var b = this.g.responseText;
      a2 && 0 == b.indexOf(a2) && (b = b.substring(a2.length));
      return ib(b);
    }
  };
  function Nb(a2) {
    try {
      if (!a2.g) return null;
      if ("response" in a2.g) return a2.g.response;
      switch (a2.H) {
        case "":
        case "text":
          return a2.g.responseText;
        case "arraybuffer":
          if ("mozResponseArrayBuffer" in a2.g) return a2.g.mozResponseArrayBuffer;
      }
      return null;
    } catch (b) {
      return null;
    }
  }
  function Vb(a2) {
    const b = {};
    a2 = (a2.g && 2 <= P(a2) ? a2.g.getAllResponseHeaders() || "" : "").split("\r\n");
    for (let d = 0; d < a2.length; d++) {
      if (t(a2[d])) continue;
      var c2 = va(a2[d]);
      const e = c2[0];
      c2 = c2[1];
      if ("string" !== typeof c2) continue;
      c2 = c2.trim();
      const f = b[e] || [];
      b[e] = f;
      f.push(c2);
    }
    ra(b, function(d) {
      return d.join(", ");
    });
  }
  h.Ba = function() {
    return this.m;
  };
  h.Ka = function() {
    return "string" === typeof this.l ? this.l : String(this.l);
  };
  function Xc(a2, b, c2) {
    return c2 && c2.internalChannelParams ? c2.internalChannelParams[a2] || b : b;
  }
  function Yc(a2) {
    this.Aa = 0;
    this.i = [];
    this.j = new vb();
    this.ia = this.qa = this.I = this.W = this.g = this.ya = this.D = this.H = this.m = this.S = this.o = null;
    this.Ya = this.U = 0;
    this.Va = Xc("failFast", false, a2);
    this.F = this.C = this.u = this.s = this.l = null;
    this.X = true;
    this.za = this.T = -1;
    this.Y = this.v = this.B = 0;
    this.Ta = Xc("baseRetryDelayMs", 5e3, a2);
    this.cb = Xc("retryDelaySeedMs", 1e4, a2);
    this.Wa = Xc("forwardChannelMaxRetries", 2, a2);
    this.wa = Xc("forwardChannelRequestTimeoutMs", 2e4, a2);
    this.pa = a2 && a2.xmlHttpFactory || void 0;
    this.Xa = a2 && a2.Tb || void 0;
    this.Ca = a2 && a2.useFetchStreams || false;
    this.L = void 0;
    this.J = a2 && a2.supportsCrossDomainXhr || false;
    this.K = "";
    this.h = new ic(a2 && a2.concurrentRequestLimit);
    this.Da = new Hc();
    this.P = a2 && a2.fastHandshake || false;
    this.O = a2 && a2.encodeInitMessageHeaders || false;
    this.P && this.O && (this.O = false);
    this.Ua = a2 && a2.Rb || false;
    a2 && a2.xa && this.j.xa();
    a2 && a2.forceLongPolling && (this.X = false);
    this.ba = !this.P && this.X && a2 && a2.detectBufferingProxy || false;
    this.ja = void 0;
    a2 && a2.longPollingTimeout && 0 < a2.longPollingTimeout && (this.ja = a2.longPollingTimeout);
    this.ca = void 0;
    this.R = 0;
    this.M = false;
    this.ka = this.A = null;
  }
  h = Yc.prototype;
  h.la = 8;
  h.G = 1;
  h.connect = function(a2, b, c2, d) {
    K2(0);
    this.W = a2;
    this.H = b || {};
    c2 && void 0 !== d && (this.H.OSID = c2, this.H.OAID = d);
    this.F = this.X;
    this.I = cc(this, null, this.W);
    fc(this);
  };
  function gc(a2) {
    Zc(a2);
    if (3 == a2.G) {
      var b = a2.U++, c2 = N2(a2.I);
      S(c2, "SID", a2.K);
      S(c2, "RID", b);
      S(c2, "TYPE", "terminate");
      $c(a2, c2);
      b = new M2(a2, a2.j, b);
      b.L = 2;
      b.v = Ib(N2(c2));
      c2 = false;
      if (k2.navigator && k2.navigator.sendBeacon) try {
        c2 = k2.navigator.sendBeacon(b.v.toString(), "");
      } catch (d) {
      }
      !c2 && k2.Image && (new Image().src = b.v, c2 = true);
      c2 || (b.g = Mb(b.j, null), b.g.ea(b.v));
      b.F = Date.now();
      Kb(b);
    }
    ad(a2);
  }
  function Zb(a2) {
    a2.g && (Tb(a2), a2.g.cancel(), a2.g = null);
  }
  function Zc(a2) {
    Zb(a2);
    a2.u && (k2.clearTimeout(a2.u), a2.u = null);
    Yb(a2);
    a2.h.cancel();
    a2.s && ("number" === typeof a2.s && k2.clearTimeout(a2.s), a2.s = null);
  }
  function fc(a2) {
    if (!jc(a2.h) && !a2.s) {
      a2.s = true;
      var b = a2.Ga;
      x2 || Ea();
      y || (x2(), y = true);
      za.add(b, a2);
      a2.B = 0;
    }
  }
  function bd(a2, b) {
    if (ac(a2.h) >= a2.h.j - (a2.s ? 1 : 0)) return false;
    if (a2.s) return a2.i = b.D.concat(a2.i), true;
    if (1 == a2.G || 2 == a2.G || a2.B >= (a2.Va ? 0 : a2.Wa)) return false;
    a2.s = ub(p(a2.Ga, a2, b), cd(a2, a2.B));
    a2.B++;
    return true;
  }
  h.Ga = function(a2) {
    if (this.s) if (this.s = null, 1 == this.G) {
      if (!a2) {
        this.U = Math.floor(1e5 * Math.random());
        a2 = this.U++;
        const e = new M2(this, this.j, a2);
        let f = this.o;
        this.S && (f ? (f = sa(f), ua(f, this.S)) : f = this.S);
        null !== this.m || this.O || (e.H = f, f = null);
        if (this.P) a: {
          var b = 0;
          for (var c2 = 0; c2 < this.i.length; c2++) {
            b: {
              var d = this.i[c2];
              if ("__data__" in d.map && (d = d.map.__data__, "string" === typeof d)) {
                d = d.length;
                break b;
              }
              d = void 0;
            }
            if (void 0 === d) break;
            b += d;
            if (4096 < b) {
              b = c2;
              break a;
            }
            if (4096 === b || c2 === this.i.length - 1) {
              b = c2 + 1;
              break a;
            }
          }
          b = 1e3;
        }
        else b = 1e3;
        b = dd(this, e, b);
        c2 = N2(this.I);
        S(c2, "RID", a2);
        S(c2, "CVER", 22);
        this.D && S(c2, "X-HTTP-Session-Id", this.D);
        $c(this, c2);
        f && (this.O ? b = "headers=" + encodeURIComponent(String(Oc(f))) + "&" + b : this.m && Pc(c2, this.m, f));
        bc(this.h, e);
        this.Ua && S(c2, "TYPE", "init");
        this.P ? (S(c2, "$req", b), S(c2, "SID", "null"), e.T = true, Hb(e, c2, null)) : Hb(e, c2, b);
        this.G = 2;
      }
    } else 3 == this.G && (a2 ? ed(this, a2) : 0 == this.i.length || jc(this.h) || ed(this));
  };
  function ed(a2, b) {
    var c2;
    b ? c2 = b.l : c2 = a2.U++;
    const d = N2(a2.I);
    S(d, "SID", a2.K);
    S(d, "RID", c2);
    S(d, "AID", a2.T);
    $c(a2, d);
    a2.m && a2.o && Pc(d, a2.m, a2.o);
    c2 = new M2(a2, a2.j, c2, a2.B + 1);
    null === a2.m && (c2.H = a2.o);
    b && (a2.i = b.D.concat(a2.i));
    b = dd(a2, c2, 1e3);
    c2.I = Math.round(0.5 * a2.wa) + Math.round(0.5 * a2.wa * Math.random());
    bc(a2.h, c2);
    Hb(c2, d, b);
  }
  function $c(a2, b) {
    a2.H && qa(a2.H, function(c2, d) {
      S(b, d, c2);
    });
    a2.l && nc({}, function(c2, d) {
      S(b, d, c2);
    });
  }
  function dd(a2, b, c2) {
    c2 = Math.min(a2.i.length, c2);
    var d = a2.l ? p(a2.l.Na, a2.l, a2) : null;
    a: {
      var e = a2.i;
      let f = -1;
      for (; ; ) {
        const g = ["count=" + c2];
        -1 == f ? 0 < c2 ? (f = e[0].g, g.push("ofs=" + f)) : f = 0 : g.push("ofs=" + f);
        let m = true;
        for (let q2 = 0; q2 < c2; q2++) {
          let l = e[q2].g;
          const v = e[q2].map;
          l -= f;
          if (0 > l) f = Math.max(0, e[q2].g - 100), m = false;
          else try {
            Ic(v, g, "req" + l + "_");
          } catch (w) {
            d && d(v);
          }
        }
        if (m) {
          d = g.join("&");
          break a;
        }
      }
    }
    a2 = a2.i.splice(0, c2);
    b.D = a2;
    return d;
  }
  function ec(a2) {
    if (!a2.g && !a2.u) {
      a2.Y = 1;
      var b = a2.Fa;
      x2 || Ea();
      y || (x2(), y = true);
      za.add(b, a2);
      a2.v = 0;
    }
  }
  function $b(a2) {
    if (a2.g || a2.u || 3 <= a2.v) return false;
    a2.Y++;
    a2.u = ub(p(a2.Fa, a2), cd(a2, a2.v));
    a2.v++;
    return true;
  }
  h.Fa = function() {
    this.u = null;
    fd(this);
    if (this.ba && !(this.M || null == this.g || 0 >= this.R)) {
      var a2 = 2 * this.R;
      this.j.info("BP detection timer enabled: " + a2);
      this.A = ub(p(this.ab, this), a2);
    }
  };
  h.ab = function() {
    this.A && (this.A = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = false, this.M = true, K2(10), Zb(this), fd(this));
  };
  function Tb(a2) {
    null != a2.A && (k2.clearTimeout(a2.A), a2.A = null);
  }
  function fd(a2) {
    a2.g = new M2(a2, a2.j, "rpc", a2.Y);
    null === a2.m && (a2.g.H = a2.o);
    a2.g.O = 0;
    var b = N2(a2.qa);
    S(b, "RID", "rpc");
    S(b, "SID", a2.K);
    S(b, "AID", a2.T);
    S(b, "CI", a2.F ? "0" : "1");
    !a2.F && a2.ja && S(b, "TO", a2.ja);
    S(b, "TYPE", "xmlhttp");
    $c(a2, b);
    a2.m && a2.o && Pc(b, a2.m, a2.o);
    a2.L && (a2.g.I = a2.L);
    var c2 = a2.g;
    a2 = a2.ia;
    c2.L = 1;
    c2.v = Ib(N2(b));
    c2.m = null;
    c2.P = true;
    Jb(c2, a2);
  }
  h.Za = function() {
    null != this.C && (this.C = null, Zb(this), $b(this), K2(19));
  };
  function Yb(a2) {
    null != a2.C && (k2.clearTimeout(a2.C), a2.C = null);
  }
  function Ub(a2, b) {
    var c2 = null;
    if (a2.g == b) {
      Yb(a2);
      Tb(a2);
      a2.g = null;
      var d = 2;
    } else if (Xb(a2.h, b)) c2 = b.D, dc(a2.h, b), d = 1;
    else return;
    if (0 != a2.G) {
      if (b.o) if (1 == d) {
        c2 = b.m ? b.m.length : 0;
        b = Date.now() - b.F;
        var e = a2.B;
        d = qb();
        F2(d, new tb(d, c2));
        fc(a2);
      } else ec(a2);
      else if (e = b.s, 3 == e || 0 == e && 0 < b.X || !(1 == d && bd(a2, b) || 2 == d && $b(a2))) switch (c2 && 0 < c2.length && (b = a2.h, b.i = b.i.concat(c2)), e) {
        case 1:
          R(a2, 5);
          break;
        case 4:
          R(a2, 10);
          break;
        case 3:
          R(a2, 6);
          break;
        default:
          R(a2, 2);
      }
    }
  }
  function cd(a2, b) {
    let c2 = a2.Ta + Math.floor(Math.random() * a2.cb);
    a2.isActive() || (c2 *= 2);
    return c2 * b;
  }
  function R(a2, b) {
    a2.j.info("Error code " + b);
    if (2 == b) {
      var c2 = p(a2.fb, a2), d = a2.Xa;
      const e = !d;
      d = new T(d || "//www.google.com/images/cleardot.gif");
      k2.location && "http" == k2.location.protocol || qc(d, "https");
      Ib(d);
      e ? Fc(d.toString(), c2) : Gc(d.toString(), c2);
    } else K2(2);
    a2.G = 0;
    a2.l && a2.l.sa(b);
    ad(a2);
    Zc(a2);
  }
  h.fb = function(a2) {
    a2 ? (this.j.info("Successfully pinged google.com"), K2(2)) : (this.j.info("Failed to ping google.com"), K2(1));
  };
  function ad(a2) {
    a2.G = 0;
    a2.ka = [];
    if (a2.l) {
      const b = kc(a2.h);
      if (0 != b.length || 0 != a2.i.length) ma(a2.ka, b), ma(a2.ka, a2.i), a2.h.i.length = 0, la(a2.i), a2.i.length = 0;
      a2.l.ra();
    }
  }
  function cc(a2, b, c2) {
    var d = c2 instanceof T ? N2(c2) : new T(c2);
    if ("" != d.g) b && (d.g = b + "." + d.g), rc(d, d.s);
    else {
      var e = k2.location;
      d = e.protocol;
      b = b ? b + "." + e.hostname : e.hostname;
      e = +e.port;
      var f = new T(null);
      d && qc(f, d);
      b && (f.g = b);
      e && rc(f, e);
      c2 && (f.l = c2);
      d = f;
    }
    c2 = a2.D;
    b = a2.ya;
    c2 && b && S(d, c2, b);
    S(d, "VER", a2.la);
    $c(a2, d);
    return d;
  }
  function Mb(a2, b, c2) {
    if (b && !a2.J) throw Error("Can't create secondary domain capable XhrIo object.");
    b = a2.Ca && !a2.pa ? new X2(new Jc({ eb: c2 })) : new X2(a2.pa);
    b.Ha(a2.J);
    return b;
  }
  h.isActive = function() {
    return !!this.l && this.l.isActive(this);
  };
  function gd() {
  }
  h = gd.prototype;
  h.ua = function() {
  };
  h.ta = function() {
  };
  h.sa = function() {
  };
  h.ra = function() {
  };
  h.isActive = function() {
    return true;
  };
  h.Na = function() {
  };
  function hd() {
  }
  hd.prototype.g = function(a2, b) {
    return new Y2(a2, b);
  };
  function Y2(a2, b) {
    E.call(this);
    this.g = new Yc(b);
    this.l = a2;
    this.h = b && b.messageUrlParams || null;
    a2 = b && b.messageHeaders || null;
    b && b.clientProtocolHeaderRequired && (a2 ? a2["X-Client-Protocol"] = "webchannel" : a2 = { "X-Client-Protocol": "webchannel" });
    this.g.o = a2;
    a2 = b && b.initMessageHeaders || null;
    b && b.messageContentType && (a2 ? a2["X-WebChannel-Content-Type"] = b.messageContentType : a2 = { "X-WebChannel-Content-Type": b.messageContentType });
    b && b.va && (a2 ? a2["X-WebChannel-Client-Profile"] = b.va : a2 = { "X-WebChannel-Client-Profile": b.va });
    this.g.S = a2;
    (a2 = b && b.Sb) && !t(a2) && (this.g.m = a2);
    this.v = b && b.supportsCrossDomainXhr || false;
    this.u = b && b.sendRawJson || false;
    (b = b && b.httpSessionIdParam) && !t(b) && (this.g.D = b, a2 = this.h, null !== a2 && b in a2 && (a2 = this.h, b in a2 && delete a2[b]));
    this.j = new Z(this);
  }
  r2(Y2, E);
  Y2.prototype.m = function() {
    this.g.l = this.j;
    this.v && (this.g.J = true);
    this.g.connect(this.l, this.h || void 0);
  };
  Y2.prototype.close = function() {
    gc(this.g);
  };
  Y2.prototype.o = function(a2) {
    var b = this.g;
    if ("string" === typeof a2) {
      var c2 = {};
      c2.__data__ = a2;
      a2 = c2;
    } else this.u && (c2 = {}, c2.__data__ = hb(a2), a2 = c2);
    b.i.push(new hc(b.Ya++, a2));
    3 == b.G && fc(b);
  };
  Y2.prototype.N = function() {
    this.g.l = null;
    delete this.j;
    gc(this.g);
    delete this.g;
    Y2.aa.N.call(this);
  };
  function id(a2) {
    nb.call(this);
    a2.__headers__ && (this.headers = a2.__headers__, this.statusCode = a2.__status__, delete a2.__headers__, delete a2.__status__);
    var b = a2.__sm__;
    if (b) {
      a: {
        for (const c2 in b) {
          a2 = c2;
          break a;
        }
        a2 = void 0;
      }
      if (this.i = a2) a2 = this.i, b = null !== b && a2 in b ? b[a2] : void 0;
      this.data = b;
    } else this.data = a2;
  }
  r2(id, nb);
  function jd() {
    ob.call(this);
    this.status = 1;
  }
  r2(jd, ob);
  function Z(a2) {
    this.g = a2;
  }
  r2(Z, gd);
  Z.prototype.ua = function() {
    F2(this.g, "a");
  };
  Z.prototype.ta = function(a2) {
    F2(this.g, new id(a2));
  };
  Z.prototype.sa = function(a2) {
    F2(this.g, new jd());
  };
  Z.prototype.ra = function() {
    F2(this.g, "b");
  };
  hd.prototype.createWebChannel = hd.prototype.g;
  Y2.prototype.send = Y2.prototype.o;
  Y2.prototype.open = Y2.prototype.m;
  Y2.prototype.close = Y2.prototype.close;
  createWebChannelTransport = webchannel_blob_es2018.createWebChannelTransport = function() {
    return new hd();
  };
  getStatEventTarget = webchannel_blob_es2018.getStatEventTarget = function() {
    return qb();
  };
  Event = webchannel_blob_es2018.Event = I;
  Stat = webchannel_blob_es2018.Stat = { mb: 0, pb: 1, qb: 2, Jb: 3, Ob: 4, Lb: 5, Mb: 6, Kb: 7, Ib: 8, Nb: 9, PROXY: 10, NOPROXY: 11, Gb: 12, Cb: 13, Db: 14, Bb: 15, Eb: 16, Fb: 17, ib: 18, hb: 19, jb: 20 };
  Ab.NO_ERROR = 0;
  Ab.TIMEOUT = 8;
  Ab.HTTP_ERROR = 6;
  ErrorCode = webchannel_blob_es2018.ErrorCode = Ab;
  Bb.COMPLETE = "complete";
  EventType = webchannel_blob_es2018.EventType = Bb;
  mb.EventType = H2;
  H2.OPEN = "a";
  H2.CLOSE = "b";
  H2.ERROR = "c";
  H2.MESSAGE = "d";
  E.prototype.listen = E.prototype.K;
  WebChannel = webchannel_blob_es2018.WebChannel = mb;
  FetchXmlHttpFactory = webchannel_blob_es2018.FetchXmlHttpFactory = Jc;
  X2.prototype.listenOnce = X2.prototype.L;
  X2.prototype.getLastError = X2.prototype.Ka;
  X2.prototype.getLastErrorCode = X2.prototype.Ba;
  X2.prototype.getStatus = X2.prototype.Z;
  X2.prototype.getResponseJson = X2.prototype.Oa;
  X2.prototype.getResponseText = X2.prototype.oa;
  X2.prototype.send = X2.prototype.ea;
  X2.prototype.setWithCredentials = X2.prototype.Ha;
  XhrIo = webchannel_blob_es2018.XhrIo = X2;
}).apply(typeof commonjsGlobal2 !== "undefined" ? commonjsGlobal2 : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

// node_modules/@firebase/firestore/dist/index.esm.js
var F = "@firebase/firestore";
var M = "4.9.0";
var User = class {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return null != this.uid;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
};
User.UNAUTHENTICATED = new User(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
User.GOOGLE_CREDENTIALS = new User("google-credentials-uid"), User.FIRST_PARTY = new User("first-party-uid"), User.MOCK_USER = new User("mock-user");
var x = "12.0.0";
var O = new Logger("@firebase/firestore");
function __PRIVATE_getLogLevel() {
  return O.logLevel;
}
function __PRIVATE_logDebug(e, ...t) {
  if (O.logLevel <= LogLevel.DEBUG) {
    const n = t.map(__PRIVATE_argToString);
    O.debug(`Firestore (${x}): ${e}`, ...n);
  }
}
function __PRIVATE_logError(e, ...t) {
  if (O.logLevel <= LogLevel.ERROR) {
    const n = t.map(__PRIVATE_argToString);
    O.error(`Firestore (${x}): ${e}`, ...n);
  }
}
function __PRIVATE_logWarn(e, ...t) {
  if (O.logLevel <= LogLevel.WARN) {
    const n = t.map(__PRIVATE_argToString);
    O.warn(`Firestore (${x}): ${e}`, ...n);
  }
}
function __PRIVATE_argToString(e) {
  if ("string" == typeof e) return e;
  try {
    return function __PRIVATE_formatJSON(e2) {
      return JSON.stringify(e2);
    }(e);
  } catch (t) {
    return e;
  }
}
function fail(e, t, n) {
  let r2 = "Unexpected state";
  "string" == typeof t ? r2 = t : n = t, __PRIVATE__fail(e, r2, n);
}
function __PRIVATE__fail(e, t, n) {
  let r2 = `FIRESTORE (${x}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;
  if (void 0 !== n) try {
    r2 += " CONTEXT: " + JSON.stringify(n);
  } catch (e2) {
    r2 += " CONTEXT: " + n;
  }
  throw __PRIVATE_logError(r2), new Error(r2);
}
function __PRIVATE_hardAssert(e, t, n, r2) {
  let i = "Unexpected state";
  "string" == typeof n ? i = n : r2 = n, e || __PRIVATE__fail(t, i, r2);
}
function __PRIVATE_debugCast(e, t) {
  return e;
}
var N = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller cannot be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
var FirestoreError = class extends FirebaseError {
  /** @hideconstructor */
  constructor(e, t) {
    super(e, t), this.code = e, this.message = t, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
};
var __PRIVATE_Deferred = class {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
};
var __PRIVATE_OAuthToken = class {
  constructor(e, t) {
    this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
  }
};
var __PRIVATE_EmptyAuthCredentialsProvider = class {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
    e.enqueueRetryable(() => t(User.UNAUTHENTICATED));
  }
  shutdown() {
  }
};
var __PRIVATE_EmulatorAuthCredentialsProvider = class {
  constructor(e) {
    this.token = e, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(e, t) {
    this.changeListener = t, // Fire with initial user.
    e.enqueueRetryable(() => t(this.token.user));
  }
  shutdown() {
    this.changeListener = null;
  }
};
var __PRIVATE_FirebaseAuthCredentialsProvider = class {
  constructor(e) {
    this.t = e, /** Tracks the current User. */
    this.currentUser = User.UNAUTHENTICATED, /**
     * Counter used to detect if the token changed while a getToken request was
     * outstanding.
     */
    this.i = 0, this.forceRefresh = false, this.auth = null;
  }
  start(e, t) {
    __PRIVATE_hardAssert(void 0 === this.o, 42304);
    let n = this.i;
    const __PRIVATE_guardedChangeListener = (e2) => this.i !== n ? (n = this.i, t(e2)) : Promise.resolve();
    let r2 = new __PRIVATE_Deferred();
    this.o = () => {
      this.i++, this.currentUser = this.u(), r2.resolve(), r2 = new __PRIVATE_Deferred(), e.enqueueRetryable(() => __PRIVATE_guardedChangeListener(this.currentUser));
    };
    const __PRIVATE_awaitNextToken = () => {
      const t2 = r2;
      e.enqueueRetryable(async () => {
        await t2.promise, await __PRIVATE_guardedChangeListener(this.currentUser);
      });
    }, __PRIVATE_registerAuth = (e2) => {
      __PRIVATE_logDebug("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = e2, this.o && (this.auth.addAuthTokenListener(this.o), __PRIVATE_awaitNextToken());
    };
    this.t.onInit((e2) => __PRIVATE_registerAuth(e2)), // Our users can initialize Auth right after Firestore, so we give it
    // a chance to register itself with the component framework before we
    // determine whether to start up in unauthenticated mode.
    setTimeout(() => {
      if (!this.auth) {
        const e2 = this.t.getImmediate({
          optional: true
        });
        e2 ? __PRIVATE_registerAuth(e2) : (
          // If auth is still not available, proceed with `null` user
          (__PRIVATE_logDebug("FirebaseAuthCredentialsProvider", "Auth not yet detected"), r2.resolve(), r2 = new __PRIVATE_Deferred())
        );
      }
    }, 0), __PRIVATE_awaitNextToken();
  }
  getToken() {
    const e = this.i, t = this.forceRefresh;
    return this.forceRefresh = false, this.auth ? this.auth.getToken(t).then((t2) => (
      // Cancel the request since the token changed while the request was
      // outstanding so the response is potentially for a previous user (which
      // user, we can't be sure).
      this.i !== e ? (__PRIVATE_logDebug("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : t2 ? (__PRIVATE_hardAssert("string" == typeof t2.accessToken, 31837, {
        l: t2
      }), new __PRIVATE_OAuthToken(t2.accessToken, this.currentUser)) : null
    )) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = true;
  }
  shutdown() {
    this.auth && this.o && this.auth.removeAuthTokenListener(this.o), this.o = void 0;
  }
  // Auth.getUid() can return null even with a user logged in. It is because
  // getUid() is synchronous, but the auth code populating Uid is asynchronous.
  // This method should only be called in the AuthTokenListener callback
  // to guarantee to get the actual user.
  u() {
    const e = this.auth && this.auth.getUid();
    return __PRIVATE_hardAssert(null === e || "string" == typeof e, 2055, {
      h: e
    }), new User(e);
  }
};
var __PRIVATE_FirstPartyToken = class {
  constructor(e, t, n) {
    this.P = e, this.T = t, this.I = n, this.type = "FirstParty", this.user = User.FIRST_PARTY, this.A = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  R() {
    return this.I ? this.I() : null;
  }
  get headers() {
    this.A.set("X-Goog-AuthUser", this.P);
    const e = this.R();
    return e && this.A.set("Authorization", e), this.T && this.A.set("X-Goog-Iam-Authorization-Token", this.T), this.A;
  }
};
var __PRIVATE_FirstPartyAuthCredentialsProvider = class {
  constructor(e, t, n) {
    this.P = e, this.T = t, this.I = n;
  }
  getToken() {
    return Promise.resolve(new __PRIVATE_FirstPartyToken(this.P, this.T, this.I));
  }
  start(e, t) {
    e.enqueueRetryable(() => t(User.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
};
var AppCheckToken = class {
  constructor(e) {
    this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
};
var __PRIVATE_FirebaseAppCheckTokenProvider = class {
  constructor(t, n) {
    this.V = n, this.forceRefresh = false, this.appCheck = null, this.m = null, this.p = null, _isFirebaseServerApp(t) && t.settings.appCheckToken && (this.p = t.settings.appCheckToken);
  }
  start(e, t) {
    __PRIVATE_hardAssert(void 0 === this.o, 3512);
    const onTokenChanged = (e2) => {
      null != e2.error && __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${e2.error.message}`);
      const n = e2.token !== this.m;
      return this.m = e2.token, __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), n ? t(e2.token) : Promise.resolve();
    };
    this.o = (t2) => {
      e.enqueueRetryable(() => onTokenChanged(t2));
    };
    const __PRIVATE_registerAppCheck = (e2) => {
      __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = e2, this.o && this.appCheck.addTokenListener(this.o);
    };
    this.V.onInit((e2) => __PRIVATE_registerAppCheck(e2)), // Our users can initialize AppCheck after Firestore, so we give it
    // a chance to register itself with the component framework.
    setTimeout(() => {
      if (!this.appCheck) {
        const e2 = this.V.getImmediate({
          optional: true
        });
        e2 ? __PRIVATE_registerAppCheck(e2) : (
          // If AppCheck is still not available, proceed without it.
          __PRIVATE_logDebug("FirebaseAppCheckTokenProvider", "AppCheck not yet detected")
        );
      }
    }, 0);
  }
  getToken() {
    if (this.p) return Promise.resolve(new AppCheckToken(this.p));
    const e = this.forceRefresh;
    return this.forceRefresh = false, this.appCheck ? this.appCheck.getToken(e).then((e2) => e2 ? (__PRIVATE_hardAssert("string" == typeof e2.token, 44558, {
      tokenResult: e2
    }), this.m = e2.token, new AppCheckToken(e2.token)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = true;
  }
  shutdown() {
    this.appCheck && this.o && this.appCheck.removeTokenListener(this.o), this.o = void 0;
  }
};
function __PRIVATE_randomBytes(e) {
  const t = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "undefined" != typeof self && (self.crypto || self.msCrypto)
  ), n = new Uint8Array(e);
  if (t && "function" == typeof t.getRandomValues) t.getRandomValues(n);
  else
    for (let t2 = 0; t2 < e; t2++) n[t2] = Math.floor(256 * Math.random());
  return n;
}
var __PRIVATE_AutoId = class {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = 62 * Math.floor(256 / 62);
    let n = "";
    for (; n.length < 20; ) {
      const r2 = __PRIVATE_randomBytes(40);
      for (let i = 0; i < r2.length; ++i)
        n.length < 20 && r2[i] < t && (n += e.charAt(r2[i] % 62));
    }
    return n;
  }
};
function __PRIVATE_primitiveComparator(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
function __PRIVATE_compareUtf8Strings(e, t) {
  const n = Math.min(e.length, t.length);
  for (let r2 = 0; r2 < n; r2++) {
    const n2 = e.charAt(r2), i = t.charAt(r2);
    if (n2 !== i) return __PRIVATE_isSurrogate(n2) === __PRIVATE_isSurrogate(i) ? __PRIVATE_primitiveComparator(n2, i) : __PRIVATE_isSurrogate(n2) ? 1 : -1;
  }
  return __PRIVATE_primitiveComparator(e.length, t.length);
}
var B = 55296;
var L = 57343;
function __PRIVATE_isSurrogate(e) {
  const t = e.charCodeAt(0);
  return t >= B && t <= L;
}
function __PRIVATE_arrayEquals(e, t, n) {
  return e.length === t.length && e.every((e2, r2) => n(e2, t[r2]));
}
var k = "__name__";
var BasePath = class _BasePath {
  constructor(e, t, n) {
    void 0 === t ? t = 0 : t > e.length && fail(637, {
      offset: t,
      range: e.length
    }), void 0 === n ? n = e.length - t : n > e.length - t && fail(1746, {
      length: n,
      range: e.length - t
    }), this.segments = e, this.offset = t, this.len = n;
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return 0 === _BasePath.comparator(this, e);
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return e instanceof _BasePath ? e.forEach((e2) => {
      t.push(e2);
    }) : t.push(e), this.construct(t);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return e = void 0 === e ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return 0 === this.length;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return false;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return false;
    return true;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return false;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return false;
    return true;
  }
  forEach(e) {
    for (let t = this.offset, n = this.limit(); t < n; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  /**
   * Compare 2 paths segment by segment, prioritizing numeric IDs
   * (e.g., "__id123__") in numeric ascending order, followed by string
   * segments in lexicographical order.
   */
  static comparator(e, t) {
    const n = Math.min(e.length, t.length);
    for (let r2 = 0; r2 < n; r2++) {
      const n2 = _BasePath.compareSegments(e.get(r2), t.get(r2));
      if (0 !== n2) return n2;
    }
    return __PRIVATE_primitiveComparator(e.length, t.length);
  }
  static compareSegments(e, t) {
    const n = _BasePath.isNumericId(e), r2 = _BasePath.isNumericId(t);
    return n && !r2 ? -1 : !n && r2 ? 1 : n && r2 ? _BasePath.extractNumericId(e).compare(_BasePath.extractNumericId(t)) : __PRIVATE_compareUtf8Strings(e, t);
  }
  // Checks if a segment is a numeric ID (starts with "__id" and ends with "__").
  static isNumericId(e) {
    return e.startsWith("__id") && e.endsWith("__");
  }
  static extractNumericId(e) {
    return Integer.fromString(e.substring(4, e.length - 2));
  }
};
var ResourcePath = class _ResourcePath extends BasePath {
  construct(e, t, n) {
    return new _ResourcePath(e, t, n);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns a string representation of this path
   * where each path segment has been encoded with
   * `encodeURIComponent`.
   */
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...e) {
    const t = [];
    for (const n of e) {
      if (n.indexOf("//") >= 0) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
      t.push(...n.split("/").filter((e2) => e2.length > 0));
    }
    return new _ResourcePath(t);
  }
  static emptyPath() {
    return new _ResourcePath([]);
  }
};
var q = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
var FieldPath$1 = class _FieldPath$1 extends BasePath {
  construct(e, t, n) {
    return new _FieldPath$1(e, t, n);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(e) {
    return q.test(e);
  }
  canonicalString() {
    return this.toArray().map((e) => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), _FieldPath$1.isValidIdentifier(e) || (e = "`" + e + "`"), e)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return 1 === this.length && this.get(0) === k;
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new _FieldPath$1([k]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(e) {
    const t = [];
    let n = "", r2 = 0;
    const __PRIVATE_addCurrentSegment = () => {
      if (0 === n.length) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      t.push(n), n = "";
    };
    let i = false;
    for (; r2 < e.length; ) {
      const t2 = e[r2];
      if ("\\" === t2) {
        if (r2 + 1 === e.length) throw new FirestoreError(N.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
        const t3 = e[r2 + 1];
        if ("\\" !== t3 && "." !== t3 && "`" !== t3) throw new FirestoreError(N.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
        n += t3, r2 += 2;
      } else "`" === t2 ? (i = !i, r2++) : "." !== t2 || i ? (n += t2, r2++) : (__PRIVATE_addCurrentSegment(), r2++);
    }
    if (__PRIVATE_addCurrentSegment(), i) throw new FirestoreError(N.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new _FieldPath$1(t);
  }
  static emptyPath() {
    return new _FieldPath$1([]);
  }
};
var DocumentKey = class _DocumentKey {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new _DocumentKey(ResourcePath.fromString(e));
  }
  static fromName(e) {
    return new _DocumentKey(ResourcePath.fromString(e).popFirst(5));
  }
  static empty() {
    return new _DocumentKey(ResourcePath.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return null !== e && 0 === ResourcePath.comparator(this.path, e.path);
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return ResourcePath.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(e) {
    return new _DocumentKey(new ResourcePath(e.slice()));
  }
};
function __PRIVATE_validateNonEmptyArgument(e, t, n) {
  if (!n) throw new FirestoreError(N.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
}
function __PRIVATE_validateIsNotUsedTogether(e, t, n, r2) {
  if (true === t && true === r2) throw new FirestoreError(N.INVALID_ARGUMENT, `${e} and ${n} cannot be used together.`);
}
function __PRIVATE_validateDocumentPath(e) {
  if (!DocumentKey.isDocumentKey(e)) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
}
function __PRIVATE_validateCollectionPath(e) {
  if (DocumentKey.isDocumentKey(e)) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`);
}
function __PRIVATE_isPlainObject(e) {
  return "object" == typeof e && null !== e && (Object.getPrototypeOf(e) === Object.prototype || null === Object.getPrototypeOf(e));
}
function __PRIVATE_valueDescription(e) {
  if (void 0 === e) return "undefined";
  if (null === e) return "null";
  if ("string" == typeof e) return e.length > 20 && (e = `${e.substring(0, 20)}...`), JSON.stringify(e);
  if ("number" == typeof e || "boolean" == typeof e) return "" + e;
  if ("object" == typeof e) {
    if (e instanceof Array) return "an array";
    {
      const t = (
        /** try to get the constructor name for an object. */
        function __PRIVATE_tryGetCustomObjectType(e2) {
          if (e2.constructor) return e2.constructor.name;
          return null;
        }(e)
      );
      return t ? `a custom ${t} object` : "an object";
    }
  }
  return "function" == typeof e ? "a function" : fail(12329, {
    type: typeof e
  });
}
function __PRIVATE_cast(e, t) {
  if ("_delegate" in e && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e = e._delegate), !(e instanceof t)) {
    if (t.name === e.constructor.name) throw new FirestoreError(N.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const n = __PRIVATE_valueDescription(e);
      throw new FirestoreError(N.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${n}`);
    }
  }
  return e;
}
function __PRIVATE_validatePositiveNumber(e, t) {
  if (t <= 0) throw new FirestoreError(N.INVALID_ARGUMENT, `Function ${e}() requires a positive number, but it was: ${t}.`);
}
function property(e, t) {
  const n = {
    typeString: e
  };
  return t && (n.value = t), n;
}
function __PRIVATE_validateJSON(e, t) {
  if (!__PRIVATE_isPlainObject(e)) throw new FirestoreError(N.INVALID_ARGUMENT, "JSON must be an object");
  let n;
  for (const r2 in t) if (t[r2]) {
    const i = t[r2].typeString, s = "value" in t[r2] ? {
      value: t[r2].value
    } : void 0;
    if (!(r2 in e)) {
      n = `JSON missing required field: '${r2}'`;
      break;
    }
    const o = e[r2];
    if (i && typeof o !== i) {
      n = `JSON field '${r2}' must be a ${i}.`;
      break;
    }
    if (void 0 !== s && o !== s.value) {
      n = `Expected '${r2}' field to equal '${s.value}'`;
      break;
    }
  }
  if (n) throw new FirestoreError(N.INVALID_ARGUMENT, n);
  return true;
}
var Q = -62135596800;
var $ = 1e6;
var Timestamp = class _Timestamp {
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return _Timestamp.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(e) {
    return _Timestamp.fromMillis(e.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(e) {
    const t = Math.floor(e / 1e3), n = Math.floor((e - 1e3 * t) * $);
    return new _Timestamp(t, n);
  }
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(e, t) {
    if (this.seconds = e, this.nanoseconds = t, t < 0) throw new FirestoreError(N.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (t >= 1e9) throw new FirestoreError(N.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (e < Q) throw new FirestoreError(N.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800) throw new FirestoreError(N.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / $;
  }
  _compareTo(e) {
    return this.seconds === e.seconds ? __PRIVATE_primitiveComparator(this.nanoseconds, e.nanoseconds) : __PRIVATE_primitiveComparator(this.seconds, e.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /**
   * Returns a JSON-serializable representation of this `Timestamp`.
   */
  toJSON() {
    return {
      type: _Timestamp._jsonSchemaVersion,
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Builds a `Timestamp` instance from a JSON object created by {@link Timestamp.toJSON}.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _Timestamp._jsonSchema)) return new _Timestamp(e.seconds, e.nanoseconds);
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const e = this.seconds - Q;
    return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
};
Timestamp._jsonSchemaVersion = "firestore/timestamp/1.0", Timestamp._jsonSchema = {
  type: property("string", Timestamp._jsonSchemaVersion),
  seconds: property("number"),
  nanoseconds: property("number")
};
var SnapshotVersion = class _SnapshotVersion {
  static fromTimestamp(e) {
    return new _SnapshotVersion(e);
  }
  static min() {
    return new _SnapshotVersion(new Timestamp(0, 0));
  }
  static max() {
    return new _SnapshotVersion(new Timestamp(253402300799, 999999999));
  }
  constructor(e) {
    this.timestamp = e;
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
};
var U = -1;
var FieldIndex = class {
  constructor(e, t, n, r2) {
    this.indexId = e, this.collectionGroup = t, this.fields = n, this.indexState = r2;
  }
};
FieldIndex.UNKNOWN_ID = -1;
function __PRIVATE_newIndexOffsetSuccessorFromReadTime(e, t) {
  const n = e.toTimestamp().seconds, r2 = e.toTimestamp().nanoseconds + 1, i = SnapshotVersion.fromTimestamp(1e9 === r2 ? new Timestamp(n + 1, 0) : new Timestamp(n, r2));
  return new IndexOffset(i, DocumentKey.empty(), t);
}
function __PRIVATE_newIndexOffsetFromDocument(e) {
  return new IndexOffset(e.readTime, e.key, U);
}
var IndexOffset = class _IndexOffset {
  constructor(e, t, n) {
    this.readTime = e, this.documentKey = t, this.largestBatchId = n;
  }
  /** Returns an offset that sorts before all regular offsets. */
  static min() {
    return new _IndexOffset(SnapshotVersion.min(), DocumentKey.empty(), U);
  }
  /** Returns an offset that sorts after all regular offsets. */
  static max() {
    return new _IndexOffset(SnapshotVersion.max(), DocumentKey.empty(), U);
  }
};
function __PRIVATE_indexOffsetComparator(e, t) {
  let n = e.readTime.compareTo(t.readTime);
  return 0 !== n ? n : (n = DocumentKey.comparator(e.documentKey, t.documentKey), 0 !== n ? n : __PRIVATE_primitiveComparator(e.largestBatchId, t.largestBatchId));
}
var K = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
var PersistenceTransaction = class {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((e) => e());
  }
};
async function __PRIVATE_ignoreIfPrimaryLeaseLoss(e) {
  if (e.code !== N.FAILED_PRECONDITION || e.message !== K) throw e;
  __PRIVATE_logDebug("LocalStore", "Unexpectedly lost primary lease");
}
var PersistencePromise = class _PersistencePromise {
  constructor(e) {
    this.nextCallback = null, this.catchCallback = null, // When the operation resolves, we'll set result or error and mark isDone.
    this.result = void 0, this.error = void 0, this.isDone = false, // Set to true when .then() or .catch() are called and prevents additional
    // chaining.
    this.callbackAttached = false, e((e2) => {
      this.isDone = true, this.result = e2, this.nextCallback && // value should be defined unless T is Void, but we can't express
      // that in the type system.
      this.nextCallback(e2);
    }, (e2) => {
      this.isDone = true, this.error = e2, this.catchCallback && this.catchCallback(e2);
    });
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, t) {
    return this.callbackAttached && fail(59440), this.callbackAttached = true, this.isDone ? this.error ? this.wrapFailure(t, this.error) : this.wrapSuccess(e, this.result) : new _PersistencePromise((n, r2) => {
      this.nextCallback = (t2) => {
        this.wrapSuccess(e, t2).next(n, r2);
      }, this.catchCallback = (e2) => {
        this.wrapFailure(t, e2).next(n, r2);
      };
    });
  }
  toPromise() {
    return new Promise((e, t) => {
      this.next(e, t);
    });
  }
  wrapUserFunction(e) {
    try {
      const t = e();
      return t instanceof _PersistencePromise ? t : _PersistencePromise.resolve(t);
    } catch (e2) {
      return _PersistencePromise.reject(e2);
    }
  }
  wrapSuccess(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : _PersistencePromise.resolve(t);
  }
  wrapFailure(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : _PersistencePromise.reject(t);
  }
  static resolve(e) {
    return new _PersistencePromise((t, n) => {
      t(e);
    });
  }
  static reject(e) {
    return new _PersistencePromise((t, n) => {
      n(e);
    });
  }
  static waitFor(e) {
    return new _PersistencePromise((t, n) => {
      let r2 = 0, i = 0, s = false;
      e.forEach((e2) => {
        ++r2, e2.next(() => {
          ++i, s && i === r2 && t();
        }, (e3) => n(e3));
      }), s = true, i === r2 && t();
    });
  }
  /**
   * Given an array of predicate functions that asynchronously evaluate to a
   * boolean, implements a short-circuiting `or` between the results. Predicates
   * will be evaluated until one of them returns `true`, then stop. The final
   * result will be whether any of them returned `true`.
   */
  static or(e) {
    let t = _PersistencePromise.resolve(false);
    for (const n of e) t = t.next((e2) => e2 ? _PersistencePromise.resolve(e2) : n());
    return t;
  }
  static forEach(e, t) {
    const n = [];
    return e.forEach((e2, r2) => {
      n.push(t.call(this, e2, r2));
    }), this.waitFor(n);
  }
  /**
   * Concurrently map all array elements through asynchronous function.
   */
  static mapArray(e, t) {
    return new _PersistencePromise((n, r2) => {
      const i = e.length, s = new Array(i);
      let o = 0;
      for (let _ = 0; _ < i; _++) {
        const a2 = _;
        t(e[a2]).next((e2) => {
          s[a2] = e2, ++o, o === i && n(s);
        }, (e2) => r2(e2));
      }
    });
  }
  /**
   * An alternative to recursive PersistencePromise calls, that avoids
   * potential memory problems from unbounded chains of promises.
   *
   * The `action` will be called repeatedly while `condition` is true.
   */
  static doWhile(e, t) {
    return new _PersistencePromise((n, r2) => {
      const process2 = () => {
        true === e() ? t().next(() => {
          process2();
        }, r2) : n();
      };
      process2();
    });
  }
};
function __PRIVATE_getAndroidVersion(e) {
  const t = e.match(/Android ([\d.]+)/i), n = t ? t[1].split(".").slice(0, 2).join(".") : "-1";
  return Number(n);
}
function __PRIVATE_isIndexedDbTransactionError(e) {
  return "IndexedDbTransactionError" === e.name;
}
var __PRIVATE_ListenSequence = class {
  constructor(e, t) {
    this.previousValue = e, t && (t.sequenceNumberHandler = (e2) => this.ae(e2), this.ue = (e2) => t.writeSequenceNumber(e2));
  }
  ae(e) {
    return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
  }
  next() {
    const e = ++this.previousValue;
    return this.ue && this.ue(e), e;
  }
};
__PRIVATE_ListenSequence.ce = -1;
var j = -1;
function __PRIVATE_isNullOrUndefined(e) {
  return null == e;
}
function __PRIVATE_isNegativeZero(e) {
  return 0 === e && 1 / e == -1 / 0;
}
function isSafeInteger(e) {
  return "number" == typeof e && Number.isInteger(e) && !__PRIVATE_isNegativeZero(e) && e <= Number.MAX_SAFE_INTEGER && e >= Number.MIN_SAFE_INTEGER;
}
var J = "";
function __PRIVATE_encodeResourcePath(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) t.length > 0 && (t = __PRIVATE_encodeSeparator(t)), t = __PRIVATE_encodeSegment(e.get(n), t);
  return __PRIVATE_encodeSeparator(t);
}
function __PRIVATE_encodeSegment(e, t) {
  let n = t;
  const r2 = e.length;
  for (let t2 = 0; t2 < r2; t2++) {
    const r3 = e.charAt(t2);
    switch (r3) {
      case "\0":
        n += "";
        break;
      case J:
        n += "";
        break;
      default:
        n += r3;
    }
  }
  return n;
}
function __PRIVATE_encodeSeparator(e) {
  return e + J + "";
}
var H = "remoteDocuments";
var Y = "owner";
var X = "mutationQueues";
var te = "mutations";
var oe = "documentMutations";
var _e = "remoteDocumentsV14";
var Pe = "remoteDocumentGlobal";
var Ie = "targets";
var Ae = "targetDocuments";
var ge = "targetGlobal";
var pe = "collectionParents";
var we = "clientMetadata";
var be = "bundles";
var Ce = "namedQueries";
var Fe = "indexConfiguration";
var Ne = "indexState";
var qe = "indexEntries";
var Ke = "documentOverlays";
var He = "globals";
var Ze = [...[...[...[...[X, te, oe, H, Ie, Y, ge, Ae], we], Pe], pe], be, Ce];
var Xe = [...Ze, Ke];
var et = [X, te, oe, _e, Ie, Y, ge, Ae, we, Pe, pe, be, Ce, Ke];
var tt = et;
var nt = [...tt, Fe, Ne, qe];
var it = [...nt, He];
function __PRIVATE_objectSize(e) {
  let t = 0;
  for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && t++;
  return t;
}
function forEach(e, t) {
  for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && t(n, e[n]);
}
function isEmpty(e) {
  for (const t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return false;
  return true;
}
var SortedMap = class _SortedMap {
  constructor(e, t) {
    this.comparator = e, this.root = t || LLRBNode.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(e, t) {
    return new _SortedMap(this.comparator, this.root.insert(e, t, this.comparator).copy(null, null, LLRBNode.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(e) {
    return new _SortedMap(this.comparator, this.root.remove(e, this.comparator).copy(null, null, LLRBNode.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const n = this.comparator(e, t.key);
      if (0 === n) return t.value;
      n < 0 ? t = t.left : n > 0 && (t = t.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(e) {
    let t = 0, n = this.root;
    for (; !n.isEmpty(); ) {
      const r2 = this.comparator(e, n.key);
      if (0 === r2) return t + n.left.size;
      r2 < 0 ? n = n.left : (
        // Count all nodes left of the node plus the node itself
        (t += n.left.size + 1, n = n.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((t, n) => (e(t, n), false));
  }
  toString() {
    const e = [];
    return this.inorderTraversal((t, n) => (e.push(`${t}:${n}`), false)), `{${e.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new SortedMapIterator(this.root, null, this.comparator, false);
  }
  getIteratorFrom(e) {
    return new SortedMapIterator(this.root, e, this.comparator, false);
  }
  getReverseIterator() {
    return new SortedMapIterator(this.root, null, this.comparator, true);
  }
  getReverseIteratorFrom(e) {
    return new SortedMapIterator(this.root, e, this.comparator, true);
  }
};
var SortedMapIterator = class {
  constructor(e, t, n, r2) {
    this.isReverse = r2, this.nodeStack = [];
    let i = 1;
    for (; !e.isEmpty(); ) if (i = t ? n(e.key, t) : 1, // flip the comparison if we're going in reverse
    t && r2 && (i *= -1), i < 0)
      e = this.isReverse ? e.left : e.right;
    else {
      if (0 === i) {
        this.nodeStack.push(e);
        break;
      }
      this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
    }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = {
      key: e.key,
      value: e.value
    };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right;
    else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), e = e.left;
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (0 === this.nodeStack.length) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: e.key,
      value: e.value
    };
  }
};
var LLRBNode = class _LLRBNode {
  constructor(e, t, n, r2, i) {
    this.key = e, this.value = t, this.color = null != n ? n : _LLRBNode.RED, this.left = null != r2 ? r2 : _LLRBNode.EMPTY, this.right = null != i ? i : _LLRBNode.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(e, t, n, r2, i) {
    return new _LLRBNode(null != e ? e : this.key, null != t ? t : this.value, null != n ? n : this.color, null != r2 ? r2 : this.left, null != i ? i : this.right);
  }
  isEmpty() {
    return false;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(e, t, n) {
    let r2 = this;
    const i = n(e, r2.key);
    return r2 = i < 0 ? r2.copy(null, null, null, r2.left.insert(e, t, n), null) : 0 === i ? r2.copy(null, t, null, null, null) : r2.copy(null, null, null, null, r2.right.insert(e, t, n)), r2.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty()) return _LLRBNode.EMPTY;
    let e = this;
    return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), e.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(e, t) {
    let n, r2 = this;
    if (t(e, r2.key) < 0) r2.left.isEmpty() || r2.left.isRed() || r2.left.left.isRed() || (r2 = r2.moveRedLeft()), r2 = r2.copy(null, null, null, r2.left.remove(e, t), null);
    else {
      if (r2.left.isRed() && (r2 = r2.rotateRight()), r2.right.isEmpty() || r2.right.isRed() || r2.right.left.isRed() || (r2 = r2.moveRedRight()), 0 === t(e, r2.key)) {
        if (r2.right.isEmpty()) return _LLRBNode.EMPTY;
        n = r2.right.min(), r2 = r2.copy(n.key, n.value, null, null, r2.right.removeMin());
      }
      r2 = r2.copy(null, null, null, null, r2.right.remove(e, t));
    }
    return r2.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let e = this;
    return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
  }
  moveRedRight() {
    let e = this.colorFlip();
    return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
  }
  rotateLeft() {
    const e = this.copy(null, null, _LLRBNode.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, _LLRBNode.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  // For testing.
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed()) throw fail(43730, {
      key: this.key,
      value: this.value
    });
    if (this.right.isRed()) throw fail(14113, {
      key: this.key,
      value: this.value
    });
    const e = this.left.check();
    if (e !== this.right.check()) throw fail(27949);
    return e + (this.isRed() ? 0 : 1);
  }
};
LLRBNode.EMPTY = null, LLRBNode.RED = true, LLRBNode.BLACK = false;
LLRBNode.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class LLRBEmptyNode {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw fail(57766);
  }
  get value() {
    throw fail(16141);
  }
  get color() {
    throw fail(16727);
  }
  get left() {
    throw fail(29726);
  }
  get right() {
    throw fail(36894);
  }
  // Returns a copy of the current node.
  copy(e, t, n, r2, i) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(e, t, n) {
    return new LLRBNode(e, t);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return true;
  }
  inorderTraversal(e) {
    return false;
  }
  reverseTraversal(e) {
    return false;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return false;
  }
  // For testing.
  checkMaxDepth() {
    return true;
  }
  check() {
    return 0;
  }
}();
var SortedSet = class _SortedSet {
  constructor(e) {
    this.comparator = e, this.data = new SortedMap(this.comparator);
  }
  has(e) {
    return null !== this.data.get(e);
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(e) {
    this.data.inorderTraversal((t, n) => (e(t), false));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(e, t) {
    const n = this.data.getIteratorFrom(e[0]);
    for (; n.hasNext(); ) {
      const r2 = n.getNext();
      if (this.comparator(r2.key, e[1]) >= 0) return;
      t(r2.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(e, t) {
    let n;
    for (n = void 0 !== t ? this.data.getIteratorFrom(t) : this.data.getIterator(); n.hasNext(); ) {
      if (!e(n.getNext().key)) return;
    }
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new SortedSetIterator(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new SortedSetIterator(this.data.getIteratorFrom(e));
  }
  /** Inserts or updates an element */
  add(e) {
    return this.copy(this.data.remove(e).insert(e, true));
  }
  /** Deletes an element */
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return t.size < e.size && (t = e, e = this), e.forEach((e2) => {
      t = t.add(e2);
    }), t;
  }
  isEqual(e) {
    if (!(e instanceof _SortedSet)) return false;
    if (this.size !== e.size) return false;
    const t = this.data.getIterator(), n = e.data.getIterator();
    for (; t.hasNext(); ) {
      const e2 = t.getNext().key, r2 = n.getNext().key;
      if (0 !== this.comparator(e2, r2)) return false;
    }
    return true;
  }
  toArray() {
    const e = [];
    return this.forEach((t) => {
      e.push(t);
    }), e;
  }
  toString() {
    const e = [];
    return this.forEach((t) => e.push(t)), "SortedSet(" + e.toString() + ")";
  }
  copy(e) {
    const t = new _SortedSet(this.comparator);
    return t.data = e, t;
  }
};
var SortedSetIterator = class {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
};
var FieldMask = class _FieldMask {
  constructor(e) {
    this.fields = e, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    e.sort(FieldPath$1.comparator);
  }
  static empty() {
    return new _FieldMask([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(e) {
    let t = new SortedSet(FieldPath$1.comparator);
    for (const e2 of this.fields) t = t.add(e2);
    for (const n of e) t = t.add(n);
    return new _FieldMask(t.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return true;
    return false;
  }
  isEqual(e) {
    return __PRIVATE_arrayEquals(this.fields, e.fields, (e2, t) => e2.isEqual(t));
  }
};
var __PRIVATE_Base64DecodeError = class extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
};
var ByteString = class _ByteString {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = function __PRIVATE_decodeBase64(e2) {
      try {
        return atob(e2);
      } catch (e3) {
        throw "undefined" != typeof DOMException && e3 instanceof DOMException ? new __PRIVATE_Base64DecodeError("Invalid base64 string: " + e3) : e3;
      }
    }(e);
    return new _ByteString(t);
  }
  static fromUint8Array(e) {
    const t = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      function __PRIVATE_binaryStringFromUint8Array(e2) {
        let t2 = "";
        for (let n = 0; n < e2.length; ++n) t2 += String.fromCharCode(e2[n]);
        return t2;
      }(e)
    );
    return new _ByteString(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () => e < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(e++),
        done: false
      } : {
        value: void 0,
        done: true
      }
    };
  }
  toBase64() {
    return function __PRIVATE_encodeBase64(e) {
      return btoa(e);
    }(this.binaryString);
  }
  toUint8Array() {
    return function __PRIVATE_uint8ArrayFromBinaryString(e) {
      const t = new Uint8Array(e.length);
      for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
      return t;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return __PRIVATE_primitiveComparator(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
};
ByteString.EMPTY_BYTE_STRING = new ByteString("");
var ot = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function __PRIVATE_normalizeTimestamp(e) {
  if (__PRIVATE_hardAssert(!!e, 39018), "string" == typeof e) {
    let t = 0;
    const n = ot.exec(e);
    if (__PRIVATE_hardAssert(!!n, 46558, {
      timestamp: e
    }), n[1]) {
      let e2 = n[1];
      e2 = (e2 + "000000000").substr(0, 9), t = Number(e2);
    }
    const r2 = new Date(e);
    return {
      seconds: Math.floor(r2.getTime() / 1e3),
      nanos: t
    };
  }
  return {
    seconds: __PRIVATE_normalizeNumber(e.seconds),
    nanos: __PRIVATE_normalizeNumber(e.nanos)
  };
}
function __PRIVATE_normalizeNumber(e) {
  return "number" == typeof e ? e : "string" == typeof e ? Number(e) : 0;
}
function __PRIVATE_normalizeByteString(e) {
  return "string" == typeof e ? ByteString.fromBase64String(e) : ByteString.fromUint8Array(e);
}
var _t = "server_timestamp";
var at = "__type__";
var ut = "__previous_value__";
var ct = "__local_write_time__";
function __PRIVATE_isServerTimestamp(e) {
  const t = (e?.mapValue?.fields || {})[at]?.stringValue;
  return t === _t;
}
function __PRIVATE_getPreviousValue(e) {
  const t = e.mapValue.fields[ut];
  return __PRIVATE_isServerTimestamp(t) ? __PRIVATE_getPreviousValue(t) : t;
}
function __PRIVATE_getLocalWriteTime(e) {
  const t = __PRIVATE_normalizeTimestamp(e.mapValue.fields[ct].timestampValue);
  return new Timestamp(t.seconds, t.nanos);
}
var DatabaseInfo = class {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions Options that configure long-polling.
   * @param useFetchStreams Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(e, t, n, r2, i, s, o, _, a2, u) {
    this.databaseId = e, this.appId = t, this.persistenceKey = n, this.host = r2, this.ssl = i, this.forceLongPolling = s, this.autoDetectLongPolling = o, this.longPollingOptions = _, this.useFetchStreams = a2, this.isUsingEmulator = u;
  }
};
var lt = "(default)";
var DatabaseId = class _DatabaseId {
  constructor(e, t) {
    this.projectId = e, this.database = t || lt;
  }
  static empty() {
    return new _DatabaseId("", "");
  }
  get isDefaultDatabase() {
    return this.database === lt;
  }
  isEqual(e) {
    return e instanceof _DatabaseId && e.projectId === this.projectId && e.database === this.database;
  }
};
var ht = "__type__";
var Pt = "__max__";
var Tt = {
  mapValue: {
    fields: {
      __type__: {
        stringValue: Pt
      }
    }
  }
};
var It = "__vector__";
var Et = "value";
function __PRIVATE_typeOrder(e) {
  return "nullValue" in e ? 0 : "booleanValue" in e ? 1 : "integerValue" in e || "doubleValue" in e ? 2 : "timestampValue" in e ? 3 : "stringValue" in e ? 5 : "bytesValue" in e ? 6 : "referenceValue" in e ? 7 : "geoPointValue" in e ? 8 : "arrayValue" in e ? 9 : "mapValue" in e ? __PRIVATE_isServerTimestamp(e) ? 4 : __PRIVATE_isMaxValue(e) ? 9007199254740991 : __PRIVATE_isVectorValue(e) ? 10 : 11 : fail(28295, {
    value: e
  });
}
function __PRIVATE_valueEquals(e, t) {
  if (e === t) return true;
  const n = __PRIVATE_typeOrder(e);
  if (n !== __PRIVATE_typeOrder(t)) return false;
  switch (n) {
    case 0:
    case 9007199254740991:
      return true;
    case 1:
      return e.booleanValue === t.booleanValue;
    case 4:
      return __PRIVATE_getLocalWriteTime(e).isEqual(__PRIVATE_getLocalWriteTime(t));
    case 3:
      return function __PRIVATE_timestampEquals(e2, t2) {
        if ("string" == typeof e2.timestampValue && "string" == typeof t2.timestampValue && e2.timestampValue.length === t2.timestampValue.length)
          return e2.timestampValue === t2.timestampValue;
        const n2 = __PRIVATE_normalizeTimestamp(e2.timestampValue), r2 = __PRIVATE_normalizeTimestamp(t2.timestampValue);
        return n2.seconds === r2.seconds && n2.nanos === r2.nanos;
      }(e, t);
    case 5:
      return e.stringValue === t.stringValue;
    case 6:
      return function __PRIVATE_blobEquals(e2, t2) {
        return __PRIVATE_normalizeByteString(e2.bytesValue).isEqual(__PRIVATE_normalizeByteString(t2.bytesValue));
      }(e, t);
    case 7:
      return e.referenceValue === t.referenceValue;
    case 8:
      return function __PRIVATE_geoPointEquals(e2, t2) {
        return __PRIVATE_normalizeNumber(e2.geoPointValue.latitude) === __PRIVATE_normalizeNumber(t2.geoPointValue.latitude) && __PRIVATE_normalizeNumber(e2.geoPointValue.longitude) === __PRIVATE_normalizeNumber(t2.geoPointValue.longitude);
      }(e, t);
    case 2:
      return function __PRIVATE_numberEquals(e2, t2) {
        if ("integerValue" in e2 && "integerValue" in t2) return __PRIVATE_normalizeNumber(e2.integerValue) === __PRIVATE_normalizeNumber(t2.integerValue);
        if ("doubleValue" in e2 && "doubleValue" in t2) {
          const n2 = __PRIVATE_normalizeNumber(e2.doubleValue), r2 = __PRIVATE_normalizeNumber(t2.doubleValue);
          return n2 === r2 ? __PRIVATE_isNegativeZero(n2) === __PRIVATE_isNegativeZero(r2) : isNaN(n2) && isNaN(r2);
        }
        return false;
      }(e, t);
    case 9:
      return __PRIVATE_arrayEquals(e.arrayValue.values || [], t.arrayValue.values || [], __PRIVATE_valueEquals);
    case 10:
    case 11:
      return function __PRIVATE_objectEquals(e2, t2) {
        const n2 = e2.mapValue.fields || {}, r2 = t2.mapValue.fields || {};
        if (__PRIVATE_objectSize(n2) !== __PRIVATE_objectSize(r2)) return false;
        for (const e3 in n2) if (n2.hasOwnProperty(e3) && (void 0 === r2[e3] || !__PRIVATE_valueEquals(n2[e3], r2[e3]))) return false;
        return true;
      }(e, t);
    default:
      return fail(52216, {
        left: e
      });
  }
}
function __PRIVATE_arrayValueContains(e, t) {
  return void 0 !== (e.values || []).find((e2) => __PRIVATE_valueEquals(e2, t));
}
function __PRIVATE_valueCompare(e, t) {
  if (e === t) return 0;
  const n = __PRIVATE_typeOrder(e), r2 = __PRIVATE_typeOrder(t);
  if (n !== r2) return __PRIVATE_primitiveComparator(n, r2);
  switch (n) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return __PRIVATE_primitiveComparator(e.booleanValue, t.booleanValue);
    case 2:
      return function __PRIVATE_compareNumbers(e2, t2) {
        const n2 = __PRIVATE_normalizeNumber(e2.integerValue || e2.doubleValue), r3 = __PRIVATE_normalizeNumber(t2.integerValue || t2.doubleValue);
        return n2 < r3 ? -1 : n2 > r3 ? 1 : n2 === r3 ? 0 : (
          // one or both are NaN.
          isNaN(n2) ? isNaN(r3) ? 0 : -1 : 1
        );
      }(e, t);
    case 3:
      return __PRIVATE_compareTimestamps(e.timestampValue, t.timestampValue);
    case 4:
      return __PRIVATE_compareTimestamps(__PRIVATE_getLocalWriteTime(e), __PRIVATE_getLocalWriteTime(t));
    case 5:
      return __PRIVATE_compareUtf8Strings(e.stringValue, t.stringValue);
    case 6:
      return function __PRIVATE_compareBlobs(e2, t2) {
        const n2 = __PRIVATE_normalizeByteString(e2), r3 = __PRIVATE_normalizeByteString(t2);
        return n2.compareTo(r3);
      }(e.bytesValue, t.bytesValue);
    case 7:
      return function __PRIVATE_compareReferences(e2, t2) {
        const n2 = e2.split("/"), r3 = t2.split("/");
        for (let e3 = 0; e3 < n2.length && e3 < r3.length; e3++) {
          const t3 = __PRIVATE_primitiveComparator(n2[e3], r3[e3]);
          if (0 !== t3) return t3;
        }
        return __PRIVATE_primitiveComparator(n2.length, r3.length);
      }(e.referenceValue, t.referenceValue);
    case 8:
      return function __PRIVATE_compareGeoPoints(e2, t2) {
        const n2 = __PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e2.latitude), __PRIVATE_normalizeNumber(t2.latitude));
        if (0 !== n2) return n2;
        return __PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e2.longitude), __PRIVATE_normalizeNumber(t2.longitude));
      }(e.geoPointValue, t.geoPointValue);
    case 9:
      return __PRIVATE_compareArrays(e.arrayValue, t.arrayValue);
    case 10:
      return function __PRIVATE_compareVectors(e2, t2) {
        const n2 = e2.fields || {}, r3 = t2.fields || {}, i = n2[Et]?.arrayValue, s = r3[Et]?.arrayValue, o = __PRIVATE_primitiveComparator(i?.values?.length || 0, s?.values?.length || 0);
        if (0 !== o) return o;
        return __PRIVATE_compareArrays(i, s);
      }(e.mapValue, t.mapValue);
    case 11:
      return function __PRIVATE_compareMaps(e2, t2) {
        if (e2 === Tt.mapValue && t2 === Tt.mapValue) return 0;
        if (e2 === Tt.mapValue) return 1;
        if (t2 === Tt.mapValue) return -1;
        const n2 = e2.fields || {}, r3 = Object.keys(n2), i = t2.fields || {}, s = Object.keys(i);
        r3.sort(), s.sort();
        for (let e3 = 0; e3 < r3.length && e3 < s.length; ++e3) {
          const t3 = __PRIVATE_compareUtf8Strings(r3[e3], s[e3]);
          if (0 !== t3) return t3;
          const o = __PRIVATE_valueCompare(n2[r3[e3]], i[s[e3]]);
          if (0 !== o) return o;
        }
        return __PRIVATE_primitiveComparator(r3.length, s.length);
      }(e.mapValue, t.mapValue);
    default:
      throw fail(23264, {
        he: n
      });
  }
}
function __PRIVATE_compareTimestamps(e, t) {
  if ("string" == typeof e && "string" == typeof t && e.length === t.length) return __PRIVATE_primitiveComparator(e, t);
  const n = __PRIVATE_normalizeTimestamp(e), r2 = __PRIVATE_normalizeTimestamp(t), i = __PRIVATE_primitiveComparator(n.seconds, r2.seconds);
  return 0 !== i ? i : __PRIVATE_primitiveComparator(n.nanos, r2.nanos);
}
function __PRIVATE_compareArrays(e, t) {
  const n = e.values || [], r2 = t.values || [];
  for (let e2 = 0; e2 < n.length && e2 < r2.length; ++e2) {
    const t2 = __PRIVATE_valueCompare(n[e2], r2[e2]);
    if (t2) return t2;
  }
  return __PRIVATE_primitiveComparator(n.length, r2.length);
}
function canonicalId(e) {
  return __PRIVATE_canonifyValue(e);
}
function __PRIVATE_canonifyValue(e) {
  return "nullValue" in e ? "null" : "booleanValue" in e ? "" + e.booleanValue : "integerValue" in e ? "" + e.integerValue : "doubleValue" in e ? "" + e.doubleValue : "timestampValue" in e ? function __PRIVATE_canonifyTimestamp(e2) {
    const t = __PRIVATE_normalizeTimestamp(e2);
    return `time(${t.seconds},${t.nanos})`;
  }(e.timestampValue) : "stringValue" in e ? e.stringValue : "bytesValue" in e ? function __PRIVATE_canonifyByteString(e2) {
    return __PRIVATE_normalizeByteString(e2).toBase64();
  }(e.bytesValue) : "referenceValue" in e ? function __PRIVATE_canonifyReference(e2) {
    return DocumentKey.fromName(e2).toString();
  }(e.referenceValue) : "geoPointValue" in e ? function __PRIVATE_canonifyGeoPoint(e2) {
    return `geo(${e2.latitude},${e2.longitude})`;
  }(e.geoPointValue) : "arrayValue" in e ? function __PRIVATE_canonifyArray(e2) {
    let t = "[", n = true;
    for (const r2 of e2.values || []) n ? n = false : t += ",", t += __PRIVATE_canonifyValue(r2);
    return t + "]";
  }(e.arrayValue) : "mapValue" in e ? function __PRIVATE_canonifyMap(e2) {
    const t = Object.keys(e2.fields || {}).sort();
    let n = "{", r2 = true;
    for (const i of t) r2 ? r2 = false : n += ",", n += `${i}:${__PRIVATE_canonifyValue(e2.fields[i])}`;
    return n + "}";
  }(e.mapValue) : fail(61005, {
    value: e
  });
}
function __PRIVATE_estimateByteSize(e) {
  switch (__PRIVATE_typeOrder(e)) {
    case 0:
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
    case 8:
      return 16;
    case 4:
      const t = __PRIVATE_getPreviousValue(e);
      return t ? 16 + __PRIVATE_estimateByteSize(t) : 16;
    case 5:
      return 2 * e.stringValue.length;
    case 6:
      return __PRIVATE_normalizeByteString(e.bytesValue).approximateByteSize();
    case 7:
      return e.referenceValue.length;
    case 9:
      return function __PRIVATE_estimateArrayByteSize(e2) {
        return (e2.values || []).reduce((e3, t2) => e3 + __PRIVATE_estimateByteSize(t2), 0);
      }(e.arrayValue);
    case 10:
    case 11:
      return function __PRIVATE_estimateMapByteSize(e2) {
        let t2 = 0;
        return forEach(e2.fields, (e3, n) => {
          t2 += e3.length + __PRIVATE_estimateByteSize(n);
        }), t2;
      }(e.mapValue);
    default:
      throw fail(13486, {
        value: e
      });
  }
}
function __PRIVATE_refValue(e, t) {
  return {
    referenceValue: `projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`
  };
}
function isInteger(e) {
  return !!e && "integerValue" in e;
}
function isArray(e) {
  return !!e && "arrayValue" in e;
}
function __PRIVATE_isNullValue(e) {
  return !!e && "nullValue" in e;
}
function __PRIVATE_isNanValue(e) {
  return !!e && "doubleValue" in e && isNaN(Number(e.doubleValue));
}
function __PRIVATE_isMapValue(e) {
  return !!e && "mapValue" in e;
}
function __PRIVATE_isVectorValue(e) {
  const t = (e?.mapValue?.fields || {})[ht]?.stringValue;
  return t === It;
}
function __PRIVATE_deepClone(e) {
  if (e.geoPointValue) return {
    geoPointValue: {
      ...e.geoPointValue
    }
  };
  if (e.timestampValue && "object" == typeof e.timestampValue) return {
    timestampValue: {
      ...e.timestampValue
    }
  };
  if (e.mapValue) {
    const t = {
      mapValue: {
        fields: {}
      }
    };
    return forEach(e.mapValue.fields, (e2, n) => t.mapValue.fields[e2] = __PRIVATE_deepClone(n)), t;
  }
  if (e.arrayValue) {
    const t = {
      arrayValue: {
        values: []
      }
    };
    for (let n = 0; n < (e.arrayValue.values || []).length; ++n) t.arrayValue.values[n] = __PRIVATE_deepClone(e.arrayValue.values[n]);
    return t;
  }
  return {
    ...e
  };
}
function __PRIVATE_isMaxValue(e) {
  return (((e.mapValue || {}).fields || {}).__type__ || {}).stringValue === Pt;
}
var At = {
  mapValue: {
    fields: {
      [ht]: {
        stringValue: It
      },
      [Et]: {
        arrayValue: {}
      }
    }
  }
};
var ObjectValue = class _ObjectValue {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new _ObjectValue({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let n = 0; n < e.length - 1; ++n) if (t = (t.mapValue.fields || {})[e.get(n)], !__PRIVATE_isMapValue(t)) return null;
      return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = __PRIVATE_deepClone(t);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(e) {
    let t = FieldPath$1.emptyPath(), n = {}, r2 = [];
    e.forEach((e2, i2) => {
      if (!t.isImmediateParentOf(i2)) {
        const e3 = this.getFieldsMap(t);
        this.applyChanges(e3, n, r2), n = {}, r2 = [], t = i2.popLast();
      }
      e2 ? n[i2.lastSegment()] = __PRIVATE_deepClone(e2) : r2.push(i2.lastSegment());
    });
    const i = this.getFieldsMap(t);
    this.applyChanges(i, n, r2);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(e) {
    const t = this.field(e.popLast());
    __PRIVATE_isMapValue(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return __PRIVATE_valueEquals(this.value, e.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = {
      fields: {}
    });
    for (let n = 0; n < e.length; ++n) {
      let r2 = t.mapValue.fields[e.get(n)];
      __PRIVATE_isMapValue(r2) && r2.mapValue.fields || (r2 = {
        mapValue: {
          fields: {}
        }
      }, t.mapValue.fields[e.get(n)] = r2), t = r2;
    }
    return t.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(e, t, n) {
    forEach(t, (t2, n2) => e[t2] = n2);
    for (const t2 of n) delete e[t2];
  }
  clone() {
    return new _ObjectValue(__PRIVATE_deepClone(this.value));
  }
};
function __PRIVATE_extractFieldMask(e) {
  const t = [];
  return forEach(e.fields, (e2, n) => {
    const r2 = new FieldPath$1([e2]);
    if (__PRIVATE_isMapValue(n)) {
      const e3 = __PRIVATE_extractFieldMask(n.mapValue).fields;
      if (0 === e3.length)
        t.push(r2);
      else
        for (const n2 of e3) t.push(r2.child(n2));
    } else
      t.push(r2);
  }), new FieldMask(t);
}
var MutableDocument = class _MutableDocument {
  constructor(e, t, n, r2, i, s, o) {
    this.key = e, this.documentType = t, this.version = n, this.readTime = r2, this.createTime = i, this.data = s, this.documentState = o;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(e) {
    return new _MutableDocument(
      e,
      0,
      /* version */
      SnapshotVersion.min(),
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      SnapshotVersion.min(),
      ObjectValue.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(e, t, n, r2) {
    return new _MutableDocument(
      e,
      1,
      /* version */
      t,
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      n,
      r2,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(e, t) {
    return new _MutableDocument(
      e,
      2,
      /* version */
      t,
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      SnapshotVersion.min(),
      ObjectValue.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(e, t) {
    return new _MutableDocument(
      e,
      3,
      /* version */
      t,
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      SnapshotVersion.min(),
      ObjectValue.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(e, t) {
    return !this.createTime.isEqual(SnapshotVersion.min()) || 2 !== this.documentType && 0 !== this.documentType || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(e) {
    return this.version = e, this.documentType = 2, this.data = ObjectValue.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(e) {
    return this.version = e, this.documentType = 3, this.data = ObjectValue.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = SnapshotVersion.min(), this;
  }
  setReadTime(e) {
    return this.readTime = e, this;
  }
  get hasLocalMutations() {
    return 1 === this.documentState;
  }
  get hasCommittedMutations() {
    return 2 === this.documentState;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return 0 !== this.documentType;
  }
  isFoundDocument() {
    return 1 === this.documentType;
  }
  isNoDocument() {
    return 2 === this.documentType;
  }
  isUnknownDocument() {
    return 3 === this.documentType;
  }
  isEqual(e) {
    return e instanceof _MutableDocument && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
  }
  mutableCopy() {
    return new _MutableDocument(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
};
var Bound = class {
  constructor(e, t) {
    this.position = e, this.inclusive = t;
  }
};
function __PRIVATE_boundCompareToDocument(e, t, n) {
  let r2 = 0;
  for (let i = 0; i < e.position.length; i++) {
    const s = t[i], o = e.position[i];
    if (s.field.isKeyField()) r2 = DocumentKey.comparator(DocumentKey.fromName(o.referenceValue), n.key);
    else {
      r2 = __PRIVATE_valueCompare(o, n.data.field(s.field));
    }
    if ("desc" === s.dir && (r2 *= -1), 0 !== r2) break;
  }
  return r2;
}
function __PRIVATE_boundEquals(e, t) {
  if (null === e) return null === t;
  if (null === t) return false;
  if (e.inclusive !== t.inclusive || e.position.length !== t.position.length) return false;
  for (let n = 0; n < e.position.length; n++) {
    if (!__PRIVATE_valueEquals(e.position[n], t.position[n])) return false;
  }
  return true;
}
var OrderBy = class {
  constructor(e, t = "asc") {
    this.field = e, this.dir = t;
  }
};
function __PRIVATE_orderByEquals(e, t) {
  return e.dir === t.dir && e.field.isEqual(t.field);
}
var Filter = class {
};
var FieldFilter = class _FieldFilter extends Filter {
  constructor(e, t, n) {
    super(), this.field = e, this.op = t, this.value = n;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t, n) {
    return e.isKeyField() ? "in" === t || "not-in" === t ? this.createKeyFieldInFilter(e, t, n) : new __PRIVATE_KeyFieldFilter(e, t, n) : "array-contains" === t ? new __PRIVATE_ArrayContainsFilter(e, n) : "in" === t ? new __PRIVATE_InFilter(e, n) : "not-in" === t ? new __PRIVATE_NotInFilter(e, n) : "array-contains-any" === t ? new __PRIVATE_ArrayContainsAnyFilter(e, n) : new _FieldFilter(e, t, n);
  }
  static createKeyFieldInFilter(e, t, n) {
    return "in" === t ? new __PRIVATE_KeyFieldInFilter(e, n) : new __PRIVATE_KeyFieldNotInFilter(e, n);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return "!=" === this.op ? null !== t && void 0 === t.nullValue && this.matchesComparison(__PRIVATE_valueCompare(t, this.value)) : null !== t && __PRIVATE_typeOrder(this.value) === __PRIVATE_typeOrder(t) && this.matchesComparison(__PRIVATE_valueCompare(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return 0 === e;
      case "!=":
        return 0 !== e;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return fail(47266, {
          operator: this.op
        });
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
};
var CompositeFilter = class _CompositeFilter extends Filter {
  constructor(e, t) {
    super(), this.filters = e, this.op = t, this.Pe = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t) {
    return new _CompositeFilter(e, t);
  }
  matches(e) {
    return __PRIVATE_compositeFilterIsConjunction(this) ? void 0 === this.filters.find((t) => !t.matches(e)) : void 0 !== this.filters.find((t) => t.matches(e));
  }
  getFlattenedFilters() {
    return null !== this.Pe || (this.Pe = this.filters.reduce((e, t) => e.concat(t.getFlattenedFilters()), [])), this.Pe;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
};
function __PRIVATE_compositeFilterIsConjunction(e) {
  return "and" === e.op;
}
function __PRIVATE_compositeFilterIsFlatConjunction(e) {
  return __PRIVATE_compositeFilterIsFlat(e) && __PRIVATE_compositeFilterIsConjunction(e);
}
function __PRIVATE_compositeFilterIsFlat(e) {
  for (const t of e.filters) if (t instanceof CompositeFilter) return false;
  return true;
}
function __PRIVATE_canonifyFilter(e) {
  if (e instanceof FieldFilter)
    return e.field.canonicalString() + e.op.toString() + canonicalId(e.value);
  if (__PRIVATE_compositeFilterIsFlatConjunction(e))
    return e.filters.map((e2) => __PRIVATE_canonifyFilter(e2)).join(",");
  {
    const t = e.filters.map((e2) => __PRIVATE_canonifyFilter(e2)).join(",");
    return `${e.op}(${t})`;
  }
}
function __PRIVATE_filterEquals(e, t) {
  return e instanceof FieldFilter ? function __PRIVATE_fieldFilterEquals(e2, t2) {
    return t2 instanceof FieldFilter && e2.op === t2.op && e2.field.isEqual(t2.field) && __PRIVATE_valueEquals(e2.value, t2.value);
  }(e, t) : e instanceof CompositeFilter ? function __PRIVATE_compositeFilterEquals(e2, t2) {
    if (t2 instanceof CompositeFilter && e2.op === t2.op && e2.filters.length === t2.filters.length) {
      return e2.filters.reduce((e3, n, r2) => e3 && __PRIVATE_filterEquals(n, t2.filters[r2]), true);
    }
    return false;
  }(e, t) : void fail(19439);
}
function __PRIVATE_stringifyFilter(e) {
  return e instanceof FieldFilter ? function __PRIVATE_stringifyFieldFilter(e2) {
    return `${e2.field.canonicalString()} ${e2.op} ${canonicalId(e2.value)}`;
  }(e) : e instanceof CompositeFilter ? function __PRIVATE_stringifyCompositeFilter(e2) {
    return e2.op.toString() + " {" + e2.getFilters().map(__PRIVATE_stringifyFilter).join(" ,") + "}";
  }(e) : "Filter";
}
var __PRIVATE_KeyFieldFilter = class extends FieldFilter {
  constructor(e, t, n) {
    super(e, t, n), this.key = DocumentKey.fromName(n.referenceValue);
  }
  matches(e) {
    const t = DocumentKey.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
};
var __PRIVATE_KeyFieldInFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "in", t), this.keys = __PRIVATE_extractDocumentKeysFromArrayValue("in", t);
  }
  matches(e) {
    return this.keys.some((t) => t.isEqual(e.key));
  }
};
var __PRIVATE_KeyFieldNotInFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "not-in", t), this.keys = __PRIVATE_extractDocumentKeysFromArrayValue("not-in", t);
  }
  matches(e) {
    return !this.keys.some((t) => t.isEqual(e.key));
  }
};
function __PRIVATE_extractDocumentKeysFromArrayValue(e, t) {
  return (t.arrayValue?.values || []).map((e2) => DocumentKey.fromName(e2.referenceValue));
}
var __PRIVATE_ArrayContainsFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "array-contains", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return isArray(t) && __PRIVATE_arrayValueContains(t.arrayValue, this.value);
  }
};
var __PRIVATE_InFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "in", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return null !== t && __PRIVATE_arrayValueContains(this.value.arrayValue, t);
  }
};
var __PRIVATE_NotInFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "not-in", t);
  }
  matches(e) {
    if (__PRIVATE_arrayValueContains(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    })) return false;
    const t = e.data.field(this.field);
    return null !== t && void 0 === t.nullValue && !__PRIVATE_arrayValueContains(this.value.arrayValue, t);
  }
};
var __PRIVATE_ArrayContainsAnyFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "array-contains-any", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return !(!isArray(t) || !t.arrayValue.values) && t.arrayValue.values.some((e2) => __PRIVATE_arrayValueContains(this.value.arrayValue, e2));
  }
};
var __PRIVATE_TargetImpl = class {
  constructor(e, t = null, n = [], r2 = [], i = null, s = null, o = null) {
    this.path = e, this.collectionGroup = t, this.orderBy = n, this.filters = r2, this.limit = i, this.startAt = s, this.endAt = o, this.Te = null;
  }
};
function __PRIVATE_newTarget(e, t = null, n = [], r2 = [], i = null, s = null, o = null) {
  return new __PRIVATE_TargetImpl(e, t, n, r2, i, s, o);
}
function __PRIVATE_canonifyTarget(e) {
  const t = __PRIVATE_debugCast(e);
  if (null === t.Te) {
    let e2 = t.path.canonicalString();
    null !== t.collectionGroup && (e2 += "|cg:" + t.collectionGroup), e2 += "|f:", e2 += t.filters.map((e3) => __PRIVATE_canonifyFilter(e3)).join(","), e2 += "|ob:", e2 += t.orderBy.map((e3) => function __PRIVATE_canonifyOrderBy(e4) {
      return e4.field.canonicalString() + e4.dir;
    }(e3)).join(","), __PRIVATE_isNullOrUndefined(t.limit) || (e2 += "|l:", e2 += t.limit), t.startAt && (e2 += "|lb:", e2 += t.startAt.inclusive ? "b:" : "a:", e2 += t.startAt.position.map((e3) => canonicalId(e3)).join(",")), t.endAt && (e2 += "|ub:", e2 += t.endAt.inclusive ? "a:" : "b:", e2 += t.endAt.position.map((e3) => canonicalId(e3)).join(",")), t.Te = e2;
  }
  return t.Te;
}
function __PRIVATE_targetEquals(e, t) {
  if (e.limit !== t.limit) return false;
  if (e.orderBy.length !== t.orderBy.length) return false;
  for (let n = 0; n < e.orderBy.length; n++) if (!__PRIVATE_orderByEquals(e.orderBy[n], t.orderBy[n])) return false;
  if (e.filters.length !== t.filters.length) return false;
  for (let n = 0; n < e.filters.length; n++) if (!__PRIVATE_filterEquals(e.filters[n], t.filters[n])) return false;
  return e.collectionGroup === t.collectionGroup && (!!e.path.isEqual(t.path) && (!!__PRIVATE_boundEquals(e.startAt, t.startAt) && __PRIVATE_boundEquals(e.endAt, t.endAt)));
}
function __PRIVATE_targetIsDocumentTarget(e) {
  return DocumentKey.isDocumentKey(e.path) && null === e.collectionGroup && 0 === e.filters.length;
}
var __PRIVATE_QueryImpl = class {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(e, t = null, n = [], r2 = [], i = null, s = "F", o = null, _ = null) {
    this.path = e, this.collectionGroup = t, this.explicitOrderBy = n, this.filters = r2, this.limit = i, this.limitType = s, this.startAt = o, this.endAt = _, this.Ie = null, // The corresponding `Target` of this `Query` instance, for use with
    // non-aggregate queries.
    this.Ee = null, // The corresponding `Target` of this `Query` instance, for use with
    // aggregate queries. Unlike targets for non-aggregate queries,
    // aggregate query targets do not contain normalized order-bys, they only
    // contain explicit order-bys.
    this.de = null, this.startAt, this.endAt;
  }
};
function __PRIVATE_newQuery(e, t, n, r2, i, s, o, _) {
  return new __PRIVATE_QueryImpl(e, t, n, r2, i, s, o, _);
}
function __PRIVATE_newQueryForPath(e) {
  return new __PRIVATE_QueryImpl(e);
}
function __PRIVATE_queryMatchesAllDocuments(e) {
  return 0 === e.filters.length && null === e.limit && null == e.startAt && null == e.endAt && (0 === e.explicitOrderBy.length || 1 === e.explicitOrderBy.length && e.explicitOrderBy[0].field.isKeyField());
}
function __PRIVATE_isCollectionGroupQuery(e) {
  return null !== e.collectionGroup;
}
function __PRIVATE_queryNormalizedOrderBy(e) {
  const t = __PRIVATE_debugCast(e);
  if (null === t.Ie) {
    t.Ie = [];
    const e2 = /* @__PURE__ */ new Set();
    for (const n2 of t.explicitOrderBy) t.Ie.push(n2), e2.add(n2.field.canonicalString());
    const n = t.explicitOrderBy.length > 0 ? t.explicitOrderBy[t.explicitOrderBy.length - 1].dir : "asc", r2 = function __PRIVATE_getInequalityFilterFields(e3) {
      let t2 = new SortedSet(FieldPath$1.comparator);
      return e3.filters.forEach((e4) => {
        e4.getFlattenedFilters().forEach((e5) => {
          e5.isInequality() && (t2 = t2.add(e5.field));
        });
      }), t2;
    }(t);
    r2.forEach((r3) => {
      e2.has(r3.canonicalString()) || r3.isKeyField() || t.Ie.push(new OrderBy(r3, n));
    }), // Add the document key field to the last if it is not explicitly ordered.
    e2.has(FieldPath$1.keyField().canonicalString()) || t.Ie.push(new OrderBy(FieldPath$1.keyField(), n));
  }
  return t.Ie;
}
function __PRIVATE_queryToTarget(e) {
  const t = __PRIVATE_debugCast(e);
  return t.Ee || (t.Ee = __PRIVATE__queryToTarget(t, __PRIVATE_queryNormalizedOrderBy(e))), t.Ee;
}
function __PRIVATE__queryToTarget(e, t) {
  if ("F" === e.limitType) return __PRIVATE_newTarget(e.path, e.collectionGroup, t, e.filters, e.limit, e.startAt, e.endAt);
  {
    t = t.map((e2) => {
      const t2 = "desc" === e2.dir ? "asc" : "desc";
      return new OrderBy(e2.field, t2);
    });
    const n = e.endAt ? new Bound(e.endAt.position, e.endAt.inclusive) : null, r2 = e.startAt ? new Bound(e.startAt.position, e.startAt.inclusive) : null;
    return __PRIVATE_newTarget(e.path, e.collectionGroup, t, e.filters, e.limit, n, r2);
  }
}
function __PRIVATE_queryWithAddedFilter(e, t) {
  const n = e.filters.concat([t]);
  return new __PRIVATE_QueryImpl(e.path, e.collectionGroup, e.explicitOrderBy.slice(), n, e.limit, e.limitType, e.startAt, e.endAt);
}
function __PRIVATE_queryWithLimit(e, t, n) {
  return new __PRIVATE_QueryImpl(e.path, e.collectionGroup, e.explicitOrderBy.slice(), e.filters.slice(), t, n, e.startAt, e.endAt);
}
function __PRIVATE_queryEquals(e, t) {
  return __PRIVATE_targetEquals(__PRIVATE_queryToTarget(e), __PRIVATE_queryToTarget(t)) && e.limitType === t.limitType;
}
function __PRIVATE_canonifyQuery(e) {
  return `${__PRIVATE_canonifyTarget(__PRIVATE_queryToTarget(e))}|lt:${e.limitType}`;
}
function __PRIVATE_stringifyQuery(e) {
  return `Query(target=${function __PRIVATE_stringifyTarget(e2) {
    let t = e2.path.canonicalString();
    return null !== e2.collectionGroup && (t += " collectionGroup=" + e2.collectionGroup), e2.filters.length > 0 && (t += `, filters: [${e2.filters.map((e3) => __PRIVATE_stringifyFilter(e3)).join(", ")}]`), __PRIVATE_isNullOrUndefined(e2.limit) || (t += ", limit: " + e2.limit), e2.orderBy.length > 0 && (t += `, orderBy: [${e2.orderBy.map((e3) => function __PRIVATE_stringifyOrderBy(e4) {
      return `${e4.field.canonicalString()} (${e4.dir})`;
    }(e3)).join(", ")}]`), e2.startAt && (t += ", startAt: ", t += e2.startAt.inclusive ? "b:" : "a:", t += e2.startAt.position.map((e3) => canonicalId(e3)).join(",")), e2.endAt && (t += ", endAt: ", t += e2.endAt.inclusive ? "a:" : "b:", t += e2.endAt.position.map((e3) => canonicalId(e3)).join(",")), `Target(${t})`;
  }(__PRIVATE_queryToTarget(e))}; limitType=${e.limitType})`;
}
function __PRIVATE_queryMatches(e, t) {
  return t.isFoundDocument() && function __PRIVATE_queryMatchesPathAndCollectionGroup(e2, t2) {
    const n = t2.key.path;
    return null !== e2.collectionGroup ? t2.key.hasCollectionId(e2.collectionGroup) && e2.path.isPrefixOf(n) : DocumentKey.isDocumentKey(e2.path) ? e2.path.isEqual(n) : e2.path.isImmediateParentOf(n);
  }(e, t) && function __PRIVATE_queryMatchesOrderBy(e2, t2) {
    for (const n of __PRIVATE_queryNormalizedOrderBy(e2))
      if (!n.field.isKeyField() && null === t2.data.field(n.field)) return false;
    return true;
  }(e, t) && function __PRIVATE_queryMatchesFilters(e2, t2) {
    for (const n of e2.filters) if (!n.matches(t2)) return false;
    return true;
  }(e, t) && function __PRIVATE_queryMatchesBounds(e2, t2) {
    if (e2.startAt && !/**
    * Returns true if a document sorts before a bound using the provided sort
    * order.
    */
    function __PRIVATE_boundSortsBeforeDocument(e3, t3, n) {
      const r2 = __PRIVATE_boundCompareToDocument(e3, t3, n);
      return e3.inclusive ? r2 <= 0 : r2 < 0;
    }(e2.startAt, __PRIVATE_queryNormalizedOrderBy(e2), t2)) return false;
    if (e2.endAt && !function __PRIVATE_boundSortsAfterDocument(e3, t3, n) {
      const r2 = __PRIVATE_boundCompareToDocument(e3, t3, n);
      return e3.inclusive ? r2 >= 0 : r2 > 0;
    }(e2.endAt, __PRIVATE_queryNormalizedOrderBy(e2), t2)) return false;
    return true;
  }(e, t);
}
function __PRIVATE_queryCollectionGroup(e) {
  return e.collectionGroup || (e.path.length % 2 == 1 ? e.path.lastSegment() : e.path.get(e.path.length - 2));
}
function __PRIVATE_newQueryComparator(e) {
  return (t, n) => {
    let r2 = false;
    for (const i of __PRIVATE_queryNormalizedOrderBy(e)) {
      const e2 = __PRIVATE_compareDocs(i, t, n);
      if (0 !== e2) return e2;
      r2 = r2 || i.field.isKeyField();
    }
    return 0;
  };
}
function __PRIVATE_compareDocs(e, t, n) {
  const r2 = e.field.isKeyField() ? DocumentKey.comparator(t.key, n.key) : function __PRIVATE_compareDocumentsByField(e2, t2, n2) {
    const r3 = t2.data.field(e2), i = n2.data.field(e2);
    return null !== r3 && null !== i ? __PRIVATE_valueCompare(r3, i) : fail(42886);
  }(e.field, t, n);
  switch (e.dir) {
    case "asc":
      return r2;
    case "desc":
      return -1 * r2;
    default:
      return fail(19790, {
        direction: e.dir
      });
  }
}
var ObjectMap = class {
  constructor(e, t) {
    this.mapKeyFn = e, this.equalsFn = t, /**
     * The inner map for a key/value pair. Due to the possibility of collisions we
     * keep a list of entries that we do a linear search through to find an actual
     * match. Note that collisions should be rare, so we still expect near
     * constant time lookups in practice.
     */
    this.inner = {}, /** The number of entries stored in the map */
    this.innerSize = 0;
  }
  /** Get a value for this key, or undefined if it does not exist. */
  get(e) {
    const t = this.mapKeyFn(e), n = this.inner[t];
    if (void 0 !== n) {
      for (const [t2, r2] of n) if (this.equalsFn(t2, e)) return r2;
    }
  }
  has(e) {
    return void 0 !== this.get(e);
  }
  /** Put this key and value in the map. */
  set(e, t) {
    const n = this.mapKeyFn(e), r2 = this.inner[n];
    if (void 0 === r2) return this.inner[n] = [[e, t]], void this.innerSize++;
    for (let n2 = 0; n2 < r2.length; n2++) if (this.equalsFn(r2[n2][0], e))
      return void (r2[n2] = [e, t]);
    r2.push([e, t]), this.innerSize++;
  }
  /**
   * Remove this key from the map. Returns a boolean if anything was deleted.
   */
  delete(e) {
    const t = this.mapKeyFn(e), n = this.inner[t];
    if (void 0 === n) return false;
    for (let r2 = 0; r2 < n.length; r2++) if (this.equalsFn(n[r2][0], e)) return 1 === n.length ? delete this.inner[t] : n.splice(r2, 1), this.innerSize--, true;
    return false;
  }
  forEach(e) {
    forEach(this.inner, (t, n) => {
      for (const [t2, r2] of n) e(t2, r2);
    });
  }
  isEmpty() {
    return isEmpty(this.inner);
  }
  size() {
    return this.innerSize;
  }
};
var Rt = new SortedMap(DocumentKey.comparator);
function __PRIVATE_mutableDocumentMap() {
  return Rt;
}
var Vt = new SortedMap(DocumentKey.comparator);
function documentMap(...e) {
  let t = Vt;
  for (const n of e) t = t.insert(n.key, n);
  return t;
}
function __PRIVATE_convertOverlayedDocumentMapToDocumentMap(e) {
  let t = Vt;
  return e.forEach((e2, n) => t = t.insert(e2, n.overlayedDocument)), t;
}
function __PRIVATE_newOverlayMap() {
  return __PRIVATE_newDocumentKeyMap();
}
function __PRIVATE_newMutationMap() {
  return __PRIVATE_newDocumentKeyMap();
}
function __PRIVATE_newDocumentKeyMap() {
  return new ObjectMap((e) => e.toString(), (e, t) => e.isEqual(t));
}
var mt = new SortedMap(DocumentKey.comparator);
var ft = new SortedSet(DocumentKey.comparator);
function __PRIVATE_documentKeySet(...e) {
  let t = ft;
  for (const n of e) t = t.add(n);
  return t;
}
var gt = new SortedSet(__PRIVATE_primitiveComparator);
function __PRIVATE_targetIdSet() {
  return gt;
}
function __PRIVATE_toDouble(e, t) {
  if (e.useProto3Json) {
    if (isNaN(t)) return {
      doubleValue: "NaN"
    };
    if (t === 1 / 0) return {
      doubleValue: "Infinity"
    };
    if (t === -1 / 0) return {
      doubleValue: "-Infinity"
    };
  }
  return {
    doubleValue: __PRIVATE_isNegativeZero(t) ? "-0" : t
  };
}
function __PRIVATE_toInteger(e) {
  return {
    integerValue: "" + e
  };
}
function toNumber(e, t) {
  return isSafeInteger(t) ? __PRIVATE_toInteger(t) : __PRIVATE_toDouble(e, t);
}
var TransformOperation = class {
  constructor() {
    this._ = void 0;
  }
};
function __PRIVATE_applyTransformOperationToLocalView(e, t, n) {
  return e instanceof __PRIVATE_ServerTimestampTransform ? function serverTimestamp$1(e2, t2) {
    const n2 = {
      fields: {
        [at]: {
          stringValue: _t
        },
        [ct]: {
          timestampValue: {
            seconds: e2.seconds,
            nanos: e2.nanoseconds
          }
        }
      }
    };
    return t2 && __PRIVATE_isServerTimestamp(t2) && (t2 = __PRIVATE_getPreviousValue(t2)), t2 && (n2.fields[ut] = t2), {
      mapValue: n2
    };
  }(n, t) : e instanceof __PRIVATE_ArrayUnionTransformOperation ? __PRIVATE_applyArrayUnionTransformOperation(e, t) : e instanceof __PRIVATE_ArrayRemoveTransformOperation ? __PRIVATE_applyArrayRemoveTransformOperation(e, t) : function __PRIVATE_applyNumericIncrementTransformOperationToLocalView(e2, t2) {
    const n2 = __PRIVATE_computeTransformOperationBaseValue(e2, t2), r2 = asNumber(n2) + asNumber(e2.Ae);
    return isInteger(n2) && isInteger(e2.Ae) ? __PRIVATE_toInteger(r2) : __PRIVATE_toDouble(e2.serializer, r2);
  }(e, t);
}
function __PRIVATE_applyTransformOperationToRemoteDocument(e, t, n) {
  return e instanceof __PRIVATE_ArrayUnionTransformOperation ? __PRIVATE_applyArrayUnionTransformOperation(e, t) : e instanceof __PRIVATE_ArrayRemoveTransformOperation ? __PRIVATE_applyArrayRemoveTransformOperation(e, t) : n;
}
function __PRIVATE_computeTransformOperationBaseValue(e, t) {
  return e instanceof __PRIVATE_NumericIncrementTransformOperation ? (
    /** Returns true if `value` is either an IntegerValue or a DoubleValue. */
    function __PRIVATE_isNumber(e2) {
      return isInteger(e2) || function __PRIVATE_isDouble(e3) {
        return !!e3 && "doubleValue" in e3;
      }(e2);
    }(t) ? t : {
      integerValue: 0
    }
  ) : null;
}
var __PRIVATE_ServerTimestampTransform = class extends TransformOperation {
};
var __PRIVATE_ArrayUnionTransformOperation = class extends TransformOperation {
  constructor(e) {
    super(), this.elements = e;
  }
};
function __PRIVATE_applyArrayUnionTransformOperation(e, t) {
  const n = __PRIVATE_coercedFieldValuesArray(t);
  for (const t2 of e.elements) n.some((e2) => __PRIVATE_valueEquals(e2, t2)) || n.push(t2);
  return {
    arrayValue: {
      values: n
    }
  };
}
var __PRIVATE_ArrayRemoveTransformOperation = class extends TransformOperation {
  constructor(e) {
    super(), this.elements = e;
  }
};
function __PRIVATE_applyArrayRemoveTransformOperation(e, t) {
  let n = __PRIVATE_coercedFieldValuesArray(t);
  for (const t2 of e.elements) n = n.filter((e2) => !__PRIVATE_valueEquals(e2, t2));
  return {
    arrayValue: {
      values: n
    }
  };
}
var __PRIVATE_NumericIncrementTransformOperation = class extends TransformOperation {
  constructor(e, t) {
    super(), this.serializer = e, this.Ae = t;
  }
};
function asNumber(e) {
  return __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue);
}
function __PRIVATE_coercedFieldValuesArray(e) {
  return isArray(e) && e.arrayValue.values ? e.arrayValue.values.slice() : [];
}
var FieldTransform = class {
  constructor(e, t) {
    this.field = e, this.transform = t;
  }
};
function __PRIVATE_fieldTransformEquals(e, t) {
  return e.field.isEqual(t.field) && function __PRIVATE_transformOperationEquals(e2, t2) {
    return e2 instanceof __PRIVATE_ArrayUnionTransformOperation && t2 instanceof __PRIVATE_ArrayUnionTransformOperation || e2 instanceof __PRIVATE_ArrayRemoveTransformOperation && t2 instanceof __PRIVATE_ArrayRemoveTransformOperation ? __PRIVATE_arrayEquals(e2.elements, t2.elements, __PRIVATE_valueEquals) : e2 instanceof __PRIVATE_NumericIncrementTransformOperation && t2 instanceof __PRIVATE_NumericIncrementTransformOperation ? __PRIVATE_valueEquals(e2.Ae, t2.Ae) : e2 instanceof __PRIVATE_ServerTimestampTransform && t2 instanceof __PRIVATE_ServerTimestampTransform;
  }(e.transform, t.transform);
}
var MutationResult = class {
  constructor(e, t) {
    this.version = e, this.transformResults = t;
  }
};
var Precondition = class _Precondition {
  constructor(e, t) {
    this.updateTime = e, this.exists = t;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new _Precondition();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(e) {
    return new _Precondition(void 0, e);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(e) {
    return new _Precondition(e);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return void 0 === this.updateTime && void 0 === this.exists;
  }
  isEqual(e) {
    return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
  }
};
function __PRIVATE_preconditionIsValidForDocument(e, t) {
  return void 0 !== e.updateTime ? t.isFoundDocument() && t.version.isEqual(e.updateTime) : void 0 === e.exists || e.exists === t.isFoundDocument();
}
var Mutation = class {
};
function __PRIVATE_calculateOverlayMutation(e, t) {
  if (!e.hasLocalMutations || t && 0 === t.fields.length) return null;
  if (null === t) return e.isNoDocument() ? new __PRIVATE_DeleteMutation(e.key, Precondition.none()) : new __PRIVATE_SetMutation(e.key, e.data, Precondition.none());
  {
    const n = e.data, r2 = ObjectValue.empty();
    let i = new SortedSet(FieldPath$1.comparator);
    for (let e2 of t.fields) if (!i.has(e2)) {
      let t2 = n.field(e2);
      null === t2 && e2.length > 1 && (e2 = e2.popLast(), t2 = n.field(e2)), null === t2 ? r2.delete(e2) : r2.set(e2, t2), i = i.add(e2);
    }
    return new __PRIVATE_PatchMutation(e.key, r2, new FieldMask(i.toArray()), Precondition.none());
  }
}
function __PRIVATE_mutationApplyToRemoteDocument(e, t, n) {
  e instanceof __PRIVATE_SetMutation ? function __PRIVATE_setMutationApplyToRemoteDocument(e2, t2, n2) {
    const r2 = e2.value.clone(), i = __PRIVATE_serverTransformResults(e2.fieldTransforms, t2, n2.transformResults);
    r2.setAll(i), t2.convertToFoundDocument(n2.version, r2).setHasCommittedMutations();
  }(e, t, n) : e instanceof __PRIVATE_PatchMutation ? function __PRIVATE_patchMutationApplyToRemoteDocument(e2, t2, n2) {
    if (!__PRIVATE_preconditionIsValidForDocument(e2.precondition, t2))
      return void t2.convertToUnknownDocument(n2.version);
    const r2 = __PRIVATE_serverTransformResults(e2.fieldTransforms, t2, n2.transformResults), i = t2.data;
    i.setAll(__PRIVATE_getPatch(e2)), i.setAll(r2), t2.convertToFoundDocument(n2.version, i).setHasCommittedMutations();
  }(e, t, n) : function __PRIVATE_deleteMutationApplyToRemoteDocument(e2, t2, n2) {
    t2.convertToNoDocument(n2.version).setHasCommittedMutations();
  }(0, t, n);
}
function __PRIVATE_mutationApplyToLocalView(e, t, n, r2) {
  return e instanceof __PRIVATE_SetMutation ? function __PRIVATE_setMutationApplyToLocalView(e2, t2, n2, r3) {
    if (!__PRIVATE_preconditionIsValidForDocument(e2.precondition, t2))
      return n2;
    const i = e2.value.clone(), s = __PRIVATE_localTransformResults(e2.fieldTransforms, r3, t2);
    return i.setAll(s), t2.convertToFoundDocument(t2.version, i).setHasLocalMutations(), null;
  }(e, t, n, r2) : e instanceof __PRIVATE_PatchMutation ? function __PRIVATE_patchMutationApplyToLocalView(e2, t2, n2, r3) {
    if (!__PRIVATE_preconditionIsValidForDocument(e2.precondition, t2)) return n2;
    const i = __PRIVATE_localTransformResults(e2.fieldTransforms, r3, t2), s = t2.data;
    if (s.setAll(__PRIVATE_getPatch(e2)), s.setAll(i), t2.convertToFoundDocument(t2.version, s).setHasLocalMutations(), null === n2) return null;
    return n2.unionWith(e2.fieldMask.fields).unionWith(e2.fieldTransforms.map((e3) => e3.field));
  }(e, t, n, r2) : function __PRIVATE_deleteMutationApplyToLocalView(e2, t2, n2) {
    if (__PRIVATE_preconditionIsValidForDocument(e2.precondition, t2)) return t2.convertToNoDocument(t2.version).setHasLocalMutations(), null;
    return n2;
  }(e, t, n);
}
function __PRIVATE_mutationExtractBaseValue(e, t) {
  let n = null;
  for (const r2 of e.fieldTransforms) {
    const e2 = t.data.field(r2.field), i = __PRIVATE_computeTransformOperationBaseValue(r2.transform, e2 || null);
    null != i && (null === n && (n = ObjectValue.empty()), n.set(r2.field, i));
  }
  return n || null;
}
function __PRIVATE_mutationEquals(e, t) {
  return e.type === t.type && (!!e.key.isEqual(t.key) && (!!e.precondition.isEqual(t.precondition) && (!!function __PRIVATE_fieldTransformsAreEqual(e2, t2) {
    return void 0 === e2 && void 0 === t2 || !(!e2 || !t2) && __PRIVATE_arrayEquals(e2, t2, (e3, t3) => __PRIVATE_fieldTransformEquals(e3, t3));
  }(e.fieldTransforms, t.fieldTransforms) && (0 === e.type ? e.value.isEqual(t.value) : 1 !== e.type || e.data.isEqual(t.data) && e.fieldMask.isEqual(t.fieldMask)))));
}
var __PRIVATE_SetMutation = class extends Mutation {
  constructor(e, t, n, r2 = []) {
    super(), this.key = e, this.value = t, this.precondition = n, this.fieldTransforms = r2, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
};
var __PRIVATE_PatchMutation = class extends Mutation {
  constructor(e, t, n, r2, i = []) {
    super(), this.key = e, this.data = t, this.fieldMask = n, this.precondition = r2, this.fieldTransforms = i, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
};
function __PRIVATE_getPatch(e) {
  const t = /* @__PURE__ */ new Map();
  return e.fieldMask.fields.forEach((n) => {
    if (!n.isEmpty()) {
      const r2 = e.data.field(n);
      t.set(n, r2);
    }
  }), t;
}
function __PRIVATE_serverTransformResults(e, t, n) {
  const r2 = /* @__PURE__ */ new Map();
  __PRIVATE_hardAssert(e.length === n.length, 32656, {
    Re: n.length,
    Ve: e.length
  });
  for (let i = 0; i < n.length; i++) {
    const s = e[i], o = s.transform, _ = t.data.field(s.field);
    r2.set(s.field, __PRIVATE_applyTransformOperationToRemoteDocument(o, _, n[i]));
  }
  return r2;
}
function __PRIVATE_localTransformResults(e, t, n) {
  const r2 = /* @__PURE__ */ new Map();
  for (const i of e) {
    const e2 = i.transform, s = n.data.field(i.field);
    r2.set(i.field, __PRIVATE_applyTransformOperationToLocalView(e2, s, t));
  }
  return r2;
}
var __PRIVATE_DeleteMutation = class extends Mutation {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
};
var __PRIVATE_VerifyMutation = class extends Mutation {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
};
var MutationBatch = class {
  /**
   * @param batchId - The unique ID of this mutation batch.
   * @param localWriteTime - The original write time of this mutation.
   * @param baseMutations - Mutations that are used to populate the base
   * values when this mutation is applied locally. This can be used to locally
   * overwrite values that are persisted in the remote document cache. Base
   * mutations are never sent to the backend.
   * @param mutations - The user-provided mutations in this mutation batch.
   * User-provided mutations are applied both locally and remotely on the
   * backend.
   */
  constructor(e, t, n, r2) {
    this.batchId = e, this.localWriteTime = t, this.baseMutations = n, this.mutations = r2;
  }
  /**
   * Applies all the mutations in this MutationBatch to the specified document
   * to compute the state of the remote document
   *
   * @param document - The document to apply mutations to.
   * @param batchResult - The result of applying the MutationBatch to the
   * backend.
   */
  applyToRemoteDocument(e, t) {
    const n = t.mutationResults;
    for (let t2 = 0; t2 < this.mutations.length; t2++) {
      const r2 = this.mutations[t2];
      if (r2.key.isEqual(e.key)) {
        __PRIVATE_mutationApplyToRemoteDocument(r2, e, n[t2]);
      }
    }
  }
  /**
   * Computes the local view of a document given all the mutations in this
   * batch.
   *
   * @param document - The document to apply mutations to.
   * @param mutatedFields - Fields that have been updated before applying this mutation batch.
   * @returns A `FieldMask` representing all the fields that are mutated.
   */
  applyToLocalView(e, t) {
    for (const n of this.baseMutations) n.key.isEqual(e.key) && (t = __PRIVATE_mutationApplyToLocalView(n, e, t, this.localWriteTime));
    for (const n of this.mutations) n.key.isEqual(e.key) && (t = __PRIVATE_mutationApplyToLocalView(n, e, t, this.localWriteTime));
    return t;
  }
  /**
   * Computes the local view for all provided documents given the mutations in
   * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
   * replace all the mutation applications.
   */
  applyToLocalDocumentSet(e, t) {
    const n = __PRIVATE_newMutationMap();
    return this.mutations.forEach((r2) => {
      const i = e.get(r2.key), s = i.overlayedDocument;
      let o = this.applyToLocalView(s, i.mutatedFields);
      o = t.has(r2.key) ? null : o;
      const _ = __PRIVATE_calculateOverlayMutation(s, o);
      null !== _ && n.set(r2.key, _), s.isValidDocument() || s.convertToNoDocument(SnapshotVersion.min());
    }), n;
  }
  keys() {
    return this.mutations.reduce((e, t) => e.add(t.key), __PRIVATE_documentKeySet());
  }
  isEqual(e) {
    return this.batchId === e.batchId && __PRIVATE_arrayEquals(this.mutations, e.mutations, (e2, t) => __PRIVATE_mutationEquals(e2, t)) && __PRIVATE_arrayEquals(this.baseMutations, e.baseMutations, (e2, t) => __PRIVATE_mutationEquals(e2, t));
  }
};
var MutationBatchResult = class _MutationBatchResult {
  constructor(e, t, n, r2) {
    this.batch = e, this.commitVersion = t, this.mutationResults = n, this.docVersions = r2;
  }
  /**
   * Creates a new MutationBatchResult for the given batch and results. There
   * must be one result for each mutation in the batch. This static factory
   * caches a document=&gt;version mapping (docVersions).
   */
  static from(e, t, n) {
    __PRIVATE_hardAssert(e.mutations.length === n.length, 58842, {
      me: e.mutations.length,
      fe: n.length
    });
    let r2 = /* @__PURE__ */ function __PRIVATE_documentVersionMap() {
      return mt;
    }();
    const i = e.mutations;
    for (let e2 = 0; e2 < i.length; e2++) r2 = r2.insert(i[e2].key, n[e2].version);
    return new _MutationBatchResult(e, t, n, r2);
  }
};
var Overlay = class {
  constructor(e, t) {
    this.largestBatchId = e, this.mutation = t;
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return null !== e && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
};
var ExistenceFilter = class {
  constructor(e, t) {
    this.count = e, this.unchangedNames = t;
  }
};
var pt;
var yt;
function __PRIVATE_isPermanentError(e) {
  switch (e) {
    case N.OK:
      return fail(64938);
    case N.CANCELLED:
    case N.UNKNOWN:
    case N.DEADLINE_EXCEEDED:
    case N.RESOURCE_EXHAUSTED:
    case N.INTERNAL:
    case N.UNAVAILABLE:
    // Unauthenticated means something went wrong with our token and we need
    // to retry with new credentials which will happen automatically.
    case N.UNAUTHENTICATED:
      return false;
    case N.INVALID_ARGUMENT:
    case N.NOT_FOUND:
    case N.ALREADY_EXISTS:
    case N.PERMISSION_DENIED:
    case N.FAILED_PRECONDITION:
    // Aborted might be retried in some scenarios, but that is dependent on
    // the context and should handled individually by the calling code.
    // See https://cloud.google.com/apis/design/errors.
    case N.ABORTED:
    case N.OUT_OF_RANGE:
    case N.UNIMPLEMENTED:
    case N.DATA_LOSS:
      return true;
    default:
      return fail(15467, {
        code: e
      });
  }
}
function __PRIVATE_mapCodeFromRpcCode(e) {
  if (void 0 === e)
    return __PRIVATE_logError("GRPC error has no .code"), N.UNKNOWN;
  switch (e) {
    case pt.OK:
      return N.OK;
    case pt.CANCELLED:
      return N.CANCELLED;
    case pt.UNKNOWN:
      return N.UNKNOWN;
    case pt.DEADLINE_EXCEEDED:
      return N.DEADLINE_EXCEEDED;
    case pt.RESOURCE_EXHAUSTED:
      return N.RESOURCE_EXHAUSTED;
    case pt.INTERNAL:
      return N.INTERNAL;
    case pt.UNAVAILABLE:
      return N.UNAVAILABLE;
    case pt.UNAUTHENTICATED:
      return N.UNAUTHENTICATED;
    case pt.INVALID_ARGUMENT:
      return N.INVALID_ARGUMENT;
    case pt.NOT_FOUND:
      return N.NOT_FOUND;
    case pt.ALREADY_EXISTS:
      return N.ALREADY_EXISTS;
    case pt.PERMISSION_DENIED:
      return N.PERMISSION_DENIED;
    case pt.FAILED_PRECONDITION:
      return N.FAILED_PRECONDITION;
    case pt.ABORTED:
      return N.ABORTED;
    case pt.OUT_OF_RANGE:
      return N.OUT_OF_RANGE;
    case pt.UNIMPLEMENTED:
      return N.UNIMPLEMENTED;
    case pt.DATA_LOSS:
      return N.DATA_LOSS;
    default:
      return fail(39323, {
        code: e
      });
  }
}
(yt = pt || (pt = {}))[yt.OK = 0] = "OK", yt[yt.CANCELLED = 1] = "CANCELLED", yt[yt.UNKNOWN = 2] = "UNKNOWN", yt[yt.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", yt[yt.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", yt[yt.NOT_FOUND = 5] = "NOT_FOUND", yt[yt.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", yt[yt.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", yt[yt.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", yt[yt.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", yt[yt.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", yt[yt.ABORTED = 10] = "ABORTED", yt[yt.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", yt[yt.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", yt[yt.INTERNAL = 13] = "INTERNAL", yt[yt.UNAVAILABLE = 14] = "UNAVAILABLE", yt[yt.DATA_LOSS = 15] = "DATA_LOSS";
var wt = null;
function __PRIVATE_newTextEncoder() {
  return new TextEncoder();
}
var St = new Integer([4294967295, 4294967295], 0);
function __PRIVATE_getMd5HashValue(e) {
  const t = __PRIVATE_newTextEncoder().encode(e), n = new Md5();
  return n.update(t), new Uint8Array(n.digest());
}
function __PRIVATE_get64BitUints(e) {
  const t = new DataView(e.buffer), n = t.getUint32(
    0,
    /* littleEndian= */
    true
  ), r2 = t.getUint32(
    4,
    /* littleEndian= */
    true
  ), i = t.getUint32(
    8,
    /* littleEndian= */
    true
  ), s = t.getUint32(
    12,
    /* littleEndian= */
    true
  );
  return [new Integer([n, r2], 0), new Integer([i, s], 0)];
}
var BloomFilter = class _BloomFilter {
  constructor(e, t, n) {
    if (this.bitmap = e, this.padding = t, this.hashCount = n, t < 0 || t >= 8) throw new __PRIVATE_BloomFilterError(`Invalid padding: ${t}`);
    if (n < 0) throw new __PRIVATE_BloomFilterError(`Invalid hash count: ${n}`);
    if (e.length > 0 && 0 === this.hashCount)
      throw new __PRIVATE_BloomFilterError(`Invalid hash count: ${n}`);
    if (0 === e.length && 0 !== t)
      throw new __PRIVATE_BloomFilterError(`Invalid padding when bitmap length is 0: ${t}`);
    this.ge = 8 * e.length - t, // Set the bit count in Integer to avoid repetition in mightContain().
    this.pe = Integer.fromNumber(this.ge);
  }
  // Calculate the ith hash value based on the hashed 64bit integers,
  // and calculate its corresponding bit index in the bitmap to be checked.
  ye(e, t, n) {
    let r2 = e.add(t.multiply(Integer.fromNumber(n)));
    return 1 === r2.compare(St) && (r2 = new Integer([r2.getBits(0), r2.getBits(1)], 0)), r2.modulo(this.pe).toNumber();
  }
  // Return whether the bit on the given index in the bitmap is set to 1.
  we(e) {
    return !!(this.bitmap[Math.floor(e / 8)] & 1 << e % 8);
  }
  mightContain(e) {
    if (0 === this.ge) return false;
    const t = __PRIVATE_getMd5HashValue(e), [n, r2] = __PRIVATE_get64BitUints(t);
    for (let e2 = 0; e2 < this.hashCount; e2++) {
      const t2 = this.ye(n, r2, e2);
      if (!this.we(t2)) return false;
    }
    return true;
  }
  /** Create bloom filter for testing purposes only. */
  static create(e, t, n) {
    const r2 = e % 8 == 0 ? 0 : 8 - e % 8, i = new Uint8Array(Math.ceil(e / 8)), s = new _BloomFilter(i, r2, t);
    return n.forEach((e2) => s.insert(e2)), s;
  }
  insert(e) {
    if (0 === this.ge) return;
    const t = __PRIVATE_getMd5HashValue(e), [n, r2] = __PRIVATE_get64BitUints(t);
    for (let e2 = 0; e2 < this.hashCount; e2++) {
      const t2 = this.ye(n, r2, e2);
      this.Se(t2);
    }
  }
  Se(e) {
    const t = Math.floor(e / 8), n = e % 8;
    this.bitmap[t] |= 1 << n;
  }
};
var __PRIVATE_BloomFilterError = class extends Error {
  constructor() {
    super(...arguments), this.name = "BloomFilterError";
  }
};
var RemoteEvent = class _RemoteEvent {
  constructor(e, t, n, r2, i) {
    this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = n, this.documentUpdates = r2, this.resolvedLimboDocuments = i;
  }
  /**
   * HACK: Views require RemoteEvents in order to determine whether the view is
   * CURRENT, but secondary tabs don't receive remote events. So this method is
   * used to create a synthesized RemoteEvent that can be used to apply a
   * CURRENT status change to a View, for queries executed in a different tab.
   */
  // PORTING NOTE: Multi-tab only
  static createSynthesizedRemoteEventForCurrentChange(e, t, n) {
    const r2 = /* @__PURE__ */ new Map();
    return r2.set(e, TargetChange.createSynthesizedTargetChangeForCurrentChange(e, t, n)), new _RemoteEvent(SnapshotVersion.min(), r2, new SortedMap(__PRIVATE_primitiveComparator), __PRIVATE_mutableDocumentMap(), __PRIVATE_documentKeySet());
  }
};
var TargetChange = class _TargetChange {
  constructor(e, t, n, r2, i) {
    this.resumeToken = e, this.current = t, this.addedDocuments = n, this.modifiedDocuments = r2, this.removedDocuments = i;
  }
  /**
   * This method is used to create a synthesized TargetChanges that can be used to
   * apply a CURRENT status change to a View (for queries executed in a different
   * tab) or for new queries (to raise snapshots with correct CURRENT status).
   */
  static createSynthesizedTargetChangeForCurrentChange(e, t, n) {
    return new _TargetChange(n, t, __PRIVATE_documentKeySet(), __PRIVATE_documentKeySet(), __PRIVATE_documentKeySet());
  }
};
var __PRIVATE_DocumentWatchChange = class {
  constructor(e, t, n, r2) {
    this.be = e, this.removedTargetIds = t, this.key = n, this.De = r2;
  }
};
var __PRIVATE_ExistenceFilterChange = class {
  constructor(e, t) {
    this.targetId = e, this.Ce = t;
  }
};
var __PRIVATE_WatchTargetChange = class {
  constructor(e, t, n = ByteString.EMPTY_BYTE_STRING, r2 = null) {
    this.state = e, this.targetIds = t, this.resumeToken = n, this.cause = r2;
  }
};
var __PRIVATE_TargetState = class {
  constructor() {
    this.ve = 0, /**
     * Keeps track of the document changes since the last raised snapshot.
     *
     * These changes are continuously updated as we receive document updates and
     * always reflect the current set of changes against the last issued snapshot.
     */
    this.Fe = __PRIVATE_snapshotChangesMap(), /** See public getters for explanations of these fields. */
    this.Me = ByteString.EMPTY_BYTE_STRING, this.xe = false, /**
     * Whether this target state should be included in the next snapshot. We
     * initialize to true so that newly-added targets are included in the next
     * RemoteEvent.
     */
    this.Oe = true;
  }
  /**
   * Whether this target has been marked 'current'.
   *
   * 'Current' has special meaning in the RPC protocol: It implies that the
   * Watch backend has sent us all changes up to the point at which the target
   * was added and that the target is consistent with the rest of the watch
   * stream.
   */
  get current() {
    return this.xe;
  }
  /** The last resume token sent to us for this target. */
  get resumeToken() {
    return this.Me;
  }
  /** Whether this target has pending target adds or target removes. */
  get Ne() {
    return 0 !== this.ve;
  }
  /** Whether we have modified any state that should trigger a snapshot. */
  get Be() {
    return this.Oe;
  }
  /**
   * Applies the resume token to the TargetChange, but only when it has a new
   * value. Empty resumeTokens are discarded.
   */
  Le(e) {
    e.approximateByteSize() > 0 && (this.Oe = true, this.Me = e);
  }
  /**
   * Creates a target change from the current set of changes.
   *
   * To reset the document changes after raising this snapshot, call
   * `clearPendingChanges()`.
   */
  ke() {
    let e = __PRIVATE_documentKeySet(), t = __PRIVATE_documentKeySet(), n = __PRIVATE_documentKeySet();
    return this.Fe.forEach((r2, i) => {
      switch (i) {
        case 0:
          e = e.add(r2);
          break;
        case 2:
          t = t.add(r2);
          break;
        case 1:
          n = n.add(r2);
          break;
        default:
          fail(38017, {
            changeType: i
          });
      }
    }), new TargetChange(this.Me, this.xe, e, t, n);
  }
  /**
   * Resets the document changes and sets `hasPendingChanges` to false.
   */
  qe() {
    this.Oe = false, this.Fe = __PRIVATE_snapshotChangesMap();
  }
  Qe(e, t) {
    this.Oe = true, this.Fe = this.Fe.insert(e, t);
  }
  $e(e) {
    this.Oe = true, this.Fe = this.Fe.remove(e);
  }
  Ue() {
    this.ve += 1;
  }
  Ke() {
    this.ve -= 1, __PRIVATE_hardAssert(this.ve >= 0, 3241, {
      ve: this.ve
    });
  }
  We() {
    this.Oe = true, this.xe = true;
  }
};
var __PRIVATE_WatchChangeAggregator = class {
  constructor(e) {
    this.Ge = e, /** The internal state of all tracked targets. */
    this.ze = /* @__PURE__ */ new Map(), /** Keeps track of the documents to update since the last raised snapshot. */
    this.je = __PRIVATE_mutableDocumentMap(), this.Je = __PRIVATE_documentTargetMap(), /** A mapping of document keys to their set of target IDs. */
    this.He = __PRIVATE_documentTargetMap(), /**
     * A map of targets with existence filter mismatches. These targets are
     * known to be inconsistent and their listens needs to be re-established by
     * RemoteStore.
     */
    this.Ye = new SortedMap(__PRIVATE_primitiveComparator);
  }
  /**
   * Processes and adds the DocumentWatchChange to the current set of changes.
   */
  Ze(e) {
    for (const t of e.be) e.De && e.De.isFoundDocument() ? this.Xe(t, e.De) : this.et(t, e.key, e.De);
    for (const t of e.removedTargetIds) this.et(t, e.key, e.De);
  }
  /** Processes and adds the WatchTargetChange to the current set of changes. */
  tt(e) {
    this.forEachTarget(e, (t) => {
      const n = this.nt(t);
      switch (e.state) {
        case 0:
          this.rt(t) && n.Le(e.resumeToken);
          break;
        case 1:
          n.Ke(), n.Ne || // We have a freshly added target, so we need to reset any state
          // that we had previously. This can happen e.g. when remove and add
          // back a target for existence filter mismatches.
          n.qe(), n.Le(e.resumeToken);
          break;
        case 2:
          n.Ke(), n.Ne || this.removeTarget(t);
          break;
        case 3:
          this.rt(t) && (n.We(), n.Le(e.resumeToken));
          break;
        case 4:
          this.rt(t) && // Reset the target and synthesizes removes for all existing
          // documents. The backend will re-add any documents that still
          // match the target before it sends the next global snapshot.
          (this.it(t), n.Le(e.resumeToken));
          break;
        default:
          fail(56790, {
            state: e.state
          });
      }
    });
  }
  /**
   * Iterates over all targetIds that the watch change applies to: either the
   * targetIds explicitly listed in the change or the targetIds of all currently
   * active targets.
   */
  forEachTarget(e, t) {
    e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.ze.forEach((e2, n) => {
      this.rt(n) && t(n);
    });
  }
  /**
   * Handles existence filters and synthesizes deletes for filter mismatches.
   * Targets that are invalidated by filter mismatches are added to
   * `pendingTargetResets`.
   */
  st(e) {
    const t = e.targetId, n = e.Ce.count, r2 = this.ot(t);
    if (r2) {
      const i = r2.target;
      if (__PRIVATE_targetIsDocumentTarget(i)) if (0 === n) {
        const e2 = new DocumentKey(i.path);
        this.et(t, e2, MutableDocument.newNoDocument(e2, SnapshotVersion.min()));
      } else __PRIVATE_hardAssert(1 === n, 20013, {
        expectedCount: n
      });
      else {
        const r3 = this._t(t);
        if (r3 !== n) {
          const n2 = this.ut(e), i2 = n2 ? this.ct(n2, e, r3) : 1;
          if (0 !== i2) {
            this.it(t);
            const e2 = 2 === i2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
            this.Ye = this.Ye.insert(t, e2);
          }
          wt?.lt(function __PRIVATE_createExistenceFilterMismatchInfoForTestingHooks(e2, t2, n3, r4, i3) {
            const s = {
              localCacheCount: e2,
              existenceFilterCount: t2.count,
              databaseId: n3.database,
              projectId: n3.projectId
            }, o = t2.unchangedNames;
            o && (s.bloomFilter = {
              applied: 0 === i3,
              hashCount: o?.hashCount ?? 0,
              bitmapLength: o?.bits?.bitmap?.length ?? 0,
              padding: o?.bits?.padding ?? 0,
              mightContain: (e3) => r4?.mightContain(e3) ?? false
            });
            return s;
          }(r3, e.Ce, this.Ge.ht(), n2, i2));
        }
      }
    }
  }
  /**
   * Parse the bloom filter from the "unchanged_names" field of an existence
   * filter.
   */
  ut(e) {
    const t = e.Ce.unchangedNames;
    if (!t || !t.bits) return null;
    const { bits: { bitmap: n = "", padding: r2 = 0 }, hashCount: i = 0 } = t;
    let s, o;
    try {
      s = __PRIVATE_normalizeByteString(n).toUint8Array();
    } catch (e2) {
      if (e2 instanceof __PRIVATE_Base64DecodeError) return __PRIVATE_logWarn("Decoding the base64 bloom filter in existence filter failed (" + e2.message + "); ignoring the bloom filter and falling back to full re-query."), null;
      throw e2;
    }
    try {
      o = new BloomFilter(s, r2, i);
    } catch (e2) {
      return __PRIVATE_logWarn(e2 instanceof __PRIVATE_BloomFilterError ? "BloomFilter error: " : "Applying bloom filter failed: ", e2), null;
    }
    return 0 === o.ge ? null : o;
  }
  /**
   * Apply bloom filter to remove the deleted documents, and return the
   * application status.
   */
  ct(e, t, n) {
    return t.Ce.count === n - this.Pt(e, t.targetId) ? 0 : 2;
  }
  /**
   * Filter out removed documents based on bloom filter membership result and
   * return number of documents removed.
   */
  Pt(e, t) {
    const n = this.Ge.getRemoteKeysForTarget(t);
    let r2 = 0;
    return n.forEach((n2) => {
      const i = this.Ge.ht(), s = `projects/${i.projectId}/databases/${i.database}/documents/${n2.path.canonicalString()}`;
      e.mightContain(s) || (this.et(
        t,
        n2,
        /*updatedDocument=*/
        null
      ), r2++);
    }), r2;
  }
  /**
   * Converts the currently accumulated state into a remote event at the
   * provided snapshot version. Resets the accumulated changes before returning.
   */
  Tt(e) {
    const t = /* @__PURE__ */ new Map();
    this.ze.forEach((n2, r3) => {
      const i = this.ot(r3);
      if (i) {
        if (n2.current && __PRIVATE_targetIsDocumentTarget(i.target)) {
          const t2 = new DocumentKey(i.target.path);
          this.It(t2).has(r3) || this.Et(r3, t2) || this.et(r3, t2, MutableDocument.newNoDocument(t2, e));
        }
        n2.Be && (t.set(r3, n2.ke()), n2.qe());
      }
    });
    let n = __PRIVATE_documentKeySet();
    this.He.forEach((e2, t2) => {
      let r3 = true;
      t2.forEachWhile((e3) => {
        const t3 = this.ot(e3);
        return !t3 || "TargetPurposeLimboResolution" === t3.purpose || (r3 = false, false);
      }), r3 && (n = n.add(e2));
    }), this.je.forEach((t2, n2) => n2.setReadTime(e));
    const r2 = new RemoteEvent(e, t, this.Ye, this.je, n);
    return this.je = __PRIVATE_mutableDocumentMap(), this.Je = __PRIVATE_documentTargetMap(), this.He = __PRIVATE_documentTargetMap(), this.Ye = new SortedMap(__PRIVATE_primitiveComparator), r2;
  }
  /**
   * Adds the provided document to the internal list of document updates and
   * its document key to the given target's mapping.
   */
  // Visible for testing.
  Xe(e, t) {
    if (!this.rt(e)) return;
    const n = this.Et(e, t.key) ? 2 : 0;
    this.nt(e).Qe(t.key, n), this.je = this.je.insert(t.key, t), this.Je = this.Je.insert(t.key, this.It(t.key).add(e)), this.He = this.He.insert(t.key, this.dt(t.key).add(e));
  }
  /**
   * Removes the provided document from the target mapping. If the
   * document no longer matches the target, but the document's state is still
   * known (e.g. we know that the document was deleted or we received the change
   * that caused the filter mismatch), the new document can be provided
   * to update the remote document cache.
   */
  // Visible for testing.
  et(e, t, n) {
    if (!this.rt(e)) return;
    const r2 = this.nt(e);
    this.Et(e, t) ? r2.Qe(
      t,
      1
      /* ChangeType.Removed */
    ) : (
      // The document may have entered and left the target before we raised a
      // snapshot, so we can just ignore the change.
      r2.$e(t)
    ), this.He = this.He.insert(t, this.dt(t).delete(e)), this.He = this.He.insert(t, this.dt(t).add(e)), n && (this.je = this.je.insert(t, n));
  }
  removeTarget(e) {
    this.ze.delete(e);
  }
  /**
   * Returns the current count of documents in the target. This includes both
   * the number of documents that the LocalStore considers to be part of the
   * target as well as any accumulated changes.
   */
  _t(e) {
    const t = this.nt(e).ke();
    return this.Ge.getRemoteKeysForTarget(e).size + t.addedDocuments.size - t.removedDocuments.size;
  }
  /**
   * Increment the number of acks needed from watch before we can consider the
   * server to be 'in-sync' with the client's active targets.
   */
  Ue(e) {
    this.nt(e).Ue();
  }
  nt(e) {
    let t = this.ze.get(e);
    return t || (t = new __PRIVATE_TargetState(), this.ze.set(e, t)), t;
  }
  dt(e) {
    let t = this.He.get(e);
    return t || (t = new SortedSet(__PRIVATE_primitiveComparator), this.He = this.He.insert(e, t)), t;
  }
  It(e) {
    let t = this.Je.get(e);
    return t || (t = new SortedSet(__PRIVATE_primitiveComparator), this.Je = this.Je.insert(e, t)), t;
  }
  /**
   * Verifies that the user is still interested in this target (by calling
   * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
   * from watch.
   */
  rt(e) {
    const t = null !== this.ot(e);
    return t || __PRIVATE_logDebug("WatchChangeAggregator", "Detected inactive target", e), t;
  }
  /**
   * Returns the TargetData for an active target (i.e. a target that the user
   * is still interested in that has no outstanding target change requests).
   */
  ot(e) {
    const t = this.ze.get(e);
    return t && t.Ne ? null : this.Ge.At(e);
  }
  /**
   * Resets the state of a Watch target to its initial state (e.g. sets
   * 'current' to false, clears the resume token and removes its target mapping
   * from all documents).
   */
  it(e) {
    this.ze.set(e, new __PRIVATE_TargetState());
    this.Ge.getRemoteKeysForTarget(e).forEach((t) => {
      this.et(
        e,
        t,
        /*updatedDocument=*/
        null
      );
    });
  }
  /**
   * Returns whether the LocalStore considers the document to be part of the
   * specified target.
   */
  Et(e, t) {
    return this.Ge.getRemoteKeysForTarget(e).has(t);
  }
};
function __PRIVATE_documentTargetMap() {
  return new SortedMap(DocumentKey.comparator);
}
function __PRIVATE_snapshotChangesMap() {
  return new SortedMap(DocumentKey.comparator);
}
var bt = /* @__PURE__ */ (() => {
  const e = {
    asc: "ASCENDING",
    desc: "DESCENDING"
  };
  return e;
})();
var Dt = /* @__PURE__ */ (() => {
  const e = {
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "==": "EQUAL",
    "!=": "NOT_EQUAL",
    "array-contains": "ARRAY_CONTAINS",
    in: "IN",
    "not-in": "NOT_IN",
    "array-contains-any": "ARRAY_CONTAINS_ANY"
  };
  return e;
})();
var Ct = /* @__PURE__ */ (() => {
  const e = {
    and: "AND",
    or: "OR"
  };
  return e;
})();
var JsonProtoSerializer = class {
  constructor(e, t) {
    this.databaseId = e, this.useProto3Json = t;
  }
};
function __PRIVATE_toInt32Proto(e, t) {
  return e.useProto3Json || __PRIVATE_isNullOrUndefined(t) ? t : {
    value: t
  };
}
function toTimestamp(e, t) {
  if (e.useProto3Json) {
    return `${new Date(1e3 * t.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + t.nanoseconds).slice(-9)}Z`;
  }
  return {
    seconds: "" + t.seconds,
    nanos: t.nanoseconds
  };
}
function __PRIVATE_toBytes(e, t) {
  return e.useProto3Json ? t.toBase64() : t.toUint8Array();
}
function __PRIVATE_toVersion(e, t) {
  return toTimestamp(e, t.toTimestamp());
}
function __PRIVATE_fromVersion(e) {
  return __PRIVATE_hardAssert(!!e, 49232), SnapshotVersion.fromTimestamp(function fromTimestamp(e2) {
    const t = __PRIVATE_normalizeTimestamp(e2);
    return new Timestamp(t.seconds, t.nanos);
  }(e));
}
function __PRIVATE_toResourceName(e, t) {
  return __PRIVATE_toResourcePath(e, t).canonicalString();
}
function __PRIVATE_toResourcePath(e, t) {
  const n = function __PRIVATE_fullyQualifiedPrefixPath(e2) {
    return new ResourcePath(["projects", e2.projectId, "databases", e2.database]);
  }(e).child("documents");
  return void 0 === t ? n : n.child(t);
}
function __PRIVATE_fromResourceName(e) {
  const t = ResourcePath.fromString(e);
  return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(t), 10190, {
    key: t.toString()
  }), t;
}
function __PRIVATE_toName(e, t) {
  return __PRIVATE_toResourceName(e.databaseId, t.path);
}
function fromName(e, t) {
  const n = __PRIVATE_fromResourceName(t);
  if (n.get(1) !== e.databaseId.projectId) throw new FirestoreError(N.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + e.databaseId.projectId);
  if (n.get(3) !== e.databaseId.database) throw new FirestoreError(N.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + e.databaseId.database);
  return new DocumentKey(__PRIVATE_extractLocalPathFromResourceName(n));
}
function __PRIVATE_toQueryPath(e, t) {
  return __PRIVATE_toResourceName(e.databaseId, t);
}
function __PRIVATE_fromQueryPath(e) {
  const t = __PRIVATE_fromResourceName(e);
  return 4 === t.length ? ResourcePath.emptyPath() : __PRIVATE_extractLocalPathFromResourceName(t);
}
function __PRIVATE_getEncodedDatabaseId(e) {
  return new ResourcePath(["projects", e.databaseId.projectId, "databases", e.databaseId.database]).canonicalString();
}
function __PRIVATE_extractLocalPathFromResourceName(e) {
  return __PRIVATE_hardAssert(e.length > 4 && "documents" === e.get(4), 29091, {
    key: e.toString()
  }), e.popFirst(5);
}
function __PRIVATE_toMutationDocument(e, t, n) {
  return {
    name: __PRIVATE_toName(e, t),
    fields: n.value.mapValue.fields
  };
}
function __PRIVATE_fromWatchChange(e, t) {
  let n;
  if ("targetChange" in t) {
    t.targetChange;
    const r2 = function __PRIVATE_fromWatchTargetChangeState(e2) {
      return "NO_CHANGE" === e2 ? 0 : "ADD" === e2 ? 1 : "REMOVE" === e2 ? 2 : "CURRENT" === e2 ? 3 : "RESET" === e2 ? 4 : fail(39313, {
        state: e2
      });
    }(t.targetChange.targetChangeType || "NO_CHANGE"), i = t.targetChange.targetIds || [], s = function __PRIVATE_fromBytes(e2, t2) {
      return e2.useProto3Json ? (__PRIVATE_hardAssert(void 0 === t2 || "string" == typeof t2, 58123), ByteString.fromBase64String(t2 || "")) : (__PRIVATE_hardAssert(void 0 === t2 || // Check if the value is an instance of both Buffer and Uint8Array,
      // despite the fact that Buffer extends Uint8Array. In some
      // environments, such as jsdom, the prototype chain of Buffer
      // does not indicate that it extends Uint8Array.
      t2 instanceof Buffer || t2 instanceof Uint8Array, 16193), ByteString.fromUint8Array(t2 || new Uint8Array()));
    }(e, t.targetChange.resumeToken), o = t.targetChange.cause, _ = o && function __PRIVATE_fromRpcStatus(e2) {
      const t2 = void 0 === e2.code ? N.UNKNOWN : __PRIVATE_mapCodeFromRpcCode(e2.code);
      return new FirestoreError(t2, e2.message || "");
    }(o);
    n = new __PRIVATE_WatchTargetChange(r2, i, s, _ || null);
  } else if ("documentChange" in t) {
    t.documentChange;
    const r2 = t.documentChange;
    r2.document, r2.document.name, r2.document.updateTime;
    const i = fromName(e, r2.document.name), s = __PRIVATE_fromVersion(r2.document.updateTime), o = r2.document.createTime ? __PRIVATE_fromVersion(r2.document.createTime) : SnapshotVersion.min(), _ = new ObjectValue({
      mapValue: {
        fields: r2.document.fields
      }
    }), a2 = MutableDocument.newFoundDocument(i, s, o, _), u = r2.targetIds || [], c2 = r2.removedTargetIds || [];
    n = new __PRIVATE_DocumentWatchChange(u, c2, a2.key, a2);
  } else if ("documentDelete" in t) {
    t.documentDelete;
    const r2 = t.documentDelete;
    r2.document;
    const i = fromName(e, r2.document), s = r2.readTime ? __PRIVATE_fromVersion(r2.readTime) : SnapshotVersion.min(), o = MutableDocument.newNoDocument(i, s), _ = r2.removedTargetIds || [];
    n = new __PRIVATE_DocumentWatchChange([], _, o.key, o);
  } else if ("documentRemove" in t) {
    t.documentRemove;
    const r2 = t.documentRemove;
    r2.document;
    const i = fromName(e, r2.document), s = r2.removedTargetIds || [];
    n = new __PRIVATE_DocumentWatchChange([], s, i, null);
  } else {
    if (!("filter" in t)) return fail(11601, {
      Rt: t
    });
    {
      t.filter;
      const e2 = t.filter;
      e2.targetId;
      const { count: r2 = 0, unchangedNames: i } = e2, s = new ExistenceFilter(r2, i), o = e2.targetId;
      n = new __PRIVATE_ExistenceFilterChange(o, s);
    }
  }
  return n;
}
function toMutation(e, t) {
  let n;
  if (t instanceof __PRIVATE_SetMutation) n = {
    update: __PRIVATE_toMutationDocument(e, t.key, t.value)
  };
  else if (t instanceof __PRIVATE_DeleteMutation) n = {
    delete: __PRIVATE_toName(e, t.key)
  };
  else if (t instanceof __PRIVATE_PatchMutation) n = {
    update: __PRIVATE_toMutationDocument(e, t.key, t.data),
    updateMask: __PRIVATE_toDocumentMask(t.fieldMask)
  };
  else {
    if (!(t instanceof __PRIVATE_VerifyMutation)) return fail(16599, {
      Vt: t.type
    });
    n = {
      verify: __PRIVATE_toName(e, t.key)
    };
  }
  return t.fieldTransforms.length > 0 && (n.updateTransforms = t.fieldTransforms.map((e2) => function __PRIVATE_toFieldTransform(e3, t2) {
    const n2 = t2.transform;
    if (n2 instanceof __PRIVATE_ServerTimestampTransform) return {
      fieldPath: t2.field.canonicalString(),
      setToServerValue: "REQUEST_TIME"
    };
    if (n2 instanceof __PRIVATE_ArrayUnionTransformOperation) return {
      fieldPath: t2.field.canonicalString(),
      appendMissingElements: {
        values: n2.elements
      }
    };
    if (n2 instanceof __PRIVATE_ArrayRemoveTransformOperation) return {
      fieldPath: t2.field.canonicalString(),
      removeAllFromArray: {
        values: n2.elements
      }
    };
    if (n2 instanceof __PRIVATE_NumericIncrementTransformOperation) return {
      fieldPath: t2.field.canonicalString(),
      increment: n2.Ae
    };
    throw fail(20930, {
      transform: t2.transform
    });
  }(0, e2))), t.precondition.isNone || (n.currentDocument = function __PRIVATE_toPrecondition(e2, t2) {
    return void 0 !== t2.updateTime ? {
      updateTime: __PRIVATE_toVersion(e2, t2.updateTime)
    } : void 0 !== t2.exists ? {
      exists: t2.exists
    } : fail(27497);
  }(e, t.precondition)), n;
}
function __PRIVATE_fromWriteResults(e, t) {
  return e && e.length > 0 ? (__PRIVATE_hardAssert(void 0 !== t, 14353), e.map((e2) => function __PRIVATE_fromWriteResult(e3, t2) {
    let n = e3.updateTime ? __PRIVATE_fromVersion(e3.updateTime) : __PRIVATE_fromVersion(t2);
    return n.isEqual(SnapshotVersion.min()) && // The Firestore Emulator currently returns an update time of 0 for
    // deletes of non-existing documents (rather than null). This breaks the
    // test "get deleted doc while offline with source=cache" as NoDocuments
    // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
    // TODO(#2149): Remove this when Emulator is fixed
    (n = __PRIVATE_fromVersion(t2)), new MutationResult(n, e3.transformResults || []);
  }(e2, t))) : [];
}
function __PRIVATE_toDocumentsTarget(e, t) {
  return {
    documents: [__PRIVATE_toQueryPath(e, t.path)]
  };
}
function __PRIVATE_toQueryTarget(e, t) {
  const n = {
    structuredQuery: {}
  }, r2 = t.path;
  let i;
  null !== t.collectionGroup ? (i = r2, n.structuredQuery.from = [{
    collectionId: t.collectionGroup,
    allDescendants: true
  }]) : (i = r2.popLast(), n.structuredQuery.from = [{
    collectionId: r2.lastSegment()
  }]), n.parent = __PRIVATE_toQueryPath(e, i);
  const s = function __PRIVATE_toFilters(e2) {
    if (0 === e2.length) return;
    return __PRIVATE_toFilter(CompositeFilter.create(
      e2,
      "and"
      /* CompositeOperator.AND */
    ));
  }(t.filters);
  s && (n.structuredQuery.where = s);
  const o = function __PRIVATE_toOrder(e2) {
    if (0 === e2.length) return;
    return e2.map((e3) => (
      // visible for testing
      function __PRIVATE_toPropertyOrder(e4) {
        return {
          field: __PRIVATE_toFieldPathReference(e4.field),
          direction: __PRIVATE_toDirection(e4.dir)
        };
      }(e3)
    ));
  }(t.orderBy);
  o && (n.structuredQuery.orderBy = o);
  const _ = __PRIVATE_toInt32Proto(e, t.limit);
  return null !== _ && (n.structuredQuery.limit = _), t.startAt && (n.structuredQuery.startAt = function __PRIVATE_toStartAtCursor(e2) {
    return {
      before: e2.inclusive,
      values: e2.position
    };
  }(t.startAt)), t.endAt && (n.structuredQuery.endAt = function __PRIVATE_toEndAtCursor(e2) {
    return {
      before: !e2.inclusive,
      values: e2.position
    };
  }(t.endAt)), {
    ft: n,
    parent: i
  };
}
function __PRIVATE_convertQueryTargetToQuery(e) {
  let t = __PRIVATE_fromQueryPath(e.parent);
  const n = e.structuredQuery, r2 = n.from ? n.from.length : 0;
  let i = null;
  if (r2 > 0) {
    __PRIVATE_hardAssert(1 === r2, 65062);
    const e2 = n.from[0];
    e2.allDescendants ? i = e2.collectionId : t = t.child(e2.collectionId);
  }
  let s = [];
  n.where && (s = function __PRIVATE_fromFilters(e2) {
    const t2 = __PRIVATE_fromFilter(e2);
    if (t2 instanceof CompositeFilter && __PRIVATE_compositeFilterIsFlatConjunction(t2)) return t2.getFilters();
    return [t2];
  }(n.where));
  let o = [];
  n.orderBy && (o = function __PRIVATE_fromOrder(e2) {
    return e2.map((e3) => function __PRIVATE_fromPropertyOrder(e4) {
      return new OrderBy(
        __PRIVATE_fromFieldPathReference(e4.field),
        // visible for testing
        function __PRIVATE_fromDirection(e5) {
          switch (e5) {
            case "ASCENDING":
              return "asc";
            case "DESCENDING":
              return "desc";
            default:
              return;
          }
        }(e4.direction)
      );
    }(e3));
  }(n.orderBy));
  let _ = null;
  n.limit && (_ = function __PRIVATE_fromInt32Proto(e2) {
    let t2;
    return t2 = "object" == typeof e2 ? e2.value : e2, __PRIVATE_isNullOrUndefined(t2) ? null : t2;
  }(n.limit));
  let a2 = null;
  n.startAt && (a2 = function __PRIVATE_fromStartAtCursor(e2) {
    const t2 = !!e2.before, n2 = e2.values || [];
    return new Bound(n2, t2);
  }(n.startAt));
  let u = null;
  return n.endAt && (u = function __PRIVATE_fromEndAtCursor(e2) {
    const t2 = !e2.before, n2 = e2.values || [];
    return new Bound(n2, t2);
  }(n.endAt)), __PRIVATE_newQuery(t, i, o, s, _, "F", a2, u);
}
function __PRIVATE_toListenRequestLabels(e, t) {
  const n = function __PRIVATE_toLabel(e2) {
    switch (e2) {
      case "TargetPurposeListen":
        return null;
      case "TargetPurposeExistenceFilterMismatch":
        return "existence-filter-mismatch";
      case "TargetPurposeExistenceFilterMismatchBloom":
        return "existence-filter-mismatch-bloom";
      case "TargetPurposeLimboResolution":
        return "limbo-document";
      default:
        return fail(28987, {
          purpose: e2
        });
    }
  }(t.purpose);
  return null == n ? null : {
    "goog-listen-tags": n
  };
}
function __PRIVATE_fromFilter(e) {
  return void 0 !== e.unaryFilter ? function __PRIVATE_fromUnaryFilter(e2) {
    switch (e2.unaryFilter.op) {
      case "IS_NAN":
        const t = __PRIVATE_fromFieldPathReference(e2.unaryFilter.field);
        return FieldFilter.create(t, "==", {
          doubleValue: NaN
        });
      case "IS_NULL":
        const n = __PRIVATE_fromFieldPathReference(e2.unaryFilter.field);
        return FieldFilter.create(n, "==", {
          nullValue: "NULL_VALUE"
        });
      case "IS_NOT_NAN":
        const r2 = __PRIVATE_fromFieldPathReference(e2.unaryFilter.field);
        return FieldFilter.create(r2, "!=", {
          doubleValue: NaN
        });
      case "IS_NOT_NULL":
        const i = __PRIVATE_fromFieldPathReference(e2.unaryFilter.field);
        return FieldFilter.create(i, "!=", {
          nullValue: "NULL_VALUE"
        });
      case "OPERATOR_UNSPECIFIED":
        return fail(61313);
      default:
        return fail(60726);
    }
  }(e) : void 0 !== e.fieldFilter ? function __PRIVATE_fromFieldFilter(e2) {
    return FieldFilter.create(__PRIVATE_fromFieldPathReference(e2.fieldFilter.field), function __PRIVATE_fromOperatorName(e3) {
      switch (e3) {
        case "EQUAL":
          return "==";
        case "NOT_EQUAL":
          return "!=";
        case "GREATER_THAN":
          return ">";
        case "GREATER_THAN_OR_EQUAL":
          return ">=";
        case "LESS_THAN":
          return "<";
        case "LESS_THAN_OR_EQUAL":
          return "<=";
        case "ARRAY_CONTAINS":
          return "array-contains";
        case "IN":
          return "in";
        case "NOT_IN":
          return "not-in";
        case "ARRAY_CONTAINS_ANY":
          return "array-contains-any";
        case "OPERATOR_UNSPECIFIED":
          return fail(58110);
        default:
          return fail(50506);
      }
    }(e2.fieldFilter.op), e2.fieldFilter.value);
  }(e) : void 0 !== e.compositeFilter ? function __PRIVATE_fromCompositeFilter(e2) {
    return CompositeFilter.create(e2.compositeFilter.filters.map((e3) => __PRIVATE_fromFilter(e3)), function __PRIVATE_fromCompositeOperatorName(e3) {
      switch (e3) {
        case "AND":
          return "and";
        case "OR":
          return "or";
        default:
          return fail(1026);
      }
    }(e2.compositeFilter.op));
  }(e) : fail(30097, {
    filter: e
  });
}
function __PRIVATE_toDirection(e) {
  return bt[e];
}
function __PRIVATE_toOperatorName(e) {
  return Dt[e];
}
function __PRIVATE_toCompositeOperatorName(e) {
  return Ct[e];
}
function __PRIVATE_toFieldPathReference(e) {
  return {
    fieldPath: e.canonicalString()
  };
}
function __PRIVATE_fromFieldPathReference(e) {
  return FieldPath$1.fromServerFormat(e.fieldPath);
}
function __PRIVATE_toFilter(e) {
  return e instanceof FieldFilter ? function __PRIVATE_toUnaryOrFieldFilter(e2) {
    if ("==" === e2.op) {
      if (__PRIVATE_isNanValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NAN"
        }
      };
      if (__PRIVATE_isNullValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NULL"
        }
      };
    } else if ("!=" === e2.op) {
      if (__PRIVATE_isNanValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NOT_NAN"
        }
      };
      if (__PRIVATE_isNullValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NOT_NULL"
        }
      };
    }
    return {
      fieldFilter: {
        field: __PRIVATE_toFieldPathReference(e2.field),
        op: __PRIVATE_toOperatorName(e2.op),
        value: e2.value
      }
    };
  }(e) : e instanceof CompositeFilter ? function __PRIVATE_toCompositeFilter(e2) {
    const t = e2.getFilters().map((e3) => __PRIVATE_toFilter(e3));
    if (1 === t.length) return t[0];
    return {
      compositeFilter: {
        op: __PRIVATE_toCompositeOperatorName(e2.op),
        filters: t
      }
    };
  }(e) : fail(54877, {
    filter: e
  });
}
function __PRIVATE_toDocumentMask(e) {
  const t = [];
  return e.fields.forEach((e2) => t.push(e2.canonicalString())), {
    fieldPaths: t
  };
}
function __PRIVATE_isValidResourceName(e) {
  return e.length >= 4 && "projects" === e.get(0) && "databases" === e.get(2);
}
var TargetData = class _TargetData {
  constructor(e, t, n, r2, i = SnapshotVersion.min(), s = SnapshotVersion.min(), o = ByteString.EMPTY_BYTE_STRING, _ = null) {
    this.target = e, this.targetId = t, this.purpose = n, this.sequenceNumber = r2, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = s, this.resumeToken = o, this.expectedCount = _;
  }
  /** Creates a new target data instance with an updated sequence number. */
  withSequenceNumber(e) {
    return new _TargetData(this.target, this.targetId, this.purpose, e, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
  }
  /**
   * Creates a new target data instance with an updated resume token and
   * snapshot version.
   */
  withResumeToken(e, t) {
    return new _TargetData(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      t,
      this.lastLimboFreeSnapshotVersion,
      e,
      /* expectedCount= */
      null
    );
  }
  /**
   * Creates a new target data instance with an updated expected count.
   */
  withExpectedCount(e) {
    return new _TargetData(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, e);
  }
  /**
   * Creates a new target data instance with an updated last limbo free
   * snapshot version number.
   */
  withLastLimboFreeSnapshotVersion(e) {
    return new _TargetData(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, e, this.resumeToken, this.expectedCount);
  }
};
var __PRIVATE_LocalSerializer = class {
  constructor(e) {
    this.yt = e;
  }
};
function __PRIVATE_fromBundledQuery(e) {
  const t = __PRIVATE_convertQueryTargetToQuery({
    parent: e.parent,
    structuredQuery: e.structuredQuery
  });
  return "LAST" === e.limitType ? __PRIVATE_queryWithLimit(
    t,
    t.limit,
    "L"
    /* LimitType.Last */
  ) : t;
}
var __PRIVATE_FirestoreIndexValueWriter = class {
  constructor() {
  }
  // The write methods below short-circuit writing terminators for values
  // containing a (terminating) truncated value.
  // As an example, consider the resulting encoding for:
  // ["bar", [2, "foo"]] -> (STRING, "bar", TERM, ARRAY, NUMBER, 2, STRING, "foo", TERM, TERM, TERM)
  // ["bar", [2, truncated("foo")]] -> (STRING, "bar", TERM, ARRAY, NUMBER, 2, STRING, "foo", TRUNC)
  // ["bar", truncated(["foo"])] -> (STRING, "bar", TERM, ARRAY. STRING, "foo", TERM, TRUNC)
  /** Writes an index value.  */
  Dt(e, t) {
    this.Ct(e, t), // Write separator to split index values
    // (see go/firestore-storage-format#encodings).
    t.vt();
  }
  Ct(e, t) {
    if ("nullValue" in e) this.Ft(t, 5);
    else if ("booleanValue" in e) this.Ft(t, 10), t.Mt(e.booleanValue ? 1 : 0);
    else if ("integerValue" in e) this.Ft(t, 15), t.Mt(__PRIVATE_normalizeNumber(e.integerValue));
    else if ("doubleValue" in e) {
      const n = __PRIVATE_normalizeNumber(e.doubleValue);
      isNaN(n) ? this.Ft(t, 13) : (this.Ft(t, 15), __PRIVATE_isNegativeZero(n) ? (
        // -0.0, 0 and 0.0 are all considered the same
        t.Mt(0)
      ) : t.Mt(n));
    } else if ("timestampValue" in e) {
      let n = e.timestampValue;
      this.Ft(t, 20), "string" == typeof n && (n = __PRIVATE_normalizeTimestamp(n)), t.xt(`${n.seconds || ""}`), t.Mt(n.nanos || 0);
    } else if ("stringValue" in e) this.Ot(e.stringValue, t), this.Nt(t);
    else if ("bytesValue" in e) this.Ft(t, 30), t.Bt(__PRIVATE_normalizeByteString(e.bytesValue)), this.Nt(t);
    else if ("referenceValue" in e) this.Lt(e.referenceValue, t);
    else if ("geoPointValue" in e) {
      const n = e.geoPointValue;
      this.Ft(t, 45), t.Mt(n.latitude || 0), t.Mt(n.longitude || 0);
    } else "mapValue" in e ? __PRIVATE_isMaxValue(e) ? this.Ft(t, Number.MAX_SAFE_INTEGER) : __PRIVATE_isVectorValue(e) ? this.kt(e.mapValue, t) : (this.qt(e.mapValue, t), this.Nt(t)) : "arrayValue" in e ? (this.Qt(e.arrayValue, t), this.Nt(t)) : fail(19022, {
      $t: e
    });
  }
  Ot(e, t) {
    this.Ft(t, 25), this.Ut(e, t);
  }
  Ut(e, t) {
    t.xt(e);
  }
  qt(e, t) {
    const n = e.fields || {};
    this.Ft(t, 55);
    for (const e2 of Object.keys(n)) this.Ot(e2, t), this.Ct(n[e2], t);
  }
  kt(e, t) {
    const n = e.fields || {};
    this.Ft(t, 53);
    const r2 = Et, i = n[r2].arrayValue?.values?.length || 0;
    this.Ft(t, 15), t.Mt(__PRIVATE_normalizeNumber(i)), // Vectors then sort by position value
    this.Ot(r2, t), this.Ct(n[r2], t);
  }
  Qt(e, t) {
    const n = e.values || [];
    this.Ft(t, 50);
    for (const e2 of n) this.Ct(e2, t);
  }
  Lt(e, t) {
    this.Ft(t, 37);
    DocumentKey.fromName(e).path.forEach((e2) => {
      this.Ft(t, 60), this.Ut(e2, t);
    });
  }
  Ft(e, t) {
    e.Mt(t);
  }
  Nt(e) {
    e.Mt(2);
  }
};
__PRIVATE_FirestoreIndexValueWriter.Kt = new __PRIVATE_FirestoreIndexValueWriter();
var __PRIVATE_MemoryIndexManager = class {
  constructor() {
    this.Cn = new __PRIVATE_MemoryCollectionParentIndex();
  }
  addToCollectionParentIndex(e, t) {
    return this.Cn.add(t), PersistencePromise.resolve();
  }
  getCollectionParents(e, t) {
    return PersistencePromise.resolve(this.Cn.getEntries(t));
  }
  addFieldIndex(e, t) {
    return PersistencePromise.resolve();
  }
  deleteFieldIndex(e, t) {
    return PersistencePromise.resolve();
  }
  deleteAllFieldIndexes(e) {
    return PersistencePromise.resolve();
  }
  createTargetIndexes(e, t) {
    return PersistencePromise.resolve();
  }
  getDocumentsMatchingTarget(e, t) {
    return PersistencePromise.resolve(null);
  }
  getIndexType(e, t) {
    return PersistencePromise.resolve(
      0
      /* IndexType.NONE */
    );
  }
  getFieldIndexes(e, t) {
    return PersistencePromise.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return PersistencePromise.resolve(null);
  }
  getMinOffset(e, t) {
    return PersistencePromise.resolve(IndexOffset.min());
  }
  getMinOffsetFromCollectionGroup(e, t) {
    return PersistencePromise.resolve(IndexOffset.min());
  }
  updateCollectionGroup(e, t, n) {
    return PersistencePromise.resolve();
  }
  updateIndexEntries(e, t) {
    return PersistencePromise.resolve();
  }
};
var __PRIVATE_MemoryCollectionParentIndex = class {
  constructor() {
    this.index = {};
  }
  // Returns false if the entry already existed.
  add(e) {
    const t = e.lastSegment(), n = e.popLast(), r2 = this.index[t] || new SortedSet(ResourcePath.comparator), i = !r2.has(n);
    return this.index[t] = r2.add(n), i;
  }
  has(e) {
    const t = e.lastSegment(), n = e.popLast(), r2 = this.index[t];
    return r2 && r2.has(n);
  }
  getEntries(e) {
    return (this.index[e] || new SortedSet(ResourcePath.comparator)).toArray();
  }
};
var Mt = new Uint8Array(0);
var xt = {
  didRun: false,
  sequenceNumbersCollected: 0,
  targetsRemoved: 0,
  documentsRemoved: 0
};
var Ot = 41943040;
var LruParams = class _LruParams {
  static withCacheSize(e) {
    return new _LruParams(e, _LruParams.DEFAULT_COLLECTION_PERCENTILE, _LruParams.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
  }
  constructor(e, t, n) {
    this.cacheSizeCollectionThreshold = e, this.percentileToCollect = t, this.maximumSequenceNumbersToCollect = n;
  }
};
LruParams.DEFAULT_COLLECTION_PERCENTILE = 10, LruParams.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, LruParams.DEFAULT = new LruParams(Ot, LruParams.DEFAULT_COLLECTION_PERCENTILE, LruParams.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), LruParams.DISABLED = new LruParams(-1, 0, 0);
var __PRIVATE_TargetIdGenerator = class ___PRIVATE_TargetIdGenerator {
  constructor(e) {
    this.ar = e;
  }
  next() {
    return this.ar += 2, this.ar;
  }
  static ur() {
    return new ___PRIVATE_TargetIdGenerator(0);
  }
  static cr() {
    return new ___PRIVATE_TargetIdGenerator(-1);
  }
};
var Nt = "LruGarbageCollector";
var Bt = 1048576;
function __PRIVATE_bufferEntryComparator([e, t], [n, r2]) {
  const i = __PRIVATE_primitiveComparator(e, n);
  return 0 === i ? __PRIVATE_primitiveComparator(t, r2) : i;
}
var __PRIVATE_RollingSequenceNumberBuffer = class {
  constructor(e) {
    this.Ir = e, this.buffer = new SortedSet(__PRIVATE_bufferEntryComparator), this.Er = 0;
  }
  dr() {
    return ++this.Er;
  }
  Ar(e) {
    const t = [e, this.dr()];
    if (this.buffer.size < this.Ir) this.buffer = this.buffer.add(t);
    else {
      const e2 = this.buffer.last();
      __PRIVATE_bufferEntryComparator(t, e2) < 0 && (this.buffer = this.buffer.delete(e2).add(t));
    }
  }
  get maxValue() {
    return this.buffer.last()[0];
  }
};
var __PRIVATE_LruScheduler = class {
  constructor(e, t, n) {
    this.garbageCollector = e, this.asyncQueue = t, this.localStore = n, this.Rr = null;
  }
  start() {
    -1 !== this.garbageCollector.params.cacheSizeCollectionThreshold && this.Vr(6e4);
  }
  stop() {
    this.Rr && (this.Rr.cancel(), this.Rr = null);
  }
  get started() {
    return null !== this.Rr;
  }
  Vr(e) {
    __PRIVATE_logDebug(Nt, `Garbage collection scheduled in ${e}ms`), this.Rr = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection", e, async () => {
      this.Rr = null;
      try {
        await this.localStore.collectGarbage(this.garbageCollector);
      } catch (e2) {
        __PRIVATE_isIndexedDbTransactionError(e2) ? __PRIVATE_logDebug(Nt, "Ignoring IndexedDB error during garbage collection: ", e2) : await __PRIVATE_ignoreIfPrimaryLeaseLoss(e2);
      }
      await this.Vr(3e5);
    });
  }
};
var __PRIVATE_LruGarbageCollectorImpl = class {
  constructor(e, t) {
    this.mr = e, this.params = t;
  }
  calculateTargetCount(e, t) {
    return this.mr.gr(e).next((e2) => Math.floor(t / 100 * e2));
  }
  nthSequenceNumber(e, t) {
    if (0 === t) return PersistencePromise.resolve(__PRIVATE_ListenSequence.ce);
    const n = new __PRIVATE_RollingSequenceNumberBuffer(t);
    return this.mr.forEachTarget(e, (e2) => n.Ar(e2.sequenceNumber)).next(() => this.mr.pr(e, (e2) => n.Ar(e2))).next(() => n.maxValue);
  }
  removeTargets(e, t, n) {
    return this.mr.removeTargets(e, t, n);
  }
  removeOrphanedDocuments(e, t) {
    return this.mr.removeOrphanedDocuments(e, t);
  }
  collect(e, t) {
    return -1 === this.params.cacheSizeCollectionThreshold ? (__PRIVATE_logDebug("LruGarbageCollector", "Garbage collection skipped; disabled"), PersistencePromise.resolve(xt)) : this.getCacheSize(e).next((n) => n < this.params.cacheSizeCollectionThreshold ? (__PRIVATE_logDebug("LruGarbageCollector", `Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`), xt) : this.yr(e, t));
  }
  getCacheSize(e) {
    return this.mr.getCacheSize(e);
  }
  yr(e, t) {
    let n, r2, i, s, o, _, u;
    const c2 = Date.now();
    return this.calculateTargetCount(e, this.params.percentileToCollect).next((t2) => (
      // Cap at the configured max
      (t2 > this.params.maximumSequenceNumbersToCollect ? (__PRIVATE_logDebug("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t2}`), r2 = this.params.maximumSequenceNumbersToCollect) : r2 = t2, s = Date.now(), this.nthSequenceNumber(e, r2))
    )).next((r3) => (n = r3, o = Date.now(), this.removeTargets(e, n, t))).next((t2) => (i = t2, _ = Date.now(), this.removeOrphanedDocuments(e, n))).next((e2) => {
      if (u = Date.now(), __PRIVATE_getLogLevel() <= LogLevel.DEBUG) {
        __PRIVATE_logDebug("LruGarbageCollector", `LRU Garbage Collection
	Counted targets in ${s - c2}ms
	Determined least recently used ${r2} in ` + (o - s) + `ms
	Removed ${i} targets in ` + (_ - o) + `ms
	Removed ${e2} documents in ` + (u - _) + `ms
Total Duration: ${u - c2}ms`);
      }
      return PersistencePromise.resolve({
        didRun: true,
        sequenceNumbersCollected: r2,
        targetsRemoved: i,
        documentsRemoved: e2
      });
    });
  }
};
function __PRIVATE_newLruGarbageCollector(e, t) {
  return new __PRIVATE_LruGarbageCollectorImpl(e, t);
}
var RemoteDocumentChangeBuffer = class {
  constructor() {
    this.changes = new ObjectMap((e) => e.toString(), (e, t) => e.isEqual(t)), this.changesApplied = false;
  }
  /**
   * Buffers a `RemoteDocumentCache.addEntry()` call.
   *
   * You can only modify documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  addEntry(e) {
    this.assertNotApplied(), this.changes.set(e.key, e);
  }
  /**
   * Buffers a `RemoteDocumentCache.removeEntry()` call.
   *
   * You can only remove documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  removeEntry(e, t) {
    this.assertNotApplied(), this.changes.set(e, MutableDocument.newInvalidDocument(e).setReadTime(t));
  }
  /**
   * Looks up an entry in the cache. The buffered changes will first be checked,
   * and if no buffered change applies, this will forward to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKey - The key of the entry to look up.
   * @returns The cached document or an invalid document if we have nothing
   * cached.
   */
  getEntry(e, t) {
    this.assertNotApplied();
    const n = this.changes.get(t);
    return void 0 !== n ? PersistencePromise.resolve(n) : this.getFromCache(e, t);
  }
  /**
   * Looks up several entries in the cache, forwarding to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKeys - The keys of the entries to look up.
   * @returns A map of cached documents, indexed by key. If an entry cannot be
   *     found, the corresponding key will be mapped to an invalid document.
   */
  getEntries(e, t) {
    return this.getAllFromCache(e, t);
  }
  /**
   * Applies buffered changes to the underlying RemoteDocumentCache, using
   * the provided transaction.
   */
  apply(e) {
    return this.assertNotApplied(), this.changesApplied = true, this.applyChanges(e);
  }
  /** Helper to assert this.changes is not null  */
  assertNotApplied() {
  }
};
var OverlayedDocument = class {
  constructor(e, t) {
    this.overlayedDocument = e, this.mutatedFields = t;
  }
};
var LocalDocumentsView = class {
  constructor(e, t, n, r2) {
    this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = n, this.indexManager = r2;
  }
  /**
   * Get the local view of the document identified by `key`.
   *
   * @returns Local view of the document or null if we don't have any cached
   * state for it.
   */
  getDocument(e, t) {
    let n = null;
    return this.documentOverlayCache.getOverlay(e, t).next((r2) => (n = r2, this.remoteDocumentCache.getEntry(e, t))).next((e2) => (null !== n && __PRIVATE_mutationApplyToLocalView(n.mutation, e2, FieldMask.empty(), Timestamp.now()), e2));
  }
  /**
   * Gets the local view of the documents identified by `keys`.
   *
   * If we don't have cached state for a document in `keys`, a NoDocument will
   * be stored for that key in the resulting set.
   */
  getDocuments(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next((t2) => this.getLocalViewOfDocuments(e, t2, __PRIVATE_documentKeySet()).next(() => t2));
  }
  /**
   * Similar to `getDocuments`, but creates the local view from the given
   * `baseDocs` without retrieving documents from the local store.
   *
   * @param transaction - The transaction this operation is scoped to.
   * @param docs - The documents to apply local mutations to get the local views.
   * @param existenceStateChanged - The set of document keys whose existence state
   *   is changed. This is useful to determine if some documents overlay needs
   *   to be recalculated.
   */
  getLocalViewOfDocuments(e, t, n = __PRIVATE_documentKeySet()) {
    const r2 = __PRIVATE_newOverlayMap();
    return this.populateOverlays(e, r2, t).next(() => this.computeViews(e, t, r2, n).next((e2) => {
      let t2 = documentMap();
      return e2.forEach((e3, n2) => {
        t2 = t2.insert(e3, n2.overlayedDocument);
      }), t2;
    }));
  }
  /**
   * Gets the overlayed documents for the given document map, which will include
   * the local view of those documents and a `FieldMask` indicating which fields
   * are mutated locally, `null` if overlay is a Set or Delete mutation.
   */
  getOverlayedDocuments(e, t) {
    const n = __PRIVATE_newOverlayMap();
    return this.populateOverlays(e, n, t).next(() => this.computeViews(e, t, n, __PRIVATE_documentKeySet()));
  }
  /**
   * Fetches the overlays for {@code docs} and adds them to provided overlay map
   * if the map does not already contain an entry for the given document key.
   */
  populateOverlays(e, t, n) {
    const r2 = [];
    return n.forEach((e2) => {
      t.has(e2) || r2.push(e2);
    }), this.documentOverlayCache.getOverlays(e, r2).next((e2) => {
      e2.forEach((e3, n2) => {
        t.set(e3, n2);
      });
    });
  }
  /**
   * Computes the local view for the given documents.
   *
   * @param docs - The documents to compute views for. It also has the base
   *   version of the documents.
   * @param overlays - The overlays that need to be applied to the given base
   *   version of the documents.
   * @param existenceStateChanged - A set of documents whose existence states
   *   might have changed. This is used to determine if we need to re-calculate
   *   overlays from mutation queues.
   * @return A map represents the local documents view.
   */
  computeViews(e, t, n, r2) {
    let i = __PRIVATE_mutableDocumentMap();
    const s = __PRIVATE_newDocumentKeyMap(), o = function __PRIVATE_newOverlayedDocumentMap() {
      return __PRIVATE_newDocumentKeyMap();
    }();
    return t.forEach((e2, t2) => {
      const o2 = n.get(t2.key);
      r2.has(t2.key) && (void 0 === o2 || o2.mutation instanceof __PRIVATE_PatchMutation) ? i = i.insert(t2.key, t2) : void 0 !== o2 ? (s.set(t2.key, o2.mutation.getFieldMask()), __PRIVATE_mutationApplyToLocalView(o2.mutation, t2, o2.mutation.getFieldMask(), Timestamp.now())) : (
        // no overlay exists
        // Using EMPTY to indicate there is no overlay for the document.
        s.set(t2.key, FieldMask.empty())
      );
    }), this.recalculateAndSaveOverlays(e, i).next((e2) => (e2.forEach((e3, t2) => s.set(e3, t2)), t.forEach((e3, t2) => o.set(e3, new OverlayedDocument(t2, s.get(e3) ?? null))), o));
  }
  recalculateAndSaveOverlays(e, t) {
    const n = __PRIVATE_newDocumentKeyMap();
    let r2 = new SortedMap((e2, t2) => e2 - t2), i = __PRIVATE_documentKeySet();
    return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next((e2) => {
      for (const i2 of e2) i2.keys().forEach((e3) => {
        const s = t.get(e3);
        if (null === s) return;
        let o = n.get(e3) || FieldMask.empty();
        o = i2.applyToLocalView(s, o), n.set(e3, o);
        const _ = (r2.get(i2.batchId) || __PRIVATE_documentKeySet()).add(e3);
        r2 = r2.insert(i2.batchId, _);
      });
    }).next(() => {
      const s = [], o = r2.getReverseIterator();
      for (; o.hasNext(); ) {
        const r3 = o.getNext(), _ = r3.key, a2 = r3.value, u = __PRIVATE_newMutationMap();
        a2.forEach((e2) => {
          if (!i.has(e2)) {
            const r4 = __PRIVATE_calculateOverlayMutation(t.get(e2), n.get(e2));
            null !== r4 && u.set(e2, r4), i = i.add(e2);
          }
        }), s.push(this.documentOverlayCache.saveOverlays(e, _, u));
      }
      return PersistencePromise.waitFor(s);
    }).next(() => n);
  }
  /**
   * Recalculates overlays by reading the documents from remote document cache
   * first, and saves them after they are calculated.
   */
  recalculateAndSaveOverlaysForDocumentKeys(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next((t2) => this.recalculateAndSaveOverlays(e, t2));
  }
  /**
   * Performs a query against the local view of all documents.
   *
   * @param transaction - The persistence transaction.
   * @param query - The query to match documents against.
   * @param offset - Read time and key to start scanning by (exclusive).
   * @param context - A optional tracker to keep a record of important details
   *   during database local query execution.
   */
  getDocumentsMatchingQuery(e, t, n, r2) {
    return function __PRIVATE_isDocumentQuery$1(e2) {
      return DocumentKey.isDocumentKey(e2.path) && null === e2.collectionGroup && 0 === e2.filters.length;
    }(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : __PRIVATE_isCollectionGroupQuery(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, n, r2) : this.getDocumentsMatchingCollectionQuery(e, t, n, r2);
  }
  /**
   * Given a collection group, returns the next documents that follow the provided offset, along
   * with an updated batch ID.
   *
   * <p>The documents returned by this method are ordered by remote version from the provided
   * offset. If there are no more remote documents after the provided offset, documents with
   * mutations in order of batch id from the offset are returned. Since all documents in a batch are
   * returned together, the total number of documents returned can exceed {@code count}.
   *
   * @param transaction
   * @param collectionGroup The collection group for the documents.
   * @param offset The offset to index into.
   * @param count The number of documents to return
   * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
   */
  getNextDocuments(e, t, n, r2) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, n, r2).next((i) => {
      const s = r2 - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, n.largestBatchId, r2 - i.size) : PersistencePromise.resolve(__PRIVATE_newOverlayMap());
      let o = U, _ = i;
      return s.next((t2) => PersistencePromise.forEach(t2, (t3, n2) => (o < n2.largestBatchId && (o = n2.largestBatchId), i.get(t3) ? PersistencePromise.resolve() : this.remoteDocumentCache.getEntry(e, t3).next((e2) => {
        _ = _.insert(t3, e2);
      }))).next(() => this.populateOverlays(e, t2, i)).next(() => this.computeViews(e, _, t2, __PRIVATE_documentKeySet())).next((e2) => ({
        batchId: o,
        changes: __PRIVATE_convertOverlayedDocumentMapToDocumentMap(e2)
      })));
    });
  }
  getDocumentsMatchingDocumentQuery(e, t) {
    return this.getDocument(e, new DocumentKey(t)).next((e2) => {
      let t2 = documentMap();
      return e2.isFoundDocument() && (t2 = t2.insert(e2.key, e2)), t2;
    });
  }
  getDocumentsMatchingCollectionGroupQuery(e, t, n, r2) {
    const i = t.collectionGroup;
    let s = documentMap();
    return this.indexManager.getCollectionParents(e, i).next((o) => PersistencePromise.forEach(o, (o2) => {
      const _ = function __PRIVATE_asCollectionQueryAtPath(e2, t2) {
        return new __PRIVATE_QueryImpl(
          t2,
          /*collectionGroup=*/
          null,
          e2.explicitOrderBy.slice(),
          e2.filters.slice(),
          e2.limit,
          e2.limitType,
          e2.startAt,
          e2.endAt
        );
      }(t, o2.child(i));
      return this.getDocumentsMatchingCollectionQuery(e, _, n, r2).next((e2) => {
        e2.forEach((e3, t2) => {
          s = s.insert(e3, t2);
        });
      });
    }).next(() => s));
  }
  getDocumentsMatchingCollectionQuery(e, t, n, r2) {
    let i;
    return this.documentOverlayCache.getOverlaysForCollection(e, t.path, n.largestBatchId).next((s) => (i = s, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r2))).next((e2) => {
      i.forEach((t2, n3) => {
        const r3 = n3.getKey();
        null === e2.get(r3) && (e2 = e2.insert(r3, MutableDocument.newInvalidDocument(r3)));
      });
      let n2 = documentMap();
      return e2.forEach((e3, r3) => {
        const s = i.get(e3);
        void 0 !== s && __PRIVATE_mutationApplyToLocalView(s.mutation, r3, FieldMask.empty(), Timestamp.now()), // Finally, insert the documents that still match the query
        __PRIVATE_queryMatches(t, r3) && (n2 = n2.insert(e3, r3));
      }), n2;
    });
  }
};
var __PRIVATE_MemoryBundleCache = class {
  constructor(e) {
    this.serializer = e, this.Lr = /* @__PURE__ */ new Map(), this.kr = /* @__PURE__ */ new Map();
  }
  getBundleMetadata(e, t) {
    return PersistencePromise.resolve(this.Lr.get(t));
  }
  saveBundleMetadata(e, t) {
    return this.Lr.set(
      t.id,
      /** Decodes a BundleMetadata proto into a BundleMetadata object. */
      function __PRIVATE_fromBundleMetadata(e2) {
        return {
          id: e2.id,
          version: e2.version,
          createTime: __PRIVATE_fromVersion(e2.createTime)
        };
      }(t)
    ), PersistencePromise.resolve();
  }
  getNamedQuery(e, t) {
    return PersistencePromise.resolve(this.kr.get(t));
  }
  saveNamedQuery(e, t) {
    return this.kr.set(t.name, function __PRIVATE_fromProtoNamedQuery(e2) {
      return {
        name: e2.name,
        query: __PRIVATE_fromBundledQuery(e2.bundledQuery),
        readTime: __PRIVATE_fromVersion(e2.readTime)
      };
    }(t)), PersistencePromise.resolve();
  }
};
var __PRIVATE_MemoryDocumentOverlayCache = class {
  constructor() {
    this.overlays = new SortedMap(DocumentKey.comparator), this.qr = /* @__PURE__ */ new Map();
  }
  getOverlay(e, t) {
    return PersistencePromise.resolve(this.overlays.get(t));
  }
  getOverlays(e, t) {
    const n = __PRIVATE_newOverlayMap();
    return PersistencePromise.forEach(t, (t2) => this.getOverlay(e, t2).next((e2) => {
      null !== e2 && n.set(t2, e2);
    })).next(() => n);
  }
  saveOverlays(e, t, n) {
    return n.forEach((n2, r2) => {
      this.St(e, t, r2);
    }), PersistencePromise.resolve();
  }
  removeOverlaysForBatchId(e, t, n) {
    const r2 = this.qr.get(n);
    return void 0 !== r2 && (r2.forEach((e2) => this.overlays = this.overlays.remove(e2)), this.qr.delete(n)), PersistencePromise.resolve();
  }
  getOverlaysForCollection(e, t, n) {
    const r2 = __PRIVATE_newOverlayMap(), i = t.length + 1, s = new DocumentKey(t.child("")), o = this.overlays.getIteratorFrom(s);
    for (; o.hasNext(); ) {
      const e2 = o.getNext().value, s2 = e2.getKey();
      if (!t.isPrefixOf(s2.path)) break;
      s2.path.length === i && (e2.largestBatchId > n && r2.set(e2.getKey(), e2));
    }
    return PersistencePromise.resolve(r2);
  }
  getOverlaysForCollectionGroup(e, t, n, r2) {
    let i = new SortedMap((e2, t2) => e2 - t2);
    const s = this.overlays.getIterator();
    for (; s.hasNext(); ) {
      const e2 = s.getNext().value;
      if (e2.getKey().getCollectionGroup() === t && e2.largestBatchId > n) {
        let t2 = i.get(e2.largestBatchId);
        null === t2 && (t2 = __PRIVATE_newOverlayMap(), i = i.insert(e2.largestBatchId, t2)), t2.set(e2.getKey(), e2);
      }
    }
    const o = __PRIVATE_newOverlayMap(), _ = i.getIterator();
    for (; _.hasNext(); ) {
      if (_.getNext().value.forEach((e2, t2) => o.set(e2, t2)), o.size() >= r2) break;
    }
    return PersistencePromise.resolve(o);
  }
  St(e, t, n) {
    const r2 = this.overlays.get(n.key);
    if (null !== r2) {
      const e2 = this.qr.get(r2.largestBatchId).delete(n.key);
      this.qr.set(r2.largestBatchId, e2);
    }
    this.overlays = this.overlays.insert(n.key, new Overlay(t, n));
    let i = this.qr.get(t);
    void 0 === i && (i = __PRIVATE_documentKeySet(), this.qr.set(t, i)), this.qr.set(t, i.add(n.key));
  }
};
var __PRIVATE_MemoryGlobalsCache = class {
  constructor() {
    this.sessionToken = ByteString.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return PersistencePromise.resolve(this.sessionToken);
  }
  setSessionToken(e, t) {
    return this.sessionToken = t, PersistencePromise.resolve();
  }
};
var __PRIVATE_ReferenceSet = class {
  constructor() {
    this.Qr = new SortedSet(__PRIVATE_DocReference.$r), // A set of outstanding references to a document sorted by target id.
    this.Ur = new SortedSet(__PRIVATE_DocReference.Kr);
  }
  /** Returns true if the reference set contains no references. */
  isEmpty() {
    return this.Qr.isEmpty();
  }
  /** Adds a reference to the given document key for the given ID. */
  addReference(e, t) {
    const n = new __PRIVATE_DocReference(e, t);
    this.Qr = this.Qr.add(n), this.Ur = this.Ur.add(n);
  }
  /** Add references to the given document keys for the given ID. */
  Wr(e, t) {
    e.forEach((e2) => this.addReference(e2, t));
  }
  /**
   * Removes a reference to the given document key for the given
   * ID.
   */
  removeReference(e, t) {
    this.Gr(new __PRIVATE_DocReference(e, t));
  }
  zr(e, t) {
    e.forEach((e2) => this.removeReference(e2, t));
  }
  /**
   * Clears all references with a given ID. Calls removeRef() for each key
   * removed.
   */
  jr(e) {
    const t = new DocumentKey(new ResourcePath([])), n = new __PRIVATE_DocReference(t, e), r2 = new __PRIVATE_DocReference(t, e + 1), i = [];
    return this.Ur.forEachInRange([n, r2], (e2) => {
      this.Gr(e2), i.push(e2.key);
    }), i;
  }
  Jr() {
    this.Qr.forEach((e) => this.Gr(e));
  }
  Gr(e) {
    this.Qr = this.Qr.delete(e), this.Ur = this.Ur.delete(e);
  }
  Hr(e) {
    const t = new DocumentKey(new ResourcePath([])), n = new __PRIVATE_DocReference(t, e), r2 = new __PRIVATE_DocReference(t, e + 1);
    let i = __PRIVATE_documentKeySet();
    return this.Ur.forEachInRange([n, r2], (e2) => {
      i = i.add(e2.key);
    }), i;
  }
  containsKey(e) {
    const t = new __PRIVATE_DocReference(e, 0), n = this.Qr.firstAfterOrEqual(t);
    return null !== n && e.isEqual(n.key);
  }
};
var __PRIVATE_DocReference = class {
  constructor(e, t) {
    this.key = e, this.Yr = t;
  }
  /** Compare by key then by ID */
  static $r(e, t) {
    return DocumentKey.comparator(e.key, t.key) || __PRIVATE_primitiveComparator(e.Yr, t.Yr);
  }
  /** Compare by ID then by key */
  static Kr(e, t) {
    return __PRIVATE_primitiveComparator(e.Yr, t.Yr) || DocumentKey.comparator(e.key, t.key);
  }
};
var __PRIVATE_MemoryMutationQueue = class {
  constructor(e, t) {
    this.indexManager = e, this.referenceDelegate = t, /**
     * The set of all mutations that have been sent but not yet been applied to
     * the backend.
     */
    this.mutationQueue = [], /** Next value to use when assigning sequential IDs to each mutation batch. */
    this.tr = 1, /** An ordered mapping between documents and the mutations batch IDs. */
    this.Zr = new SortedSet(__PRIVATE_DocReference.$r);
  }
  checkEmpty(e) {
    return PersistencePromise.resolve(0 === this.mutationQueue.length);
  }
  addMutationBatch(e, t, n, r2) {
    const i = this.tr;
    this.tr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
    const s = new MutationBatch(i, t, n, r2);
    this.mutationQueue.push(s);
    for (const t2 of r2) this.Zr = this.Zr.add(new __PRIVATE_DocReference(t2.key, i)), this.indexManager.addToCollectionParentIndex(e, t2.key.path.popLast());
    return PersistencePromise.resolve(s);
  }
  lookupMutationBatch(e, t) {
    return PersistencePromise.resolve(this.Xr(t));
  }
  getNextMutationBatchAfterBatchId(e, t) {
    const n = t + 1, r2 = this.ei(n), i = r2 < 0 ? 0 : r2;
    return PersistencePromise.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return PersistencePromise.resolve(0 === this.mutationQueue.length ? j : this.tr - 1);
  }
  getAllMutationBatches(e) {
    return PersistencePromise.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, t) {
    const n = new __PRIVATE_DocReference(t, 0), r2 = new __PRIVATE_DocReference(t, Number.POSITIVE_INFINITY), i = [];
    return this.Zr.forEachInRange([n, r2], (e2) => {
      const t2 = this.Xr(e2.Yr);
      i.push(t2);
    }), PersistencePromise.resolve(i);
  }
  getAllMutationBatchesAffectingDocumentKeys(e, t) {
    let n = new SortedSet(__PRIVATE_primitiveComparator);
    return t.forEach((e2) => {
      const t2 = new __PRIVATE_DocReference(e2, 0), r2 = new __PRIVATE_DocReference(e2, Number.POSITIVE_INFINITY);
      this.Zr.forEachInRange([t2, r2], (e3) => {
        n = n.add(e3.Yr);
      });
    }), PersistencePromise.resolve(this.ti(n));
  }
  getAllMutationBatchesAffectingQuery(e, t) {
    const n = t.path, r2 = n.length + 1;
    let i = n;
    DocumentKey.isDocumentKey(i) || (i = i.child(""));
    const s = new __PRIVATE_DocReference(new DocumentKey(i), 0);
    let o = new SortedSet(__PRIVATE_primitiveComparator);
    return this.Zr.forEachWhile((e2) => {
      const t2 = e2.key.path;
      return !!n.isPrefixOf(t2) && // Rows with document keys more than one segment longer than the query
      // path can't be matches. For example, a query on 'rooms' can't match
      // the document /rooms/abc/messages/xyx.
      // TODO(mcg): we'll need a different scanner when we implement
      // ancestor queries.
      (t2.length === r2 && (o = o.add(e2.Yr)), true);
    }, s), PersistencePromise.resolve(this.ti(o));
  }
  ti(e) {
    const t = [];
    return e.forEach((e2) => {
      const n = this.Xr(e2);
      null !== n && t.push(n);
    }), t;
  }
  removeMutationBatch(e, t) {
    __PRIVATE_hardAssert(0 === this.ni(t.batchId, "removed"), 55003), this.mutationQueue.shift();
    let n = this.Zr;
    return PersistencePromise.forEach(t.mutations, (r2) => {
      const i = new __PRIVATE_DocReference(r2.key, t.batchId);
      return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, r2.key);
    }).next(() => {
      this.Zr = n;
    });
  }
  ir(e) {
  }
  containsKey(e, t) {
    const n = new __PRIVATE_DocReference(t, 0), r2 = this.Zr.firstAfterOrEqual(n);
    return PersistencePromise.resolve(t.isEqual(r2 && r2.key));
  }
  performConsistencyCheck(e) {
    return this.mutationQueue.length, PersistencePromise.resolve();
  }
  /**
   * Finds the index of the given batchId in the mutation queue and asserts that
   * the resulting index is within the bounds of the queue.
   *
   * @param batchId - The batchId to search for
   * @param action - A description of what the caller is doing, phrased in passive
   * form (e.g. "acknowledged" in a routine that acknowledges batches).
   */
  ni(e, t) {
    return this.ei(e);
  }
  /**
   * Finds the index of the given batchId in the mutation queue. This operation
   * is O(1).
   *
   * @returns The computed index of the batch with the given batchId, based on
   * the state of the queue. Note this index can be negative if the requested
   * batchId has already been removed from the queue or past the end of the
   * queue if the batchId is larger than the last added batch.
   */
  ei(e) {
    if (0 === this.mutationQueue.length)
      return 0;
    return e - this.mutationQueue[0].batchId;
  }
  /**
   * A version of lookupMutationBatch that doesn't return a promise, this makes
   * other functions that uses this code easier to read and more efficient.
   */
  Xr(e) {
    const t = this.ei(e);
    if (t < 0 || t >= this.mutationQueue.length) return null;
    return this.mutationQueue[t];
  }
};
var __PRIVATE_MemoryRemoteDocumentCacheImpl = class {
  /**
   * @param sizer - Used to assess the size of a document. For eager GC, this is
   * expected to just return 0 to avoid unnecessarily doing the work of
   * calculating the size.
   */
  constructor(e) {
    this.ri = e, /** Underlying cache of documents and their read times. */
    this.docs = function __PRIVATE_documentEntryMap() {
      return new SortedMap(DocumentKey.comparator);
    }(), /** Size of all cached documents. */
    this.size = 0;
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  /**
   * Adds the supplied entry to the cache and updates the cache size as appropriate.
   *
   * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  addEntry(e, t) {
    const n = t.key, r2 = this.docs.get(n), i = r2 ? r2.size : 0, s = this.ri(t);
    return this.docs = this.docs.insert(n, {
      document: t.mutableCopy(),
      size: s
    }), this.size += s - i, this.indexManager.addToCollectionParentIndex(e, n.path.popLast());
  }
  /**
   * Removes the specified entry from the cache and updates the cache size as appropriate.
   *
   * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  removeEntry(e) {
    const t = this.docs.get(e);
    t && (this.docs = this.docs.remove(e), this.size -= t.size);
  }
  getEntry(e, t) {
    const n = this.docs.get(t);
    return PersistencePromise.resolve(n ? n.document.mutableCopy() : MutableDocument.newInvalidDocument(t));
  }
  getEntries(e, t) {
    let n = __PRIVATE_mutableDocumentMap();
    return t.forEach((e2) => {
      const t2 = this.docs.get(e2);
      n = n.insert(e2, t2 ? t2.document.mutableCopy() : MutableDocument.newInvalidDocument(e2));
    }), PersistencePromise.resolve(n);
  }
  getDocumentsMatchingQuery(e, t, n, r2) {
    let i = __PRIVATE_mutableDocumentMap();
    const s = t.path, o = new DocumentKey(s.child("__id-9223372036854775808__")), _ = this.docs.getIteratorFrom(o);
    for (; _.hasNext(); ) {
      const { key: e2, value: { document: o2 } } = _.getNext();
      if (!s.isPrefixOf(e2.path)) break;
      e2.path.length > s.length + 1 || (__PRIVATE_indexOffsetComparator(__PRIVATE_newIndexOffsetFromDocument(o2), n) <= 0 || (r2.has(o2.key) || __PRIVATE_queryMatches(t, o2)) && (i = i.insert(o2.key, o2.mutableCopy())));
    }
    return PersistencePromise.resolve(i);
  }
  getAllFromCollectionGroup(e, t, n, r2) {
    fail(9500);
  }
  ii(e, t) {
    return PersistencePromise.forEach(this.docs, (e2) => t(e2));
  }
  newChangeBuffer(e) {
    return new __PRIVATE_MemoryRemoteDocumentChangeBuffer(this);
  }
  getSize(e) {
    return PersistencePromise.resolve(this.size);
  }
};
var __PRIVATE_MemoryRemoteDocumentChangeBuffer = class extends RemoteDocumentChangeBuffer {
  constructor(e) {
    super(), this.Nr = e;
  }
  applyChanges(e) {
    const t = [];
    return this.changes.forEach((n, r2) => {
      r2.isValidDocument() ? t.push(this.Nr.addEntry(e, r2)) : this.Nr.removeEntry(n);
    }), PersistencePromise.waitFor(t);
  }
  getFromCache(e, t) {
    return this.Nr.getEntry(e, t);
  }
  getAllFromCache(e, t) {
    return this.Nr.getEntries(e, t);
  }
};
var __PRIVATE_MemoryTargetCache = class {
  constructor(e) {
    this.persistence = e, /**
     * Maps a target to the data about that target
     */
    this.si = new ObjectMap((e2) => __PRIVATE_canonifyTarget(e2), __PRIVATE_targetEquals), /** The last received snapshot version. */
    this.lastRemoteSnapshotVersion = SnapshotVersion.min(), /** The highest numbered target ID encountered. */
    this.highestTargetId = 0, /** The highest sequence number encountered. */
    this.oi = 0, /**
     * A ordered bidirectional mapping between documents and the remote target
     * IDs.
     */
    this._i = new __PRIVATE_ReferenceSet(), this.targetCount = 0, this.ai = __PRIVATE_TargetIdGenerator.ur();
  }
  forEachTarget(e, t) {
    return this.si.forEach((e2, n) => t(n)), PersistencePromise.resolve();
  }
  getLastRemoteSnapshotVersion(e) {
    return PersistencePromise.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return PersistencePromise.resolve(this.oi);
  }
  allocateTargetId(e) {
    return this.highestTargetId = this.ai.next(), PersistencePromise.resolve(this.highestTargetId);
  }
  setTargetsMetadata(e, t, n) {
    return n && (this.lastRemoteSnapshotVersion = n), t > this.oi && (this.oi = t), PersistencePromise.resolve();
  }
  Pr(e) {
    this.si.set(e.target, e);
    const t = e.targetId;
    t > this.highestTargetId && (this.ai = new __PRIVATE_TargetIdGenerator(t), this.highestTargetId = t), e.sequenceNumber > this.oi && (this.oi = e.sequenceNumber);
  }
  addTargetData(e, t) {
    return this.Pr(t), this.targetCount += 1, PersistencePromise.resolve();
  }
  updateTargetData(e, t) {
    return this.Pr(t), PersistencePromise.resolve();
  }
  removeTargetData(e, t) {
    return this.si.delete(t.target), this._i.jr(t.targetId), this.targetCount -= 1, PersistencePromise.resolve();
  }
  removeTargets(e, t, n) {
    let r2 = 0;
    const i = [];
    return this.si.forEach((s, o) => {
      o.sequenceNumber <= t && null === n.get(o.targetId) && (this.si.delete(s), i.push(this.removeMatchingKeysForTargetId(e, o.targetId)), r2++);
    }), PersistencePromise.waitFor(i).next(() => r2);
  }
  getTargetCount(e) {
    return PersistencePromise.resolve(this.targetCount);
  }
  getTargetData(e, t) {
    const n = this.si.get(t) || null;
    return PersistencePromise.resolve(n);
  }
  addMatchingKeys(e, t, n) {
    return this._i.Wr(t, n), PersistencePromise.resolve();
  }
  removeMatchingKeys(e, t, n) {
    this._i.zr(t, n);
    const r2 = this.persistence.referenceDelegate, i = [];
    return r2 && t.forEach((t2) => {
      i.push(r2.markPotentiallyOrphaned(e, t2));
    }), PersistencePromise.waitFor(i);
  }
  removeMatchingKeysForTargetId(e, t) {
    return this._i.jr(t), PersistencePromise.resolve();
  }
  getMatchingKeysForTargetId(e, t) {
    const n = this._i.Hr(t);
    return PersistencePromise.resolve(n);
  }
  containsKey(e, t) {
    return PersistencePromise.resolve(this._i.containsKey(t));
  }
};
var __PRIVATE_MemoryPersistence = class {
  /**
   * The constructor accepts a factory for creating a reference delegate. This
   * allows both the delegate and this instance to have strong references to
   * each other without having nullable fields that would then need to be
   * checked or asserted on every access.
   */
  constructor(e, t) {
    this.ui = {}, this.overlays = {}, this.ci = new __PRIVATE_ListenSequence(0), this.li = false, this.li = true, this.hi = new __PRIVATE_MemoryGlobalsCache(), this.referenceDelegate = e(this), this.Pi = new __PRIVATE_MemoryTargetCache(this);
    this.indexManager = new __PRIVATE_MemoryIndexManager(), this.remoteDocumentCache = function __PRIVATE_newMemoryRemoteDocumentCache(e2) {
      return new __PRIVATE_MemoryRemoteDocumentCacheImpl(e2);
    }((e2) => this.referenceDelegate.Ti(e2)), this.serializer = new __PRIVATE_LocalSerializer(t), this.Ii = new __PRIVATE_MemoryBundleCache(this.serializer);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.li = false, Promise.resolve();
  }
  get started() {
    return this.li;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let t = this.overlays[e.toKey()];
    return t || (t = new __PRIVATE_MemoryDocumentOverlayCache(), this.overlays[e.toKey()] = t), t;
  }
  getMutationQueue(e, t) {
    let n = this.ui[e.toKey()];
    return n || (n = new __PRIVATE_MemoryMutationQueue(t, this.referenceDelegate), this.ui[e.toKey()] = n), n;
  }
  getGlobalsCache() {
    return this.hi;
  }
  getTargetCache() {
    return this.Pi;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.Ii;
  }
  runTransaction(e, t, n) {
    __PRIVATE_logDebug("MemoryPersistence", "Starting transaction:", e);
    const r2 = new __PRIVATE_MemoryTransaction(this.ci.next());
    return this.referenceDelegate.Ei(), n(r2).next((e2) => this.referenceDelegate.di(r2).next(() => e2)).toPromise().then((e2) => (r2.raiseOnCommittedEvent(), e2));
  }
  Ai(e, t) {
    return PersistencePromise.or(Object.values(this.ui).map((n) => () => n.containsKey(e, t)));
  }
};
var __PRIVATE_MemoryTransaction = class extends PersistenceTransaction {
  constructor(e) {
    super(), this.currentSequenceNumber = e;
  }
};
var __PRIVATE_MemoryEagerDelegate = class ___PRIVATE_MemoryEagerDelegate {
  constructor(e) {
    this.persistence = e, /** Tracks all documents that are active in Query views. */
    this.Ri = new __PRIVATE_ReferenceSet(), /** The list of documents that are potentially GCed after each transaction. */
    this.Vi = null;
  }
  static mi(e) {
    return new ___PRIVATE_MemoryEagerDelegate(e);
  }
  get fi() {
    if (this.Vi) return this.Vi;
    throw fail(60996);
  }
  addReference(e, t, n) {
    return this.Ri.addReference(n, t), this.fi.delete(n.toString()), PersistencePromise.resolve();
  }
  removeReference(e, t, n) {
    return this.Ri.removeReference(n, t), this.fi.add(n.toString()), PersistencePromise.resolve();
  }
  markPotentiallyOrphaned(e, t) {
    return this.fi.add(t.toString()), PersistencePromise.resolve();
  }
  removeTarget(e, t) {
    this.Ri.jr(t.targetId).forEach((e2) => this.fi.add(e2.toString()));
    const n = this.persistence.getTargetCache();
    return n.getMatchingKeysForTargetId(e, t.targetId).next((e2) => {
      e2.forEach((e3) => this.fi.add(e3.toString()));
    }).next(() => n.removeTargetData(e, t));
  }
  Ei() {
    this.Vi = /* @__PURE__ */ new Set();
  }
  di(e) {
    const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return PersistencePromise.forEach(this.fi, (n) => {
      const r2 = DocumentKey.fromPath(n);
      return this.gi(e, r2).next((e2) => {
        e2 || t.removeEntry(r2, SnapshotVersion.min());
      });
    }).next(() => (this.Vi = null, t.apply(e)));
  }
  updateLimboDocument(e, t) {
    return this.gi(e, t).next((e2) => {
      e2 ? this.fi.delete(t.toString()) : this.fi.add(t.toString());
    });
  }
  Ti(e) {
    return 0;
  }
  gi(e, t) {
    return PersistencePromise.or([() => PersistencePromise.resolve(this.Ri.containsKey(t)), () => this.persistence.getTargetCache().containsKey(e, t), () => this.persistence.Ai(e, t)]);
  }
};
var __PRIVATE_MemoryLruDelegate = class ___PRIVATE_MemoryLruDelegate {
  constructor(e, t) {
    this.persistence = e, this.pi = new ObjectMap((e2) => __PRIVATE_encodeResourcePath(e2.path), (e2, t2) => e2.isEqual(t2)), this.garbageCollector = __PRIVATE_newLruGarbageCollector(this, t);
  }
  static mi(e, t) {
    return new ___PRIVATE_MemoryLruDelegate(e, t);
  }
  // No-ops, present so memory persistence doesn't have to care which delegate
  // it has.
  Ei() {
  }
  di(e) {
    return PersistencePromise.resolve();
  }
  forEachTarget(e, t) {
    return this.persistence.getTargetCache().forEachTarget(e, t);
  }
  gr(e) {
    const t = this.wr(e);
    return this.persistence.getTargetCache().getTargetCount(e).next((e2) => t.next((t2) => e2 + t2));
  }
  wr(e) {
    let t = 0;
    return this.pr(e, (e2) => {
      t++;
    }).next(() => t);
  }
  pr(e, t) {
    return PersistencePromise.forEach(this.pi, (n, r2) => this.br(e, n, r2).next((e2) => e2 ? PersistencePromise.resolve() : t(r2)));
  }
  removeTargets(e, t, n) {
    return this.persistence.getTargetCache().removeTargets(e, t, n);
  }
  removeOrphanedDocuments(e, t) {
    let n = 0;
    const r2 = this.persistence.getRemoteDocumentCache(), i = r2.newChangeBuffer();
    return r2.ii(e, (r3) => this.br(e, r3, t).next((e2) => {
      e2 || (n++, i.removeEntry(r3, SnapshotVersion.min()));
    })).next(() => i.apply(e)).next(() => n);
  }
  markPotentiallyOrphaned(e, t) {
    return this.pi.set(t, e.currentSequenceNumber), PersistencePromise.resolve();
  }
  removeTarget(e, t) {
    const n = t.withSequenceNumber(e.currentSequenceNumber);
    return this.persistence.getTargetCache().updateTargetData(e, n);
  }
  addReference(e, t, n) {
    return this.pi.set(n, e.currentSequenceNumber), PersistencePromise.resolve();
  }
  removeReference(e, t, n) {
    return this.pi.set(n, e.currentSequenceNumber), PersistencePromise.resolve();
  }
  updateLimboDocument(e, t) {
    return this.pi.set(t, e.currentSequenceNumber), PersistencePromise.resolve();
  }
  Ti(e) {
    let t = e.key.toString().length;
    return e.isFoundDocument() && (t += __PRIVATE_estimateByteSize(e.data.value)), t;
  }
  br(e, t, n) {
    return PersistencePromise.or([() => this.persistence.Ai(e, t), () => this.persistence.getTargetCache().containsKey(e, t), () => {
      const e2 = this.pi.get(t);
      return PersistencePromise.resolve(void 0 !== e2 && e2 > n);
    }]);
  }
  getCacheSize(e) {
    return this.persistence.getRemoteDocumentCache().getSize(e);
  }
};
var __PRIVATE_LocalViewChanges = class ___PRIVATE_LocalViewChanges {
  constructor(e, t, n, r2) {
    this.targetId = e, this.fromCache = t, this.Es = n, this.ds = r2;
  }
  static As(e, t) {
    let n = __PRIVATE_documentKeySet(), r2 = __PRIVATE_documentKeySet();
    for (const e2 of t.docChanges) switch (e2.type) {
      case 0:
        n = n.add(e2.doc.key);
        break;
      case 1:
        r2 = r2.add(e2.doc.key);
    }
    return new ___PRIVATE_LocalViewChanges(e, t.fromCache, n, r2);
  }
};
var QueryContext = class {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
};
var __PRIVATE_QueryEngine = class {
  constructor() {
    this.Rs = false, this.Vs = false, /**
     * SDK only decides whether it should create index when collection size is
     * larger than this.
     */
    this.fs = 100, this.gs = /**
    * This cost represents the evaluation result of
    * (([index, docKey] + [docKey, docContent]) per document in the result set)
    * / ([docKey, docContent] per documents in full collection scan) coming from
    * experiment [enter PR experiment URL here].
    */
    function __PRIVATE_getDefaultRelativeIndexReadCostPerDocument() {
      return isSafari() ? 8 : __PRIVATE_getAndroidVersion(getUA()) > 0 ? 6 : 4;
    }();
  }
  /** Sets the document view to query against. */
  initialize(e, t) {
    this.ps = e, this.indexManager = t, this.Rs = true;
  }
  /** Returns all local documents matching the specified query. */
  getDocumentsMatchingQuery(e, t, n, r2) {
    const i = {
      result: null
    };
    return this.ys(e, t).next((e2) => {
      i.result = e2;
    }).next(() => {
      if (!i.result) return this.ws(e, t, r2, n).next((e2) => {
        i.result = e2;
      });
    }).next(() => {
      if (i.result) return;
      const n2 = new QueryContext();
      return this.Ss(e, t, n2).next((r3) => {
        if (i.result = r3, this.Vs) return this.bs(e, t, n2, r3.size);
      });
    }).next(() => i.result);
  }
  bs(e, t, n, r2) {
    return n.documentReadCount < this.fs ? (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "SDK will not create cache indexes for query:", __PRIVATE_stringifyQuery(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.fs, "documents"), PersistencePromise.resolve()) : (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "Query:", __PRIVATE_stringifyQuery(t), "scans", n.documentReadCount, "local documents and returns", r2, "documents as results."), n.documentReadCount > this.gs * r2 ? (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "The SDK decides to create cache indexes for query:", __PRIVATE_stringifyQuery(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, __PRIVATE_queryToTarget(t))) : PersistencePromise.resolve());
  }
  /**
   * Performs an indexed query that evaluates the query based on a collection's
   * persisted index values. Returns `null` if an index is not available.
   */
  ys(e, t) {
    if (__PRIVATE_queryMatchesAllDocuments(t))
      return PersistencePromise.resolve(null);
    let n = __PRIVATE_queryToTarget(t);
    return this.indexManager.getIndexType(e, n).next((r2) => 0 === r2 ? null : (null !== t.limit && 1 === r2 && // We cannot apply a limit for targets that are served using a partial
    // index. If a partial index will be used to serve the target, the
    // query may return a superset of documents that match the target
    // (e.g. if the index doesn't include all the target's filters), or
    // may return the correct set of documents in the wrong order (e.g. if
    // the index doesn't include a segment for one of the orderBys).
    // Therefore, a limit should not be applied in such cases.
    (t = __PRIVATE_queryWithLimit(
      t,
      null,
      "F"
      /* LimitType.First */
    ), n = __PRIVATE_queryToTarget(t)), this.indexManager.getDocumentsMatchingTarget(e, n).next((r3) => {
      const i = __PRIVATE_documentKeySet(...r3);
      return this.ps.getDocuments(e, i).next((r4) => this.indexManager.getMinOffset(e, n).next((n2) => {
        const s = this.Ds(t, r4);
        return this.Cs(t, s, i, n2.readTime) ? this.ys(e, __PRIVATE_queryWithLimit(
          t,
          null,
          "F"
          /* LimitType.First */
        )) : this.vs(e, s, t, n2);
      }));
    })));
  }
  /**
   * Performs a query based on the target's persisted query mapping. Returns
   * `null` if the mapping is not available or cannot be used.
   */
  ws(e, t, n, r2) {
    return __PRIVATE_queryMatchesAllDocuments(t) || r2.isEqual(SnapshotVersion.min()) ? PersistencePromise.resolve(null) : this.ps.getDocuments(e, n).next((i) => {
      const s = this.Ds(t, i);
      return this.Cs(t, s, n, r2) ? PersistencePromise.resolve(null) : (__PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "Re-using previous result from %s to execute query: %s", r2.toString(), __PRIVATE_stringifyQuery(t)), this.vs(e, s, t, __PRIVATE_newIndexOffsetSuccessorFromReadTime(r2, U)).next((e2) => e2));
    });
  }
  /** Applies the query filter and sorting to the provided documents.  */
  Ds(e, t) {
    let n = new SortedSet(__PRIVATE_newQueryComparator(e));
    return t.forEach((t2, r2) => {
      __PRIVATE_queryMatches(e, r2) && (n = n.add(r2));
    }), n;
  }
  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param query - The query.
   * @param sortedPreviousResults - The documents that matched the query when it
   * was last synchronized, sorted by the query's comparator.
   * @param remoteKeys - The document keys that matched the query at the last
   * snapshot.
   * @param limboFreeSnapshotVersion - The version of the snapshot when the
   * query was last synchronized.
   */
  Cs(e, t, n, r2) {
    if (null === e.limit)
      return false;
    if (n.size !== t.size)
      return true;
    const i = "F" === e.limitType ? t.last() : t.first();
    return !!i && (i.hasPendingWrites || i.version.compareTo(r2) > 0);
  }
  Ss(e, t, n) {
    return __PRIVATE_getLogLevel() <= LogLevel.DEBUG && __PRIVATE_logDebug("QueryEngine", "Using full collection scan to execute query:", __PRIVATE_stringifyQuery(t)), this.ps.getDocumentsMatchingQuery(e, t, IndexOffset.min(), n);
  }
  /**
   * Combines the results from an indexed execution with the remaining documents
   * that have not yet been indexed.
   */
  vs(e, t, n, r2) {
    return this.ps.getDocumentsMatchingQuery(e, n, r2).next((e2) => (
      // Merge with existing results
      (t.forEach((t2) => {
        e2 = e2.insert(t2.key, t2);
      }), e2)
    ));
  }
};
var Ut = "LocalStore";
var Kt = 3e8;
var __PRIVATE_LocalStoreImpl = class {
  constructor(e, t, n, r2) {
    this.persistence = e, this.Fs = t, this.serializer = r2, /**
     * Maps a targetID to data about its target.
     *
     * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
     * of `applyRemoteEvent()` idempotent.
     */
    this.Ms = new SortedMap(__PRIVATE_primitiveComparator), /** Maps a target to its targetID. */
    // TODO(wuandy): Evaluate if TargetId can be part of Target.
    this.xs = new ObjectMap((e2) => __PRIVATE_canonifyTarget(e2), __PRIVATE_targetEquals), /**
     * A per collection group index of the last read time processed by
     * `getNewDocumentChanges()`.
     *
     * PORTING NOTE: This is only used for multi-tab synchronization.
     */
    this.Os = /* @__PURE__ */ new Map(), this.Ns = e.getRemoteDocumentCache(), this.Pi = e.getTargetCache(), this.Ii = e.getBundleCache(), this.Bs(n);
  }
  Bs(e) {
    this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new LocalDocumentsView(this.Ns, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.Ns.setIndexManager(this.indexManager), this.Fs.initialize(this.localDocuments, this.indexManager);
  }
  collectGarbage(e) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (t) => e.collect(t, this.Ms));
  }
};
function __PRIVATE_newLocalStore(e, t, n, r2) {
  return new __PRIVATE_LocalStoreImpl(e, t, n, r2);
}
async function __PRIVATE_localStoreHandleUserChange(e, t) {
  const n = __PRIVATE_debugCast(e);
  return await n.persistence.runTransaction("Handle user change", "readonly", (e2) => {
    let r2;
    return n.mutationQueue.getAllMutationBatches(e2).next((i) => (r2 = i, n.Bs(t), n.mutationQueue.getAllMutationBatches(e2))).next((t2) => {
      const i = [], s = [];
      let o = __PRIVATE_documentKeySet();
      for (const e3 of r2) {
        i.push(e3.batchId);
        for (const t3 of e3.mutations) o = o.add(t3.key);
      }
      for (const e3 of t2) {
        s.push(e3.batchId);
        for (const t3 of e3.mutations) o = o.add(t3.key);
      }
      return n.localDocuments.getDocuments(e2, o).next((e3) => ({
        Ls: e3,
        removedBatchIds: i,
        addedBatchIds: s
      }));
    });
  });
}
function __PRIVATE_localStoreAcknowledgeBatch(e, t) {
  const n = __PRIVATE_debugCast(e);
  return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (e2) => {
    const r2 = t.batch.keys(), i = n.Ns.newChangeBuffer({
      trackRemovals: true
    });
    return function __PRIVATE_applyWriteToRemoteDocuments(e3, t2, n2, r3) {
      const i2 = n2.batch, s = i2.keys();
      let o = PersistencePromise.resolve();
      return s.forEach((e4) => {
        o = o.next(() => r3.getEntry(t2, e4)).next((t3) => {
          const s2 = n2.docVersions.get(e4);
          __PRIVATE_hardAssert(null !== s2, 48541), t3.version.compareTo(s2) < 0 && (i2.applyToRemoteDocument(t3, n2), t3.isValidDocument() && // We use the commitVersion as the readTime rather than the
          // document's updateTime since the updateTime is not advanced
          // for updates that do not modify the underlying document.
          (t3.setReadTime(n2.commitVersion), r3.addEntry(t3)));
        });
      }), o.next(() => e3.mutationQueue.removeMutationBatch(t2, i2));
    }(n, e2, t, i).next(() => i.apply(e2)).next(() => n.mutationQueue.performConsistencyCheck(e2)).next(() => n.documentOverlayCache.removeOverlaysForBatchId(e2, r2, t.batch.batchId)).next(() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e2, function __PRIVATE_getKeysWithTransformResults(e3) {
      let t2 = __PRIVATE_documentKeySet();
      for (let n2 = 0; n2 < e3.mutationResults.length; ++n2) {
        e3.mutationResults[n2].transformResults.length > 0 && (t2 = t2.add(e3.batch.mutations[n2].key));
      }
      return t2;
    }(t))).next(() => n.localDocuments.getDocuments(e2, r2));
  });
}
function __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e) {
  const t = __PRIVATE_debugCast(e);
  return t.persistence.runTransaction("Get last remote snapshot version", "readonly", (e2) => t.Pi.getLastRemoteSnapshotVersion(e2));
}
function __PRIVATE_localStoreApplyRemoteEventToLocalCache(e, t) {
  const n = __PRIVATE_debugCast(e), r2 = t.snapshotVersion;
  let i = n.Ms;
  return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (e2) => {
    const s = n.Ns.newChangeBuffer({
      trackRemovals: true
    });
    i = n.Ms;
    const o = [];
    t.targetChanges.forEach((s2, _2) => {
      const a3 = i.get(_2);
      if (!a3) return;
      o.push(n.Pi.removeMatchingKeys(e2, s2.removedDocuments, _2).next(() => n.Pi.addMatchingKeys(e2, s2.addedDocuments, _2)));
      let u = a3.withSequenceNumber(e2.currentSequenceNumber);
      null !== t.targetMismatches.get(_2) ? u = u.withResumeToken(ByteString.EMPTY_BYTE_STRING, SnapshotVersion.min()).withLastLimboFreeSnapshotVersion(SnapshotVersion.min()) : s2.resumeToken.approximateByteSize() > 0 && (u = u.withResumeToken(s2.resumeToken, r2)), i = i.insert(_2, u), // Update the target data if there are target changes (or if
      // sufficient time has passed since the last update).
      /**
      * Returns true if the newTargetData should be persisted during an update of
      * an active target. TargetData should always be persisted when a target is
      * being released and should not call this function.
      *
      * While the target is active, TargetData updates can be omitted when nothing
      * about the target has changed except metadata like the resume token or
      * snapshot version. Occasionally it's worth the extra write to prevent these
      * values from getting too stale after a crash, but this doesn't have to be
      * too frequent.
      */
      function __PRIVATE_shouldPersistTargetData(e3, t2, n2) {
        if (0 === e3.resumeToken.approximateByteSize()) return true;
        const r3 = t2.snapshotVersion.toMicroseconds() - e3.snapshotVersion.toMicroseconds();
        if (r3 >= Kt) return true;
        const i2 = n2.addedDocuments.size + n2.modifiedDocuments.size + n2.removedDocuments.size;
        return i2 > 0;
      }(a3, u, s2) && o.push(n.Pi.updateTargetData(e2, u));
    });
    let _ = __PRIVATE_mutableDocumentMap(), a2 = __PRIVATE_documentKeySet();
    if (t.documentUpdates.forEach((r3) => {
      t.resolvedLimboDocuments.has(r3) && o.push(n.persistence.referenceDelegate.updateLimboDocument(e2, r3));
    }), // Each loop iteration only affects its "own" doc, so it's safe to get all
    // the remote documents in advance in a single call.
    o.push(__PRIVATE_populateDocumentChangeBuffer(e2, s, t.documentUpdates).next((e3) => {
      _ = e3.ks, a2 = e3.qs;
    })), !r2.isEqual(SnapshotVersion.min())) {
      const t2 = n.Pi.getLastRemoteSnapshotVersion(e2).next((t3) => n.Pi.setTargetsMetadata(e2, e2.currentSequenceNumber, r2));
      o.push(t2);
    }
    return PersistencePromise.waitFor(o).next(() => s.apply(e2)).next(() => n.localDocuments.getLocalViewOfDocuments(e2, _, a2)).next(() => _);
  }).then((e2) => (n.Ms = i, e2));
}
function __PRIVATE_populateDocumentChangeBuffer(e, t, n) {
  let r2 = __PRIVATE_documentKeySet(), i = __PRIVATE_documentKeySet();
  return n.forEach((e2) => r2 = r2.add(e2)), t.getEntries(e, r2).next((e2) => {
    let r3 = __PRIVATE_mutableDocumentMap();
    return n.forEach((n2, s) => {
      const o = e2.get(n2);
      s.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n2)), // Note: The order of the steps below is important, since we want
      // to ensure that rejected limbo resolutions (which fabricate
      // NoDocuments with SnapshotVersion.min()) never add documents to
      // cache.
      s.isNoDocument() && s.version.isEqual(SnapshotVersion.min()) ? (
        // NoDocuments with SnapshotVersion.min() are used in manufactured
        // events. We remove these documents from cache since we lost
        // access.
        (t.removeEntry(n2, s.readTime), r3 = r3.insert(n2, s))
      ) : !o.isValidDocument() || s.version.compareTo(o.version) > 0 || 0 === s.version.compareTo(o.version) && o.hasPendingWrites ? (t.addEntry(s), r3 = r3.insert(n2, s)) : __PRIVATE_logDebug(Ut, "Ignoring outdated watch update for ", n2, ". Current version:", o.version, " Watch version:", s.version);
    }), {
      ks: r3,
      qs: i
    };
  });
}
function __PRIVATE_localStoreGetNextMutationBatch(e, t) {
  const n = __PRIVATE_debugCast(e);
  return n.persistence.runTransaction("Get next mutation batch", "readonly", (e2) => (void 0 === t && (t = j), n.mutationQueue.getNextMutationBatchAfterBatchId(e2, t)));
}
function __PRIVATE_localStoreAllocateTarget(e, t) {
  const n = __PRIVATE_debugCast(e);
  return n.persistence.runTransaction("Allocate target", "readwrite", (e2) => {
    let r2;
    return n.Pi.getTargetData(e2, t).next((i) => i ? (
      // This target has been listened to previously, so reuse the
      // previous targetID.
      // TODO(mcg): freshen last accessed date?
      (r2 = i, PersistencePromise.resolve(r2))
    ) : n.Pi.allocateTargetId(e2).next((i2) => (r2 = new TargetData(t, i2, "TargetPurposeListen", e2.currentSequenceNumber), n.Pi.addTargetData(e2, r2).next(() => r2))));
  }).then((e2) => {
    const r2 = n.Ms.get(e2.targetId);
    return (null === r2 || e2.snapshotVersion.compareTo(r2.snapshotVersion) > 0) && (n.Ms = n.Ms.insert(e2.targetId, e2), n.xs.set(t, e2.targetId)), e2;
  });
}
async function __PRIVATE_localStoreReleaseTarget(e, t, n) {
  const r2 = __PRIVATE_debugCast(e), i = r2.Ms.get(t), s = n ? "readwrite" : "readwrite-primary";
  try {
    n || await r2.persistence.runTransaction("Release target", s, (e2) => r2.persistence.referenceDelegate.removeTarget(e2, i));
  } catch (e2) {
    if (!__PRIVATE_isIndexedDbTransactionError(e2)) throw e2;
    __PRIVATE_logDebug(Ut, `Failed to update sequence numbers for target ${t}: ${e2}`);
  }
  r2.Ms = r2.Ms.remove(t), r2.xs.delete(i.target);
}
function __PRIVATE_localStoreExecuteQuery(e, t, n) {
  const r2 = __PRIVATE_debugCast(e);
  let i = SnapshotVersion.min(), s = __PRIVATE_documentKeySet();
  return r2.persistence.runTransaction(
    "Execute query",
    "readwrite",
    // Use readwrite instead of readonly so indexes can be created
    // Use readwrite instead of readonly so indexes can be created
    (e2) => function __PRIVATE_localStoreGetTargetData(e3, t2, n2) {
      const r3 = __PRIVATE_debugCast(e3), i2 = r3.xs.get(n2);
      return void 0 !== i2 ? PersistencePromise.resolve(r3.Ms.get(i2)) : r3.Pi.getTargetData(t2, n2);
    }(r2, e2, __PRIVATE_queryToTarget(t)).next((t2) => {
      if (t2) return i = t2.lastLimboFreeSnapshotVersion, r2.Pi.getMatchingKeysForTargetId(e2, t2.targetId).next((e3) => {
        s = e3;
      });
    }).next(() => r2.Fs.getDocumentsMatchingQuery(e2, t, n ? i : SnapshotVersion.min(), n ? s : __PRIVATE_documentKeySet())).next((e3) => (__PRIVATE_setMaxReadTime(r2, __PRIVATE_queryCollectionGroup(t), e3), {
      documents: e3,
      Qs: s
    }))
  );
}
function __PRIVATE_setMaxReadTime(e, t, n) {
  let r2 = e.Os.get(t) || SnapshotVersion.min();
  n.forEach((e2, t2) => {
    t2.readTime.compareTo(r2) > 0 && (r2 = t2.readTime);
  }), e.Os.set(t, r2);
}
var __PRIVATE_LocalClientState = class {
  constructor() {
    this.activeTargetIds = __PRIVATE_targetIdSet();
  }
  zs(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  js(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  /**
   * Converts this entry into a JSON-encoded format we can use for WebStorage.
   * Does not encode `clientId` as it is part of the key in WebStorage.
   */
  Gs() {
    const e = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(e);
  }
};
var __PRIVATE_MemorySharedClientState = class {
  constructor() {
    this.Mo = new __PRIVATE_LocalClientState(), this.xo = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(e) {
  }
  updateMutationState(e, t, n) {
  }
  addLocalQueryTarget(e, t = true) {
    return t && this.Mo.zs(e), this.xo[e] || "not-current";
  }
  updateQueryState(e, t, n) {
    this.xo[e] = t;
  }
  removeLocalQueryTarget(e) {
    this.Mo.js(e);
  }
  isLocalQueryTarget(e) {
    return this.Mo.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.xo[e];
  }
  getAllActiveQueryTargets() {
    return this.Mo.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.Mo.activeTargetIds.has(e);
  }
  start() {
    return this.Mo = new __PRIVATE_LocalClientState(), Promise.resolve();
  }
  handleUserChange(e, t, n) {
  }
  setOnlineState(e) {
  }
  shutdown() {
  }
  writeSequenceNumber(e) {
  }
  notifyBundleLoaded(e) {
  }
};
var __PRIVATE_NoopConnectivityMonitor = class {
  Oo(e) {
  }
  shutdown() {
  }
};
var Jt = "ConnectivityMonitor";
var __PRIVATE_BrowserConnectivityMonitor = class {
  constructor() {
    this.No = () => this.Bo(), this.Lo = () => this.ko(), this.qo = [], this.Qo();
  }
  Oo(e) {
    this.qo.push(e);
  }
  shutdown() {
    window.removeEventListener("online", this.No), window.removeEventListener("offline", this.Lo);
  }
  Qo() {
    window.addEventListener("online", this.No), window.addEventListener("offline", this.Lo);
  }
  Bo() {
    __PRIVATE_logDebug(Jt, "Network connectivity changed: AVAILABLE");
    for (const e of this.qo) e(
      0
      /* NetworkStatus.AVAILABLE */
    );
  }
  ko() {
    __PRIVATE_logDebug(Jt, "Network connectivity changed: UNAVAILABLE");
    for (const e of this.qo) e(
      1
      /* NetworkStatus.UNAVAILABLE */
    );
  }
  // TODO(chenbrian): Consider passing in window either into this component or
  // here for testing via FakeWindow.
  /** Checks that all used attributes of window are available. */
  static v() {
    return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
  }
};
var Ht = null;
function __PRIVATE_generateUniqueDebugId() {
  return null === Ht ? Ht = function __PRIVATE_generateInitialUniqueDebugId() {
    return 268435456 + Math.round(2147483648 * Math.random());
  }() : Ht++, "0x" + Ht.toString(16);
}
var Yt = "RestConnection";
var Zt = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery"
};
var __PRIVATE_RestConnection = class {
  get $o() {
    return false;
  }
  constructor(e) {
    this.databaseInfo = e, this.databaseId = e.databaseId;
    const t = e.ssl ? "https" : "http", n = encodeURIComponent(this.databaseId.projectId), r2 = encodeURIComponent(this.databaseId.database);
    this.Uo = t + "://" + e.host, this.Ko = `projects/${n}/databases/${r2}`, this.Wo = this.databaseId.database === lt ? `project_id=${n}` : `project_id=${n}&database_id=${r2}`;
  }
  Go(e, t, n, r2, i) {
    const s = __PRIVATE_generateUniqueDebugId(), o = this.zo(e, t.toUriEncodedString());
    __PRIVATE_logDebug(Yt, `Sending RPC '${e}' ${s}:`, o, n);
    const _ = {
      "google-cloud-resource-prefix": this.Ko,
      "x-goog-request-params": this.Wo
    };
    this.jo(_, r2, i);
    const { host: a2 } = new URL(o), u = isCloudWorkstation(a2);
    return this.Jo(e, o, _, n, u).then((t2) => (__PRIVATE_logDebug(Yt, `Received RPC '${e}' ${s}: `, t2), t2), (t2) => {
      throw __PRIVATE_logWarn(Yt, `RPC '${e}' ${s} failed with error: `, t2, "url: ", o, "request:", n), t2;
    });
  }
  Ho(e, t, n, r2, i, s) {
    return this.Go(e, t, n, r2, i);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  jo(e, t, n) {
    e["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
    // so we need to get its value when we need it in a function.
    function __PRIVATE_getGoogApiClientValue() {
      return "gl-js/ fire/" + x;
    }(), // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), t && t.headers.forEach((t2, n2) => e[n2] = t2), n && n.headers.forEach((t2, n2) => e[n2] = t2);
  }
  zo(e, t) {
    const n = Zt[e];
    return `${this.Uo}/v1/${t}:${n}`;
  }
  /**
   * Closes and cleans up any resources associated with the connection. This
   * implementation is a no-op because there are no resources associated
   * with the RestConnection that need to be cleaned up.
   */
  terminate() {
  }
};
var __PRIVATE_StreamBridge = class {
  constructor(e) {
    this.Yo = e.Yo, this.Zo = e.Zo;
  }
  Xo(e) {
    this.e_ = e;
  }
  t_(e) {
    this.n_ = e;
  }
  r_(e) {
    this.i_ = e;
  }
  onMessage(e) {
    this.s_ = e;
  }
  close() {
    this.Zo();
  }
  send(e) {
    this.Yo(e);
  }
  o_() {
    this.e_();
  }
  __() {
    this.n_();
  }
  a_(e) {
    this.i_(e);
  }
  u_(e) {
    this.s_(e);
  }
};
var Xt = "WebChannelConnection";
var __PRIVATE_WebChannelConnection = class extends __PRIVATE_RestConnection {
  constructor(e) {
    super(e), /** A collection of open WebChannel instances */
    this.c_ = [], this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
  }
  Jo(e, t, n, r2, i) {
    const s = __PRIVATE_generateUniqueDebugId();
    return new Promise((i2, o) => {
      const _ = new XhrIo();
      _.setWithCredentials(true), _.listenOnce(EventType.COMPLETE, () => {
        try {
          switch (_.getLastErrorCode()) {
            case ErrorCode.NO_ERROR:
              const t2 = _.getResponseJson();
              __PRIVATE_logDebug(Xt, `XHR for RPC '${e}' ${s} received:`, JSON.stringify(t2)), i2(t2);
              break;
            case ErrorCode.TIMEOUT:
              __PRIVATE_logDebug(Xt, `RPC '${e}' ${s} timed out`), o(new FirestoreError(N.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case ErrorCode.HTTP_ERROR:
              const n2 = _.getStatus();
              if (__PRIVATE_logDebug(Xt, `RPC '${e}' ${s} failed with status:`, n2, "response text:", _.getResponseText()), n2 > 0) {
                let e2 = _.getResponseJson();
                Array.isArray(e2) && (e2 = e2[0]);
                const t3 = e2?.error;
                if (t3 && t3.status && t3.message) {
                  const e3 = function __PRIVATE_mapCodeFromHttpResponseErrorStatus(e4) {
                    const t4 = e4.toLowerCase().replace(/_/g, "-");
                    return Object.values(N).indexOf(t4) >= 0 ? t4 : N.UNKNOWN;
                  }(t3.status);
                  o(new FirestoreError(e3, t3.message));
                } else o(new FirestoreError(N.UNKNOWN, "Server responded with status " + _.getStatus()));
              } else
                o(new FirestoreError(N.UNAVAILABLE, "Connection failed."));
              break;
            default:
              fail(9055, {
                l_: e,
                streamId: s,
                h_: _.getLastErrorCode(),
                P_: _.getLastError()
              });
          }
        } finally {
          __PRIVATE_logDebug(Xt, `RPC '${e}' ${s} completed.`);
        }
      });
      const a2 = JSON.stringify(r2);
      __PRIVATE_logDebug(Xt, `RPC '${e}' ${s} sending request:`, r2), _.send(t, "POST", a2, n, 15);
    });
  }
  T_(e, t, n) {
    const r2 = __PRIVATE_generateUniqueDebugId(), i = [this.Uo, "/", "google.firestore.v1.Firestore", "/", e, "/channel"], s = createWebChannelTransport(), o = getStatEventTarget(), _ = {
      // Required for backend stickiness, routing behavior is based on this
      // parameter.
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        // This param is used to improve routing and project isolation by the
        // backend and must be included in every request.
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: true,
      supportsCrossDomainXhr: true,
      internalChannelParams: {
        // Override the default timeout (randomized between 10-20 seconds) since
        // a large write batch on a slow internet connection may take a long
        // time to send to the backend. Rather than have WebChannel impose a
        // tight timeout which could lead to infinite timeouts and retries, we
        // set it very large (5-10 minutes) and rely on the browser's builtin
        // timeouts to kick in if the request isn't working.
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    }, a2 = this.longPollingOptions.timeoutSeconds;
    void 0 !== a2 && (_.longPollingTimeout = Math.round(1e3 * a2)), this.useFetchStreams && (_.useFetchStreams = true), this.jo(_.initMessageHeaders, t, n), // Sending the custom headers we just added to request.initMessageHeaders
    // (Authorization, etc.) will trigger the browser to make a CORS preflight
    // request because the XHR will no longer meet the criteria for a "simple"
    // CORS request:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // Therefore to avoid the CORS preflight request (an extra network
    // roundtrip), we use the encodeInitMessageHeaders option to specify that
    // the headers should instead be encoded in the request's POST payload,
    // which is recognized by the webchannel backend.
    _.encodeInitMessageHeaders = true;
    const u = i.join("");
    __PRIVATE_logDebug(Xt, `Creating RPC '${e}' stream ${r2}: ${u}`, _);
    const c2 = s.createWebChannel(u, _);
    this.I_(c2);
    let l = false, h = false;
    const P = new __PRIVATE_StreamBridge({
      Yo: (t2) => {
        h ? __PRIVATE_logDebug(Xt, `Not sending because RPC '${e}' stream ${r2} is closed:`, t2) : (l || (__PRIVATE_logDebug(Xt, `Opening RPC '${e}' stream ${r2} transport.`), c2.open(), l = true), __PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} sending:`, t2), c2.send(t2));
      },
      Zo: () => c2.close()
    }), __PRIVATE_unguardedEventListen = (e2, t2, n2) => {
      e2.listen(t2, (e3) => {
        try {
          n2(e3);
        } catch (e4) {
          setTimeout(() => {
            throw e4;
          }, 0);
        }
      });
    };
    return __PRIVATE_unguardedEventListen(c2, WebChannel.EventType.OPEN, () => {
      h || (__PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} transport opened.`), P.o_());
    }), __PRIVATE_unguardedEventListen(c2, WebChannel.EventType.CLOSE, () => {
      h || (h = true, __PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} transport closed`), P.a_(), this.E_(c2));
    }), __PRIVATE_unguardedEventListen(c2, WebChannel.EventType.ERROR, (t2) => {
      h || (h = true, __PRIVATE_logWarn(Xt, `RPC '${e}' stream ${r2} transport errored. Name:`, t2.name, "Message:", t2.message), P.a_(new FirestoreError(N.UNAVAILABLE, "The operation could not be completed")));
    }), __PRIVATE_unguardedEventListen(c2, WebChannel.EventType.MESSAGE, (t2) => {
      if (!h) {
        const n2 = t2.data[0];
        __PRIVATE_hardAssert(!!n2, 16349);
        const i2 = n2, s2 = i2?.error || i2[0]?.error;
        if (s2) {
          __PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} received error:`, s2);
          const t3 = s2.status;
          let n3 = (
            /**
            * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
            *
            * @returns The Code equivalent to the given status string or undefined if
            *     there is no match.
            */
            function __PRIVATE_mapCodeFromRpcStatus(e2) {
              const t4 = pt[e2];
              if (void 0 !== t4) return __PRIVATE_mapCodeFromRpcCode(t4);
            }(t3)
          ), i3 = s2.message;
          void 0 === n3 && (n3 = N.INTERNAL, i3 = "Unknown error status: " + t3 + " with message " + s2.message), // Mark closed so no further events are propagated
          h = true, P.a_(new FirestoreError(n3, i3)), c2.close();
        } else __PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} received:`, n2), P.u_(n2);
      }
    }), __PRIVATE_unguardedEventListen(o, Event.STAT_EVENT, (t2) => {
      t2.stat === Stat.PROXY ? __PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} detected buffering proxy`) : t2.stat === Stat.NOPROXY && __PRIVATE_logDebug(Xt, `RPC '${e}' stream ${r2} detected no buffering proxy`);
    }), setTimeout(() => {
      P.__();
    }, 0), P;
  }
  /**
   * Closes and cleans up any resources associated with the connection.
   */
  terminate() {
    this.c_.forEach((e) => e.close()), this.c_ = [];
  }
  /**
   * Add a WebChannel instance to the collection of open instances.
   * @param webChannel
   */
  I_(e) {
    this.c_.push(e);
  }
  /**
   * Remove a WebChannel instance from the collection of open instances.
   * @param webChannel
   */
  E_(e) {
    this.c_ = this.c_.filter((t) => t === e);
  }
};
function getDocument() {
  return "undefined" != typeof document ? document : null;
}
function __PRIVATE_newSerializer(e) {
  return new JsonProtoSerializer(
    e,
    /* useProto3Json= */
    true
  );
}
var __PRIVATE_ExponentialBackoff = class {
  constructor(e, t, n = 1e3, r2 = 1.5, i = 6e4) {
    this.Mi = e, this.timerId = t, this.d_ = n, this.A_ = r2, this.R_ = i, this.V_ = 0, this.m_ = null, /** The last backoff attempt, as epoch milliseconds. */
    this.f_ = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.V_ = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  g_() {
    this.V_ = this.R_;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  p_(e) {
    this.cancel();
    const t = Math.floor(this.V_ + this.y_()), n = Math.max(0, Date.now() - this.f_), r2 = Math.max(0, t - n);
    r2 > 0 && __PRIVATE_logDebug("ExponentialBackoff", `Backing off for ${r2} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`), this.m_ = this.Mi.enqueueAfterDelay(this.timerId, r2, () => (this.f_ = Date.now(), e())), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.V_ *= this.A_, this.V_ < this.d_ && (this.V_ = this.d_), this.V_ > this.R_ && (this.V_ = this.R_);
  }
  w_() {
    null !== this.m_ && (this.m_.skipDelay(), this.m_ = null);
  }
  cancel() {
    null !== this.m_ && (this.m_.cancel(), this.m_ = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  y_() {
    return (Math.random() - 0.5) * this.V_;
  }
};
var en = "PersistentStream";
var __PRIVATE_PersistentStream = class {
  constructor(e, t, n, r2, i, s, o, _) {
    this.Mi = e, this.S_ = n, this.b_ = r2, this.connection = i, this.authCredentialsProvider = s, this.appCheckCredentialsProvider = o, this.listener = _, this.state = 0, /**
     * A close count that's incremented every time the stream is closed; used by
     * getCloseGuardedDispatcher() to invalidate callbacks that happen after
     * close.
     */
    this.D_ = 0, this.C_ = null, this.v_ = null, this.stream = null, /**
     * Count of response messages received.
     */
    this.F_ = 0, this.M_ = new __PRIVATE_ExponentialBackoff(e, t);
  }
  /**
   * Returns true if start() has been called and no error has occurred. True
   * indicates the stream is open or in the process of opening (which
   * encompasses respecting backoff, getting auth tokens, and starting the
   * actual RPC). Use isOpen() to determine if the stream is open and ready for
   * outbound requests.
   */
  x_() {
    return 1 === this.state || 5 === this.state || this.O_();
  }
  /**
   * Returns true if the underlying RPC is open (the onOpen() listener has been
   * called) and the stream is ready for outbound requests.
   */
  O_() {
    return 2 === this.state || 3 === this.state;
  }
  /**
   * Starts the RPC. Only allowed if isStarted() returns false. The stream is
   * not immediately ready for use: onOpen() will be invoked when the RPC is
   * ready for outbound requests, at which point isOpen() will return true.
   *
   * When start returns, isStarted() will return true.
   */
  start() {
    this.F_ = 0, 4 !== this.state ? this.auth() : this.N_();
  }
  /**
   * Stops the RPC. This call is idempotent and allowed regardless of the
   * current isStarted() state.
   *
   * When stop returns, isStarted() and isOpen() will both return false.
   */
  async stop() {
    this.x_() && await this.close(
      0
      /* PersistentStreamState.Initial */
    );
  }
  /**
   * After an error the stream will usually back off on the next attempt to
   * start it. If the error warrants an immediate restart of the stream, the
   * sender can use this to indicate that the receiver should not back off.
   *
   * Each error will call the onClose() listener. That function can decide to
   * inhibit backoff if required.
   */
  B_() {
    this.state = 0, this.M_.reset();
  }
  /**
   * Marks this stream as idle. If no further actions are performed on the
   * stream for one minute, the stream will automatically close itself and
   * notify the stream's onClose() handler with Status.OK. The stream will then
   * be in a !isStarted() state, requiring the caller to start the stream again
   * before further use.
   *
   * Only streams that are in state 'Open' can be marked idle, as all other
   * states imply pending network operations.
   */
  L_() {
    this.O_() && null === this.C_ && (this.C_ = this.Mi.enqueueAfterDelay(this.S_, 6e4, () => this.k_()));
  }
  /** Sends a message to the underlying stream. */
  q_(e) {
    this.Q_(), this.stream.send(e);
  }
  /** Called by the idle timer when the stream should close due to inactivity. */
  async k_() {
    if (this.O_())
      return this.close(
        0
        /* PersistentStreamState.Initial */
      );
  }
  /** Marks the stream as active again. */
  Q_() {
    this.C_ && (this.C_.cancel(), this.C_ = null);
  }
  /** Cancels the health check delayed operation. */
  U_() {
    this.v_ && (this.v_.cancel(), this.v_ = null);
  }
  /**
   * Closes the stream and cleans up as necessary:
   *
   * * closes the underlying GRPC stream;
   * * calls the onClose handler with the given 'error';
   * * sets internal stream state to 'finalState';
   * * adjusts the backoff timer based on the error
   *
   * A new stream can be opened by calling start().
   *
   * @param finalState - the intended state of the stream after closing.
   * @param error - the error the connection was closed with.
   */
  async close(e, t) {
    this.Q_(), this.U_(), this.M_.cancel(), // Invalidates any stream-related callbacks (e.g. from auth or the
    // underlying stream), guaranteeing they won't execute.
    this.D_++, 4 !== e ? (
      // If this is an intentional close ensure we don't delay our next connection attempt.
      this.M_.reset()
    ) : t && t.code === N.RESOURCE_EXHAUSTED ? (
      // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
      (__PRIVATE_logError(t.toString()), __PRIVATE_logError("Using maximum backoff delay to prevent overloading the backend."), this.M_.g_())
    ) : t && t.code === N.UNAUTHENTICATED && 3 !== this.state && // "unauthenticated" error means the token was rejected. This should rarely
    // happen since both Auth and AppCheck ensure a sufficient TTL when we
    // request a token. If a user manually resets their system clock this can
    // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
    // before we received the first message and we need to invalidate the token
    // to ensure that we fetch a new token.
    (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), // Clean up the underlying stream because we are no longer interested in events.
    null !== this.stream && (this.K_(), this.stream.close(), this.stream = null), // This state must be assigned before calling onClose() to allow the callback to
    // inhibit backoff or otherwise manipulate the state in its non-started state.
    this.state = e, // Notify the listener that the stream closed.
    await this.listener.r_(t);
  }
  /**
   * Can be overridden to perform additional cleanup before the stream is closed.
   * Calling super.tearDown() is not required.
   */
  K_() {
  }
  auth() {
    this.state = 1;
    const e = this.W_(this.D_), t = this.D_;
    Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then(([e2, n]) => {
      this.D_ === t && // Normally we'd have to schedule the callback on the AsyncQueue.
      // However, the following calls are safe to be called outside the
      // AsyncQueue since they don't chain asynchronous calls
      this.G_(e2, n);
    }, (t2) => {
      e(() => {
        const e2 = new FirestoreError(N.UNKNOWN, "Fetching auth token failed: " + t2.message);
        return this.z_(e2);
      });
    });
  }
  G_(e, t) {
    const n = this.W_(this.D_);
    this.stream = this.j_(e, t), this.stream.Xo(() => {
      n(() => this.listener.Xo());
    }), this.stream.t_(() => {
      n(() => (this.state = 2, this.v_ = this.Mi.enqueueAfterDelay(this.b_, 1e4, () => (this.O_() && (this.state = 3), Promise.resolve())), this.listener.t_()));
    }), this.stream.r_((e2) => {
      n(() => this.z_(e2));
    }), this.stream.onMessage((e2) => {
      n(() => 1 == ++this.F_ ? this.J_(e2) : this.onNext(e2));
    });
  }
  N_() {
    this.state = 5, this.M_.p_(async () => {
      this.state = 0, this.start();
    });
  }
  // Visible for tests
  z_(e) {
    return __PRIVATE_logDebug(en, `close with error: ${e}`), this.stream = null, this.close(4, e);
  }
  /**
   * Returns a "dispatcher" function that dispatches operations onto the
   * AsyncQueue but only runs them if closeCount remains unchanged. This allows
   * us to turn auth / stream callbacks into no-ops if the stream is closed /
   * re-opened, etc.
   */
  W_(e) {
    return (t) => {
      this.Mi.enqueueAndForget(() => this.D_ === e ? t() : (__PRIVATE_logDebug(en, "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve()));
    };
  }
};
var __PRIVATE_PersistentListenStream = class extends __PRIVATE_PersistentStream {
  constructor(e, t, n, r2, i, s) {
    super(e, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", t, n, r2, s), this.serializer = i;
  }
  j_(e, t) {
    return this.connection.T_("Listen", e, t);
  }
  J_(e) {
    return this.onNext(e);
  }
  onNext(e) {
    this.M_.reset();
    const t = __PRIVATE_fromWatchChange(this.serializer, e), n = function __PRIVATE_versionFromListenResponse(e2) {
      if (!("targetChange" in e2)) return SnapshotVersion.min();
      const t2 = e2.targetChange;
      return t2.targetIds && t2.targetIds.length ? SnapshotVersion.min() : t2.readTime ? __PRIVATE_fromVersion(t2.readTime) : SnapshotVersion.min();
    }(e);
    return this.listener.H_(t, n);
  }
  /**
   * Registers interest in the results of the given target. If the target
   * includes a resumeToken it will be included in the request. Results that
   * affect the target will be streamed back as WatchChange messages that
   * reference the targetId.
   */
  Y_(e) {
    const t = {};
    t.database = __PRIVATE_getEncodedDatabaseId(this.serializer), t.addTarget = function __PRIVATE_toTarget(e2, t2) {
      let n2;
      const r2 = t2.target;
      if (n2 = __PRIVATE_targetIsDocumentTarget(r2) ? {
        documents: __PRIVATE_toDocumentsTarget(e2, r2)
      } : {
        query: __PRIVATE_toQueryTarget(e2, r2).ft
      }, n2.targetId = t2.targetId, t2.resumeToken.approximateByteSize() > 0) {
        n2.resumeToken = __PRIVATE_toBytes(e2, t2.resumeToken);
        const r3 = __PRIVATE_toInt32Proto(e2, t2.expectedCount);
        null !== r3 && (n2.expectedCount = r3);
      } else if (t2.snapshotVersion.compareTo(SnapshotVersion.min()) > 0) {
        n2.readTime = toTimestamp(e2, t2.snapshotVersion.toTimestamp());
        const r3 = __PRIVATE_toInt32Proto(e2, t2.expectedCount);
        null !== r3 && (n2.expectedCount = r3);
      }
      return n2;
    }(this.serializer, e);
    const n = __PRIVATE_toListenRequestLabels(this.serializer, e);
    n && (t.labels = n), this.q_(t);
  }
  /**
   * Unregisters interest in the results of the target associated with the
   * given targetId.
   */
  Z_(e) {
    const t = {};
    t.database = __PRIVATE_getEncodedDatabaseId(this.serializer), t.removeTarget = e, this.q_(t);
  }
};
var __PRIVATE_PersistentWriteStream = class extends __PRIVATE_PersistentStream {
  constructor(e, t, n, r2, i, s) {
    super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", t, n, r2, s), this.serializer = i;
  }
  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  get X_() {
    return this.F_ > 0;
  }
  // Override of PersistentStream.start
  start() {
    this.lastStreamToken = void 0, super.start();
  }
  K_() {
    this.X_ && this.ea([]);
  }
  j_(e, t) {
    return this.connection.T_("Write", e, t);
  }
  J_(e) {
    return __PRIVATE_hardAssert(!!e.streamToken, 31322), this.lastStreamToken = e.streamToken, // The first response is always the handshake response
    __PRIVATE_hardAssert(!e.writeResults || 0 === e.writeResults.length, 55816), this.listener.ta();
  }
  onNext(e) {
    __PRIVATE_hardAssert(!!e.streamToken, 12678), this.lastStreamToken = e.streamToken, // A successful first write response means the stream is healthy,
    // Note, that we could consider a successful handshake healthy, however,
    // the write itself might be causing an error we want to back off from.
    this.M_.reset();
    const t = __PRIVATE_fromWriteResults(e.writeResults, e.commitTime), n = __PRIVATE_fromVersion(e.commitTime);
    return this.listener.na(n, t);
  }
  /**
   * Sends an initial streamToken to the server, performing the handshake
   * required to make the StreamingWrite RPC work. Subsequent
   * calls should wait until onHandshakeComplete was called.
   */
  ra() {
    const e = {};
    e.database = __PRIVATE_getEncodedDatabaseId(this.serializer), this.q_(e);
  }
  /** Sends a group of mutations to the Firestore backend to apply. */
  ea(e) {
    const t = {
      streamToken: this.lastStreamToken,
      writes: e.map((e2) => toMutation(this.serializer, e2))
    };
    this.q_(t);
  }
};
var Datastore = class {
};
var __PRIVATE_DatastoreImpl = class extends Datastore {
  constructor(e, t, n, r2) {
    super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = n, this.serializer = r2, this.ia = false;
  }
  sa() {
    if (this.ia) throw new FirestoreError(N.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  Go(e, t, n, r2) {
    return this.sa(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([i, s]) => this.connection.Go(e, __PRIVATE_toResourcePath(t, n), r2, i, s)).catch((e2) => {
      throw "FirebaseError" === e2.name ? (e2.code === N.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e2) : new FirestoreError(N.UNKNOWN, e2.toString());
    });
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  Ho(e, t, n, r2, i) {
    return this.sa(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([s, o]) => this.connection.Ho(e, __PRIVATE_toResourcePath(t, n), r2, s, o, i)).catch((e2) => {
      throw "FirebaseError" === e2.name ? (e2.code === N.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e2) : new FirestoreError(N.UNKNOWN, e2.toString());
    });
  }
  terminate() {
    this.ia = true, this.connection.terminate();
  }
};
var __PRIVATE_OnlineStateTracker = class {
  constructor(e, t) {
    this.asyncQueue = e, this.onlineStateHandler = t, /** The current OnlineState. */
    this.state = "Unknown", /**
     * A count of consecutive failures to open the stream. If it reaches the
     * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
     * Offline.
     */
    this.oa = 0, /**
     * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
     * transition from OnlineState.Unknown to OnlineState.Offline without waiting
     * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
     */
    this._a = null, /**
     * Whether the client should log a warning message if it fails to connect to
     * the backend (initially true, cleared after a successful stream, or if we've
     * logged the message already).
     */
    this.aa = true;
  }
  /**
   * Called by RemoteStore when a watch stream is started (including on each
   * backoff attempt).
   *
   * If this is the first attempt, it sets the OnlineState to Unknown and starts
   * the onlineStateTimer.
   */
  ua() {
    0 === this.oa && (this.ca(
      "Unknown"
      /* OnlineState.Unknown */
    ), this._a = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, () => (this._a = null, this.la("Backend didn't respond within 10 seconds."), this.ca(
      "Offline"
      /* OnlineState.Offline */
    ), Promise.resolve())));
  }
  /**
   * Updates our OnlineState as appropriate after the watch stream reports a
   * failure. The first failure moves us to the 'Unknown' state. We then may
   * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
   * actually transition to the 'Offline' state.
   */
  ha(e) {
    "Online" === this.state ? this.ca(
      "Unknown"
      /* OnlineState.Unknown */
    ) : (this.oa++, this.oa >= 1 && (this.Pa(), this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.ca(
      "Offline"
      /* OnlineState.Offline */
    )));
  }
  /**
   * Explicitly sets the OnlineState to the specified state.
   *
   * Note that this resets our timers / failure counters, etc. used by our
   * Offline heuristics, so must not be used in place of
   * handleWatchStreamStart() and handleWatchStreamFailure().
   */
  set(e) {
    this.Pa(), this.oa = 0, "Online" === e && // We've connected to watch at least once. Don't warn the developer
    // about being offline going forward.
    (this.aa = false), this.ca(e);
  }
  ca(e) {
    e !== this.state && (this.state = e, this.onlineStateHandler(e));
  }
  la(e) {
    const t = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.aa ? (__PRIVATE_logError(t), this.aa = false) : __PRIVATE_logDebug("OnlineStateTracker", t);
  }
  Pa() {
    null !== this._a && (this._a.cancel(), this._a = null);
  }
};
var tn = "RemoteStore";
var __PRIVATE_RemoteStoreImpl = class {
  constructor(e, t, n, r2, i) {
    this.localStore = e, this.datastore = t, this.asyncQueue = n, this.remoteSyncer = {}, /**
     * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
     * LocalStore via fillWritePipeline() and have or will send to the write
     * stream.
     *
     * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
     * restart the write stream. When the stream is established the writes in the
     * pipeline will be sent in order.
     *
     * Writes remain in writePipeline until they are acknowledged by the backend
     * and thus will automatically be re-sent if the stream is interrupted /
     * restarted before they're acknowledged.
     *
     * Write responses from the backend are linked to their originating request
     * purely based on order, and so we can just shift() writes from the front of
     * the writePipeline as we receive responses.
     */
    this.Ta = [], /**
     * A mapping of watched targets that the client cares about tracking and the
     * user has explicitly called a 'listen' for this target.
     *
     * These targets may or may not have been sent to or acknowledged by the
     * server. On re-establishing the listen stream, these targets should be sent
     * to the server. The targets removed with unlistens are removed eagerly
     * without waiting for confirmation from the listen stream.
     */
    this.Ia = /* @__PURE__ */ new Map(), /**
     * A set of reasons for why the RemoteStore may be offline. If empty, the
     * RemoteStore may start its network connections.
     */
    this.Ea = /* @__PURE__ */ new Set(), /**
     * Event handlers that get called when the network is disabled or enabled.
     *
     * PORTING NOTE: These functions are used on the Web client to create the
     * underlying streams (to support tree-shakeable streams). On Android and iOS,
     * the streams are created during construction of RemoteStore.
     */
    this.da = [], this.Aa = i, this.Aa.Oo((e2) => {
      n.enqueueAndForget(async () => {
        __PRIVATE_canUseNetwork(this) && (__PRIVATE_logDebug(tn, "Restarting streams for network reachability change."), await async function __PRIVATE_restartNetwork(e3) {
          const t2 = __PRIVATE_debugCast(e3);
          t2.Ea.add(
            4
            /* OfflineCause.ConnectivityChange */
          ), await __PRIVATE_disableNetworkInternal(t2), t2.Ra.set(
            "Unknown"
            /* OnlineState.Unknown */
          ), t2.Ea.delete(
            4
            /* OfflineCause.ConnectivityChange */
          ), await __PRIVATE_enableNetworkInternal(t2);
        }(this));
      });
    }), this.Ra = new __PRIVATE_OnlineStateTracker(n, r2);
  }
};
async function __PRIVATE_enableNetworkInternal(e) {
  if (__PRIVATE_canUseNetwork(e)) for (const t of e.da) await t(
    /* enabled= */
    true
  );
}
async function __PRIVATE_disableNetworkInternal(e) {
  for (const t of e.da) await t(
    /* enabled= */
    false
  );
}
function __PRIVATE_remoteStoreListen(e, t) {
  const n = __PRIVATE_debugCast(e);
  n.Ia.has(t.targetId) || // Mark this as something the client is currently listening for.
  (n.Ia.set(t.targetId, t), __PRIVATE_shouldStartWatchStream(n) ? (
    // The listen will be sent in onWatchStreamOpen
    __PRIVATE_startWatchStream(n)
  ) : __PRIVATE_ensureWatchStream(n).O_() && __PRIVATE_sendWatchRequest(n, t));
}
function __PRIVATE_remoteStoreUnlisten(e, t) {
  const n = __PRIVATE_debugCast(e), r2 = __PRIVATE_ensureWatchStream(n);
  n.Ia.delete(t), r2.O_() && __PRIVATE_sendUnwatchRequest(n, t), 0 === n.Ia.size && (r2.O_() ? r2.L_() : __PRIVATE_canUseNetwork(n) && // Revert to OnlineState.Unknown if the watch stream is not open and we
  // have no listeners, since without any listens to send we cannot
  // confirm if the stream is healthy and upgrade to OnlineState.Online.
  n.Ra.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function __PRIVATE_sendWatchRequest(e, t) {
  if (e.Va.Ue(t.targetId), t.resumeToken.approximateByteSize() > 0 || t.snapshotVersion.compareTo(SnapshotVersion.min()) > 0) {
    const n = e.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;
    t = t.withExpectedCount(n);
  }
  __PRIVATE_ensureWatchStream(e).Y_(t);
}
function __PRIVATE_sendUnwatchRequest(e, t) {
  e.Va.Ue(t), __PRIVATE_ensureWatchStream(e).Z_(t);
}
function __PRIVATE_startWatchStream(e) {
  e.Va = new __PRIVATE_WatchChangeAggregator({
    getRemoteKeysForTarget: (t) => e.remoteSyncer.getRemoteKeysForTarget(t),
    At: (t) => e.Ia.get(t) || null,
    ht: () => e.datastore.serializer.databaseId
  }), __PRIVATE_ensureWatchStream(e).start(), e.Ra.ua();
}
function __PRIVATE_shouldStartWatchStream(e) {
  return __PRIVATE_canUseNetwork(e) && !__PRIVATE_ensureWatchStream(e).x_() && e.Ia.size > 0;
}
function __PRIVATE_canUseNetwork(e) {
  return 0 === __PRIVATE_debugCast(e).Ea.size;
}
function __PRIVATE_cleanUpWatchStreamState(e) {
  e.Va = void 0;
}
async function __PRIVATE_onWatchStreamConnected(e) {
  e.Ra.set(
    "Online"
    /* OnlineState.Online */
  );
}
async function __PRIVATE_onWatchStreamOpen(e) {
  e.Ia.forEach((t, n) => {
    __PRIVATE_sendWatchRequest(e, t);
  });
}
async function __PRIVATE_onWatchStreamClose(e, t) {
  __PRIVATE_cleanUpWatchStreamState(e), // If we still need the watch stream, retry the connection.
  __PRIVATE_shouldStartWatchStream(e) ? (e.Ra.ha(t), __PRIVATE_startWatchStream(e)) : (
    // No need to restart watch stream because there are no active targets.
    // The online state is set to unknown because there is no active attempt
    // at establishing a connection
    e.Ra.set(
      "Unknown"
      /* OnlineState.Unknown */
    )
  );
}
async function __PRIVATE_onWatchStreamChange(e, t, n) {
  if (
    // Mark the client as online since we got a message from the server
    e.Ra.set(
      "Online"
      /* OnlineState.Online */
    ), t instanceof __PRIVATE_WatchTargetChange && 2 === t.state && t.cause
  )
    try {
      await async function __PRIVATE_handleTargetError(e2, t2) {
        const n2 = t2.cause;
        for (const r2 of t2.targetIds)
          e2.Ia.has(r2) && (await e2.remoteSyncer.rejectListen(r2, n2), e2.Ia.delete(r2), e2.Va.removeTarget(r2));
      }(e, t);
    } catch (n2) {
      __PRIVATE_logDebug(tn, "Failed to remove targets %s: %s ", t.targetIds.join(","), n2), await __PRIVATE_disableNetworkUntilRecovery(e, n2);
    }
  else if (t instanceof __PRIVATE_DocumentWatchChange ? e.Va.Ze(t) : t instanceof __PRIVATE_ExistenceFilterChange ? e.Va.st(t) : e.Va.tt(t), !n.isEqual(SnapshotVersion.min())) try {
    const t2 = await __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e.localStore);
    n.compareTo(t2) >= 0 && // We have received a target change with a global snapshot if the snapshot
    // version is not equal to SnapshotVersion.min().
    /**
    * Takes a batch of changes from the Datastore, repackages them as a
    * RemoteEvent, and passes that on to the listener, which is typically the
    * SyncEngine.
    */
    await function __PRIVATE_raiseWatchSnapshot(e2, t3) {
      const n2 = e2.Va.Tt(t3);
      return n2.targetChanges.forEach((n3, r2) => {
        if (n3.resumeToken.approximateByteSize() > 0) {
          const i = e2.Ia.get(r2);
          i && e2.Ia.set(r2, i.withResumeToken(n3.resumeToken, t3));
        }
      }), // Re-establish listens for the targets that have been invalidated by
      // existence filter mismatches.
      n2.targetMismatches.forEach((t4, n3) => {
        const r2 = e2.Ia.get(t4);
        if (!r2)
          return;
        e2.Ia.set(t4, r2.withResumeToken(ByteString.EMPTY_BYTE_STRING, r2.snapshotVersion)), // Cause a hard reset by unwatching and rewatching immediately, but
        // deliberately don't send a resume token so that we get a full update.
        __PRIVATE_sendUnwatchRequest(e2, t4);
        const i = new TargetData(r2.target, t4, n3, r2.sequenceNumber);
        __PRIVATE_sendWatchRequest(e2, i);
      }), e2.remoteSyncer.applyRemoteEvent(n2);
    }(e, n);
  } catch (t2) {
    __PRIVATE_logDebug(tn, "Failed to raise snapshot:", t2), await __PRIVATE_disableNetworkUntilRecovery(e, t2);
  }
}
async function __PRIVATE_disableNetworkUntilRecovery(e, t, n) {
  if (!__PRIVATE_isIndexedDbTransactionError(t)) throw t;
  e.Ea.add(
    1
    /* OfflineCause.IndexedDbFailed */
  ), // Disable network and raise offline snapshots
  await __PRIVATE_disableNetworkInternal(e), e.Ra.set(
    "Offline"
    /* OnlineState.Offline */
  ), n || // Use a simple read operation to determine if IndexedDB recovered.
  // Ideally, we would expose a health check directly on SimpleDb, but
  // RemoteStore only has access to persistence through LocalStore.
  (n = () => __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e.localStore)), // Probe IndexedDB periodically and re-enable network
  e.asyncQueue.enqueueRetryable(async () => {
    __PRIVATE_logDebug(tn, "Retrying IndexedDB access"), await n(), e.Ea.delete(
      1
      /* OfflineCause.IndexedDbFailed */
    ), await __PRIVATE_enableNetworkInternal(e);
  });
}
function __PRIVATE_executeWithRecovery(e, t) {
  return t().catch((n) => __PRIVATE_disableNetworkUntilRecovery(e, n, t));
}
async function __PRIVATE_fillWritePipeline(e) {
  const t = __PRIVATE_debugCast(e), n = __PRIVATE_ensureWriteStream(t);
  let r2 = t.Ta.length > 0 ? t.Ta[t.Ta.length - 1].batchId : j;
  for (; __PRIVATE_canAddToWritePipeline(t); ) try {
    const e2 = await __PRIVATE_localStoreGetNextMutationBatch(t.localStore, r2);
    if (null === e2) {
      0 === t.Ta.length && n.L_();
      break;
    }
    r2 = e2.batchId, __PRIVATE_addToWritePipeline(t, e2);
  } catch (e2) {
    await __PRIVATE_disableNetworkUntilRecovery(t, e2);
  }
  __PRIVATE_shouldStartWriteStream(t) && __PRIVATE_startWriteStream(t);
}
function __PRIVATE_canAddToWritePipeline(e) {
  return __PRIVATE_canUseNetwork(e) && e.Ta.length < 10;
}
function __PRIVATE_addToWritePipeline(e, t) {
  e.Ta.push(t);
  const n = __PRIVATE_ensureWriteStream(e);
  n.O_() && n.X_ && n.ea(t.mutations);
}
function __PRIVATE_shouldStartWriteStream(e) {
  return __PRIVATE_canUseNetwork(e) && !__PRIVATE_ensureWriteStream(e).x_() && e.Ta.length > 0;
}
function __PRIVATE_startWriteStream(e) {
  __PRIVATE_ensureWriteStream(e).start();
}
async function __PRIVATE_onWriteStreamOpen(e) {
  __PRIVATE_ensureWriteStream(e).ra();
}
async function __PRIVATE_onWriteHandshakeComplete(e) {
  const t = __PRIVATE_ensureWriteStream(e);
  for (const n of e.Ta) t.ea(n.mutations);
}
async function __PRIVATE_onMutationResult(e, t, n) {
  const r2 = e.Ta.shift(), i = MutationBatchResult.from(r2, t, n);
  await __PRIVATE_executeWithRecovery(e, () => e.remoteSyncer.applySuccessfulWrite(i)), // It's possible that with the completion of this mutation another
  // slot has freed up.
  await __PRIVATE_fillWritePipeline(e);
}
async function __PRIVATE_onWriteStreamClose(e, t) {
  t && __PRIVATE_ensureWriteStream(e).X_ && // This error affects the actual write.
  await async function __PRIVATE_handleWriteError(e2, t2) {
    if (function __PRIVATE_isPermanentWriteError(e3) {
      return __PRIVATE_isPermanentError(e3) && e3 !== N.ABORTED;
    }(t2.code)) {
      const n = e2.Ta.shift();
      __PRIVATE_ensureWriteStream(e2).B_(), await __PRIVATE_executeWithRecovery(e2, () => e2.remoteSyncer.rejectFailedWrite(n.batchId, t2)), // It's possible that with the completion of this mutation
      // another slot has freed up.
      await __PRIVATE_fillWritePipeline(e2);
    }
  }(e, t), // The write stream might have been started by refilling the write
  // pipeline for failed writes
  __PRIVATE_shouldStartWriteStream(e) && __PRIVATE_startWriteStream(e);
}
async function __PRIVATE_remoteStoreHandleCredentialChange(e, t) {
  const n = __PRIVATE_debugCast(e);
  n.asyncQueue.verifyOperationInProgress(), __PRIVATE_logDebug(tn, "RemoteStore received new credentials");
  const r2 = __PRIVATE_canUseNetwork(n);
  n.Ea.add(
    3
    /* OfflineCause.CredentialChange */
  ), await __PRIVATE_disableNetworkInternal(n), r2 && // Don't set the network status to Unknown if we are offline.
  n.Ra.set(
    "Unknown"
    /* OnlineState.Unknown */
  ), await n.remoteSyncer.handleCredentialChange(t), n.Ea.delete(
    3
    /* OfflineCause.CredentialChange */
  ), await __PRIVATE_enableNetworkInternal(n);
}
async function __PRIVATE_remoteStoreApplyPrimaryState(e, t) {
  const n = __PRIVATE_debugCast(e);
  t ? (n.Ea.delete(
    2
    /* OfflineCause.IsSecondary */
  ), await __PRIVATE_enableNetworkInternal(n)) : t || (n.Ea.add(
    2
    /* OfflineCause.IsSecondary */
  ), await __PRIVATE_disableNetworkInternal(n), n.Ra.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function __PRIVATE_ensureWatchStream(e) {
  return e.ma || // Create stream (but note that it is not started yet).
  (e.ma = function __PRIVATE_newPersistentWatchStream(e2, t, n) {
    const r2 = __PRIVATE_debugCast(e2);
    return r2.sa(), new __PRIVATE_PersistentListenStream(t, r2.connection, r2.authCredentials, r2.appCheckCredentials, r2.serializer, n);
  }(e.datastore, e.asyncQueue, {
    Xo: __PRIVATE_onWatchStreamConnected.bind(null, e),
    t_: __PRIVATE_onWatchStreamOpen.bind(null, e),
    r_: __PRIVATE_onWatchStreamClose.bind(null, e),
    H_: __PRIVATE_onWatchStreamChange.bind(null, e)
  }), e.da.push(async (t) => {
    t ? (e.ma.B_(), __PRIVATE_shouldStartWatchStream(e) ? __PRIVATE_startWatchStream(e) : e.Ra.set(
      "Unknown"
      /* OnlineState.Unknown */
    )) : (await e.ma.stop(), __PRIVATE_cleanUpWatchStreamState(e));
  })), e.ma;
}
function __PRIVATE_ensureWriteStream(e) {
  return e.fa || // Create stream (but note that it is not started yet).
  (e.fa = function __PRIVATE_newPersistentWriteStream(e2, t, n) {
    const r2 = __PRIVATE_debugCast(e2);
    return r2.sa(), new __PRIVATE_PersistentWriteStream(t, r2.connection, r2.authCredentials, r2.appCheckCredentials, r2.serializer, n);
  }(e.datastore, e.asyncQueue, {
    Xo: () => Promise.resolve(),
    t_: __PRIVATE_onWriteStreamOpen.bind(null, e),
    r_: __PRIVATE_onWriteStreamClose.bind(null, e),
    ta: __PRIVATE_onWriteHandshakeComplete.bind(null, e),
    na: __PRIVATE_onMutationResult.bind(null, e)
  }), e.da.push(async (t) => {
    t ? (e.fa.B_(), // This will start the write stream if necessary.
    await __PRIVATE_fillWritePipeline(e)) : (await e.fa.stop(), e.Ta.length > 0 && (__PRIVATE_logDebug(tn, `Stopping write stream with ${e.Ta.length} pending writes`), e.Ta = []));
  })), e.fa;
}
var DelayedOperation = class _DelayedOperation {
  constructor(e, t, n, r2, i) {
    this.asyncQueue = e, this.timerId = t, this.targetTimeMs = n, this.op = r2, this.removalCallback = i, this.deferred = new __PRIVATE_Deferred(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch((e2) => {
    });
  }
  get promise() {
    return this.deferred.promise;
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(e, t, n, r2, i) {
    const s = Date.now() + n, o = new _DelayedOperation(e, t, s, r2, i);
    return o.start(n), o;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(e) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), e);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(e) {
    null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new FirestoreError(N.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => null !== this.timerHandle ? (this.clearTimeout(), this.op().then((e) => this.deferred.resolve(e))) : Promise.resolve());
  }
  clearTimeout() {
    null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
};
function __PRIVATE_wrapInUserErrorIfRecoverable(e, t) {
  if (__PRIVATE_logError("AsyncQueue", `${t}: ${e}`), __PRIVATE_isIndexedDbTransactionError(e)) return new FirestoreError(N.UNAVAILABLE, `${t}: ${e}`);
  throw e;
}
var DocumentSet = class _DocumentSet {
  /**
   * Returns an empty copy of the existing DocumentSet, using the same
   * comparator.
   */
  static emptySet(e) {
    return new _DocumentSet(e.comparator);
  }
  /** The default ordering is by key if the comparator is omitted */
  constructor(e) {
    this.comparator = e ? (t, n) => e(t, n) || DocumentKey.comparator(t.key, n.key) : (e2, t) => DocumentKey.comparator(e2.key, t.key), this.keyedMap = documentMap(), this.sortedSet = new SortedMap(this.comparator);
  }
  has(e) {
    return null != this.keyedMap.get(e);
  }
  get(e) {
    return this.keyedMap.get(e);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  /**
   * Returns the index of the provided key in the document set, or -1 if the
   * document key is not present in the set;
   */
  indexOf(e) {
    const t = this.keyedMap.get(e);
    return t ? this.sortedSet.indexOf(t) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  /** Iterates documents in order defined by "comparator" */
  forEach(e) {
    this.sortedSet.inorderTraversal((t, n) => (e(t), false));
  }
  /** Inserts or updates a document with the same key */
  add(e) {
    const t = this.delete(e.key);
    return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
  }
  /** Deletes a document with a given key */
  delete(e) {
    const t = this.get(e);
    return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
  }
  isEqual(e) {
    if (!(e instanceof _DocumentSet)) return false;
    if (this.size !== e.size) return false;
    const t = this.sortedSet.getIterator(), n = e.sortedSet.getIterator();
    for (; t.hasNext(); ) {
      const e2 = t.getNext().key, r2 = n.getNext().key;
      if (!e2.isEqual(r2)) return false;
    }
    return true;
  }
  toString() {
    const e = [];
    return this.forEach((t) => {
      e.push(t.toString());
    }), 0 === e.length ? "DocumentSet ()" : "DocumentSet (\n  " + e.join("  \n") + "\n)";
  }
  copy(e, t) {
    const n = new _DocumentSet();
    return n.comparator = this.comparator, n.keyedMap = e, n.sortedSet = t, n;
  }
};
var __PRIVATE_DocumentChangeSet = class {
  constructor() {
    this.ga = new SortedMap(DocumentKey.comparator);
  }
  track(e) {
    const t = e.doc.key, n = this.ga.get(t);
    n ? (
      // Merge the new change with the existing change.
      0 !== e.type && 3 === n.type ? this.ga = this.ga.insert(t, e) : 3 === e.type && 1 !== n.type ? this.ga = this.ga.insert(t, {
        type: n.type,
        doc: e.doc
      }) : 2 === e.type && 2 === n.type ? this.ga = this.ga.insert(t, {
        type: 2,
        doc: e.doc
      }) : 2 === e.type && 0 === n.type ? this.ga = this.ga.insert(t, {
        type: 0,
        doc: e.doc
      }) : 1 === e.type && 0 === n.type ? this.ga = this.ga.remove(t) : 1 === e.type && 2 === n.type ? this.ga = this.ga.insert(t, {
        type: 1,
        doc: n.doc
      }) : 0 === e.type && 1 === n.type ? this.ga = this.ga.insert(t, {
        type: 2,
        doc: e.doc
      }) : (
        // This includes these cases, which don't make sense:
        // Added->Added
        // Removed->Removed
        // Modified->Added
        // Removed->Modified
        // Metadata->Added
        // Removed->Metadata
        fail(63341, {
          Rt: e,
          pa: n
        })
      )
    ) : this.ga = this.ga.insert(t, e);
  }
  ya() {
    const e = [];
    return this.ga.inorderTraversal((t, n) => {
      e.push(n);
    }), e;
  }
};
var ViewSnapshot = class _ViewSnapshot {
  constructor(e, t, n, r2, i, s, o, _, a2) {
    this.query = e, this.docs = t, this.oldDocs = n, this.docChanges = r2, this.mutatedKeys = i, this.fromCache = s, this.syncStateChanged = o, this.excludesMetadataChanges = _, this.hasCachedResults = a2;
  }
  /** Returns a view snapshot as if all documents in the snapshot were added. */
  static fromInitialDocuments(e, t, n, r2, i) {
    const s = [];
    return t.forEach((e2) => {
      s.push({
        type: 0,
        doc: e2
      });
    }), new _ViewSnapshot(
      e,
      t,
      DocumentSet.emptySet(t),
      s,
      n,
      r2,
      /* syncStateChanged= */
      true,
      /* excludesMetadataChanges= */
      false,
      i
    );
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(e) {
    if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && __PRIVATE_queryEquals(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return false;
    const t = this.docChanges, n = e.docChanges;
    if (t.length !== n.length) return false;
    for (let e2 = 0; e2 < t.length; e2++) if (t[e2].type !== n[e2].type || !t[e2].doc.isEqual(n[e2].doc)) return false;
    return true;
  }
};
var __PRIVATE_QueryListenersInfo = class {
  constructor() {
    this.wa = void 0, this.Sa = [];
  }
  // Helper methods that checks if the query has listeners that listening to remote store
  ba() {
    return this.Sa.some((e) => e.Da());
  }
};
var __PRIVATE_EventManagerImpl = class {
  constructor() {
    this.queries = __PRIVATE_newQueriesObjectMap(), this.onlineState = "Unknown", this.Ca = /* @__PURE__ */ new Set();
  }
  terminate() {
    !function __PRIVATE_errorAllTargets(e, t) {
      const n = __PRIVATE_debugCast(e), r2 = n.queries;
      n.queries = __PRIVATE_newQueriesObjectMap(), r2.forEach((e2, n2) => {
        for (const e3 of n2.Sa) e3.onError(t);
      });
    }(this, new FirestoreError(N.ABORTED, "Firestore shutting down"));
  }
};
function __PRIVATE_newQueriesObjectMap() {
  return new ObjectMap((e) => __PRIVATE_canonifyQuery(e), __PRIVATE_queryEquals);
}
async function __PRIVATE_eventManagerListen(e, t) {
  const n = __PRIVATE_debugCast(e);
  let r2 = 3;
  const i = t.query;
  let s = n.queries.get(i);
  s ? !s.ba() && t.Da() && // Query has been listening to local cache, and tries to add a new listener sourced from watch.
  (r2 = 2) : (s = new __PRIVATE_QueryListenersInfo(), r2 = t.Da() ? 0 : 1);
  try {
    switch (r2) {
      case 0:
        s.wa = await n.onListen(
          i,
          /** enableRemoteListen= */
          true
        );
        break;
      case 1:
        s.wa = await n.onListen(
          i,
          /** enableRemoteListen= */
          false
        );
        break;
      case 2:
        await n.onFirstRemoteStoreListen(i);
    }
  } catch (e2) {
    const n2 = __PRIVATE_wrapInUserErrorIfRecoverable(e2, `Initialization of query '${__PRIVATE_stringifyQuery(t.query)}' failed`);
    return void t.onError(n2);
  }
  if (n.queries.set(i, s), s.Sa.push(t), // Run global snapshot listeners if a consistent snapshot has been emitted.
  t.va(n.onlineState), s.wa) {
    t.Fa(s.wa) && __PRIVATE_raiseSnapshotsInSyncEvent(n);
  }
}
async function __PRIVATE_eventManagerUnlisten(e, t) {
  const n = __PRIVATE_debugCast(e), r2 = t.query;
  let i = 3;
  const s = n.queries.get(r2);
  if (s) {
    const e2 = s.Sa.indexOf(t);
    e2 >= 0 && (s.Sa.splice(e2, 1), 0 === s.Sa.length ? i = t.Da() ? 0 : 1 : !s.ba() && t.Da() && // The removed listener is the last one that sourced from watch.
    (i = 2));
  }
  switch (i) {
    case 0:
      return n.queries.delete(r2), n.onUnlisten(
        r2,
        /** disableRemoteListen= */
        true
      );
    case 1:
      return n.queries.delete(r2), n.onUnlisten(
        r2,
        /** disableRemoteListen= */
        false
      );
    case 2:
      return n.onLastRemoteStoreUnlisten(r2);
    default:
      return;
  }
}
function __PRIVATE_eventManagerOnWatchChange(e, t) {
  const n = __PRIVATE_debugCast(e);
  let r2 = false;
  for (const e2 of t) {
    const t2 = e2.query, i = n.queries.get(t2);
    if (i) {
      for (const t3 of i.Sa) t3.Fa(e2) && (r2 = true);
      i.wa = e2;
    }
  }
  r2 && __PRIVATE_raiseSnapshotsInSyncEvent(n);
}
function __PRIVATE_eventManagerOnWatchError(e, t, n) {
  const r2 = __PRIVATE_debugCast(e), i = r2.queries.get(t);
  if (i) for (const e2 of i.Sa) e2.onError(n);
  r2.queries.delete(t);
}
function __PRIVATE_raiseSnapshotsInSyncEvent(e) {
  e.Ca.forEach((e2) => {
    e2.next();
  });
}
var nn;
var rn;
(rn = nn || (nn = {})).Ma = "default", /** Listen to changes in cache only */
rn.Cache = "cache";
var __PRIVATE_QueryListener = class {
  constructor(e, t, n) {
    this.query = e, this.xa = t, /**
     * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
     * observer. This flag is set to true once we've actually raised an event.
     */
    this.Oa = false, this.Na = null, this.onlineState = "Unknown", this.options = n || {};
  }
  /**
   * Applies the new ViewSnapshot to this listener, raising a user-facing event
   * if applicable (depending on what changed, whether the user has opted into
   * metadata-only changes, etc.). Returns true if a user-facing event was
   * indeed raised.
   */
  Fa(e) {
    if (!this.options.includeMetadataChanges) {
      const t2 = [];
      for (const n of e.docChanges) 3 !== n.type && t2.push(n);
      e = new ViewSnapshot(
        e.query,
        e.docs,
        e.oldDocs,
        t2,
        e.mutatedKeys,
        e.fromCache,
        e.syncStateChanged,
        /* excludesMetadataChanges= */
        true,
        e.hasCachedResults
      );
    }
    let t = false;
    return this.Oa ? this.Ba(e) && (this.xa.next(e), t = true) : this.La(e, this.onlineState) && (this.ka(e), t = true), this.Na = e, t;
  }
  onError(e) {
    this.xa.error(e);
  }
  /** Returns whether a snapshot was raised. */
  va(e) {
    this.onlineState = e;
    let t = false;
    return this.Na && !this.Oa && this.La(this.Na, e) && (this.ka(this.Na), t = true), t;
  }
  La(e, t) {
    if (!e.fromCache) return true;
    if (!this.Da()) return true;
    const n = "Offline" !== t;
    return (!this.options.qa || !n) && (!e.docs.isEmpty() || e.hasCachedResults || "Offline" === t);
  }
  Ba(e) {
    if (e.docChanges.length > 0) return true;
    const t = this.Na && this.Na.hasPendingWrites !== e.hasPendingWrites;
    return !(!e.syncStateChanged && !t) && true === this.options.includeMetadataChanges;
  }
  ka(e) {
    e = ViewSnapshot.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), this.Oa = true, this.xa.next(e);
  }
  Da() {
    return this.options.source !== nn.Cache;
  }
};
var __PRIVATE_AddedLimboDocument = class {
  constructor(e) {
    this.key = e;
  }
};
var __PRIVATE_RemovedLimboDocument = class {
  constructor(e) {
    this.key = e;
  }
};
var __PRIVATE_View = class {
  constructor(e, t) {
    this.query = e, this.Ya = t, this.Za = null, this.hasCachedResults = false, /**
     * A flag whether the view is current with the backend. A view is considered
     * current after it has seen the current flag from the backend and did not
     * lose consistency within the watch stream (e.g. because of an existence
     * filter mismatch).
     */
    this.current = false, /** Documents in the view but not in the remote target */
    this.Xa = __PRIVATE_documentKeySet(), /** Document Keys that have local changes */
    this.mutatedKeys = __PRIVATE_documentKeySet(), this.eu = __PRIVATE_newQueryComparator(e), this.tu = new DocumentSet(this.eu);
  }
  /**
   * The set of remote documents that the server has told us belongs to the target associated with
   * this view.
   */
  get nu() {
    return this.Ya;
  }
  /**
   * Iterates over a set of doc changes, applies the query limit, and computes
   * what the new results should be, what the changes were, and whether we may
   * need to go back to the local cache for more results. Does not make any
   * changes to the view.
   * @param docChanges - The doc changes to apply to this view.
   * @param previousChanges - If this is being called with a refill, then start
   *        with this set of docs and changes instead of the current view.
   * @returns a new set of docs, changes, and refill flag.
   */
  ru(e, t) {
    const n = t ? t.iu : new __PRIVATE_DocumentChangeSet(), r2 = t ? t.tu : this.tu;
    let i = t ? t.mutatedKeys : this.mutatedKeys, s = r2, o = false;
    const _ = "F" === this.query.limitType && r2.size === this.query.limit ? r2.last() : null, a2 = "L" === this.query.limitType && r2.size === this.query.limit ? r2.first() : null;
    if (e.inorderTraversal((e2, t2) => {
      const u = r2.get(e2), c2 = __PRIVATE_queryMatches(this.query, t2) ? t2 : null, l = !!u && this.mutatedKeys.has(u.key), h = !!c2 && (c2.hasLocalMutations || // We only consider committed mutations for documents that were
      // mutated during the lifetime of the view.
      this.mutatedKeys.has(c2.key) && c2.hasCommittedMutations);
      let P = false;
      if (u && c2) {
        u.data.isEqual(c2.data) ? l !== h && (n.track({
          type: 3,
          doc: c2
        }), P = true) : this.su(u, c2) || (n.track({
          type: 2,
          doc: c2
        }), P = true, (_ && this.eu(c2, _) > 0 || a2 && this.eu(c2, a2) < 0) && // This doc moved from inside the limit to outside the limit.
        // That means there may be some other doc in the local cache
        // that should be included instead.
        (o = true));
      } else !u && c2 ? (n.track({
        type: 0,
        doc: c2
      }), P = true) : u && !c2 && (n.track({
        type: 1,
        doc: u
      }), P = true, (_ || a2) && // A doc was removed from a full limit query. We'll need to
      // requery from the local cache to see if we know about some other
      // doc that should be in the results.
      (o = true));
      P && (c2 ? (s = s.add(c2), i = h ? i.add(e2) : i.delete(e2)) : (s = s.delete(e2), i = i.delete(e2)));
    }), null !== this.query.limit) for (; s.size > this.query.limit; ) {
      const e2 = "F" === this.query.limitType ? s.last() : s.first();
      s = s.delete(e2.key), i = i.delete(e2.key), n.track({
        type: 1,
        doc: e2
      });
    }
    return {
      tu: s,
      iu: n,
      Cs: o,
      mutatedKeys: i
    };
  }
  su(e, t) {
    return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
  }
  /**
   * Updates the view with the given ViewDocumentChanges and optionally updates
   * limbo docs and sync state from the provided target change.
   * @param docChanges - The set of changes to make to the view's docs.
   * @param limboResolutionEnabled - Whether to update limbo documents based on
   *        this change.
   * @param targetChange - A target change to apply for computing limbo docs and
   *        sync state.
   * @param targetIsPendingReset - Whether the target is pending to reset due to
   *        existence filter mismatch. If not explicitly specified, it is treated
   *        equivalently to `false`.
   * @returns A new ViewChange with the given docs, changes, and sync state.
   */
  // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
  applyChanges(e, t, n, r2) {
    const i = this.tu;
    this.tu = e.tu, this.mutatedKeys = e.mutatedKeys;
    const s = e.iu.ya();
    s.sort((e2, t2) => function __PRIVATE_compareChangeType(e3, t3) {
      const order = (e4) => {
        switch (e4) {
          case 0:
            return 1;
          case 2:
          case 3:
            return 2;
          case 1:
            return 0;
          default:
            return fail(20277, {
              Rt: e4
            });
        }
      };
      return order(e3) - order(t3);
    }(e2.type, t2.type) || this.eu(e2.doc, t2.doc)), this.ou(n), r2 = r2 ?? false;
    const o = t && !r2 ? this._u() : [], _ = 0 === this.Xa.size && this.current && !r2 ? 1 : 0, a2 = _ !== this.Za;
    if (this.Za = _, 0 !== s.length || a2) {
      return {
        snapshot: new ViewSnapshot(
          this.query,
          e.tu,
          i,
          s,
          e.mutatedKeys,
          0 === _,
          a2,
          /* excludesMetadataChanges= */
          false,
          !!n && n.resumeToken.approximateByteSize() > 0
        ),
        au: o
      };
    }
    return {
      au: o
    };
  }
  /**
   * Applies an OnlineState change to the view, potentially generating a
   * ViewChange if the view's syncState changes as a result.
   */
  va(e) {
    return this.current && "Offline" === e ? (
      // If we're offline, set `current` to false and then call applyChanges()
      // to refresh our syncState and generate a ViewChange as appropriate. We
      // are guaranteed to get a new TargetChange that sets `current` back to
      // true once the client is back online.
      (this.current = false, this.applyChanges(
        {
          tu: this.tu,
          iu: new __PRIVATE_DocumentChangeSet(),
          mutatedKeys: this.mutatedKeys,
          Cs: false
        },
        /* limboResolutionEnabled= */
        false
      ))
    ) : {
      au: []
    };
  }
  /**
   * Returns whether the doc for the given key should be in limbo.
   */
  uu(e) {
    return !this.Ya.has(e) && // The local store doesn't think it's a result, so it shouldn't be in limbo.
    (!!this.tu.has(e) && !this.tu.get(e).hasLocalMutations);
  }
  /**
   * Updates syncedDocuments, current, and limbo docs based on the given change.
   * Returns the list of changes to which docs are in limbo.
   */
  ou(e) {
    e && (e.addedDocuments.forEach((e2) => this.Ya = this.Ya.add(e2)), e.modifiedDocuments.forEach((e2) => {
    }), e.removedDocuments.forEach((e2) => this.Ya = this.Ya.delete(e2)), this.current = e.current);
  }
  _u() {
    if (!this.current) return [];
    const e = this.Xa;
    this.Xa = __PRIVATE_documentKeySet(), this.tu.forEach((e2) => {
      this.uu(e2.key) && (this.Xa = this.Xa.add(e2.key));
    });
    const t = [];
    return e.forEach((e2) => {
      this.Xa.has(e2) || t.push(new __PRIVATE_RemovedLimboDocument(e2));
    }), this.Xa.forEach((n) => {
      e.has(n) || t.push(new __PRIVATE_AddedLimboDocument(n));
    }), t;
  }
  /**
   * Update the in-memory state of the current view with the state read from
   * persistence.
   *
   * We update the query view whenever a client's primary status changes:
   * - When a client transitions from primary to secondary, it can miss
   *   LocalStorage updates and its query views may temporarily not be
   *   synchronized with the state on disk.
   * - For secondary to primary transitions, the client needs to update the list
   *   of `syncedDocuments` since secondary clients update their query views
   *   based purely on synthesized RemoteEvents.
   *
   * @param queryResult.documents - The documents that match the query according
   * to the LocalStore.
   * @param queryResult.remoteKeys - The keys of the documents that match the
   * query according to the backend.
   *
   * @returns The ViewChange that resulted from this synchronization.
   */
  // PORTING NOTE: Multi-tab only.
  cu(e) {
    this.Ya = e.Qs, this.Xa = __PRIVATE_documentKeySet();
    const t = this.ru(e.documents);
    return this.applyChanges(
      t,
      /* limboResolutionEnabled= */
      true
    );
  }
  /**
   * Returns a view snapshot as if this query was just listened to. Contains
   * a document add for every existing document and the `fromCache` and
   * `hasPendingWrites` status of the already established view.
   */
  // PORTING NOTE: Multi-tab only.
  lu() {
    return ViewSnapshot.fromInitialDocuments(this.query, this.tu, this.mutatedKeys, 0 === this.Za, this.hasCachedResults);
  }
};
var sn = "SyncEngine";
var __PRIVATE_QueryView = class {
  constructor(e, t, n) {
    this.query = e, this.targetId = t, this.view = n;
  }
};
var LimboResolution = class {
  constructor(e) {
    this.key = e, /**
     * Set to true once we've received a document. This is used in
     * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
     * decide whether it needs to manufacture a delete event for the target once
     * the target is CURRENT.
     */
    this.hu = false;
  }
};
var __PRIVATE_SyncEngineImpl = class {
  constructor(e, t, n, r2, i, s) {
    this.localStore = e, this.remoteStore = t, this.eventManager = n, this.sharedClientState = r2, this.currentUser = i, this.maxConcurrentLimboResolutions = s, this.Pu = {}, this.Tu = new ObjectMap((e2) => __PRIVATE_canonifyQuery(e2), __PRIVATE_queryEquals), this.Iu = /* @__PURE__ */ new Map(), /**
     * The keys of documents that are in limbo for which we haven't yet started a
     * limbo resolution query. The strings in this set are the result of calling
     * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
     *
     * The `Set` type was chosen because it provides efficient lookup and removal
     * of arbitrary elements and it also maintains insertion order, providing the
     * desired queue-like FIFO semantics.
     */
    this.Eu = /* @__PURE__ */ new Set(), /**
     * Keeps track of the target ID for each document that is in limbo with an
     * active target.
     */
    this.du = new SortedMap(DocumentKey.comparator), /**
     * Keeps track of the information about an active limbo resolution for each
     * active target ID that was started for the purpose of limbo resolution.
     */
    this.Au = /* @__PURE__ */ new Map(), this.Ru = new __PRIVATE_ReferenceSet(), /** Stores user completion handlers, indexed by User and BatchId. */
    this.Vu = {}, /** Stores user callbacks waiting for all pending writes to be acknowledged. */
    this.mu = /* @__PURE__ */ new Map(), this.fu = __PRIVATE_TargetIdGenerator.cr(), this.onlineState = "Unknown", // The primary state is set to `true` or `false` immediately after Firestore
    // startup. In the interim, a client should only be considered primary if
    // `isPrimary` is true.
    this.gu = void 0;
  }
  get isPrimaryClient() {
    return true === this.gu;
  }
};
async function __PRIVATE_syncEngineListen(e, t, n = true) {
  const r2 = __PRIVATE_ensureWatchCallbacks(e);
  let i;
  const s = r2.Tu.get(t);
  return s ? (
    // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
    // already exists when EventManager calls us for the first time. This
    // happens when the primary tab is already listening to this query on
    // behalf of another tab and the user of the primary also starts listening
    // to the query. EventManager will not have an assigned target ID in this
    // case and calls `listen` to obtain this ID.
    (r2.sharedClientState.addLocalQueryTarget(s.targetId), i = s.view.lu())
  ) : i = await __PRIVATE_allocateTargetAndMaybeListen(
    r2,
    t,
    n,
    /** shouldInitializeView= */
    true
  ), i;
}
async function __PRIVATE_triggerRemoteStoreListen(e, t) {
  const n = __PRIVATE_ensureWatchCallbacks(e);
  await __PRIVATE_allocateTargetAndMaybeListen(
    n,
    t,
    /** shouldListenToRemote= */
    true,
    /** shouldInitializeView= */
    false
  );
}
async function __PRIVATE_allocateTargetAndMaybeListen(e, t, n, r2) {
  const i = await __PRIVATE_localStoreAllocateTarget(e.localStore, __PRIVATE_queryToTarget(t)), s = i.targetId, o = e.sharedClientState.addLocalQueryTarget(s, n);
  let _;
  return r2 && (_ = await __PRIVATE_initializeViewAndComputeSnapshot(e, t, s, "current" === o, i.resumeToken)), e.isPrimaryClient && n && __PRIVATE_remoteStoreListen(e.remoteStore, i), _;
}
async function __PRIVATE_initializeViewAndComputeSnapshot(e, t, n, r2, i) {
  e.pu = (t2, n2, r3) => async function __PRIVATE_applyDocChanges(e2, t3, n3, r4) {
    let i2 = t3.view.ru(n3);
    i2.Cs && // The query has a limit and some docs were removed, so we need
    // to re-run the query against the local store to make sure we
    // didn't lose any good docs that had been past the limit.
    (i2 = await __PRIVATE_localStoreExecuteQuery(
      e2.localStore,
      t3.query,
      /* usePreviousResults= */
      false
    ).then(({ documents: e3 }) => t3.view.ru(e3, i2)));
    const s2 = r4 && r4.targetChanges.get(t3.targetId), o2 = r4 && null != r4.targetMismatches.get(t3.targetId), _2 = t3.view.applyChanges(
      i2,
      /* limboResolutionEnabled= */
      e2.isPrimaryClient,
      s2,
      o2
    );
    return __PRIVATE_updateTrackedLimbos(e2, t3.targetId, _2.au), _2.snapshot;
  }(e, t2, n2, r3);
  const s = await __PRIVATE_localStoreExecuteQuery(
    e.localStore,
    t,
    /* usePreviousResults= */
    true
  ), o = new __PRIVATE_View(t, s.Qs), _ = o.ru(s.documents), a2 = TargetChange.createSynthesizedTargetChangeForCurrentChange(n, r2 && "Offline" !== e.onlineState, i), u = o.applyChanges(
    _,
    /* limboResolutionEnabled= */
    e.isPrimaryClient,
    a2
  );
  __PRIVATE_updateTrackedLimbos(e, n, u.au);
  const c2 = new __PRIVATE_QueryView(t, n, o);
  return e.Tu.set(t, c2), e.Iu.has(n) ? e.Iu.get(n).push(t) : e.Iu.set(n, [t]), u.snapshot;
}
async function __PRIVATE_syncEngineUnlisten(e, t, n) {
  const r2 = __PRIVATE_debugCast(e), i = r2.Tu.get(t), s = r2.Iu.get(i.targetId);
  if (s.length > 1) return r2.Iu.set(i.targetId, s.filter((e2) => !__PRIVATE_queryEquals(e2, t))), void r2.Tu.delete(t);
  if (r2.isPrimaryClient) {
    r2.sharedClientState.removeLocalQueryTarget(i.targetId);
    r2.sharedClientState.isActiveQueryTarget(i.targetId) || await __PRIVATE_localStoreReleaseTarget(
      r2.localStore,
      i.targetId,
      /*keepPersistedTargetData=*/
      false
    ).then(() => {
      r2.sharedClientState.clearQueryState(i.targetId), n && __PRIVATE_remoteStoreUnlisten(r2.remoteStore, i.targetId), __PRIVATE_removeAndCleanupTarget(r2, i.targetId);
    }).catch(__PRIVATE_ignoreIfPrimaryLeaseLoss);
  } else __PRIVATE_removeAndCleanupTarget(r2, i.targetId), await __PRIVATE_localStoreReleaseTarget(
    r2.localStore,
    i.targetId,
    /*keepPersistedTargetData=*/
    true
  );
}
async function __PRIVATE_triggerRemoteStoreUnlisten(e, t) {
  const n = __PRIVATE_debugCast(e), r2 = n.Tu.get(t), i = n.Iu.get(r2.targetId);
  n.isPrimaryClient && 1 === i.length && // PORTING NOTE: Unregister the target ID with local Firestore client as
  // watch target.
  (n.sharedClientState.removeLocalQueryTarget(r2.targetId), __PRIVATE_remoteStoreUnlisten(n.remoteStore, r2.targetId));
}
async function __PRIVATE_syncEngineWrite(e, t, n) {
  const r2 = __PRIVATE_syncEngineEnsureWriteCallbacks(e);
  try {
    const e2 = await function __PRIVATE_localStoreWriteLocally(e3, t2) {
      const n2 = __PRIVATE_debugCast(e3), r3 = Timestamp.now(), i = t2.reduce((e4, t3) => e4.add(t3.key), __PRIVATE_documentKeySet());
      let s, o;
      return n2.persistence.runTransaction("Locally write mutations", "readwrite", (e4) => {
        let _ = __PRIVATE_mutableDocumentMap(), a2 = __PRIVATE_documentKeySet();
        return n2.Ns.getEntries(e4, i).next((e5) => {
          _ = e5, _.forEach((e6, t3) => {
            t3.isValidDocument() || (a2 = a2.add(e6));
          });
        }).next(() => n2.localDocuments.getOverlayedDocuments(e4, _)).next((i2) => {
          s = i2;
          const o2 = [];
          for (const e5 of t2) {
            const t3 = __PRIVATE_mutationExtractBaseValue(e5, s.get(e5.key).overlayedDocument);
            null != t3 && // NOTE: The base state should only be applied if there's some
            // existing document to override, so use a Precondition of
            // exists=true
            o2.push(new __PRIVATE_PatchMutation(e5.key, t3, __PRIVATE_extractFieldMask(t3.value.mapValue), Precondition.exists(true)));
          }
          return n2.mutationQueue.addMutationBatch(e4, r3, o2, t2);
        }).next((t3) => {
          o = t3;
          const r4 = t3.applyToLocalDocumentSet(s, a2);
          return n2.documentOverlayCache.saveOverlays(e4, t3.batchId, r4);
        });
      }).then(() => ({
        batchId: o.batchId,
        changes: __PRIVATE_convertOverlayedDocumentMapToDocumentMap(s)
      }));
    }(r2.localStore, t);
    r2.sharedClientState.addPendingMutation(e2.batchId), function __PRIVATE_addMutationCallback(e3, t2, n2) {
      let r3 = e3.Vu[e3.currentUser.toKey()];
      r3 || (r3 = new SortedMap(__PRIVATE_primitiveComparator));
      r3 = r3.insert(t2, n2), e3.Vu[e3.currentUser.toKey()] = r3;
    }(r2, e2.batchId, n), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(r2, e2.changes), await __PRIVATE_fillWritePipeline(r2.remoteStore);
  } catch (e2) {
    const t2 = __PRIVATE_wrapInUserErrorIfRecoverable(e2, "Failed to persist write");
    n.reject(t2);
  }
}
async function __PRIVATE_syncEngineApplyRemoteEvent(e, t) {
  const n = __PRIVATE_debugCast(e);
  try {
    const e2 = await __PRIVATE_localStoreApplyRemoteEventToLocalCache(n.localStore, t);
    t.targetChanges.forEach((e3, t2) => {
      const r2 = n.Au.get(t2);
      r2 && // Since this is a limbo resolution lookup, it's for a single document
      // and it could be added, modified, or removed, but not a combination.
      (__PRIVATE_hardAssert(e3.addedDocuments.size + e3.modifiedDocuments.size + e3.removedDocuments.size <= 1, 22616), e3.addedDocuments.size > 0 ? r2.hu = true : e3.modifiedDocuments.size > 0 ? __PRIVATE_hardAssert(r2.hu, 14607) : e3.removedDocuments.size > 0 && (__PRIVATE_hardAssert(r2.hu, 42227), r2.hu = false));
    }), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(n, e2, t);
  } catch (e2) {
    await __PRIVATE_ignoreIfPrimaryLeaseLoss(e2);
  }
}
function __PRIVATE_syncEngineApplyOnlineStateChange(e, t, n) {
  const r2 = __PRIVATE_debugCast(e);
  if (r2.isPrimaryClient && 0 === n || !r2.isPrimaryClient && 1 === n) {
    const e2 = [];
    r2.Tu.forEach((n2, r3) => {
      const i = r3.view.va(t);
      i.snapshot && e2.push(i.snapshot);
    }), function __PRIVATE_eventManagerOnOnlineStateChange(e3, t2) {
      const n2 = __PRIVATE_debugCast(e3);
      n2.onlineState = t2;
      let r3 = false;
      n2.queries.forEach((e4, n3) => {
        for (const e5 of n3.Sa)
          e5.va(t2) && (r3 = true);
      }), r3 && __PRIVATE_raiseSnapshotsInSyncEvent(n2);
    }(r2.eventManager, t), e2.length && r2.Pu.H_(e2), r2.onlineState = t, r2.isPrimaryClient && r2.sharedClientState.setOnlineState(t);
  }
}
async function __PRIVATE_syncEngineRejectListen(e, t, n) {
  const r2 = __PRIVATE_debugCast(e);
  r2.sharedClientState.updateQueryState(t, "rejected", n);
  const i = r2.Au.get(t), s = i && i.key;
  if (s) {
    let e2 = new SortedMap(DocumentKey.comparator);
    e2 = e2.insert(s, MutableDocument.newNoDocument(s, SnapshotVersion.min()));
    const n2 = __PRIVATE_documentKeySet().add(s), i2 = new RemoteEvent(
      SnapshotVersion.min(),
      /* targetChanges= */
      /* @__PURE__ */ new Map(),
      /* targetMismatches= */
      new SortedMap(__PRIVATE_primitiveComparator),
      e2,
      n2
    );
    await __PRIVATE_syncEngineApplyRemoteEvent(r2, i2), // Since this query failed, we won't want to manually unlisten to it.
    // We only remove it from bookkeeping after we successfully applied the
    // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
    // this query when the RemoteStore restarts the Watch stream, which should
    // re-trigger the target failure.
    r2.du = r2.du.remove(s), r2.Au.delete(t), __PRIVATE_pumpEnqueuedLimboResolutions(r2);
  } else await __PRIVATE_localStoreReleaseTarget(
    r2.localStore,
    t,
    /* keepPersistedTargetData */
    false
  ).then(() => __PRIVATE_removeAndCleanupTarget(r2, t, n)).catch(__PRIVATE_ignoreIfPrimaryLeaseLoss);
}
async function __PRIVATE_syncEngineApplySuccessfulWrite(e, t) {
  const n = __PRIVATE_debugCast(e), r2 = t.batch.batchId;
  try {
    const e2 = await __PRIVATE_localStoreAcknowledgeBatch(n.localStore, t);
    __PRIVATE_processUserCallback(
      n,
      r2,
      /*error=*/
      null
    ), __PRIVATE_triggerPendingWritesCallbacks(n, r2), n.sharedClientState.updateMutationState(r2, "acknowledged"), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(n, e2);
  } catch (e2) {
    await __PRIVATE_ignoreIfPrimaryLeaseLoss(e2);
  }
}
async function __PRIVATE_syncEngineRejectFailedWrite(e, t, n) {
  const r2 = __PRIVATE_debugCast(e);
  try {
    const e2 = await function __PRIVATE_localStoreRejectBatch(e3, t2) {
      const n2 = __PRIVATE_debugCast(e3);
      return n2.persistence.runTransaction("Reject batch", "readwrite-primary", (e4) => {
        let r3;
        return n2.mutationQueue.lookupMutationBatch(e4, t2).next((t3) => (__PRIVATE_hardAssert(null !== t3, 37113), r3 = t3.keys(), n2.mutationQueue.removeMutationBatch(e4, t3))).next(() => n2.mutationQueue.performConsistencyCheck(e4)).next(() => n2.documentOverlayCache.removeOverlaysForBatchId(e4, r3, t2)).next(() => n2.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e4, r3)).next(() => n2.localDocuments.getDocuments(e4, r3));
      });
    }(r2.localStore, t);
    __PRIVATE_processUserCallback(r2, t, n), __PRIVATE_triggerPendingWritesCallbacks(r2, t), r2.sharedClientState.updateMutationState(t, "rejected", n), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(r2, e2);
  } catch (n2) {
    await __PRIVATE_ignoreIfPrimaryLeaseLoss(n2);
  }
}
function __PRIVATE_triggerPendingWritesCallbacks(e, t) {
  (e.mu.get(t) || []).forEach((e2) => {
    e2.resolve();
  }), e.mu.delete(t);
}
function __PRIVATE_processUserCallback(e, t, n) {
  const r2 = __PRIVATE_debugCast(e);
  let i = r2.Vu[r2.currentUser.toKey()];
  if (i) {
    const e2 = i.get(t);
    e2 && (n ? e2.reject(n) : e2.resolve(), i = i.remove(t)), r2.Vu[r2.currentUser.toKey()] = i;
  }
}
function __PRIVATE_removeAndCleanupTarget(e, t, n = null) {
  e.sharedClientState.removeLocalQueryTarget(t);
  for (const r2 of e.Iu.get(t)) e.Tu.delete(r2), n && e.Pu.yu(r2, n);
  if (e.Iu.delete(t), e.isPrimaryClient) {
    e.Ru.jr(t).forEach((t2) => {
      e.Ru.containsKey(t2) || // We removed the last reference for this key
      __PRIVATE_removeLimboTarget(e, t2);
    });
  }
}
function __PRIVATE_removeLimboTarget(e, t) {
  e.Eu.delete(t.path.canonicalString());
  const n = e.du.get(t);
  null !== n && (__PRIVATE_remoteStoreUnlisten(e.remoteStore, n), e.du = e.du.remove(t), e.Au.delete(n), __PRIVATE_pumpEnqueuedLimboResolutions(e));
}
function __PRIVATE_updateTrackedLimbos(e, t, n) {
  for (const r2 of n) if (r2 instanceof __PRIVATE_AddedLimboDocument) e.Ru.addReference(r2.key, t), __PRIVATE_trackLimboChange(e, r2);
  else if (r2 instanceof __PRIVATE_RemovedLimboDocument) {
    __PRIVATE_logDebug(sn, "Document no longer in limbo: " + r2.key), e.Ru.removeReference(r2.key, t);
    e.Ru.containsKey(r2.key) || // We removed the last reference for this key
    __PRIVATE_removeLimboTarget(e, r2.key);
  } else fail(19791, {
    wu: r2
  });
}
function __PRIVATE_trackLimboChange(e, t) {
  const n = t.key, r2 = n.path.canonicalString();
  e.du.get(n) || e.Eu.has(r2) || (__PRIVATE_logDebug(sn, "New document in limbo: " + n), e.Eu.add(r2), __PRIVATE_pumpEnqueuedLimboResolutions(e));
}
function __PRIVATE_pumpEnqueuedLimboResolutions(e) {
  for (; e.Eu.size > 0 && e.du.size < e.maxConcurrentLimboResolutions; ) {
    const t = e.Eu.values().next().value;
    e.Eu.delete(t);
    const n = new DocumentKey(ResourcePath.fromString(t)), r2 = e.fu.next();
    e.Au.set(r2, new LimboResolution(n)), e.du = e.du.insert(n, r2), __PRIVATE_remoteStoreListen(e.remoteStore, new TargetData(__PRIVATE_queryToTarget(__PRIVATE_newQueryForPath(n.path)), r2, "TargetPurposeLimboResolution", __PRIVATE_ListenSequence.ce));
  }
}
async function __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(e, t, n) {
  const r2 = __PRIVATE_debugCast(e), i = [], s = [], o = [];
  r2.Tu.isEmpty() || (r2.Tu.forEach((e2, _) => {
    o.push(r2.pu(_, t, n).then((e3) => {
      if ((e3 || n) && r2.isPrimaryClient) {
        const t2 = e3 ? !e3.fromCache : n?.targetChanges.get(_.targetId)?.current;
        r2.sharedClientState.updateQueryState(_.targetId, t2 ? "current" : "not-current");
      }
      if (e3) {
        i.push(e3);
        const t2 = __PRIVATE_LocalViewChanges.As(_.targetId, e3);
        s.push(t2);
      }
    }));
  }), await Promise.all(o), r2.Pu.H_(i), await async function __PRIVATE_localStoreNotifyLocalViewChanges(e2, t2) {
    const n2 = __PRIVATE_debugCast(e2);
    try {
      await n2.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (e3) => PersistencePromise.forEach(t2, (t3) => PersistencePromise.forEach(t3.Es, (r3) => n2.persistence.referenceDelegate.addReference(e3, t3.targetId, r3)).next(() => PersistencePromise.forEach(t3.ds, (r3) => n2.persistence.referenceDelegate.removeReference(e3, t3.targetId, r3)))));
    } catch (e3) {
      if (!__PRIVATE_isIndexedDbTransactionError(e3)) throw e3;
      __PRIVATE_logDebug(Ut, "Failed to update sequence numbers: " + e3);
    }
    for (const e3 of t2) {
      const t3 = e3.targetId;
      if (!e3.fromCache) {
        const e4 = n2.Ms.get(t3), r3 = e4.snapshotVersion, i2 = e4.withLastLimboFreeSnapshotVersion(r3);
        n2.Ms = n2.Ms.insert(t3, i2);
      }
    }
  }(r2.localStore, s));
}
async function __PRIVATE_syncEngineHandleCredentialChange(e, t) {
  const n = __PRIVATE_debugCast(e);
  if (!n.currentUser.isEqual(t)) {
    __PRIVATE_logDebug(sn, "User change. New user:", t.toKey());
    const e2 = await __PRIVATE_localStoreHandleUserChange(n.localStore, t);
    n.currentUser = t, // Fails tasks waiting for pending writes requested by previous user.
    function __PRIVATE_rejectOutstandingPendingWritesCallbacks(e3, t2) {
      e3.mu.forEach((e4) => {
        e4.forEach((e5) => {
          e5.reject(new FirestoreError(N.CANCELLED, t2));
        });
      }), e3.mu.clear();
    }(n, "'waitForPendingWrites' promise is rejected due to a user change."), // TODO(b/114226417): Consider calling this only in the primary tab.
    n.sharedClientState.handleUserChange(t, e2.removedBatchIds, e2.addedBatchIds), await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(n, e2.Ls);
  }
}
function __PRIVATE_syncEngineGetRemoteKeysForTarget(e, t) {
  const n = __PRIVATE_debugCast(e), r2 = n.Au.get(t);
  if (r2 && r2.hu) return __PRIVATE_documentKeySet().add(r2.key);
  {
    let e2 = __PRIVATE_documentKeySet();
    const r3 = n.Iu.get(t);
    if (!r3) return e2;
    for (const t2 of r3) {
      const r4 = n.Tu.get(t2);
      e2 = e2.unionWith(r4.view.nu);
    }
    return e2;
  }
}
function __PRIVATE_ensureWatchCallbacks(e) {
  const t = __PRIVATE_debugCast(e);
  return t.remoteStore.remoteSyncer.applyRemoteEvent = __PRIVATE_syncEngineApplyRemoteEvent.bind(null, t), t.remoteStore.remoteSyncer.getRemoteKeysForTarget = __PRIVATE_syncEngineGetRemoteKeysForTarget.bind(null, t), t.remoteStore.remoteSyncer.rejectListen = __PRIVATE_syncEngineRejectListen.bind(null, t), t.Pu.H_ = __PRIVATE_eventManagerOnWatchChange.bind(null, t.eventManager), t.Pu.yu = __PRIVATE_eventManagerOnWatchError.bind(null, t.eventManager), t;
}
function __PRIVATE_syncEngineEnsureWriteCallbacks(e) {
  const t = __PRIVATE_debugCast(e);
  return t.remoteStore.remoteSyncer.applySuccessfulWrite = __PRIVATE_syncEngineApplySuccessfulWrite.bind(null, t), t.remoteStore.remoteSyncer.rejectFailedWrite = __PRIVATE_syncEngineRejectFailedWrite.bind(null, t), t;
}
var __PRIVATE_MemoryOfflineComponentProvider = class {
  constructor() {
    this.kind = "memory", this.synchronizeTabs = false;
  }
  async initialize(e) {
    this.serializer = __PRIVATE_newSerializer(e.databaseInfo.databaseId), this.sharedClientState = this.Du(e), this.persistence = this.Cu(e), await this.persistence.start(), this.localStore = this.vu(e), this.gcScheduler = this.Fu(e, this.localStore), this.indexBackfillerScheduler = this.Mu(e, this.localStore);
  }
  Fu(e, t) {
    return null;
  }
  Mu(e, t) {
    return null;
  }
  vu(e) {
    return __PRIVATE_newLocalStore(this.persistence, new __PRIVATE_QueryEngine(), e.initialUser, this.serializer);
  }
  Cu(e) {
    return new __PRIVATE_MemoryPersistence(__PRIVATE_MemoryEagerDelegate.mi, this.serializer);
  }
  Du(e) {
    return new __PRIVATE_MemorySharedClientState();
  }
  async terminate() {
    this.gcScheduler?.stop(), this.indexBackfillerScheduler?.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
};
__PRIVATE_MemoryOfflineComponentProvider.provider = {
  build: () => new __PRIVATE_MemoryOfflineComponentProvider()
};
var __PRIVATE_LruGcMemoryOfflineComponentProvider = class extends __PRIVATE_MemoryOfflineComponentProvider {
  constructor(e) {
    super(), this.cacheSizeBytes = e;
  }
  Fu(e, t) {
    __PRIVATE_hardAssert(this.persistence.referenceDelegate instanceof __PRIVATE_MemoryLruDelegate, 46915);
    const n = this.persistence.referenceDelegate.garbageCollector;
    return new __PRIVATE_LruScheduler(n, e.asyncQueue, t);
  }
  Cu(e) {
    const t = void 0 !== this.cacheSizeBytes ? LruParams.withCacheSize(this.cacheSizeBytes) : LruParams.DEFAULT;
    return new __PRIVATE_MemoryPersistence((e2) => __PRIVATE_MemoryLruDelegate.mi(e2, t), this.serializer);
  }
};
var OnlineComponentProvider = class {
  async initialize(e, t) {
    this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(
      t,
      /* startAsPrimary=*/
      !e.synchronizeTabs
    ), this.sharedClientState.onlineStateHandler = (e2) => __PRIVATE_syncEngineApplyOnlineStateChange(
      this.syncEngine,
      e2,
      1
      /* OnlineStateSource.SharedClientState */
    ), this.remoteStore.remoteSyncer.handleCredentialChange = __PRIVATE_syncEngineHandleCredentialChange.bind(null, this.syncEngine), await __PRIVATE_remoteStoreApplyPrimaryState(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return function __PRIVATE_newEventManager() {
      return new __PRIVATE_EventManagerImpl();
    }();
  }
  createDatastore(e) {
    const t = __PRIVATE_newSerializer(e.databaseInfo.databaseId), n = function __PRIVATE_newConnection(e2) {
      return new __PRIVATE_WebChannelConnection(e2);
    }(e.databaseInfo);
    return function __PRIVATE_newDatastore(e2, t2, n2, r2) {
      return new __PRIVATE_DatastoreImpl(e2, t2, n2, r2);
    }(e.authCredentials, e.appCheckCredentials, n, t);
  }
  createRemoteStore(e) {
    return function __PRIVATE_newRemoteStore(e2, t, n, r2, i) {
      return new __PRIVATE_RemoteStoreImpl(e2, t, n, r2, i);
    }(this.localStore, this.datastore, e.asyncQueue, (e2) => __PRIVATE_syncEngineApplyOnlineStateChange(
      this.syncEngine,
      e2,
      0
      /* OnlineStateSource.RemoteStore */
    ), function __PRIVATE_newConnectivityMonitor() {
      return __PRIVATE_BrowserConnectivityMonitor.v() ? new __PRIVATE_BrowserConnectivityMonitor() : new __PRIVATE_NoopConnectivityMonitor();
    }());
  }
  createSyncEngine(e, t) {
    return function __PRIVATE_newSyncEngine(e2, t2, n, r2, i, s, o) {
      const _ = new __PRIVATE_SyncEngineImpl(e2, t2, n, r2, i, s);
      return o && (_.gu = true), _;
    }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
  }
  async terminate() {
    await async function __PRIVATE_remoteStoreShutdown(e) {
      const t = __PRIVATE_debugCast(e);
      __PRIVATE_logDebug(tn, "RemoteStore shutting down."), t.Ea.add(
        5
        /* OfflineCause.Shutdown */
      ), await __PRIVATE_disableNetworkInternal(t), t.Aa.shutdown(), // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
      // triggering spurious listener events with cached data, etc.
      t.Ra.set(
        "Unknown"
        /* OnlineState.Unknown */
      );
    }(this.remoteStore), this.datastore?.terminate(), this.eventManager?.terminate();
  }
};
OnlineComponentProvider.provider = {
  build: () => new OnlineComponentProvider()
};
var __PRIVATE_AsyncObserver = class {
  constructor(e) {
    this.observer = e, /**
     * When set to true, will not raise future events. Necessary to deal with
     * async detachment of listener.
     */
    this.muted = false;
  }
  next(e) {
    this.muted || this.observer.next && this.Ou(this.observer.next, e);
  }
  error(e) {
    this.muted || (this.observer.error ? this.Ou(this.observer.error, e) : __PRIVATE_logError("Uncaught Error in snapshot listener:", e.toString()));
  }
  Nu() {
    this.muted = true;
  }
  Ou(e, t) {
    setTimeout(() => {
      this.muted || e(t);
    }, 0);
  }
};
var on = "FirestoreClient";
var FirestoreClient = class {
  constructor(e, t, n, r2, i) {
    this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = n, this.databaseInfo = r2, this.user = User.UNAUTHENTICATED, this.clientId = __PRIVATE_AutoId.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = i, this.authCredentials.start(n, async (e2) => {
      __PRIVATE_logDebug(on, "Received user=", e2.uid), await this.authCredentialListener(e2), this.user = e2;
    }), this.appCheckCredentials.start(n, (e2) => (__PRIVATE_logDebug(on, "Received new app check token=", e2), this.appCheckCredentialListener(e2, this.user)));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new __PRIVATE_Deferred();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
      try {
        this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), // The credentials provider must be terminated after shutting down the
        // RemoteStore as it will prevent the RemoteStore from retrieving auth
        // tokens.
        this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
      } catch (t) {
        const n = __PRIVATE_wrapInUserErrorIfRecoverable(t, "Failed to shutdown persistence");
        e.reject(n);
      }
    }), e.promise;
  }
};
async function __PRIVATE_setOfflineComponentProvider(e, t) {
  e.asyncQueue.verifyOperationInProgress(), __PRIVATE_logDebug(on, "Initializing OfflineComponentProvider");
  const n = e.configuration;
  await t.initialize(n);
  let r2 = n.initialUser;
  e.setCredentialChangeListener(async (e2) => {
    r2.isEqual(e2) || (await __PRIVATE_localStoreHandleUserChange(t.localStore, e2), r2 = e2);
  }), // When a user calls clearPersistence() in one client, all other clients
  // need to be terminated to allow the delete to succeed.
  t.persistence.setDatabaseDeletedListener(() => e.terminate()), e._offlineComponents = t;
}
async function __PRIVATE_setOnlineComponentProvider(e, t) {
  e.asyncQueue.verifyOperationInProgress();
  const n = await __PRIVATE_ensureOfflineComponents(e);
  __PRIVATE_logDebug(on, "Initializing OnlineComponentProvider"), await t.initialize(n, e.configuration), // The CredentialChangeListener of the online component provider takes
  // precedence over the offline component provider.
  e.setCredentialChangeListener((e2) => __PRIVATE_remoteStoreHandleCredentialChange(t.remoteStore, e2)), e.setAppCheckTokenChangeListener((e2, n2) => __PRIVATE_remoteStoreHandleCredentialChange(t.remoteStore, n2)), e._onlineComponents = t;
}
async function __PRIVATE_ensureOfflineComponents(e) {
  if (!e._offlineComponents) if (e._uninitializedComponentsProvider) {
    __PRIVATE_logDebug(on, "Using user provided OfflineComponentProvider");
    try {
      await __PRIVATE_setOfflineComponentProvider(e, e._uninitializedComponentsProvider._offline);
    } catch (t) {
      const n = t;
      if (!function __PRIVATE_canFallbackFromIndexedDbError(e2) {
        return "FirebaseError" === e2.name ? e2.code === N.FAILED_PRECONDITION || e2.code === N.UNIMPLEMENTED : !("undefined" != typeof DOMException && e2 instanceof DOMException) || // When the browser is out of quota we could get either quota exceeded
        // or an aborted error depending on whether the error happened during
        // schema migration.
        22 === e2.code || 20 === e2.code || // Firefox Private Browsing mode disables IndexedDb and returns
        // INVALID_STATE for any usage.
        11 === e2.code;
      }(n)) throw n;
      __PRIVATE_logWarn("Error using user provided cache. Falling back to memory cache: " + n), await __PRIVATE_setOfflineComponentProvider(e, new __PRIVATE_MemoryOfflineComponentProvider());
    }
  } else __PRIVATE_logDebug(on, "Using default OfflineComponentProvider"), await __PRIVATE_setOfflineComponentProvider(e, new __PRIVATE_LruGcMemoryOfflineComponentProvider(void 0));
  return e._offlineComponents;
}
async function __PRIVATE_ensureOnlineComponents(e) {
  return e._onlineComponents || (e._uninitializedComponentsProvider ? (__PRIVATE_logDebug(on, "Using user provided OnlineComponentProvider"), await __PRIVATE_setOnlineComponentProvider(e, e._uninitializedComponentsProvider._online)) : (__PRIVATE_logDebug(on, "Using default OnlineComponentProvider"), await __PRIVATE_setOnlineComponentProvider(e, new OnlineComponentProvider()))), e._onlineComponents;
}
function __PRIVATE_getSyncEngine(e) {
  return __PRIVATE_ensureOnlineComponents(e).then((e2) => e2.syncEngine);
}
async function __PRIVATE_getEventManager(e) {
  const t = await __PRIVATE_ensureOnlineComponents(e), n = t.eventManager;
  return n.onListen = __PRIVATE_syncEngineListen.bind(null, t.syncEngine), n.onUnlisten = __PRIVATE_syncEngineUnlisten.bind(null, t.syncEngine), n.onFirstRemoteStoreListen = __PRIVATE_triggerRemoteStoreListen.bind(null, t.syncEngine), n.onLastRemoteStoreUnlisten = __PRIVATE_triggerRemoteStoreUnlisten.bind(null, t.syncEngine), n;
}
function __PRIVATE_firestoreClientGetDocumentViaSnapshotListener(e, t, n = {}) {
  const r2 = new __PRIVATE_Deferred();
  return e.asyncQueue.enqueueAndForget(async () => function __PRIVATE_readDocumentViaSnapshotListener(e2, t2, n2, r3, i) {
    const s = new __PRIVATE_AsyncObserver({
      next: (_) => {
        s.Nu(), t2.enqueueAndForget(() => __PRIVATE_eventManagerUnlisten(e2, o));
        const a2 = _.docs.has(n2);
        !a2 && _.fromCache ? (
          // TODO(dimond): If we're online and the document doesn't
          // exist then we resolve with a doc.exists set to false. If
          // we're offline however, we reject the Promise in this
          // case. Two options: 1) Cache the negative response from
          // the server so we can deliver that even when you're
          // offline 2) Actually reject the Promise in the online case
          // if the document doesn't exist.
          i.reject(new FirestoreError(N.UNAVAILABLE, "Failed to get document because the client is offline."))
        ) : a2 && _.fromCache && r3 && "server" === r3.source ? i.reject(new FirestoreError(N.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : i.resolve(_);
      },
      error: (e3) => i.reject(e3)
    }), o = new __PRIVATE_QueryListener(__PRIVATE_newQueryForPath(n2.path), s, {
      includeMetadataChanges: true,
      qa: true
    });
    return __PRIVATE_eventManagerListen(e2, o);
  }(await __PRIVATE_getEventManager(e), e.asyncQueue, t, n, r2)), r2.promise;
}
function __PRIVATE_firestoreClientGetDocumentsViaSnapshotListener(e, t, n = {}) {
  const r2 = new __PRIVATE_Deferred();
  return e.asyncQueue.enqueueAndForget(async () => function __PRIVATE_executeQueryViaSnapshotListener(e2, t2, n2, r3, i) {
    const s = new __PRIVATE_AsyncObserver({
      next: (n3) => {
        s.Nu(), t2.enqueueAndForget(() => __PRIVATE_eventManagerUnlisten(e2, o)), n3.fromCache && "server" === r3.source ? i.reject(new FirestoreError(N.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : i.resolve(n3);
      },
      error: (e3) => i.reject(e3)
    }), o = new __PRIVATE_QueryListener(n2, s, {
      includeMetadataChanges: true,
      qa: true
    });
    return __PRIVATE_eventManagerListen(e2, o);
  }(await __PRIVATE_getEventManager(e), e.asyncQueue, t, n, r2)), r2.promise;
}
function __PRIVATE_cloneLongPollingOptions(e) {
  const t = {};
  return void 0 !== e.timeoutSeconds && (t.timeoutSeconds = e.timeoutSeconds), t;
}
var _n = /* @__PURE__ */ new Map();
var an = "firestore.googleapis.com";
var un = true;
var FirestoreSettingsImpl = class {
  constructor(e) {
    if (void 0 === e.host) {
      if (void 0 !== e.ssl) throw new FirestoreError(N.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = an, this.ssl = un;
    } else this.host = e.host, this.ssl = e.ssl ?? un;
    if (this.isUsingEmulator = void 0 !== e.emulatorOptions, this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, void 0 === e.cacheSizeBytes) this.cacheSizeBytes = Ot;
    else {
      if (-1 !== e.cacheSizeBytes && e.cacheSizeBytes < Bt) throw new FirestoreError(N.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    __PRIVATE_validateIsNotUsedTogether("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = false : void 0 === e.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = __PRIVATE_cloneLongPollingOptions(e.experimentalLongPollingOptions ?? {}), function __PRIVATE_validateLongPollingOptions(e2) {
      if (void 0 !== e2.timeoutSeconds) {
        if (isNaN(e2.timeoutSeconds)) throw new FirestoreError(N.INVALID_ARGUMENT, `invalid long polling timeout: ${e2.timeoutSeconds} (must not be NaN)`);
        if (e2.timeoutSeconds < 5) throw new FirestoreError(N.INVALID_ARGUMENT, `invalid long polling timeout: ${e2.timeoutSeconds} (minimum allowed value is 5)`);
        if (e2.timeoutSeconds > 30) throw new FirestoreError(N.INVALID_ARGUMENT, `invalid long polling timeout: ${e2.timeoutSeconds} (maximum allowed value is 30)`);
      }
    }(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
  }
  isEqual(e) {
    return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function __PRIVATE_longPollingOptionsEqual(e2, t) {
      return e2.timeoutSeconds === t.timeoutSeconds;
    }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
  }
};
var Firestore$1 = class {
  /** @hideconstructor */
  constructor(e, t, n, r2) {
    this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = n, this._app = r2, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new FirestoreSettingsImpl({}), this._settingsFrozen = false, this._emulatorOptions = {}, // A task that is assigned when the terminate() is invoked and resolved when
    // all components have shut down. Otherwise, Firestore is not terminated,
    // which can mean either the FirestoreClient is in the process of starting,
    // or restarting.
    this._terminateTask = "notTerminated";
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app) throw new FirestoreError(N.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return "notTerminated" !== this._terminateTask;
  }
  _setSettings(e) {
    if (this._settingsFrozen) throw new FirestoreError(N.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new FirestoreSettingsImpl(e), this._emulatorOptions = e.emulatorOptions || {}, void 0 !== e.credentials && (this._authCredentials = function __PRIVATE_makeAuthCredentialsProvider(e2) {
      if (!e2) return new __PRIVATE_EmptyAuthCredentialsProvider();
      switch (e2.type) {
        case "firstParty":
          return new __PRIVATE_FirstPartyAuthCredentialsProvider(e2.sessionIndex || "0", e2.iamToken || null, e2.authTokenFactory || null);
        case "provider":
          return e2.client;
        default:
          throw new FirestoreError(N.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    }(e.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _getEmulatorOptions() {
    return this._emulatorOptions;
  }
  _freezeSettings() {
    return this._settingsFrozen = true, this._settings;
  }
  _delete() {
    return "notTerminated" === this._terminateTask && (this._terminateTask = this._terminate()), this._terminateTask;
  }
  async _restart() {
    "notTerminated" === this._terminateTask ? await this._terminate() : this._terminateTask = "notTerminated";
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return function __PRIVATE_removeComponents(e) {
      const t = _n.get(e);
      t && (__PRIVATE_logDebug("ComponentProvider", "Removing Datastore"), _n.delete(e), t.terminate());
    }(this), Promise.resolve();
  }
};
function connectFirestoreEmulator(e, t, n, r2 = {}) {
  e = __PRIVATE_cast(e, Firestore$1);
  const i = isCloudWorkstation(t), s = e._getSettings(), o = {
    ...s,
    emulatorOptions: e._getEmulatorOptions()
  }, _ = `${t}:${n}`;
  i && (pingServer(`https://${_}`), updateEmulatorBanner("Firestore", true)), s.host !== an && s.host !== _ && __PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");
  const a2 = {
    ...s,
    host: _,
    ssl: i,
    emulatorOptions: r2
  };
  if (!deepEqual(a2, o) && (e._setSettings(a2), r2.mockUserToken)) {
    let t2, n2;
    if ("string" == typeof r2.mockUserToken) t2 = r2.mockUserToken, n2 = User.MOCK_USER;
    else {
      t2 = createMockUserToken(r2.mockUserToken, e._app?.options.projectId);
      const i2 = r2.mockUserToken.sub || r2.mockUserToken.user_id;
      if (!i2) throw new FirestoreError(N.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      n2 = new User(i2);
    }
    e._authCredentials = new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(t2, n2));
  }
}
var Query = class _Query {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(e, t, n) {
    this.converter = t, this._query = n, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = e;
  }
  withConverter(e) {
    return new _Query(this.firestore, e, this._query);
  }
};
var DocumentReference = class _DocumentReference {
  /** @hideconstructor */
  constructor(e, t, n) {
    this.converter = t, this._key = n, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = e;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new CollectionReference(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new _DocumentReference(this.firestore, e, this._key);
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentReference` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: _DocumentReference._jsonSchemaVersion,
      referencePath: this._key.toString()
    };
  }
  static fromJSON(e, t, n) {
    if (__PRIVATE_validateJSON(t, _DocumentReference._jsonSchema)) return new _DocumentReference(e, n || null, new DocumentKey(ResourcePath.fromString(t.referencePath)));
  }
};
DocumentReference._jsonSchemaVersion = "firestore/documentReference/1.0", DocumentReference._jsonSchema = {
  type: property("string", DocumentReference._jsonSchemaVersion),
  referencePath: property("string")
};
var CollectionReference = class _CollectionReference extends Query {
  /** @hideconstructor */
  constructor(e, t, n) {
    super(e, t, __PRIVATE_newQueryForPath(n)), this._path = n, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new DocumentReference(
      this.firestore,
      /* converter= */
      null,
      new DocumentKey(e)
    );
  }
  withConverter(e) {
    return new _CollectionReference(this.firestore, e, this._path);
  }
};
function collection(e, t, ...n) {
  if (e = getModularInstance(e), __PRIVATE_validateNonEmptyArgument("collection", "path", t), e instanceof Firestore$1) {
    const r2 = ResourcePath.fromString(t, ...n);
    return __PRIVATE_validateCollectionPath(r2), new CollectionReference(
      e,
      /* converter= */
      null,
      r2
    );
  }
  {
    if (!(e instanceof DocumentReference || e instanceof CollectionReference)) throw new FirestoreError(N.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const r2 = e._path.child(ResourcePath.fromString(t, ...n));
    return __PRIVATE_validateCollectionPath(r2), new CollectionReference(
      e.firestore,
      /* converter= */
      null,
      r2
    );
  }
}
function doc(e, t, ...n) {
  if (e = getModularInstance(e), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  1 === arguments.length && (t = __PRIVATE_AutoId.newId()), __PRIVATE_validateNonEmptyArgument("doc", "path", t), e instanceof Firestore$1) {
    const r2 = ResourcePath.fromString(t, ...n);
    return __PRIVATE_validateDocumentPath(r2), new DocumentReference(
      e,
      /* converter= */
      null,
      new DocumentKey(r2)
    );
  }
  {
    if (!(e instanceof DocumentReference || e instanceof CollectionReference)) throw new FirestoreError(N.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const r2 = e._path.child(ResourcePath.fromString(t, ...n));
    return __PRIVATE_validateDocumentPath(r2), new DocumentReference(e.firestore, e instanceof CollectionReference ? e.converter : null, new DocumentKey(r2));
  }
}
var cn = "AsyncQueue";
var __PRIVATE_AsyncQueueImpl = class {
  constructor(e = Promise.resolve()) {
    this.Xu = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.ec = false, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.tc = [], // visible for testing
    this.nc = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.rc = false, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.sc = false, // List of TimerIds to fast-forward delays for.
    this.oc = [], // Backoff timer used to schedule retries for retryable operations
    this.M_ = new __PRIVATE_ExponentialBackoff(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this._c = () => {
      const e2 = getDocument();
      e2 && __PRIVATE_logDebug(cn, "Visibility state changed to " + e2.visibilityState), this.M_.w_();
    }, this.ac = e;
    const t = getDocument();
    t && "function" == typeof t.addEventListener && t.addEventListener("visibilitychange", this._c);
  }
  get isShuttingDown() {
    return this.ec;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    this.uc(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.cc(e);
  }
  enterRestrictedMode(e) {
    if (!this.ec) {
      this.ec = true, this.sc = e || false;
      const t = getDocument();
      t && "function" == typeof t.removeEventListener && t.removeEventListener("visibilitychange", this._c);
    }
  }
  enqueue(e) {
    if (this.uc(), this.ec)
      return new Promise(() => {
      });
    const t = new __PRIVATE_Deferred();
    return this.cc(() => this.ec && this.sc ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise)).then(() => t.promise);
  }
  enqueueRetryable(e) {
    this.enqueueAndForget(() => (this.Xu.push(e), this.lc()));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async lc() {
    if (0 !== this.Xu.length) {
      try {
        await this.Xu[0](), this.Xu.shift(), this.M_.reset();
      } catch (e) {
        if (!__PRIVATE_isIndexedDbTransactionError(e)) throw e;
        __PRIVATE_logDebug(cn, "Operation failed with retryable error: " + e);
      }
      this.Xu.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.M_.p_(() => this.lc());
    }
  }
  cc(e) {
    const t = this.ac.then(() => (this.rc = true, e().catch((e2) => {
      this.nc = e2, this.rc = false;
      throw __PRIVATE_logError("INTERNAL UNHANDLED ERROR: ", __PRIVATE_getMessageOrStack(e2)), e2;
    }).then((e2) => (this.rc = false, e2))));
    return this.ac = t, t;
  }
  enqueueAfterDelay(e, t, n) {
    this.uc(), // Fast-forward delays for timerIds that have been overridden.
    this.oc.indexOf(e) > -1 && (t = 0);
    const r2 = DelayedOperation.createAndSchedule(this, e, t, n, (e2) => this.hc(e2));
    return this.tc.push(r2), r2;
  }
  uc() {
    this.nc && fail(47125, {
      Pc: __PRIVATE_getMessageOrStack(this.nc)
    });
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async Tc() {
    let e;
    do {
      e = this.ac, await e;
    } while (e !== this.ac);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  Ic(e) {
    for (const t of this.tc) if (t.timerId === e) return true;
    return false;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  Ec(e) {
    return this.Tc().then(() => {
      this.tc.sort((e2, t) => e2.targetTimeMs - t.targetTimeMs);
      for (const t of this.tc) if (t.skipDelay(), "all" !== e && t.timerId === e) break;
      return this.Tc();
    });
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  dc(e) {
    this.oc.push(e);
  }
  /** Called once a DelayedOperation is run or canceled. */
  hc(e) {
    const t = this.tc.indexOf(e);
    this.tc.splice(t, 1);
  }
};
function __PRIVATE_getMessageOrStack(e) {
  let t = e.message || "";
  return e.stack && (t = e.stack.includes(e.message) ? e.stack : e.message + "\n" + e.stack), t;
}
var Firestore = class extends Firestore$1 {
  /** @hideconstructor */
  constructor(e, t, n, r2) {
    super(e, t, n, r2), /**
     * Whether it's a {@link Firestore} or Firestore Lite instance.
     */
    this.type = "firestore", this._queue = new __PRIVATE_AsyncQueueImpl(), this._persistenceKey = r2?.name || "[DEFAULT]";
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      this._queue = new __PRIVATE_AsyncQueueImpl(e), this._firestoreClient = void 0, await e;
    }
  }
};
function getFirestore(e, n) {
  const r2 = "object" == typeof e ? e : getApp(), i = "string" == typeof e ? e : n || lt, s = _getProvider(r2, "firestore").getImmediate({
    identifier: i
  });
  if (!s._initialized) {
    const e2 = getDefaultEmulatorHostnameAndPort("firestore");
    e2 && connectFirestoreEmulator(s, ...e2);
  }
  return s;
}
function ensureFirestoreConfigured(e) {
  if (e._terminated) throw new FirestoreError(N.FAILED_PRECONDITION, "The client has already been terminated.");
  return e._firestoreClient || __PRIVATE_configureFirestore(e), e._firestoreClient;
}
function __PRIVATE_configureFirestore(e) {
  const t = e._freezeSettings(), n = function __PRIVATE_makeDatabaseInfo(e2, t2, n2, r2) {
    return new DatabaseInfo(e2, t2, n2, r2.host, r2.ssl, r2.experimentalForceLongPolling, r2.experimentalAutoDetectLongPolling, __PRIVATE_cloneLongPollingOptions(r2.experimentalLongPollingOptions), r2.useFetchStreams, r2.isUsingEmulator);
  }(e._databaseId, e._app?.options.appId || "", e._persistenceKey, t);
  e._componentsProvider || t.localCache?._offlineComponentProvider && t.localCache?._onlineComponentProvider && (e._componentsProvider = {
    _offline: t.localCache._offlineComponentProvider,
    _online: t.localCache._onlineComponentProvider
  }), e._firestoreClient = new FirestoreClient(e._authCredentials, e._appCheckCredentials, e._queue, n, e._componentsProvider && function __PRIVATE_buildComponentProvider(e2) {
    const t2 = e2?._online.build();
    return {
      _offline: e2?._offline.build(t2),
      _online: t2
    };
  }(e._componentsProvider));
}
var Bytes = class _Bytes {
  /** @hideconstructor */
  constructor(e) {
    this._byteString = e;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(e) {
    try {
      return new _Bytes(ByteString.fromBase64String(e));
    } catch (e2) {
      throw new FirestoreError(N.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e2);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(e) {
    return new _Bytes(ByteString.fromUint8Array(e));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
  /**
   * Returns a JSON-serializable representation of this `Bytes` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: _Bytes._jsonSchemaVersion,
      bytes: this.toBase64()
    };
  }
  /**
   * Builds a `Bytes` instance from a JSON object created by {@link Bytes.toJSON}.
   *
   * @param json a JSON object represention of a `Bytes` instance
   * @returns an instance of {@link Bytes} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _Bytes._jsonSchema)) return _Bytes.fromBase64String(e.bytes);
  }
};
Bytes._jsonSchemaVersion = "firestore/bytes/1.0", Bytes._jsonSchema = {
  type: property("string", Bytes._jsonSchemaVersion),
  bytes: property("string")
};
var FieldPath = class {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...e) {
    for (let t = 0; t < e.length; ++t) if (0 === e[t].length) throw new FirestoreError(N.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new FieldPath$1(e);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
};
var FieldValue = class {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(e) {
    this._methodName = e;
  }
};
var GeoPoint = class _GeoPoint {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90) throw new FirestoreError(N.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
    if (!isFinite(t) || t < -180 || t > 180) throw new FirestoreError(N.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
    this._lat = e, this._long = t;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(e) {
    return __PRIVATE_primitiveComparator(this._lat, e._lat) || __PRIVATE_primitiveComparator(this._long, e._long);
  }
  /**
   * Returns a JSON-serializable representation of this `GeoPoint` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long,
      type: _GeoPoint._jsonSchemaVersion
    };
  }
  /**
   * Builds a `GeoPoint` instance from a JSON object created by {@link GeoPoint.toJSON}.
   *
   * @param json a JSON object represention of a `GeoPoint` instance
   * @returns an instance of {@link GeoPoint} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _GeoPoint._jsonSchema)) return new _GeoPoint(e.latitude, e.longitude);
  }
};
GeoPoint._jsonSchemaVersion = "firestore/geoPoint/1.0", GeoPoint._jsonSchema = {
  type: property("string", GeoPoint._jsonSchemaVersion),
  latitude: property("number"),
  longitude: property("number")
};
var VectorValue = class _VectorValue {
  /**
   * @private
   * @internal
   */
  constructor(e) {
    this._values = (e || []).map((e2) => e2);
  }
  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray() {
    return this._values.map((e) => e);
  }
  /**
   * Returns `true` if the two `VectorValue` values have the same raw number arrays, returns `false` otherwise.
   */
  isEqual(e) {
    return function __PRIVATE_isPrimitiveArrayEqual(e2, t) {
      if (e2.length !== t.length) return false;
      for (let n = 0; n < e2.length; ++n) if (e2[n] !== t[n]) return false;
      return true;
    }(this._values, e._values);
  }
  /**
   * Returns a JSON-serializable representation of this `VectorValue` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: _VectorValue._jsonSchemaVersion,
      vectorValues: this._values
    };
  }
  /**
   * Builds a `VectorValue` instance from a JSON object created by {@link VectorValue.toJSON}.
   *
   * @param json a JSON object represention of a `VectorValue` instance.
   * @returns an instance of {@link VectorValue} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _VectorValue._jsonSchema)) {
      if (Array.isArray(e.vectorValues) && e.vectorValues.every((e2) => "number" == typeof e2)) return new _VectorValue(e.vectorValues);
      throw new FirestoreError(N.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
    }
  }
};
VectorValue._jsonSchemaVersion = "firestore/vectorValue/1.0", VectorValue._jsonSchema = {
  type: property("string", VectorValue._jsonSchemaVersion),
  vectorValues: property("object")
};
var hn = /^__.*__$/;
var ParsedSetData = class {
  constructor(e, t, n) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = n;
  }
  toMutation(e, t) {
    return null !== this.fieldMask ? new __PRIVATE_PatchMutation(e, this.data, this.fieldMask, t, this.fieldTransforms) : new __PRIVATE_SetMutation(e, this.data, t, this.fieldTransforms);
  }
};
var ParsedUpdateData = class {
  constructor(e, t, n) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = n;
  }
  toMutation(e, t) {
    return new __PRIVATE_PatchMutation(e, this.data, this.fieldMask, t, this.fieldTransforms);
  }
};
function __PRIVATE_isWrite(e) {
  switch (e) {
    case 0:
    // fall through
    case 2:
    // fall through
    case 1:
      return true;
    case 3:
    case 4:
      return false;
    default:
      throw fail(40011, {
        Ac: e
      });
  }
}
var __PRIVATE_ParseContextImpl = class ___PRIVATE_ParseContextImpl {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(e, t, n, r2, i, s) {
    this.settings = e, this.databaseId = t, this.serializer = n, this.ignoreUndefinedProperties = r2, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    void 0 === i && this.Rc(), this.fieldTransforms = i || [], this.fieldMask = s || [];
  }
  get path() {
    return this.settings.path;
  }
  get Ac() {
    return this.settings.Ac;
  }
  /** Returns a new context with the specified settings overwritten. */
  Vc(e) {
    return new ___PRIVATE_ParseContextImpl({
      ...this.settings,
      ...e
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  mc(e) {
    const t = this.path?.child(e), n = this.Vc({
      path: t,
      fc: false
    });
    return n.gc(e), n;
  }
  yc(e) {
    const t = this.path?.child(e), n = this.Vc({
      path: t,
      fc: false
    });
    return n.Rc(), n;
  }
  wc(e) {
    return this.Vc({
      path: void 0,
      fc: true
    });
  }
  Sc(e) {
    return __PRIVATE_createError(e, this.settings.methodName, this.settings.bc || false, this.path, this.settings.Dc);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(e) {
    return void 0 !== this.fieldMask.find((t) => e.isPrefixOf(t)) || void 0 !== this.fieldTransforms.find((t) => e.isPrefixOf(t.field));
  }
  Rc() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.gc(this.path.get(e));
  }
  gc(e) {
    if (0 === e.length) throw this.Sc("Document fields must not be empty");
    if (__PRIVATE_isWrite(this.Ac) && hn.test(e)) throw this.Sc('Document fields cannot begin and end with "__"');
  }
};
var __PRIVATE_UserDataReader = class {
  constructor(e, t, n) {
    this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = n || __PRIVATE_newSerializer(e);
  }
  /** Creates a new top-level parse context. */
  Cc(e, t, n, r2 = false) {
    return new __PRIVATE_ParseContextImpl({
      Ac: e,
      methodName: t,
      Dc: n,
      path: FieldPath$1.emptyPath(),
      fc: false,
      bc: r2
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
};
function __PRIVATE_newUserDataReader(e) {
  const t = e._freezeSettings(), n = __PRIVATE_newSerializer(e._databaseId);
  return new __PRIVATE_UserDataReader(e._databaseId, !!t.ignoreUndefinedProperties, n);
}
function __PRIVATE_parseSetData(e, t, n, r2, i, s = {}) {
  const o = e.Cc(s.merge || s.mergeFields ? 2 : 0, t, n, i);
  __PRIVATE_validatePlainObject("Data must be an object, but it was:", o, r2);
  const _ = __PRIVATE_parseObject(r2, o);
  let a2, u;
  if (s.merge) a2 = new FieldMask(o.fieldMask), u = o.fieldTransforms;
  else if (s.mergeFields) {
    const e2 = [];
    for (const r3 of s.mergeFields) {
      const i2 = __PRIVATE_fieldPathFromArgument$1(t, r3, n);
      if (!o.contains(i2)) throw new FirestoreError(N.INVALID_ARGUMENT, `Field '${i2}' is specified in your field mask but missing from your input data.`);
      __PRIVATE_fieldMaskContains(e2, i2) || e2.push(i2);
    }
    a2 = new FieldMask(e2), u = o.fieldTransforms.filter((e3) => a2.covers(e3.field));
  } else a2 = null, u = o.fieldTransforms;
  return new ParsedSetData(new ObjectValue(_), a2, u);
}
var __PRIVATE_DeleteFieldValueImpl = class ___PRIVATE_DeleteFieldValueImpl extends FieldValue {
  _toFieldTransform(e) {
    if (2 !== e.Ac) throw 1 === e.Ac ? e.Sc(`${this._methodName}() can only appear at the top level of your update data`) : e.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
    return e.fieldMask.push(e.path), null;
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_DeleteFieldValueImpl;
  }
};
function __PRIVATE_createSentinelChildContext(e, t, n) {
  return new __PRIVATE_ParseContextImpl({
    Ac: 3,
    Dc: t.settings.Dc,
    methodName: e._methodName,
    fc: n
  }, t.databaseId, t.serializer, t.ignoreUndefinedProperties);
}
var __PRIVATE_ArrayUnionFieldValueImpl = class ___PRIVATE_ArrayUnionFieldValueImpl extends FieldValue {
  constructor(e, t) {
    super(e), this.vc = t;
  }
  _toFieldTransform(e) {
    const t = __PRIVATE_createSentinelChildContext(
      this,
      e,
      /*array=*/
      true
    ), n = this.vc.map((e2) => __PRIVATE_parseData(e2, t)), r2 = new __PRIVATE_ArrayUnionTransformOperation(n);
    return new FieldTransform(e.path, r2);
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_ArrayUnionFieldValueImpl && deepEqual(this.vc, e.vc);
  }
};
var __PRIVATE_ArrayRemoveFieldValueImpl = class ___PRIVATE_ArrayRemoveFieldValueImpl extends FieldValue {
  constructor(e, t) {
    super(e), this.vc = t;
  }
  _toFieldTransform(e) {
    const t = __PRIVATE_createSentinelChildContext(
      this,
      e,
      /*array=*/
      true
    ), n = this.vc.map((e2) => __PRIVATE_parseData(e2, t)), r2 = new __PRIVATE_ArrayRemoveTransformOperation(n);
    return new FieldTransform(e.path, r2);
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_ArrayRemoveFieldValueImpl && deepEqual(this.vc, e.vc);
  }
};
function __PRIVATE_parseUpdateData(e, t, n, r2) {
  const i = e.Cc(1, t, n);
  __PRIVATE_validatePlainObject("Data must be an object, but it was:", i, r2);
  const s = [], o = ObjectValue.empty();
  forEach(r2, (e2, r3) => {
    const _2 = __PRIVATE_fieldPathFromDotSeparatedString(t, e2, n);
    r3 = getModularInstance(r3);
    const a2 = i.yc(_2);
    if (r3 instanceof __PRIVATE_DeleteFieldValueImpl)
      s.push(_2);
    else {
      const e3 = __PRIVATE_parseData(r3, a2);
      null != e3 && (s.push(_2), o.set(_2, e3));
    }
  });
  const _ = new FieldMask(s);
  return new ParsedUpdateData(o, _, i.fieldTransforms);
}
function __PRIVATE_parseUpdateVarargs(e, t, n, r2, i, s) {
  const o = e.Cc(1, t, n), _ = [__PRIVATE_fieldPathFromArgument$1(t, r2, n)], a2 = [i];
  if (s.length % 2 != 0) throw new FirestoreError(N.INVALID_ARGUMENT, `Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);
  for (let e2 = 0; e2 < s.length; e2 += 2) _.push(__PRIVATE_fieldPathFromArgument$1(t, s[e2])), a2.push(s[e2 + 1]);
  const u = [], c2 = ObjectValue.empty();
  for (let e2 = _.length - 1; e2 >= 0; --e2) if (!__PRIVATE_fieldMaskContains(u, _[e2])) {
    const t2 = _[e2];
    let n2 = a2[e2];
    n2 = getModularInstance(n2);
    const r3 = o.yc(t2);
    if (n2 instanceof __PRIVATE_DeleteFieldValueImpl)
      u.push(t2);
    else {
      const e3 = __PRIVATE_parseData(n2, r3);
      null != e3 && (u.push(t2), c2.set(t2, e3));
    }
  }
  const l = new FieldMask(u);
  return new ParsedUpdateData(c2, l, o.fieldTransforms);
}
function __PRIVATE_parseQueryValue(e, t, n, r2 = false) {
  return __PRIVATE_parseData(n, e.Cc(r2 ? 4 : 3, t));
}
function __PRIVATE_parseData(e, t) {
  if (__PRIVATE_looksLikeJsonObject(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    e = getModularInstance(e)
  )) return __PRIVATE_validatePlainObject("Unsupported field value:", t, e), __PRIVATE_parseObject(e, t);
  if (e instanceof FieldValue)
    return function __PRIVATE_parseSentinelFieldValue(e2, t2) {
      if (!__PRIVATE_isWrite(t2.Ac)) throw t2.Sc(`${e2._methodName}() can only be used with update() and set()`);
      if (!t2.path) throw t2.Sc(`${e2._methodName}() is not currently supported inside arrays`);
      const n = e2._toFieldTransform(t2);
      n && t2.fieldTransforms.push(n);
    }(e, t), null;
  if (void 0 === e && t.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    t.path && t.fieldMask.push(t.path), e instanceof Array
  ) {
    if (t.settings.fc && 4 !== t.Ac) throw t.Sc("Nested arrays are not supported");
    return function __PRIVATE_parseArray(e2, t2) {
      const n = [];
      let r2 = 0;
      for (const i of e2) {
        let e3 = __PRIVATE_parseData(i, t2.wc(r2));
        null == e3 && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (e3 = {
          nullValue: "NULL_VALUE"
        }), n.push(e3), r2++;
      }
      return {
        arrayValue: {
          values: n
        }
      };
    }(e, t);
  }
  return function __PRIVATE_parseScalarValue(e2, t2) {
    if (null === (e2 = getModularInstance(e2))) return {
      nullValue: "NULL_VALUE"
    };
    if ("number" == typeof e2) return toNumber(t2.serializer, e2);
    if ("boolean" == typeof e2) return {
      booleanValue: e2
    };
    if ("string" == typeof e2) return {
      stringValue: e2
    };
    if (e2 instanceof Date) {
      const n = Timestamp.fromDate(e2);
      return {
        timestampValue: toTimestamp(t2.serializer, n)
      };
    }
    if (e2 instanceof Timestamp) {
      const n = new Timestamp(e2.seconds, 1e3 * Math.floor(e2.nanoseconds / 1e3));
      return {
        timestampValue: toTimestamp(t2.serializer, n)
      };
    }
    if (e2 instanceof GeoPoint) return {
      geoPointValue: {
        latitude: e2.latitude,
        longitude: e2.longitude
      }
    };
    if (e2 instanceof Bytes) return {
      bytesValue: __PRIVATE_toBytes(t2.serializer, e2._byteString)
    };
    if (e2 instanceof DocumentReference) {
      const n = t2.databaseId, r2 = e2.firestore._databaseId;
      if (!r2.isEqual(n)) throw t2.Sc(`Document reference is for database ${r2.projectId}/${r2.database} but should be for database ${n.projectId}/${n.database}`);
      return {
        referenceValue: __PRIVATE_toResourceName(e2.firestore._databaseId || t2.databaseId, e2._key.path)
      };
    }
    if (e2 instanceof VectorValue)
      return function __PRIVATE_parseVectorValue(e3, t3) {
        const n = {
          fields: {
            [ht]: {
              stringValue: It
            },
            [Et]: {
              arrayValue: {
                values: e3.toArray().map((e4) => {
                  if ("number" != typeof e4) throw t3.Sc("VectorValues must only contain numeric values.");
                  return __PRIVATE_toDouble(t3.serializer, e4);
                })
              }
            }
          }
        };
        return {
          mapValue: n
        };
      }(e2, t2);
    throw t2.Sc(`Unsupported field value: ${__PRIVATE_valueDescription(e2)}`);
  }(e, t);
}
function __PRIVATE_parseObject(e, t) {
  const n = {};
  return isEmpty(e) ? (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    t.path && t.path.length > 0 && t.fieldMask.push(t.path)
  ) : forEach(e, (e2, r2) => {
    const i = __PRIVATE_parseData(r2, t.mc(e2));
    null != i && (n[e2] = i);
  }), {
    mapValue: {
      fields: n
    }
  };
}
function __PRIVATE_looksLikeJsonObject(e) {
  return !("object" != typeof e || null === e || e instanceof Array || e instanceof Date || e instanceof Timestamp || e instanceof GeoPoint || e instanceof Bytes || e instanceof DocumentReference || e instanceof FieldValue || e instanceof VectorValue);
}
function __PRIVATE_validatePlainObject(e, t, n) {
  if (!__PRIVATE_looksLikeJsonObject(n) || !__PRIVATE_isPlainObject(n)) {
    const r2 = __PRIVATE_valueDescription(n);
    throw "an object" === r2 ? t.Sc(e + " a custom object") : t.Sc(e + " " + r2);
  }
}
function __PRIVATE_fieldPathFromArgument$1(e, t, n) {
  if (
    // If required, replace the FieldPath Compat class with the firestore-exp
    // FieldPath.
    (t = getModularInstance(t)) instanceof FieldPath
  ) return t._internalPath;
  if ("string" == typeof t) return __PRIVATE_fieldPathFromDotSeparatedString(e, t);
  throw __PRIVATE_createError(
    "Field path arguments must be of type string or ",
    e,
    /* hasConverter= */
    false,
    /* path= */
    void 0,
    n
  );
}
var Pn = new RegExp("[~\\*/\\[\\]]");
function __PRIVATE_fieldPathFromDotSeparatedString(e, t, n) {
  if (t.search(Pn) >= 0) throw __PRIVATE_createError(
    `Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,
    e,
    /* hasConverter= */
    false,
    /* path= */
    void 0,
    n
  );
  try {
    return new FieldPath(...t.split("."))._internalPath;
  } catch (r2) {
    throw __PRIVATE_createError(
      `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      e,
      /* hasConverter= */
      false,
      /* path= */
      void 0,
      n
    );
  }
}
function __PRIVATE_createError(e, t, n, r2, i) {
  const s = r2 && !r2.isEmpty(), o = void 0 !== i;
  let _ = `Function ${t}() called with invalid data`;
  n && (_ += " (via `toFirestore()`)"), _ += ". ";
  let a2 = "";
  return (s || o) && (a2 += " (found", s && (a2 += ` in field ${r2}`), o && (a2 += ` in document ${i}`), a2 += ")"), new FirestoreError(N.INVALID_ARGUMENT, _ + e + a2);
}
function __PRIVATE_fieldMaskContains(e, t) {
  return e.some((e2) => e2.isEqual(t));
}
var DocumentSnapshot$1 = class {
  // Note: This class is stripped down version of the DocumentSnapshot in
  // the legacy SDK. The changes are:
  // - No support for SnapshotMetadata.
  // - No support for SnapshotOptions.
  /** @hideconstructor protected */
  constructor(e, t, n, r2, i) {
    this._firestore = e, this._userDataWriter = t, this._key = n, this._document = r2, this._converter = i;
  }
  /** Property of the `DocumentSnapshot` that provides the document's ID. */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  get ref() {
    return new DocumentReference(this._firestore, this._converter, this._key);
  }
  /**
   * Signals whether or not the document at the snapshot's location exists.
   *
   * @returns true if the document exists.
   */
  exists() {
    return null !== this._document;
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new QueryDocumentSnapshot$1(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e) {
    if (this._document) {
      const t = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", e));
      if (null !== t) return this._userDataWriter.convertValue(t);
    }
  }
};
var QueryDocumentSnapshot$1 = class extends DocumentSnapshot$1 {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * @override
   * @returns An `Object` containing all fields in the document.
   */
  data() {
    return super.data();
  }
};
function __PRIVATE_fieldPathFromArgument(e, t) {
  return "string" == typeof t ? __PRIVATE_fieldPathFromDotSeparatedString(e, t) : t instanceof FieldPath ? t._internalPath : t._delegate._internalPath;
}
function __PRIVATE_validateHasExplicitOrderByForLimitToLast(e) {
  if ("L" === e.limitType && 0 === e.explicitOrderBy.length) throw new FirestoreError(N.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
var AppliableConstraint = class {
};
var QueryConstraint = class extends AppliableConstraint {
};
function query(e, t, ...n) {
  let r2 = [];
  t instanceof AppliableConstraint && r2.push(t), r2 = r2.concat(n), function __PRIVATE_validateQueryConstraintArray(e2) {
    const t2 = e2.filter((e3) => e3 instanceof QueryCompositeFilterConstraint).length, n2 = e2.filter((e3) => e3 instanceof QueryFieldFilterConstraint).length;
    if (t2 > 1 || t2 > 0 && n2 > 0) throw new FirestoreError(N.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
  }(r2);
  for (const t2 of r2) e = t2._apply(e);
  return e;
}
var QueryFieldFilterConstraint = class _QueryFieldFilterConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t, n) {
    super(), this._field = e, this._op = t, this._value = n, /** The type of this query constraint */
    this.type = "where";
  }
  static _create(e, t, n) {
    return new _QueryFieldFilterConstraint(e, t, n);
  }
  _apply(e) {
    const t = this._parse(e);
    return __PRIVATE_validateNewFieldFilter(e._query, t), new Query(e.firestore, e.converter, __PRIVATE_queryWithAddedFilter(e._query, t));
  }
  _parse(e) {
    const t = __PRIVATE_newUserDataReader(e.firestore), n = function __PRIVATE_newQueryFilter(e2, t2, n2, r2, i, s, o) {
      let _;
      if (i.isKeyField()) {
        if ("array-contains" === s || "array-contains-any" === s) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid Query. You can't perform '${s}' queries on documentId().`);
        if ("in" === s || "not-in" === s) {
          __PRIVATE_validateDisjunctiveFilterElements(o, s);
          const t3 = [];
          for (const n3 of o) t3.push(__PRIVATE_parseDocumentIdValue(r2, e2, n3));
          _ = {
            arrayValue: {
              values: t3
            }
          };
        } else _ = __PRIVATE_parseDocumentIdValue(r2, e2, o);
      } else "in" !== s && "not-in" !== s && "array-contains-any" !== s || __PRIVATE_validateDisjunctiveFilterElements(o, s), _ = __PRIVATE_parseQueryValue(
        n2,
        t2,
        o,
        /* allowArrays= */
        "in" === s || "not-in" === s
      );
      const a2 = FieldFilter.create(i, s, _);
      return a2;
    }(e._query, "where", t, e.firestore._databaseId, this._field, this._op, this._value);
    return n;
  }
};
function where(e, t, n) {
  const r2 = t, i = __PRIVATE_fieldPathFromArgument("where", e);
  return QueryFieldFilterConstraint._create(i, r2, n);
}
var QueryCompositeFilterConstraint = class _QueryCompositeFilterConstraint extends AppliableConstraint {
  /**
   * @internal
   */
  constructor(e, t) {
    super(), this.type = e, this._queryConstraints = t;
  }
  static _create(e, t) {
    return new _QueryCompositeFilterConstraint(e, t);
  }
  _parse(e) {
    const t = this._queryConstraints.map((t2) => t2._parse(e)).filter((e2) => e2.getFilters().length > 0);
    return 1 === t.length ? t[0] : CompositeFilter.create(t, this._getOperator());
  }
  _apply(e) {
    const t = this._parse(e);
    return 0 === t.getFilters().length ? e : (function __PRIVATE_validateNewFilter(e2, t2) {
      let n = e2;
      const r2 = t2.getFlattenedFilters();
      for (const e3 of r2) __PRIVATE_validateNewFieldFilter(n, e3), n = __PRIVATE_queryWithAddedFilter(n, e3);
    }(e._query, t), new Query(e.firestore, e.converter, __PRIVATE_queryWithAddedFilter(e._query, t)));
  }
  _getQueryConstraints() {
    return this._queryConstraints;
  }
  _getOperator() {
    return "and" === this.type ? "and" : "or";
  }
};
var QueryOrderByConstraint = class _QueryOrderByConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t) {
    super(), this._field = e, this._direction = t, /** The type of this query constraint */
    this.type = "orderBy";
  }
  static _create(e, t) {
    return new _QueryOrderByConstraint(e, t);
  }
  _apply(e) {
    const t = function __PRIVATE_newQueryOrderBy(e2, t2, n) {
      if (null !== e2.startAt) throw new FirestoreError(N.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
      if (null !== e2.endAt) throw new FirestoreError(N.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
      const r2 = new OrderBy(t2, n);
      return r2;
    }(e._query, this._field, this._direction);
    return new Query(e.firestore, e.converter, function __PRIVATE_queryWithAddedOrderBy(e2, t2) {
      const n = e2.explicitOrderBy.concat([t2]);
      return new __PRIVATE_QueryImpl(e2.path, e2.collectionGroup, n, e2.filters.slice(), e2.limit, e2.limitType, e2.startAt, e2.endAt);
    }(e._query, t));
  }
};
function orderBy(e, t = "asc") {
  const n = t, r2 = __PRIVATE_fieldPathFromArgument("orderBy", e);
  return QueryOrderByConstraint._create(r2, n);
}
var QueryLimitConstraint = class _QueryLimitConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t, n) {
    super(), this.type = e, this._limit = t, this._limitType = n;
  }
  static _create(e, t, n) {
    return new _QueryLimitConstraint(e, t, n);
  }
  _apply(e) {
    return new Query(e.firestore, e.converter, __PRIVATE_queryWithLimit(e._query, this._limit, this._limitType));
  }
};
function limit(e) {
  return __PRIVATE_validatePositiveNumber("limit", e), QueryLimitConstraint._create(
    "limit",
    e,
    "F"
    /* LimitType.First */
  );
}
function __PRIVATE_parseDocumentIdValue(e, t, n) {
  if ("string" == typeof (n = getModularInstance(n))) {
    if ("" === n) throw new FirestoreError(N.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
    if (!__PRIVATE_isCollectionGroupQuery(t) && -1 !== n.indexOf("/")) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
    const r2 = t.path.child(ResourcePath.fromString(n));
    if (!DocumentKey.isDocumentKey(r2)) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r2}' is not because it has an odd number of segments (${r2.length}).`);
    return __PRIVATE_refValue(e, new DocumentKey(r2));
  }
  if (n instanceof DocumentReference) return __PRIVATE_refValue(e, n._key);
  throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${__PRIVATE_valueDescription(n)}.`);
}
function __PRIVATE_validateDisjunctiveFilterElements(e, t) {
  if (!Array.isArray(e) || 0 === e.length) throw new FirestoreError(N.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${t.toString()}' filters.`);
}
function __PRIVATE_validateNewFieldFilter(e, t) {
  const n = function __PRIVATE_findOpInsideFilters(e2, t2) {
    for (const n2 of e2) for (const e3 of n2.getFlattenedFilters()) if (t2.indexOf(e3.op) >= 0) return e3.op;
    return null;
  }(e.filters, function __PRIVATE_conflictingOps(e2) {
    switch (e2) {
      case "!=":
        return [
          "!=",
          "not-in"
          /* Operator.NOT_IN */
        ];
      case "array-contains-any":
      case "in":
        return [
          "not-in"
          /* Operator.NOT_IN */
        ];
      case "not-in":
        return [
          "array-contains-any",
          "in",
          "not-in",
          "!="
          /* Operator.NOT_EQUAL */
        ];
      default:
        return [];
    }
  }(t.op));
  if (null !== n)
    throw n === t.op ? new FirestoreError(N.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${t.op.toString()}' filter.`) : new FirestoreError(N.INVALID_ARGUMENT, `Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`);
}
var AbstractUserDataWriter = class {
  convertValue(e, t = "none") {
    switch (__PRIVATE_typeOrder(e)) {
      case 0:
        return null;
      case 1:
        return e.booleanValue;
      case 2:
        return __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue);
      case 3:
        return this.convertTimestamp(e.timestampValue);
      case 4:
        return this.convertServerTimestamp(e, t);
      case 5:
        return e.stringValue;
      case 6:
        return this.convertBytes(__PRIVATE_normalizeByteString(e.bytesValue));
      case 7:
        return this.convertReference(e.referenceValue);
      case 8:
        return this.convertGeoPoint(e.geoPointValue);
      case 9:
        return this.convertArray(e.arrayValue, t);
      case 11:
        return this.convertObject(e.mapValue, t);
      case 10:
        return this.convertVectorValue(e.mapValue);
      default:
        throw fail(62114, {
          value: e
        });
    }
  }
  convertObject(e, t) {
    return this.convertObjectMap(e.fields, t);
  }
  /**
   * @internal
   */
  convertObjectMap(e, t = "none") {
    const n = {};
    return forEach(e, (e2, r2) => {
      n[e2] = this.convertValue(r2, t);
    }), n;
  }
  /**
   * @internal
   */
  convertVectorValue(e) {
    const t = e.fields?.[Et].arrayValue?.values?.map((e2) => __PRIVATE_normalizeNumber(e2.doubleValue));
    return new VectorValue(t);
  }
  convertGeoPoint(e) {
    return new GeoPoint(__PRIVATE_normalizeNumber(e.latitude), __PRIVATE_normalizeNumber(e.longitude));
  }
  convertArray(e, t) {
    return (e.values || []).map((e2) => this.convertValue(e2, t));
  }
  convertServerTimestamp(e, t) {
    switch (t) {
      case "previous":
        const n = __PRIVATE_getPreviousValue(e);
        return null == n ? null : this.convertValue(n, t);
      case "estimate":
        return this.convertTimestamp(__PRIVATE_getLocalWriteTime(e));
      default:
        return null;
    }
  }
  convertTimestamp(e) {
    const t = __PRIVATE_normalizeTimestamp(e);
    return new Timestamp(t.seconds, t.nanos);
  }
  convertDocumentKey(e, t) {
    const n = ResourcePath.fromString(e);
    __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(n), 9688, {
      name: e
    });
    const r2 = new DatabaseId(n.get(1), n.get(3)), i = new DocumentKey(n.popFirst(5));
    return r2.isEqual(t) || // TODO(b/64130202): Somehow support foreign references.
    __PRIVATE_logError(`Document ${i} contains a document reference within a different database (${r2.projectId}/${r2.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), i;
  }
};
function __PRIVATE_applyFirestoreDataConverter(e, t, n) {
  let r2;
  return r2 = e ? n && (n.merge || n.mergeFields) ? e.toFirestore(t, n) : e.toFirestore(t) : t, r2;
}
var SnapshotMetadata = class {
  /** @hideconstructor */
  constructor(e, t) {
    this.hasPendingWrites = e, this.fromCache = t;
  }
  /**
   * Returns true if this `SnapshotMetadata` is equal to the provided one.
   *
   * @param other - The `SnapshotMetadata` to compare against.
   * @returns true if this `SnapshotMetadata` is equal to the provided one.
   */
  isEqual(e) {
    return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
  }
};
var DocumentSnapshot = class _DocumentSnapshot extends DocumentSnapshot$1 {
  /** @hideconstructor protected */
  constructor(e, t, n, r2, i, s) {
    super(e, t, n, r2, s), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
  }
  /**
   * Returns whether or not the data exists. True if the document exists.
   */
  exists() {
    return super.exists();
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document or `undefined` if
   * the document doesn't exist.
   */
  data(e = {}) {
    if (this._document) {
      if (this._converter) {
        const t = new QueryDocumentSnapshot(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(t, e);
      }
      return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @param options - An options object to configure how the field is retrieved
   * from the snapshot (for example the desired behavior for server timestamps
   * that have not yet been set to their final value).
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e, t = {}) {
    if (this._document) {
      const n = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", e));
      if (null !== n) return this._userDataWriter.convertValue(n, t.serverTimestamps);
    }
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentSnapshot` instance.
   *
   * @returns a JSON representation of this object.  Throws a {@link FirestoreError} if this
   * `DocumentSnapshot` has pending writes.
   */
  toJSON() {
    if (this.metadata.hasPendingWrites) throw new FirestoreError(N.FAILED_PRECONDITION, "DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
    const e = this._document, t = {};
    if (t.type = _DocumentSnapshot._jsonSchemaVersion, t.bundle = "", t.bundleSource = "DocumentSnapshot", t.bundleName = this._key.toString(), !e || !e.isValidDocument() || !e.isFoundDocument()) return t;
    this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields, "previous");
    return t.bundle = (this._firestore, this.ref.path, "NOT SUPPORTED"), t;
  }
};
DocumentSnapshot._jsonSchemaVersion = "firestore/documentSnapshot/1.0", DocumentSnapshot._jsonSchema = {
  type: property("string", DocumentSnapshot._jsonSchemaVersion),
  bundleSource: property("string", "DocumentSnapshot"),
  bundleName: property("string"),
  bundle: property("string")
};
var QueryDocumentSnapshot = class extends DocumentSnapshot {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @override
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document.
   */
  data(e = {}) {
    return super.data(e);
  }
};
var QuerySnapshot = class _QuerySnapshot {
  /** @hideconstructor */
  constructor(e, t, n, r2) {
    this._firestore = e, this._userDataWriter = t, this._snapshot = r2, this.metadata = new SnapshotMetadata(r2.hasPendingWrites, r2.fromCache), this.query = n;
  }
  /** An array of all the documents in the `QuerySnapshot`. */
  get docs() {
    const e = [];
    return this.forEach((t) => e.push(t)), e;
  }
  /** The number of documents in the `QuerySnapshot`. */
  get size() {
    return this._snapshot.docs.size;
  }
  /** True if there are no documents in the `QuerySnapshot`. */
  get empty() {
    return 0 === this.size;
  }
  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg - The `this` binding for the callback.
   */
  forEach(e, t) {
    this._snapshot.docs.forEach((n) => {
      e.call(t, new QueryDocumentSnapshot(this._firestore, this._userDataWriter, n.key, n, new SnapshotMetadata(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
    });
  }
  /**
   * Returns an array of the documents changes since the last snapshot. If this
   * is the first snapshot, all documents will be in the list as 'added'
   * changes.
   *
   * @param options - `SnapshotListenOptions` that control whether metadata-only
   * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
   * snapshot events.
   */
  docChanges(e = {}) {
    const t = !!e.includeMetadataChanges;
    if (t && this._snapshot.excludesMetadataChanges) throw new FirestoreError(N.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
    return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === t || (this._cachedChanges = /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
    function __PRIVATE_changesFromSnapshot(e2, t2) {
      if (e2._snapshot.oldDocs.isEmpty()) {
        let t3 = 0;
        return e2._snapshot.docChanges.map((n) => {
          const r2 = new QueryDocumentSnapshot(e2._firestore, e2._userDataWriter, n.doc.key, n.doc, new SnapshotMetadata(e2._snapshot.mutatedKeys.has(n.doc.key), e2._snapshot.fromCache), e2.query.converter);
          return n.doc, {
            type: "added",
            doc: r2,
            oldIndex: -1,
            newIndex: t3++
          };
        });
      }
      {
        let n = e2._snapshot.oldDocs;
        return e2._snapshot.docChanges.filter((e3) => t2 || 3 !== e3.type).map((t3) => {
          const r2 = new QueryDocumentSnapshot(e2._firestore, e2._userDataWriter, t3.doc.key, t3.doc, new SnapshotMetadata(e2._snapshot.mutatedKeys.has(t3.doc.key), e2._snapshot.fromCache), e2.query.converter);
          let i = -1, s = -1;
          return 0 !== t3.type && (i = n.indexOf(t3.doc.key), n = n.delete(t3.doc.key)), 1 !== t3.type && (n = n.add(t3.doc), s = n.indexOf(t3.doc.key)), {
            type: __PRIVATE_resultChangeType(t3.type),
            doc: r2,
            oldIndex: i,
            newIndex: s
          };
        });
      }
    }(this, t), this._cachedChangesIncludeMetadataChanges = t), this._cachedChanges;
  }
  /**
   * Returns a JSON-serializable representation of this `QuerySnapshot` instance.
   *
   * @returns a JSON representation of this object. Throws a {@link FirestoreError} if this
   * `QuerySnapshot` has pending writes.
   */
  toJSON() {
    if (this.metadata.hasPendingWrites) throw new FirestoreError(N.FAILED_PRECONDITION, "QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
    const e = {};
    e.type = _QuerySnapshot._jsonSchemaVersion, e.bundleSource = "QuerySnapshot", e.bundleName = __PRIVATE_AutoId.newId(), this._firestore._databaseId.database, this._firestore._databaseId.projectId;
    const t = [], n = [], r2 = [];
    return this.docs.forEach((e2) => {
      null !== e2._document && (t.push(e2._document), n.push(this._userDataWriter.convertObjectMap(e2._document.data.value.mapValue.fields, "previous")), r2.push(e2.ref.path));
    }), e.bundle = (this._firestore, this.query._query, e.bundleName, "NOT SUPPORTED"), e;
  }
};
function __PRIVATE_resultChangeType(e) {
  switch (e) {
    case 0:
      return "added";
    case 2:
    case 3:
      return "modified";
    case 1:
      return "removed";
    default:
      return fail(61501, {
        type: e
      });
  }
}
function getDoc(e) {
  e = __PRIVATE_cast(e, DocumentReference);
  const t = __PRIVATE_cast(e.firestore, Firestore);
  return __PRIVATE_firestoreClientGetDocumentViaSnapshotListener(ensureFirestoreConfigured(t), e._key).then((n) => __PRIVATE_convertToDocSnapshot(t, e, n));
}
QuerySnapshot._jsonSchemaVersion = "firestore/querySnapshot/1.0", QuerySnapshot._jsonSchema = {
  type: property("string", QuerySnapshot._jsonSchemaVersion),
  bundleSource: property("string", "QuerySnapshot"),
  bundleName: property("string"),
  bundle: property("string")
};
var __PRIVATE_ExpUserDataWriter = class extends AbstractUserDataWriter {
  constructor(e) {
    super(), this.firestore = e;
  }
  convertBytes(e) {
    return new Bytes(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new DocumentReference(
      this.firestore,
      /* converter= */
      null,
      t
    );
  }
};
function getDocs(e) {
  e = __PRIVATE_cast(e, Query);
  const t = __PRIVATE_cast(e.firestore, Firestore), n = ensureFirestoreConfigured(t), r2 = new __PRIVATE_ExpUserDataWriter(t);
  return __PRIVATE_validateHasExplicitOrderByForLimitToLast(e._query), __PRIVATE_firestoreClientGetDocumentsViaSnapshotListener(n, e._query).then((n2) => new QuerySnapshot(t, r2, e, n2));
}
function setDoc(e, t, n) {
  e = __PRIVATE_cast(e, DocumentReference);
  const r2 = __PRIVATE_cast(e.firestore, Firestore), i = __PRIVATE_applyFirestoreDataConverter(e.converter, t, n);
  return executeWrite(r2, [__PRIVATE_parseSetData(__PRIVATE_newUserDataReader(r2), "setDoc", e._key, i, null !== e.converter, n).toMutation(e._key, Precondition.none())]);
}
function updateDoc(e, t, n, ...r2) {
  e = __PRIVATE_cast(e, DocumentReference);
  const i = __PRIVATE_cast(e.firestore, Firestore), s = __PRIVATE_newUserDataReader(i);
  let o;
  o = "string" == typeof // For Compat types, we have to "extract" the underlying types before
  // performing validation.
  (t = getModularInstance(t)) || t instanceof FieldPath ? __PRIVATE_parseUpdateVarargs(s, "updateDoc", e._key, t, n, r2) : __PRIVATE_parseUpdateData(s, "updateDoc", e._key, t);
  return executeWrite(i, [o.toMutation(e._key, Precondition.exists(true))]);
}
function deleteDoc(e) {
  return executeWrite(__PRIVATE_cast(e.firestore, Firestore), [new __PRIVATE_DeleteMutation(e._key, Precondition.none())]);
}
function executeWrite(e, t) {
  return function __PRIVATE_firestoreClientWrite(e2, t2) {
    const n = new __PRIVATE_Deferred();
    return e2.asyncQueue.enqueueAndForget(async () => __PRIVATE_syncEngineWrite(await __PRIVATE_getSyncEngine(e2), t2, n)), n.promise;
  }(ensureFirestoreConfigured(e), t);
}
function __PRIVATE_convertToDocSnapshot(e, t, n) {
  const r2 = n.docs.get(t._key), i = new __PRIVATE_ExpUserDataWriter(e);
  return new DocumentSnapshot(e, i, t._key, r2, new SnapshotMetadata(n.hasPendingWrites, n.fromCache), t.converter);
}
function arrayUnion(...e) {
  return new __PRIVATE_ArrayUnionFieldValueImpl("arrayUnion", e);
}
function arrayRemove(...e) {
  return new __PRIVATE_ArrayRemoveFieldValueImpl("arrayRemove", e);
}
!function __PRIVATE_registerFirestore(e, t = true) {
  !function __PRIVATE_setSDKVersion(e2) {
    x = e2;
  }(SDK_VERSION), _registerComponent(new Component("firestore", (e2, { instanceIdentifier: n, options: r2 }) => {
    const i = e2.getProvider("app").getImmediate(), s = new Firestore(new __PRIVATE_FirebaseAuthCredentialsProvider(e2.getProvider("auth-internal")), new __PRIVATE_FirebaseAppCheckTokenProvider(i, e2.getProvider("app-check-internal")), function __PRIVATE_databaseIdFromApp(e3, t2) {
      if (!Object.prototype.hasOwnProperty.apply(e3.options, ["projectId"])) throw new FirestoreError(N.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new DatabaseId(e3.options.projectId, t2);
    }(i, n), i);
    return r2 = {
      useFetchStreams: t,
      ...r2
    }, s._setSettings(r2), s;
  }, "PUBLIC").setMultipleInstances(true)), registerVersion(F, M, e), // BUILD_TARGET will be replaced by values like esm, cjs, etc during the compilation
  registerVersion(F, M, "esm2020");
}();

// src/Database.ts
var firebaseConfig = {
  apiKey: "AIzaSyAdeL4DWDYsgIRj6x7n5vDtmcptlSf_rpg",
  authDomain: "syrch-1dd39.firebaseapp.com",
  projectId: "syrch-1dd39",
  storageBucket: "syrch-1dd39.firebasestorage.app",
  messagingSenderId: "986491950281",
  appId: "1:986491950281:web:a8c5c1fe421e1238fe2918",
  measurementId: "G-C1YP0PW2FL"
};
var app = initializeApp(firebaseConfig);
var db = getFirestore(app);
var analytics = getAnalytics(app);
async function login(address, ens) {
  if (!address) {
    throw new Error("No wallet connected. Address is null.");
  }
  resetAppState();
  const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
  const ref = doc(db, "users", checksumAddress);
  const snap = await getDoc(ref);
  if (DEBUG.ENABLED) {
    console.log(`[DATABASE-READ] Checking user: ${checksumAddress}`);
  }
  if (snap.exists()) {
    const user = snap.data();
    await loadIndexedDB(address);
    if (ens && user.ens !== ens) {
      await updateDoc(ref, { ens });
      if (DEBUG.ENABLED) console.log(`[DATABASE-WRITE] ENS updated for ${PLUGINS.sypher.truncate(checksumAddress)}: ${ens}`);
    }
    if (DEBUG.ENABLED) console.log(`User found: ${PLUGINS.sypher.truncate(checksumAddress)}`, user);
    return user;
  } else {
    return createAccount(ref, checksumAddress, ens);
  }
}
async function createAccount(ref, address, ens) {
  const newUser = {
    // Create new default account, and store anything the user already did before creation
    created: Date.now(),
    ens: ens ?? null,
    favorites: Array.from(userFavorites),
    karma: 0,
    // Default karma
    trash: Array.from(userTrash)
  };
  await setDoc(ref, newUser);
  if (DEBUG.ENABLED) {
    console.log(`[DATABASE-WRITE] New user created: ${address}`, newUser);
  }
  await migrateGuestCache(address);
  resetAppState();
  await loadIndexedDB(address);
  return newUser;
}
async function updateUser(syncGlobal, address, data) {
  if (!address) {
    if (USER.address) {
      address = USER.address;
    } else {
      throw new Error("No user address set. Cannot update user.");
    }
  }
  if (!data) {
    const karma = await syncKarma(address);
    data = {
      favorites: Array.from(userFavorites),
      trash: Array.from(userTrash),
      ens: USER.ens ?? null,
      karma
    };
  }
  const hasData = !!(data.favorites?.length || data.trash?.length);
  if (!hasData) {
    if (DEBUG.ENABLED) {
      console.log(`Local state is empty for user ${PLUGINS.sypher.truncate(address)}...`);
    }
  }
  const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
  const ref = doc(db, "users", checksumAddress);
  await setDoc(ref, data, { merge: true });
  if (DEBUG.ENABLED) {
    console.log(`[DATABASE-WRITE] User updated in DB: ${PLUGINS.sypher.truncate(checksumAddress)}`, data);
  }
  if (syncGlobal) {
    syncGlobalFavorites();
  }
}
async function cloudSync(dbUser, address) {
  const localFavCount = userFavorites.size;
  const localTrashCount = userTrash.size;
  const hasCloud = (dbUser.favorites?.length || 0) > 0 || (dbUser.trash?.length || 0) > 0;
  console.log(`Cloud Sync Check for ${address}: Local Favorites = ${localFavCount}, Local Trash = ${localTrashCount}, Cloud Data Present = ${hasCloud}`);
  if (localFavCount > 0 || localTrashCount > 0) {
    const karma = await syncKarma(address);
    await updateUser(false, address, {
      favorites: Array.from(userFavorites),
      trash: Array.from(userTrash),
      ens: USER.ens ?? null,
      karma
    });
    await syncGlobalFavorites();
    return;
  } else if (hasCloud) {
    for (const url of dbUser.favorites || []) {
      if (!userFavorites.has(url)) {
        if (DEBUG.ENABLED) {
          console.log(`Adding favorite from cloud: ${url}`);
        }
        userFavorites.add(url);
        renderValidResult(url, "favorites_container");
        await saveFavorite(url);
      }
    }
    for (const url of dbUser.trash || []) {
      if (!userTrash.has(url)) {
        userTrash.add(url);
        renderValidResult(url, "trash_bin_container");
        await saveTrash(url);
      }
    }
  }
}
async function syncGlobalFavorites() {
  if (!USER.address) throw new Error("No wallet address available for global favorites sync.");
  const checksumAddress = PLUGINS.ethers.utils.getAddress(USER.address);
  try {
    const favsSnapshot = await getDocs(
      query(collection(db, "favorites"), where("favorites", "array-contains", checksumAddress))
    );
    for (const docSnap of favsSnapshot.docs) {
      const docId = docSnap.id;
      const url = docId.replace(/_/g, "/");
      if (!userFavorites.has(url)) {
        const data = docSnap.data();
        const discovery = data.discovery || {};
        const favoritesArr = data.favorites || [];
        if (discovery.uid === checksumAddress) {
          const others = favoritesArr.filter((uid) => uid !== checksumAddress);
          if (others.length === 0) {
            await deleteDoc(docSnap.ref);
            if (discovery.uid) {
              const discovererRef = doc(db, "users", discovery.uid);
              await updateDoc(discovererRef, { discoveries: arrayRemove(docId) });
            }
            if (DEBUG.ENABLED) {
              console.log(`[DATABASE-WRITE] Deleted ${url}; removed from discoverer ${checksumAddress} discoveries`);
            }
          } else {
            await updateDoc(docSnap.ref, { favorites: arrayRemove(checksumAddress) });
            if (DEBUG.ENABLED) {
              console.log(`[DATABASE-WRITE] Removed discoverer ${checksumAddress} from favorites for ${url}; doc kept`);
            }
          }
          continue;
        }
        if (favoritesArr.length === 1) {
          await deleteDoc(docSnap.ref);
          if (discovery.uid) {
            const discovererRef = doc(db, "users", discovery.uid);
            await updateDoc(discovererRef, { discoveries: arrayRemove(docId) });
          }
          if (DEBUG.ENABLED) {
            console.log(`[DATABASE-WRITE] Deleted ${url}; removed from original discoverer ${discovery.uid} discoveries`);
          }
        } else {
          await updateDoc(docSnap.ref, { favorites: arrayRemove(checksumAddress) });
          if (DEBUG.ENABLED) {
            console.log(`[DATABASE-WRITE] Removed ${checksumAddress} from global favorite ${url}`);
          }
        }
      }
    }
    await syncKarma(checksumAddress);
  } catch (err) {
    console.error(`Error cleaning stale global favorites for ${checksumAddress}:`, err);
  }
  for (const url of userFavorites) {
    try {
      const docId = sanatizeURL(url);
      const favRef = doc(db, "favorites", docId);
      const snap = await getDoc(favRef);
      if (!snap.exists()) {
        await setDoc(favRef, {
          discovery: {
            uid: checksumAddress,
            timestamp: Date.now(),
            ...USER.ens ? { ens: USER.ens } : {}
          },
          favorites: [checksumAddress]
        });
        const userRef = doc(db, "users", checksumAddress);
        await updateDoc(userRef, {
          discoveries: arrayUnion(docId)
          // Add to user's personal discoveries
        });
        await loadGlobalFavorites();
        if (DEBUG.ENABLED) {
          console.log(`[DATABASE-WRITE] Global favorite synced for ${url}`);
        }
        continue;
      }
      const data = snap.data();
      const discovery = data.discovery || {};
      const favoritesArr = data.favorites || [];
      const updates = {};
      if (!discovery.uid) {
        updates["discovery.uid"] = checksumAddress;
        updates["discovery.timestamp"] = Date.now();
        if (USER.ens) updates["discovery.ens"] = USER.ens;
      } else {
        if (discovery.timestamp == null) {
          updates["discovery.timestamp"] = Date.now();
        }
        if (discovery.uid === checksumAddress && USER.ens && discovery.ens !== USER.ens) {
          updates["discovery.ens"] = USER.ens;
        }
      }
      if (!favoritesArr.includes(checksumAddress)) {
        updates["favorites"] = arrayUnion(checksumAddress);
        if (DEBUG.ENABLED) {
          console.log(`User ${checksumAddress} added to favorites for ${url}`);
        }
        if (discovery.uid && discovery.uid !== checksumAddress) {
          if (DEBUG.ENABLED) {
            console.log(`
                            User ${checksumAddress} not discoverer, for ${url}.
                            Updating karma for discoverer: ${discovery.uid}
                        `);
          }
          await syncKarma(discovery.uid);
        }
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(favRef, updates);
        if (DEBUG.ENABLED) {
          console.log(`[DATABASE-WRITE] Global favorite updated for ${url}`, updates);
        }
      }
    } catch (err) {
      console.error(`Error syncing global favorite for ${url}:`, err);
    }
  }
}
async function loadGlobalFavorites() {
  const snapshot = await getDocs(collection(db, "favorites"));
  if (!ui.globalResultsTable) {
    throw new Error("Global results table not found");
  }
  if (DEBUG.ENABLED) {
    console.log("[DATABASE-READ] Loading global favorites");
  }
  if (ui.globalResultsPlaceholder) {
    ui.globalResultsPlaceholder.remove();
    ui.globalResultsPlaceholder = void 0;
  }
  ui.globalResultsTable.querySelectorAll("tr:not(#global_results_header_row)").forEach((el) => el.remove());
  if (snapshot.empty) {
    const row = document.createElement("tr");
    row.className = `placeholder_row`;
    row.innerHTML = `
            <td colspan="5">No Results Available</td>
        `;
    ui.globalResultsTable.appendChild(row);
    return;
  }
  let position = 1;
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const uid = data.discovery?.uid || "Unknown";
    const displayName = data.discovery?.ens ? PLUGINS.sypher.truncate(data.discovery.ens, 5, 4) : PLUGINS.sypher.truncate(uid, 5, 4);
    const result = {
      doc: docSnap.id,
      url: docSnap.id.replace(/_/g, "/"),
      // revert sanitizeURL
      discoverer: displayName,
      discoveredOn: new Date(data.discovery?.timestamp || 0).toLocaleString(void 0, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      karma: data.favorites?.length || 0
    };
    const row = document.createElement("tr");
    row.id = `global_result_${result.doc}`;
    row.innerHTML = `
            <td>${position}</td>
            <td><a href="https://${result.url}" target="_blank">${result.url}</a></td>
            <td><a href="https://blockscan.com/address/${uid}" target="_blank">${PLUGINS.sypher.truncate(result.discoverer, 5, 4)}</a></td>
            <td>${result.discoveredOn}</td>
            <td>${result.karma}</td>
        `;
    ui.globalResultsTable.appendChild(row);
    position++;
  });
}
var MIN_KARMA = 1;
async function loadGlobalSyrchers() {
  if (!ui.globalSyrchersTable) {
    throw new Error("Global Syrchers table not found");
  }
  ui.globalSyrchersTable.querySelectorAll("tr:not(#syrchers_header_row)").forEach((el) => el.remove());
  const q2 = query(
    collection(db, "users"),
    where("karma", ">=", MIN_KARMA),
    orderBy("karma", "desc"),
    limit(50)
    // cap leaderboard length
  );
  const snapshot = await getDocs(q2);
  if (snapshot.empty) {
    const row = document.createElement("tr");
    row.className = `placeholder_row`;
    row.innerHTML = `
            <td colspan="5">No Results Available</td>
        `;
    ui.globalSyrchersTable.appendChild(row);
    return;
  }
  let position = 1;
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const displayName = data.ens ? PLUGINS.sypher.truncate(data.ens, 5, 4) : PLUGINS.sypher.truncate(docSnap.id, 5, 4);
    const discoveries = data.discoveries?.length || 0;
    const userSince = new Date(data.created || 0).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    const row = document.createElement("tr");
    row.id = `syrcher_${docSnap.id}`;
    row.innerHTML = `
            <td>${position}</td>
            <td><a href="https://blockscan.com/address/${docSnap.id}" target="_blank">${displayName}</a></td>
            <td>${discoveries}</td>
            <td>${userSince}</td>
            <td>${data.karma}</td>
        `;
    ui.globalSyrchersTable.appendChild(row);
    position++;
  });
}
async function syncENS(ens) {
  if (!USER.address || !ens) return;
  try {
    const checksumAddress = PLUGINS.ethers.utils.getAddress(USER.address);
    const ref = doc(db, "users", checksumAddress);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const user = snap.data();
      if (user.ens !== ens) {
        await updateDoc(ref, { ens });
        if (DEBUG.ENABLED) {
          console.log(`ENS updated for ${PLUGINS.sypher.truncate(checksumAddress, 4, 4)}: ${ens}`);
        }
      }
    }
  } catch (err) {
    console.error("Failed to update ENS:", err);
  }
}
async function syncKarma(address) {
  const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
  const userRef = doc(db, "users", checksumAddress);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return 0;
  if (DEBUG.ENABLED) {
    console.log(`[DATABASE-READ] Syncing karma for user: ${PLUGINS.sypher.truncate(checksumAddress)}`);
  }
  const user = userSnap.data();
  const discoveries = user.discoveries || [];
  if (discoveries.length === 0) {
    if (DEBUG.ENABLED) console.log(`No discoveries found for user ${checksumAddress}. Setting karma to 0.`);
    await updateDoc(userRef, { karma: 0 });
    return 0;
  }
  let totalKarma = 0;
  let count = 0;
  for (const docId of discoveries) {
    const favRef = doc(db, "favorites", docId);
    const favSnap = await getDoc(favRef);
    if (favSnap.exists()) {
      const data = favSnap.data();
      const karma = data.favorites?.length || 0;
      totalKarma += karma;
      count++;
    }
  }
  if (DEBUG.ENABLED) {
    console.log(`Karma for ${checksumAddress}: ${totalKarma} (based on ${count} discoveries)`);
  }
  await updateDoc(userRef, { karma: totalKarma });
  loadGlobalSyrchers();
  return totalKarma;
}

// src/InterfaceConfig.ts
var ICON = {
  LOGO: {
    TYPE: "svg",
    SVG: `
            <svg class="header_svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105.87 120.22">
                <defs>
                    <style>
                        .cls-1 {
                            fill: #aaaaaa;
                        }
                    </style>
                </defs>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="svg1">
                        <g id="layer1">
                            <g id="g28">
                                <path id="path18-6-3" class="cls-1"
                                    d="M15.16,0h7V16.56H42.35V0h7V16.56h52.22l2.3,2.54q-5,20.15-15.54,34.48a83.94,83.94,0,0,1-18,17.81h30l4.19,3.72A117.92,117.92,0,0,1,86.24,95.7l-5.07-4.62a100.71,100.71,0,0,0,13-13.1H80.54l-.07,7.41q0,12.7-4.19,20.5a43,43,0,0,1-12.32,14l-5.2-5.23a33,33,0,0,0,11.59-12q3.77-7,3.76-17.24L74,78H55.62V71.39A77.14,77.14,0,0,0,81.19,51.5a70.26,70.26,0,0,0,14.18-28H80.46C80,25.78,77.65,35.39,66.37,49.46A193.42,193.42,0,0,1,47.31,68.51v41.68h-7V74.26Q26,85,15.17,89.2l-3.93-6.43Q36.8,73.55,61,44.84s11.5-14.36,11.39-21.32H64.51v0H49.35v12.7a28.57,28.57,0,0,1-5.9,17A36,36,0,0,1,26.89,65.61l-4.43-6.88Q31.84,56.35,37.1,50a21.06,21.06,0,0,0,5.25-13.57V23.56H22.16V40.27h-7V23.56H0v-7H15.16ZM76.61,113.11l29,.12.27,7-29-.12Z" />
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        `,
    CLASS: "header_svg"
  },
  FAVORITE: {
    TYPE: "svg",
    SVG: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" fill="#4d4d4d">
            </path> </g>
            </svg>`
  },
  TRASH: {
    TYPE: "svg",
    SVG: `<svg viewBox="0 -5 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#4d4d4d"><g id="SVGRepo_iconCarrier"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-518.000000, -1146.000000)" fill="#4d4d4d"> <path d="M540.647,1159.24 C541.039,1159.63 541.039,1160.27 540.647,1160.66 C540.257,1161.05 539.623,1161.05 539.232,1160.66 L536.993,1158.42 L534.725,1160.69 C534.331,1161.08 533.692,1161.08 533.298,1160.69 C532.904,1160.29 532.904,1159.65 533.298,1159.26 L535.566,1156.99 L533.327,1154.76 C532.936,1154.37 532.936,1153.73 533.327,1153.34 C533.718,1152.95 534.352,1152.95 534.742,1153.34 L536.981,1155.58 L539.281,1153.28 C539.676,1152.89 540.314,1152.89 540.708,1153.28 C541.103,1153.68 541.103,1154.31 540.708,1154.71 L538.408,1157.01 L540.647,1159.24 L540.647,1159.24 Z M545.996,1146 L528.051,1146 C527.771,1145.98 527.485,1146.07 527.271,1146.28 L518.285,1156.22 C518.074,1156.43 517.983,1156.71 517.998,1156.98 C517.983,1157.26 518.074,1157.54 518.285,1157.75 L527.271,1167.69 C527.467,1167.88 527.723,1167.98 527.979,1167.98 L527.979,1168 L545.996,1168 C548.207,1168 550,1166.21 550,1164 L550,1150 C550,1147.79 548.207,1146 545.996,1146 L545.996,1146 Z" id="delete" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>`
  },
  BACKUP: {
    TYPE: "svg",
    SVG: `
            <?xml version="1.0" encoding="utf-8"?>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9.5V15.5M12 9.5L10 11.5M12 9.5L14 11.5M8.4 19C5.41766 19 3 16.6044 3 13.6493C3 11.2001 4.8 8.9375 7.5 8.5C8.34694 6.48637 10.3514 5 12.6893 5C15.684 5 18.1317 7.32251 18.3 10.25C19.8893 10.9449 21 12.6503 21 14.4969C21 16.9839 18.9853 19 16.5 19L8.4 19Z" stroke="#4d4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `
  },
  TRASH_TOGGLE: {
    SHOW: {
      TYPE: "svg",
      SVG: `
<svg fill="#4d4d4d" version="1.1" id="Layer_1" xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;"
	 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 24 24">
<g>
	<g>
		<g>
			<path d="M20,24H4c-2.2,0-4-1.8-4-4V4c0-2.2,1.8-4,4-4h16c2.2,0,4,1.8,4,4v16C24,22.2,22.2,24,20,24z M4,2C2.9,2,2,2.9,2,4v16
				c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4c0-1.1-0.9-2-2-2H4z"/>
		</g>
	</g>
	<g>
		<g>
			<path d="M8,24c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v22C9,23.6,8.6,24,8,24z"/>
		</g>
	</g>
	<g>
		<g>
			<g>
				<path d="M17,13c-0.3,0-0.5-0.1-0.7-0.3l-3-3c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l3,3c0.4,0.4,0.4,1,0,1.4C17.5,12.9,17.3,13,17,13
					z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M14,16c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l3-3c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-3,3C14.5,15.9,14.3,16,14,16
					z"/>
			</g>
		</g>
	</g>
</g>
</svg>
            `
    },
    HIDE: {
      TYPE: "svg",
      SVG: `
<svg fill="#4d4d4d" version="1.1" id="Layer_1" xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;"
	 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 24 24">
<g>
	<g>
		<g>
			<path d="M20,24H4c-2.2,0-4-1.8-4-4V4c0-2.2,1.8-4,4-4h16c2.2,0,4,1.8,4,4v16C24,22.2,22.2,24,20,24z M4,2C2.9,2,2,2.9,2,4v16
				c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4c0-1.1-0.9-2-2-2H4z"/>
		</g>
	</g>
	<g>
		<g>
			<path d="M8,24c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v22C9,23.6,8.6,24,8,24z"/>
		</g>
	</g>
	<g>
		<g>
			<path d="M14,13c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l3-3c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-3,3C14.5,12.9,14.3,13,14,13z
				"/>
		</g>
	</g>
	<g>
		<g>
			<path d="M17,16c-0.3,0-0.5-0.1-0.7-0.3l-3-3c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l3,3c0.4,0.4,0.4,1,0,1.4C17.5,15.9,17.3,16,17,16z
				"/>
		</g>
	</g>
</g>
</svg>
            `
    }
  },
  EMPTY_TRASH: {
    TYPE: "svg",
    SVG: `
        <svg fill="#4d4d4d" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5,22H19a1,1,0,0,0,1-1V6.414a1,1,0,0,0-.293-.707L16.293,2.293A1,1,0,0,0,15.586,2H5A1,1,0,0,0,4,3V21A1,1,0,0,0,5,22ZM8.793,10.207a1,1,0,0,1,1.414-1.414L12,10.586l1.793-1.793a1,1,0,0,1,1.414,1.414L13.414,12l1.793,1.793a1,1,0,1,1-1.414,1.414L12,13.414l-1.793,1.793a1,1,0,0,1-1.414-1.414L10.586,12Z"/></svg>
        `
  },
  GLOBAL_TAB: {
    TYPE: "svg",
    SVG: `
<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
<path fill="#4d4d4d" d="M32,0C15.776,0,2.381,12.077,0.292,27.729c-0.002,0.016-0.004,0.031-0.006,0.047
	c-0.056,0.421-0.106,0.843-0.146,1.269c-0.019,0.197-0.029,0.396-0.045,0.594c-0.021,0.28-0.044,0.56-0.058,0.842
	C0.014,30.983,0,31.49,0,32c0,17.673,14.327,32,32,32s32-14.327,32-32S49.673,0,32,0z M33.362,58.502
	c-0.72,0.787-1.901,1.414-2.675,0.67c-0.653-0.644-0.099-1.44,0-2.353c0.125-1.065-0.362-2.345,0.666-2.676
	c0.837-0.259,1.468,0.322,2.009,1.012C34.187,56.175,34.239,57.526,33.362,58.502z M43.446,49.87
	c-1.18,0.608-2.006,0.494-3.323,0.673c-2.454,0.309-4.394,1.52-6.333,0c-0.867-0.695-0.978-1.451-1.65-2.341
	c-1.084-1.364-1.355-3.879-3.01-3.322c-1.058,0.356-1.026,1.415-1.654,2.335c-0.81,1.156-0.607,2.793-2.005,2.993
	c-0.974,0.138-1.499-0.458-2.321-1c-0.922-0.614-1.104-1.348-2.002-1.993c-0.934-0.689-1.69-0.693-2.654-1.334
	c-0.694-0.463-0.842-1.304-1.673-1.334c-0.751-0.022-1.289,0.346-1.664,0.996c-0.701,1.214-0.942,4.793-2.988,4.665
	c-1.516-0.103-4.758-3.509-5.994-4.327c-0.405-0.273-0.78-0.551-1.158-0.763c-1.829-3.756-2.891-7.952-2.997-12.385
	c0.614-0.515,1.239-0.769,1.819-1.493c0.927-1.13,0.481-2.507,1.673-3.335c0.886-0.604,1.602-0.507,2.669-0.658
	c1.529-0.222,2.491-0.422,3.988,0c1.459,0.409,2.016,1.246,3.326,1.992c1.415,0.81,2.052,1.766,3.66,2.001
	c1.166,0.165,1.966-0.901,2.988-0.337c0.824,0.458,1.406,1.066,1.341,2.001c-0.1,1.218-2.522,0.444-2.659,1.662
	c-0.183,1.558,2.512-0.194,3.992,0.33c0.974,0.355,2.241,0.294,2.325,1.334c0.081,1.156-1.608,0.837-2.657,1.335
	c-1.162,0.541-1.771,0.996-3.004,1.329c-1.125,0.298-2.312-0.628-2.987,0.329c-0.53,0.742-0.343,1.489,0,2.335
	c0.787,1.931,3.349,1.352,5.322,0.657c1.383-0.488,1.641-1.726,2.997-2.329c1.438-0.641,2.554-1.335,3.981-0.663
	c1.178,0.556,0.849,2.05,2.006,2.663c1.253,0.668,2.432-0.729,3.663,0c0.957,0.569,0.887,1.521,1.655,2.327
	c0.894,0.942,1.41,1.702,2.668,2c1.286,0.299,2.072-1.071,3.327-0.671c0.965,0.315,1.755,0.68,1.987,1.672
	C46.465,48.634,44.744,49.198,43.446,49.87z M45.839,33.841c-1.154,1.16-2.156,1.539-3.771,1.893c-1.433,0.315-3.443,1.438-3.772,0
	c-0.251-1.148,1.029-1.558,1.893-2.359c0.959-0.895,1.854-0.983,2.826-1.892c0.87-0.802,0.756-2.031,1.893-2.359
	c1.109-0.32,2.182-0.019,2.825,0.947C48.652,31.438,47.006,32.681,45.839,33.841z M59.989,29.319
	c-0.492,0.508-0.462,1.044-0.965,1.542c-0.557,0.539-1.331,0.307-1.738,0.968c-0.358,0.577-0.13,1.057-0.194,1.735
	c-0.041,0.387-1.924,1.256-2.313,0.385c-0.214-0.481,0.281-0.907,0-1.353c-0.263-0.401-0.555-0.195-0.899,0.181
	c-0.359,0.388-0.772,0.958-1.221,1.172c-0.589,0.273-0.196-2.25-0.395-3.088c-0.146-0.663,0.01-1.08,0.198-1.736
	c0.25-0.91,0.938-1.206,1.155-2.125c0.194-0.806,0.033-1.295,0-2.123c-0.039-0.906-0.015-1.427-0.188-2.314
	c-0.192-0.937-0.252-1.525-0.771-2.316c-0.418-0.624-0.694-1.001-1.354-1.352c-0.16-0.088-0.31-0.146-0.452-0.191
	c-0.34-0.113-0.659-0.128-1.098-0.193c-0.888-0.132-1.522,0.432-2.314,0c-0.462-0.255-0.606-0.575-0.96-0.967
	c-0.404-0.434-0.511-0.789-0.967-1.158c-0.341-0.276-0.552-0.437-0.965-0.581c-0.79-0.263-1.342-0.082-2.126,0.196
	c-0.77,0.268-1.058,0.707-1.739,1.155c-0.522,0.303-0.893,0.371-1.348,0.774c-0.276,0.242-1.59,1.177-2.127,1.155
	c-0.544-0.021-0.851-0.343-1.338-0.382c-0.065-0.008-0.13-0.008-0.204,0c0,0,0,0-0.005,0c-0.473,0.036-0.696,0.269-1.146,0.382
	c-1.107,0.276-1.812-0.115-2.905,0.197c-0.712,0.2-0.993,0.766-1.73,0.771c-0.841,0.005-1.125-0.743-1.932-0.968
	c-0.442-0.118-0.702-0.129-1.157-0.19c-0.749-0.108-1.178-0.119-1.926-0.191H24.86c-0.016,0.006-0.591,0.058-0.688,0
	c-0.422-0.286-0.722-0.521-1.244-0.773c-0.575-0.283-0.919-0.428-1.547-0.584l0.026-0.381c0,0,0-0.847-0.121-1.207
	c-0.115-0.361-0.24-0.361,0-1.086c0.248-0.722,0.679-1.182,0.679-1.182c0.297-0.228,0.516-0.305,0.769-0.58
	c0.51-0.539,0.717-0.998,0.774-1.739c0.067-0.972-1.205-1.367-0.97-2.316c0.209-0.826,0.904-0.98,1.547-1.543
	c0.779-0.67,1.468-0.758,2.12-1.542c0.501-0.593,0.911-0.965,0.97-1.738c0.053-0.657-0.23-1.068-0.57-1.538
	C28.356,2.175,30.157,2,32,2c14.919,0,27.29,10.893,29.605,25.158c-0.203,0.352-0.001,0.796-0.27,1.193
	C60.979,28.894,60.436,28.85,59.989,29.319z"/>
</svg>
        `
  },
  HOME_TAB: {
    TYPE: "svg",
    SVG: `
<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
<g>
	<path fill="#4d4d4d" d="M62.242,53.757L51.578,43.093C54.373,38.736,56,33.56,56,28C56,12.536,43.464,0,28,0S0,12.536,0,28
		s12.536,28,28,28c5.56,0,10.736-1.627,15.093-4.422l10.664,10.664c2.344,2.344,6.142,2.344,8.485,0S64.586,56.101,62.242,53.757z
		 M28,54C13.641,54,2,42.359,2,28S13.641,2,28,2s26,11.641,26,26S42.359,54,28,54z"/>
	<path fill="#4d4d4d" d="M28,4C14.745,4,4,14.745,4,28s10.745,24,24,24s24-10.745,24-24S41.255,4,28,4z M44,29c-0.553,0-1-0.447-1-1
		c0-8.284-6.716-15-15-15c-0.553,0-1-0.447-1-1s0.447-1,1-1c9.389,0,17,7.611,17,17C45,28.553,44.553,29,44,29z"/>
</g>
</svg>
        `
  }
};
var SEARCH_TEXT = {
  // 🌍 Latin-based
  ENGLISH: "Search",
  SPANISH: "Buscar",
  FRENCH: "Chercher",
  GERMAN: "Suchen",
  ITALIAN: "Cercare",
  PORTUGUESE: "Procurar",
  DUTCH: "Zoeken",
  SWEDISH: "S\xF6k",
  NORWEGIAN: "S\xF8k",
  DANISH: "S\xF8g",
  FINNISH: "Hae",
  POLISH: "Szukaj",
  CZECH: "Hledat",
  SLOVAK: "H\u013Eada\u0165",
  HUNGARIAN: "Keres\xE9s",
  ROMANIAN: "C\u0103utare",
  CROATIAN: "Pretra\u017Ei",
  SERBIAN_LATIN: "Pretraga",
  BOSNIAN: "Pretraga",
  SLOVENIAN: "Iskanje",
  ICELANDIC: "Leita",
  MALAY: "Cari",
  INDONESIAN: "Cari",
  FILIPINO: "Maghanap",
  ESPERANTO: "Ser\u0109i",
  // 🔠 Greek
  GREEK: "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7",
  // 🔡 Cyrillic
  RUSSIAN: "\u041F\u043E\u0438\u0441\u043A",
  UKRAINIAN: "\u041F\u043E\u0448\u0443\u043A",
  BELARUSIAN: "\u041F\u043E\u0448\u0443\u043A",
  BULGARIAN: "\u0422\u044A\u0440\u0441\u0435\u043D\u0435",
  SERBIAN_CYRILLIC: "\u041F\u0440\u0435\u0442\u0440\u0430\u0433\u0430",
  MACEDONIAN: "\u041F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435",
  MONGOLIAN_CYRILLIC: "\u0425\u0430\u0439\u0445",
  // 🌏 CJK & Asian scripts
  JAPANESE: "\u691C\u7D22",
  CHINESE_SIMPLIFIED: "\u641C\u7D22",
  CHINESE_TRADITIONAL: "\u641C\u5C0B",
  KOREAN: "\uAC80\uC0C9",
  THAI: "\u0E04\u0E49\u0E19\u0E2B\u0E32",
  VIETNAMESE: "T\xECm ki\u1EBFm",
  KHMER: "\u179F\u17D2\u179C\u17C2\u1784\u179A\u1780",
  LAO: "\u0E84\u0EBB\u0EC9\u0E99\u0EAB\u0EB2",
  // 🕋 Arabic & RTL
  ARABIC: "\u0628\u062D\u062B",
  PERSIAN: "\u062C\u0633\u062A\u062C\u0648",
  URDU: "\u062A\u0644\u0627\u0634",
  PASHTO: "\u0644\u067C\u0648\u0646",
  // 🇮🇳 Indic scripts
  HINDI: "\u0916\u094B\u091C",
  BENGALI: "\u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8",
  TAMIL: "\u0BA4\u0BC7\u0B9F\u0BB2\u0BCD",
  TELUGU: "\u0C36\u0C4B\u0C27\u0C28",
  KANNADA: "\u0CB9\u0CC1\u0CA1\u0CC1\u0C95\u0CBF",
  MALAYALAM: "\u0D24\u0D3F\u0D30\u0D2F\u0D41\u0D15",
  MARATHI: "\u0936\u094B\u0927\u093E",
  GUJARATI: "\u0AB6\u0ACB\u0AA7\u0ACB",
  PUNJABI: "\u0A16\u0A4B\u0A1C",
  // ✡ Hebrew
  HEBREW: "\u05D7\u05D9\u05E4\u05D5\u05E9",
  // 🏝 Pacific & others
  MAORI: "Rapua",
  SAMOAN: "Saili",
  TONGAN: "Kumi",
  HAWAIIAN: "Huli"
};
var INTERFACE = {
  HEADER: {
    TYPE: "header",
    ID: "header",
    APPEND: "body",
    CONTAINERS: {
      LOGO: {
        TYPE: "div",
        ID: "logo_container",
        CLASS: "header-logo",
        HTML: ICON.LOGO.SVG,
        APPEND: "header"
      }
    }
  },
  FOOTER: {
    TYPE: "footer",
    ID: "footer",
    APPEND: "body"
  },
  MAIN: {
    TYPE: "main",
    ID: "main",
    APPEND: "body"
  },
  CONTAINERS: {
    GLOBAL: {
      TYPE: "div",
      ID: "global",
      CLASS: "container",
      APPEND: "main"
    },
    HOME: {
      TYPE: "div",
      ID: "home",
      CLASS: "container",
      APPEND: "main"
    },
    //
    //
    // --> Tabs
    TOP_TABS: {
      TYPE: "div",
      ID: "top_tabs",
      CLASS: "container",
      APPEND: "main",
      GLOBAL_TAB: {
        TYPE: "div",
        ID: "global_tab",
        CLASS: "tab",
        HTML: ICON.GLOBAL_TAB.SVG,
        TOOLTIP: "Check in and see what others have found.",
        APPEND: "top_tabs"
      },
      HOME_TAB: {
        TYPE: "div",
        ID: "home_tab",
        CLASS: "tab",
        HTML: ICON.HOME_TAB.SVG,
        TOOLTIP: "Main search view.",
        APPEND: "top_tabs"
      }
    },
    HOME_TABS: {
      TYPE: "div",
      ID: "tabs",
      CLASS: "container",
      APPEND: "home",
      HELP_TAB: {
        TYPE: "div",
        ID: "help_tab",
        CLASS: "tab",
        HTML: `<h3>?</h3>`,
        APPEND: "tabs"
      },
      OPTIONS_TAB: {
        TYPE: "div",
        ID: "options_tab",
        CLASS: "tab",
        HTML: `<h3>Options</h3>`,
        APPEND: "tabs"
      },
      RESULTS_TAB: {
        TYPE: "div",
        ID: "results_tab",
        CLASS: "tab",
        HTML: `<h3>Results</h3>`,
        APPEND: "tabs"
      }
    },
    SUBTABS: {
      TYPE: "div",
      ID: "subtabs",
      CLASS: "container",
      APPEND: "menu",
      FILTERS_SUBTAB: {
        TYPE: "div",
        ID: "filters_subtab",
        CLASS: "subtab",
        HTML: `<h3>Filters</h3>`,
        APPEND: "subtabs"
      },
      SEARCH_SETTINGS_SUBTAB: {
        TYPE: "div",
        ID: "search_settings_subtab",
        CLASS: "subtab",
        HTML: `<h3>Search Settings</h3>`,
        APPEND: "subtabs"
      },
      ADVANCED_SUBTAB: {
        TYPE: "div",
        ID: "advanced_subtab",
        CLASS: "subtab",
        HTML: `<h3>Advanced</h3>`,
        APPEND: "subtabs"
      }
    },
    //
    //
    // --> Global
    GLOBAL_TABS: {
      TYPE: "div",
      ID: "global_tabs",
      CLASS: "container",
      APPEND: "global",
      TOP_RESULTS: {
        TYPE: "div",
        ID: "top_results_tab",
        CLASS: "tab",
        HTML: `<h3>Global Results</h3>`,
        APPEND: "global_tabs"
      },
      SYRCHERS: {
        TYPE: "div",
        ID: "syrchers_tab",
        CLASS: "tab",
        HTML: `<h3>Syrchers</h3>`,
        APPEND: "global_tabs"
      }
    },
    GLOBAL_MENU: {
      TYPE: "div",
      ID: "global_menu",
      CLASS: "container",
      APPEND: "global",
      RESULTS_TABLE: {
        TYPE: "table",
        ID: "global_results_table",
        CLASS: "sortable_table",
        APPEND: "global_menu",
        HEADER_ROW: {
          TYPE: "tr",
          ID: "global_results_header_row",
          CLASS: "sortable_header_row",
          APPEND: "global_results_table",
          POSITION: {
            TYPE: "th",
            ID: "global_results_position_header",
            CLASS: "sortable_header",
            HTML: `<h3>#</h3>`,
            APPEND: "global_results_header_row"
          },
          URL: {
            TYPE: "th",
            ID: "global_results_url_header",
            CLASS: "sortable_header",
            HTML: `<h3>URL</h3>`,
            APPEND: "global_results_header_row"
          },
          DISCOVERER: {
            TYPE: "th",
            ID: "global_results_discoverer_header",
            CLASS: "sortable_header",
            HTML: `<h3>Discoverer</h3>`,
            APPEND: "global_results_header_row"
          },
          DISCOVERED_ON: {
            TYPE: "th",
            ID: "global_results_discovered_on_header",
            CLASS: "sortable_header",
            HTML: `<h3>Discovered On</h3>`,
            APPEND: "global_results_header_row"
          },
          KARMA: {
            TYPE: "th",
            ID: "global_results_karma_header",
            CLASS: "sortable_header",
            HTML: `<h3>Karma</h3>`,
            APPEND: "global_results_header_row"
          }
        },
        PLACEHOLDER_ROW: {
          TYPE: "tr",
          ID: "global_results_placeholder_row",
          CLASS: "placeholder_row",
          HTML: `<td colspan="5">Loading Global Results...</td>`,
          APPEND: "global_results_table"
        }
      },
      SYRCHERS_TABLE: {
        TYPE: "table",
        ID: "syrchers_table",
        CLASS: "sortable_table",
        APPEND: "global_menu",
        HEADER_ROW: {
          TYPE: "tr",
          ID: "syrchers_header_row",
          CLASS: "sortable_header_row",
          APPEND: "syrchers_table",
          POSITION: {
            TYPE: "th",
            ID: "syrchers_position_header",
            CLASS: "sortable_header",
            HTML: `<h3>#</h3>`,
            APPEND: "syrchers_header_row"
          },
          SYRCHER: {
            TYPE: "th",
            ID: "syrchers_syrcher_header",
            CLASS: "sortable_header",
            HTML: `<h3>Syrcher</h3>`,
            APPEND: "syrchers_header_row"
          },
          DISCOVERIES: {
            TYPE: "th",
            ID: "syrchers_discoveries_header",
            CLASS: "sortable_header",
            HTML: `<h3>Discoveries</h3>`,
            APPEND: "syrchers_header_row"
          },
          USER_SINCE: {
            TYPE: "th",
            ID: "syrchers_user_since_header",
            CLASS: "sortable_header",
            HTML: `<h3>User Since</h3>`,
            APPEND: "syrchers_header_row"
          },
          KARMA: {
            TYPE: "th",
            ID: "syrchers_karma_header",
            CLASS: "sortable_header",
            HTML: `<h3>Karma</h3>`,
            APPEND: "syrchers_header_row"
          }
        },
        PLACEHOLDER_ROW: {
          TYPE: "tr",
          ID: "syrchers_placeholder_row",
          CLASS: "placeholder_row",
          HTML: `<td colspan="5">Loading Syrchers...</td>`,
          APPEND: "syrchers_table"
        }
      }
    },
    HELP: {
      TYPE: "div",
      ID: "help",
      CLASS: "container",
      APPEND: "home",
      HC_00: {
        TYPE: "div",
        ID: "hc_00",
        CLASS: "help",
        HTML: `
                        <h3>What is Syrch?</h3>
                        <p>A tool to help you explore the internet without a specific destination in mind.</p>
                    `,
        APPEND: "help"
      },
      HC_01: {
        TYPE: "div",
        ID: "hc_01",
        CLASS: "help",
        HTML: `
                        <h3>What is Sypher?</h3>
                        <p>Syrch is a part of the Sypher ecosystem, fueled by the SYPHER token.</p>
                        <p>Sypher grants access to <span class="SyrchPro">SyrchPro</span>, and helps fund development through trading fees.</p>
                    `,
        APPEND: "help"
      },
      HC_02: {
        TYPE: "div",
        ID: "hc_02",
        CLASS: "help",
        HTML: `
                        <h3>What is <span class="SyrchPro">SyrchPro</span>?</h3>
                        <p><span class="SyrchPro">SyrchPro</span> extends the features and customization of Syrch. Connect a wallet with <strong>1000</strong> SYPHER tokens to get access.</p>
                        <p>Premium features can be enabled when desired; without paying a direct flat rate or subscription fee.</p>
                        <br>
                        <p>Buy SYPHER directly on <a href="https://app.uniswap.org/explore/tokens/base/0x21b9d428eb20fa075a29d51813e57bab85406620" target="_blank" id="uniswap">UniSwap</a>. Or, swap in your crypto wallet.</p>
                    `,
        APPEND: "help"
      },
      HC_03: {
        TYPE: "div",
        ID: "hc_03",
        CLASS: "help",
        HTML: `
                        <h3>Where Should I Start?</h3>
                        <p>For further help, keep reading below. Otherwise, begin customizing your filters and search preferences - finally, press the search button to begin your journey.</p>
                    `,
        APPEND: "help"
      },
      GH_00: {
        TYPE: "div",
        ID: "gh_00",
        CLASS: "help",
        HTML: `
                        <h3>General Help</h3>
                        <p><strong>Filters: </strong>Customize specific filters for the search by category.</p>
                        <p><span class="SyrchPro">SyrchPro</span> also allows you to insert a custom word as a prefix, suffix or randomly.</p>
                        <br>
                    `,
        APPEND: "help"
      },
      GH_01: {
        TYPE: "div",
        ID: "gh_01",
        CLASS: "help",
        HTML: `
                        <p><strong>Search Settings: </strong> Customize search preferences and URL generation properties.</p>
                        <p><em>Stop on First </em> stops the search when the first valid result is found.</p>
                        <p><em>Open on Find </em> opens valid results in a new tab. Highly recommended enabling "Stop on First" if this is enabled.</p>
                        <p><em>Domains </em> allows toggling of domains for the search. All are enabled by default.</p>
                        <br>
                    `,
        APPEND: "help"
      },
      GH_02: {
        TYPE: "div",
        ID: "gh_02",
        CLASS: "help",
        HTML: `
                        <p><strong>URL Generation: </strong> Choose preferences for the way URLs are generated and constructed.</p>
                        <p><em>Character Set </em> determines which characters are used when generating URLs.</p>
                        <p><em>Cluster Chance </em> determines how often clusters like "th", "he", and "in" are used in the generated URLs.</p>
                        <p><em>Mode </em> determines how URLs are generated. Either randomly, using phonetic patterns or syllables.</p>
                    `,
        APPEND: "help"
      },
      AH_00: {
        TYPE: "div",
        ID: "ah_00",
        CLASS: "help",
        HTML: `
                        <h3>Advanced Settings</h3>
                        <p><strong>Generation Length </strong> sets the minimum and maximum length for generated URLs. The maximum amount that the browser allows is 63 characters.</p>
                    `,
        APPEND: "help"
      },
      AH_01: {
        TYPE: "div",
        ID: "ah_01",
        CLASS: "help",
        HTML: `
                        <h3><span class="SyrchPro">SyrchPro</span> Advanced Settings</h3>
                        <p><strong>Search Limits</strong> Setup advanced search parameters.</p>
                        <p><em>Search Amount </em> allows you to change the total amount of searches performed.</p>
                        <p><em>Batch Size </em> sets how many batches there will be during the search process. If 'Search Amount' equals 100 and 'Batch Size' is 10, there will be 10 batches of 10 searches each.</p>
                        <p><em>Batch Interval </em> is the time between each batch. Each batch will wait this long after the last batch starts, before starting to process.</p>
                        <p><em>Concurrent Requests </em> sets the maximum amount of URLs that are processed at the same time.</p>
                        <br>
                    `,
        APPEND: "help"
      },
      AH_02: {
        TYPE: "div",
        ID: "ah_02",
        CLASS: "help",
        HTML: `
                        <p><strong>Timeouts: </strong> Change timeout parameters.</p>
                        <p><em>Timeout Limit </em> sets how long in milliseconds to wait for each URL to respond.</p>
                        <br>
                    `,
        APPEND: "help"
      },
      AH_03: {
        TYPE: "div",
        ID: "ah_03",
        CLASS: "help",
        HTML: `
                        <p>With <span class="SyrchPro">SyrchPro</span> you can take advantage of passive fallback URL processing.</p>
                        <br>
                        <p><strong>Fallbacks: </strong> Adjust fallback parameters.</p>
                        <p><em>Fallback Timeout </em> determines how long to wait during a fallback loop for each URL to respond.</p>
                        <p><em>Fallback Retries </em> sets how many times to retry a URL that has failed.</p>
                        <br>
                    `,
        APPEND: "help"
      },
      AH_04: {
        TYPE: "div",
        ID: "ah_04",
        CLASS: "help",
        HTML: `
                        <p><strong>More questions? </strong> Visit the <a href="https://github.com/Tukyo/syphersearch" target="_blank">Github</a>, or reach out on <a href="https://t.me/tukyohub" target="_blank">Telegram</a>.</p>
                    `,
        APPEND: "help"
      }
    },
    MENU: {
      TYPE: "div",
      ID: "menu",
      CLASS: "container",
      HTML: `<h3>tehe</h3>`,
      // Creates light blur effect
      APPEND: "home"
    },
    RESULTS: {
      TYPE: "div",
      ID: "results",
      CLASS: "container",
      APPEND: "home",
      BACKUP_ICON: {
        TYPE: "div",
        ID: "backup_icon",
        HTML: ICON.BACKUP.SVG,
        TOOLTIP: "Manual Save",
        APPEND: "results"
      },
      TRASH_TOGGLE: {
        TYPE: "div",
        ID: "toggle_trash_icon",
        HTML: ICON.TRASH_TOGGLE.HIDE.SVG,
        TOOLTIP: "Toggle Trash",
        APPEND: "results"
      }
    },
    RESULT_CONTAINER: {
      TYPE: "div",
      ID: " ",
      // Generate dynamically
      CLASS: "result",
      APPEND: " ",
      // Apply dynamically
      RESULT: {
        TYPE: "div",
        ID: " ",
        // Apply dynamically
        CLASS: "container",
        APPEND: " ",
        // Dynamically apend to parent
        FAVORITE_CONTAINER: {
          TYPE: "div",
          ID: " ",
          // Generate dynamically
          CLASS: "container favorite_icon",
          APPEND: " ",
          // Append dynamically to the Result Container
          ICON: {
            TYPE: "div",
            ID: " ",
            // Generate dynamically
            CLASS: "result-icon favorite_icon",
            HTML: ICON.FAVORITE.SVG,
            APPEND: " "
            // Append to parent container
          }
        },
        TRASH_CONTAINER: {
          TYPE: "div",
          ID: " ",
          // Generate dynamically
          CLASS: "container trash_icon",
          APPEND: " ",
          // Append dynamically to the Result Container
          ICON: {
            TYPE: "div",
            ID: " ",
            // Generate dynamically
            CLASS: "result-icon trash_icon",
            HTML: ICON.TRASH.SVG,
            APPEND: " "
            // Append to parent container
          }
        }
      }
    },
    QUEUE_CONTAINER: {
      TYPE: "div",
      ID: "queue_container",
      CLASS: "container",
      APPEND: "results",
      QUEUE_HEADER: {
        TYPE: "div",
        ID: "queue_header",
        CLASS: "results_column_header",
        HTML: `<h3>New Results</h3>`,
        TOOLTIP: "Newly discovered URLs will appear here.",
        APPEND: "queue_container"
      }
    },
    FAVORITES_CONTAINER: {
      TYPE: "div",
      ID: "favorites_container",
      CLASS: "container",
      APPEND: "results",
      FAVORITES_HEADER: {
        TYPE: "div",
        ID: "favorites_header",
        CLASS: "results_column_header",
        HTML: `<h3>Favorites</h3>`,
        TOOLTIP: "Your favorited URLs. Click the heart icon to favorite a website.",
        APPEND: "favorites_container"
      }
    },
    TRASH_BIN_CONTAINER: {
      TYPE: "div",
      ID: "trash_bin_container",
      CLASS: "container",
      APPEND: "results",
      TRASH_HEADER: {
        TYPE: "div",
        ID: "trash_header",
        CLASS: "results_column_header",
        HTML: `<h3>Trash Bin</h3>`,
        TOOLTIP: "Discarded results that were found but not interesting.",
        APPEND: "trash_bin_container"
      },
      EMPTY_TRASH: {
        TYPE: "div",
        ID: "empty_trash",
        HTML: ICON.EMPTY_TRASH.SVG,
        TOOLTIP: "Permanently delete all items in trash.",
        APPEND: "results"
      }
    },
    //
    //
    // --> Filters
    FILTERS_CONTAINER: {
      TYPE: "div",
      ID: "filters_container",
      CLASS: "container",
      APPEND: "menu"
    },
    FILTERS: {
      TYPE: "div",
      ID: "filters",
      CLASS: "container",
      APPEND: "filters_container"
    },
    FILTER_CATEGORIES: {
      TYPE: "div",
      ID: " ",
      // Apply dynamically
      CLASS: "category",
      APPEND: "filters"
    },
    FILTER_CONTAINTERS: {
      TYPE: "div",
      ID: " ",
      // Apply dynamically
      CLASS: "filters",
      APPEND: " "
      // Apply dynamically
    },
    //
    //
    // --> Custom Input
    CUSTOM_INPUT_CONTAINER: {
      PREMIUM: true,
      TYPE: "div",
      ID: "custom_input_container",
      CLASS: "category",
      HTML: `<h3>Custom Word</h3>`,
      APPEND: "filters_container"
    },
    INPUT_CONTAINER: {
      TYPE: "div",
      ID: "input_container",
      CLASS: "container",
      APPEND: "custom_input_container"
    },
    INPUT: {
      TYPE: "input",
      ID: "custom_input",
      CLASS: "input",
      LIMITS: "string",
      MIN: 0,
      MAX: SEARCH_PREFS.CUSTOM.LENGTH.MAX,
      PLACEHOLDER: "Custom Word Entry...",
      TOOLTIP: "Enter a custom word to include in the search.",
      AUDIO: { HOVER: true, CLICK: true },
      APPEND: "input_container"
    },
    INSERT_CONTAINER: {
      TYPE: "div",
      ID: "insert_container",
      CLASS: "container",
      APPEND: "input_container",
      INSERT_PREFIX: {
        TYPE: "div",
        ID: "insert_prefix",
        CLASS: "toggler",
        TOOLTIP: "Insert word at the beginning.",
        TEXT: "Prefix",
        AUDIO: { HOVER: true, CLICK: true },
        APPEND: "insert_container"
      },
      INSERT_SUFFIX: {
        TYPE: "div",
        ID: "insert_suffix",
        CLASS: "toggler",
        TOOLTIP: "Insert word at the end.",
        TEXT: "Suffix",
        AUDIO: { HOVER: true, CLICK: true },
        APPEND: "insert_container"
      },
      INSERT_RANDOM: {
        TYPE: "div",
        ID: "insert_random",
        CLASS: "toggler",
        TOOLTIP: "Insert word randomly.",
        TEXT: "Random",
        AUDIO: { HOVER: true, CLICK: true },
        APPEND: "insert_container"
      }
    },
    //
    //
    // --> Search Settings
    SEARCH_SETTINGS_CONTAINER: {
      TYPE: "div",
      ID: "search_settings_container",
      CLASS: "container",
      APPEND: "menu"
    },
    SEARCH_SETTINGS_TOGGLES: {
      TYPE: "div",
      ID: "search_settings_toggles",
      CLASS: "container",
      APPEND: "search_settings_container",
      STOP_ON_FIRST_CONTAINER: {
        TYPE: "div",
        ID: "stop_on_first_container",
        CLASS: "category",
        TEXT: "Stop on First",
        TOOLTIP: "Stop searching after the first valid result is found.",
        AUDIO: { HOVER: true, CLICK: true },
        APPEND: "search_settings_toggles"
      },
      STOP_ON_FIRST_TOGGLER: {
        TYPE: "div",
        ID: "stop_on_first_toggler",
        CLASS: "toggler",
        APPEND: "stop_on_first_container"
      },
      OPEN_ON_FIND_CONTAINER: {
        TYPE: "div",
        ID: "open_on_find_container",
        CLASS: "category",
        TEXT: "Open on Find",
        TOOLTIP: "Opens results in a new tab. Recommend enabling 'Stop on First' when enabled.",
        AUDIO: { HOVER: true, CLICK: true },
        APPEND: "search_settings_toggles"
      },
      OPEN_ON_FIND_TOGGLER: {
        TYPE: "div",
        ID: "open_on_find_toggler",
        CLASS: "toggler",
        APPEND: "open_on_find_container"
      }
    },
    DOMAIN_SETTINGS_CONTAINER: {
      TYPE: "div",
      ID: "domain_settings_container",
      CLASS: "container",
      APPEND: "search_settings_container",
      DOMAIN_SETTINGS: {
        TYPE: "div",
        ID: "domain_settings",
        HTML: "<h3>Domains</h3>",
        CLASS: "category",
        TOOLTIP: "Select which domains to include in the search.",
        APPEND: "domain_settings_container",
        DOMAINS_CONTAINER: {
          TYPE: "div",
          ID: "domains_container",
          CLASS: "filters",
          APPEND: "domain_settings"
        }
      }
    },
    DOMAINS: {
      TYPE: "div",
      ID: " ",
      // Apply dynamically
      CLASS: "toggler",
      APPEND: "domains_container"
    },
    GENERATION_SETTINGS_CONTAINER: {
      TYPE: "div",
      ID: "generation_settings_container",
      CLASS: "container",
      APPEND: "search_settings_container",
      GENERATION_SETTINGS: {
        TYPE: "div",
        ID: "generation_settings",
        HTML: "<h3>URL Generation</h3>",
        CLASS: "category",
        APPEND: "generation_settings_container",
        GENERATION_CONTAINER: {
          TYPE: "div",
          ID: "generation_container",
          CLASS: "filters",
          APPEND: "generation_settings"
        }
      }
    },
    CHARACTER_SET_SETTINGS_CONTAINER: {
      TYPE: "div",
      ID: "character_set_settings_container",
      CLASS: "container",
      TOOLTIP: "Determines which characters to use when generating URLs.",
      APPEND: "generation_container",
      CHARACTER_SET_SETTINGS: {
        TYPE: "div",
        ID: "character_set_settings",
        HTML: `<h2>Character Set</h2>`,
        CLASS: "category",
        APPEND: "character_set_settings_container",
        CHARACTER_SET_CONTAINER: {
          TYPE: "div",
          ID: "character_set_container",
          CLASS: "filters",
          APPEND: "character_set_settings"
        }
      }
    },
    CHARACTER_SET: {
      TYPE: "div",
      ID: " ",
      // Apply dynamically
      CLASS: "toggler",
      APPEND: "character_set_container"
    },
    CLUSTER_CHANCE_SETTINGS_CONTAINER: {
      TYPE: "div",
      ID: "cluster_chance_settings_container",
      CLASS: "container",
      TOOLTIP: "How often clusters like 'th', 'st' or 'ch' are used in URL generation.",
      APPEND: "generation_container",
      CLUSTER_CHANCE_SETTINGS: {
        TYPE: "div",
        ID: "cluster_chance_settings",
        HTML: `<h2>Cluster Chance</h2>`,
        CLASS: "category",
        APPEND: "cluster_chance_settings_container",
        CLUSTER_CHANCE_CONTAINER: {
          TYPE: "div",
          ID: "cluster_chance_container",
          CLASS: "filters",
          APPEND: "cluster_chance_settings",
          AUDIO: { HOVER: true }
        }
      }
    },
    RANDOM_MODE_SETTINGS_CONTAINER: {
      TYPE: "div",
      ID: "random_mode_settings_container",
      CLASS: "container",
      TOOLTIP: "Determines how URLs are generated. Either randomly, using phonetic patterns or syllables.",
      APPEND: "generation_container",
      RANDOM_MODE_SETTINGS: {
        TYPE: "div",
        ID: "random_mode_settings",
        HTML: `<h2>Mode</h2>`,
        CLASS: "category",
        APPEND: "random_mode_settings_container",
        RANDOM_MODE_CONTAINER: {
          TYPE: "div",
          ID: "random_mode_container",
          CLASS: "filters",
          APPEND: "random_mode_settings"
        }
      }
    },
    RANDOM_MODE: {
      TYPE: "div",
      ID: " ",
      // Apply dynamically
      CLASS: "toggler",
      APPEND: "random_mode_container"
    },
    //
    //
    // --> Advanced Settings
    ADVANCED_CONTAINER: {
      TYPE: "div",
      ID: "advanced_container",
      CLASS: "container",
      APPEND: "menu",
      SEARCH_LENGTHS_CONTAINER: {
        TYPE: "div",
        ID: "search_lengths_container",
        CLASS: "container",
        APPEND: "advanced_container",
        SEARCH_LENGTHS: {
          TYPE: "div",
          ID: "search_lengths",
          CLASS: "category",
          HTML: `<h3>Generation Length</h3>`,
          TOOLTIP: "Minimum and maximum length for generated URLs.",
          AUDIO: { HOVER: true },
          APPEND: "search_lengths_container",
          SEARCH_LENGTHS_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "search_lengths_input_container",
            CLASS: "container",
            APPEND: "search_lengths",
            MIN_LENGTH_INPUT: {
              TYPE: "input",
              ID: "min_length_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 1,
              MAX: SEARCH_PREFS.CUSTOM.LENGTH.MAX,
              VALUE: SEARCH_PREFS.CUSTOM.LENGTH.MIN,
              PLACEHOLDER: String(SEARCH_PREFS.CUSTOM.LENGTH.MIN),
              TOOLTIP: "Minimum length for generated URLs.",
              AUDIO: { CLICK: true },
              APPEND: "search_lengths_input_container"
            },
            MAX_LENGTH_INPUT: {
              TYPE: "input",
              ID: "max_length_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: SEARCH_PREFS.CUSTOM.LENGTH.MIN,
              MAX: 63,
              VALUE: SEARCH_PREFS.CUSTOM.LENGTH.MAX,
              PLACEHOLDER: String(SEARCH_PREFS.CUSTOM.LENGTH.MAX),
              TOOLTIP: "Maximum length for generated URLs.",
              AUDIO: { CLICK: true },
              APPEND: "search_lengths_input_container"
            }
          }
        }
      },
      SEARCH_LIMITS_CONTAINER: {
        TYPE: "div",
        ID: "search_limits_container",
        CLASS: "container",
        APPEND: "advanced_container",
        SEARCH_AMOUNT_CONTAINER: {
          PREMIUM: true,
          TYPE: "div",
          ID: "search_amount_container",
          CLASS: "category",
          HTML: `<h3>Search Amount</h3>`,
          TOOLTIP: "How many URLs to generate per search.",
          AUDIO: { HOVER: true },
          APPEND: "search_limits_container",
          SEARCH_AMOUNT_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "search_amount_input_container",
            CLASS: "container",
            APPEND: "search_amount_container",
            SEARCH_AMOUNT_INPUT: {
              TYPE: "input",
              ID: "search_amount_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 1,
              MAX: 1e5,
              VALUE: SEARCH_PREFS.LIMITS.RETRIES,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.RETRIES),
              AUDIO: { CLICK: true },
              APPEND: "search_amount_input_container"
            }
          }
        },
        BATCH_SIZE_CONTAINER: {
          PREMIUM: true,
          TYPE: "div",
          ID: "batch_size_container",
          CLASS: "category",
          HTML: `<h3>Batch Size</h3>`,
          TOOLTIP: "How many URLs to check per batch.",
          AUDIO: { HOVER: true },
          APPEND: "search_limits_container",
          BATCH_SIZE_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "batch_size_input_container",
            CLASS: "container",
            APPEND: "batch_size_container",
            BATCH_SIZE_INPUT: {
              TYPE: "input",
              ID: "batch_size_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 1,
              MAX: SEARCH_PREFS.LIMITS.RETRIES,
              VALUE: SEARCH_PREFS.LIMITS.BATCH,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.BATCH),
              AUDIO: { CLICK: true },
              APPEND: "batch_size_input_container"
            }
          }
        },
        BATCH_INTERVAL_CONTAINER: {
          PREMIUM: true,
          TYPE: "div",
          ID: "batch_interval_container",
          CLASS: "category",
          HTML: `<h3>Batch Interval</h3>`,
          TOOLTIP: "Time in milliseconds between batches.",
          AUDIO: { HOVER: true },
          APPEND: "search_limits_container",
          BATCH_INTERVAL_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "batch_interval_input_container",
            CLASS: "container",
            APPEND: "batch_interval_container",
            BATCH_INTERVAL_INPUT: {
              TYPE: "input",
              ID: "batch_interval_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 100,
              // 1 second
              MAX: 6e4,
              // 1 minute
              VALUE: SEARCH_PREFS.LIMITS.BATCH_INTERVAL,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.BATCH_INTERVAL),
              AUDIO: { CLICK: true },
              APPEND: "batch_interval_input_container"
            }
          }
        },
        CONCURRENT_REQUESTS_CONTAINER: {
          PREMIUM: true,
          TYPE: "div",
          ID: "concurrent_requests_container",
          CLASS: "category",
          HTML: `<h3>Concurrent Requests</h3>`,
          TOOLTIP: "How many requests can be processed at the same time. Recommend 100 or less.",
          AUDIO: { HOVER: true },
          APPEND: "search_limits_container",
          CONCURRENT_REQUESTS_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "concurrent_requests_input_container",
            CLASS: "container",
            APPEND: "concurrent_requests_container",
            CONCURRENT_REQUESTS_INPUT: {
              TYPE: "input",
              ID: "concurrent_requests_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 1,
              MAX: 1e3,
              VALUE: SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS),
              AUDIO: { CLICK: true },
              APPEND: "concurrent_requests_input_container"
            }
          }
        }
      },
      TIMEOUT_LIMITS_CONTAINER: {
        TYPE: "div",
        ID: "timeout_limits_container",
        CLASS: "container",
        APPEND: "advanced_container",
        TIMEOUT_LIMIT: {
          PREMIUM: true,
          TYPE: "div",
          ID: "timeout_limit",
          CLASS: "category",
          HTML: `<h3>Timeout Limit</h3>`,
          TOOLTIP: "How long in milliseconds to wait for each URL to respond.",
          AUDIO: { HOVER: true },
          APPEND: "timeout_limits_container",
          TIMEOUT_LIMIT_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "timeout_limit_input_container",
            CLASS: "container",
            APPEND: "timeout_limit",
            TIMEOUT_LIMIT_INPUT: {
              TYPE: "input",
              ID: "timeout_limit_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 100,
              // 0.1 second
              MAX: 3e4,
              // 30 seconds
              VALUE: SEARCH_PREFS.LIMITS.TIMEOUT,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.TIMEOUT),
              AUDIO: { CLICK: true },
              APPEND: "timeout_limit_input_container"
            }
          }
        }
      },
      FALLBACK_LIMITS_CONTAINER: {
        TYPE: "div",
        ID: "fallback_limits_container",
        CLASS: "container",
        APPEND: "advanced_container",
        FALLBACK_TIMEOUT_LIMIT: {
          PREMIUM: true,
          TYPE: "div",
          ID: "fallback_timeout_limit",
          CLASS: "category",
          HTML: `<h3>Fallback Timeout</h3>`,
          TOOLTIP: "How long in milliseconds to wait for a fallback request.",
          AUDIO: { HOVER: true },
          APPEND: "fallback_limits_container",
          FALLBACK_TIMEOUT_LIMIT_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "fallback_timeout_limit_input_container",
            CLASS: "container",
            APPEND: "fallback_timeout_limit",
            FALLBACK_TIMEOUT_LIMIT_INPUT: {
              TYPE: "input",
              ID: "fallback_timeout_limit_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 1e3,
              // 1 second
              MAX: 3e4,
              // 30 seconds
              VALUE: SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT),
              AUDIO: { CLICK: true },
              APPEND: "fallback_timeout_limit_input_container"
            }
          }
        },
        FALLBACK_RETRIES_LIMIT: {
          PREMIUM: true,
          TYPE: "div",
          ID: "fallback_retries_limit",
          CLASS: "category",
          HTML: `<h3>Fallback Retries</h3>`,
          TOOLTIP: "How many times to retry a fallback request.",
          AUDIO: { HOVER: true },
          APPEND: "fallback_limits_container",
          FALLBACK_RETRIES_LIMIT_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "fallback_retries_limit_input_container",
            CLASS: "container",
            APPEND: "fallback_retries_limit",
            FALLBACK_RETRIES_LIMIT_INPUT: {
              TYPE: "input",
              ID: "fallback_retries_limit_input",
              CLASS: "input",
              LIMITS: "number",
              MIN: 1,
              MAX: 10,
              VALUE: SEARCH_PREFS.LIMITS.FALLBACK.RETRIES,
              PLACEHOLDER: String(SEARCH_PREFS.LIMITS.FALLBACK.RETRIES),
              AUDIO: { CLICK: true },
              APPEND: "fallback_retries_limit_input_container"
            }
          }
        }
      }
    },
    //
    //
    // --> Search
    SEARCH: {
      TYPE: "div",
      ID: "search",
      CLASS: "container",
      APPEND: "home"
    }
  },
  BUTTONS: {
    SEARCH: {
      TYPE: "button",
      ID: "search_button",
      CLASS: "button",
      TEXT: SEARCH_TEXT.ENGLISH,
      APPEND: "search",
      AUDIO: {
        HOVER: true,
        CLICK: true
      }
    }
  },
  SLIDERS: {
    PROGRESS_SLIDER: {
      WRAPPER: {
        TYPE: "div",
        ID: "progress_wrapper",
        CLASS: "wrapper",
        APPEND: "search"
      },
      FILL: {
        TYPE: "div",
        ID: "progress_fill",
        CLASS: "fill",
        APPEND: "progress_wrapper"
      }
    },
    CLUSTER_CHANCE_SLIDER: {
      WRAPPER: {
        TYPE: "div",
        ID: "cluster_chance_wrapper",
        CLASS: "wrapper",
        APPEND: "cluster_chance_container"
      },
      FILL: {
        TYPE: "div",
        ID: "cluster_chance_fill",
        CLASS: "fill",
        APPEND: "cluster_chance_wrapper"
      }
    }
  },
  TOGGLE: {
    FILTERS_TOGGLE: {
      TOGGLER: {
        TYPE: "div",
        ID: "toggle_wrapper",
        CLASS: "toggler",
        TEXT: " ",
        // Apply dynamically
        APPEND: "filters"
      }
    }
  }
};

// src/dict/human/authors.json
var authors_default = {
  description: "Last names of humans well known for writing books",
  authors: [
    "Adams",
    "Alcott",
    "Angelou",
    "Asimov",
    "Atwood",
    "Auden",
    "Austen",
    "Ballard",
    "Bradbury",
    "Brautigan",
    "Bront\xEB",
    "Bukowski",
    "Burroughs",
    "Camus",
    "Capote",
    "Carroll",
    "Carver",
    "Cather",
    "Chekhov",
    "Chesterton",
    "Chomsky",
    "Clancy",
    "Clarke",
    "Collins",
    "Conrad",
    "Cooper",
    "Crichton",
    "Cummings",
    "Dahl",
    "DeLillo",
    "Dick",
    "Dickens",
    "Didion",
    "Dostoyevsky",
    "Douglass",
    "Dreiser",
    "Dumas",
    "Eco",
    "Eliot",
    "Ellison",
    "Faulkner",
    "Fitzgerald",
    "Fleming",
    "Forster",
    "Franzen",
    "Frost",
    "Gaiman",
    "Garc\xEDa M\xE1rquez",
    "Gibran",
    "Golding",
    "Grisham",
    "Hawthorne",
    "Hemingway",
    "Henry",
    "Hesse",
    "Homer",
    "Huxley",
    "Ishiguro",
    "Joyce",
    "Kafka",
    "Kerouac",
    "King",
    "Kingsolver",
    "Kipling",
    "Koontz",
    "Kundera",
    "Lawrence",
    "Le Guin",
    "Lee",
    "London",
    "Lovecraft",
    "Mailer",
    "Mann",
    "McCarthy",
    "Melville",
    "Miller",
    "Milne",
    "Mitchell",
    "Morrison",
    "Murakami",
    "Nabokov",
    "Neruda",
    "Orwell",
    "Palahniuk",
    "Poe",
    "Potter",
    "Pratchett",
    "Proust",
    "Pullman",
    "Rand",
    "Rhys",
    "Roth",
    "Rowling",
    "Rushdie",
    "Salinger",
    "Sartre",
    "Scott",
    "Seuss",
    "Shakespeare",
    "Shelley",
    "Sinclair",
    "Smith",
    "Steinbeck",
    "Stephenson",
    "Stine",
    "Stoker",
    "Swift",
    "Thoreau",
    "Tolstoy",
    "Tolkien",
    "Twain",
    "Updike",
    "Verne",
    "Vonnegut",
    "Walker",
    "Wells",
    "Welty",
    "Wharton",
    "White",
    "Whitman",
    "Wilde",
    "Williams",
    "Woolf",
    "Wright"
  ]
};

// src/dict/human/bodyparts.json
var bodyparts_default = {
  description: "A list of common human body parts.",
  bodyParts: [
    "ankle",
    "arm",
    "back",
    "belly",
    "bottom",
    "breast",
    "buttocks",
    "calf",
    "cheek",
    "chin",
    "ear",
    "elbow",
    "eye",
    "eyebrow",
    "eyelash",
    "finger",
    "fist",
    "foot",
    "forearm",
    "forehead",
    "hair",
    "hand",
    "head",
    "hip",
    "knee",
    "leg",
    "lip",
    "lower leg",
    "mouth",
    "neck",
    "nose",
    "nostril",
    "shoulder",
    "thigh",
    "thumb",
    "toe",
    "tongue",
    "tooth",
    "upper arm",
    "waist",
    "wrist"
  ]
};

// src/dict/materials/fabrics.json
var fabrics_default = {
  description: "fabrics",
  fabrics: [
    "acrylic",
    "alpaca",
    "angora",
    "canvas",
    "cashmere",
    "chambray",
    "chiffon",
    "corduroy",
    "cotton",
    "denim",
    "fleece",
    "flannel",
    "gabardine",
    "georgette",
    "gingham",
    "hemp",
    "jersey",
    "linen",
    "lycra",
    "mohair",
    "muslin",
    "nylon",
    "polyester",
    "rayon",
    "satin",
    "silk",
    "spandex",
    "suede",
    "tulle",
    "tweed",
    "twill",
    "velour",
    "velvet",
    "wool"
  ]
};

// src/dict/materials/metals.json
var metals_default = {
  description: "metals",
  metals: [
    "aluminium",
    "barium",
    "beryllium",
    "bismuth",
    "cadmium",
    "calcium",
    "chromium",
    "cobalt",
    "copper",
    "gallium",
    "gold",
    "iridium",
    "iron",
    "lead",
    "lithium",
    "magnesium",
    "manganese",
    "mercury",
    "neptunium",
    "nickel",
    "osmium",
    "palladium",
    "platinum",
    "plutonium",
    "potassium",
    "radium",
    "silver",
    "sodium",
    "thallium",
    "tin",
    "titanium",
    "tungsten",
    "uranium",
    "zinc"
  ]
};

// src/dict/music/genres.json
var genres_default = {
  description: "A list of musical genres taken from wikipedia article titles.",
  genres: [
    "acid",
    "aggrotech",
    "ambient",
    "bebop",
    "bitpop",
    "breakbeat",
    "breakcore",
    "chillwave",
    "chiptune",
    "colwave",
    "crunk",
    "darkcore",
    "darkstep",
    "deathcore",
    "disco",
    "downtempo",
    "drill",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electropop",
    "emo",
    "folktronica",
    "funk",
    "gabber",
    "glitch",
    "grime",
    "grindcore",
    "grunge",
    "hardcore",
    "hardstyle",
    "house",
    "idm",
    "illbient",
    "indie",
    "industrial",
    "jazz",
    "jungle",
    "lofi",
    "makina",
    "metal",
    "noise",
    "pop",
    "prog",
    "punk",
    "rap",
    "reggae",
    "rock",
    "screamo",
    "shoegaze",
    "ska",
    "skweee",
    "sludge",
    "soul",
    "synthpop",
    "techno",
    "trance",
    "trap",
    "triphop",
    "vaporwave"
  ]
};

// src/dict/music/instruments.json
var instruments_default = {
  description: "Musical Instruments",
  instruments: [
    "accordion",
    "bagpipe",
    "banjo",
    "bassoon",
    "bugle",
    "calliope",
    "cello",
    "clarinet",
    "clavichord",
    "concertina",
    "didgeridoo",
    "dobro",
    "drum",
    "dulcimer",
    "fiddle",
    "fife",
    "flute",
    "flugelhorn",
    "glockenspiel",
    "guitar",
    "harmonica",
    "harp",
    "harpsichord",
    "kazoo",
    "lute",
    "lyre",
    "mandolin",
    "marimba",
    "melodica",
    "oboe",
    "organ",
    "piano",
    "piccolo",
    "saxophone",
    "sitar",
    "snare",
    "sousaphone",
    "synth",
    "tambourine",
    "theremin",
    "tom",
    "triangle",
    "trombone",
    "trumpet",
    "tuba",
    "ukulele",
    "viola",
    "violin",
    "vuvuzela",
    "xylophone",
    "zither"
  ]
};

// src/dict/nsfw/drugs.json
var drugs_default = {
  description: "A list of pharmaceutical drug names",
  source: "The United States National Library of Medicine, http://druginfo.nlm.nih.gov/drugportal/",
  drugs: [
    "Adderall",
    "Ambien",
    "Antibiotics",
    "Aspirin",
    "Ativan",
    "Benadryl",
    "Caffeine",
    "Cannabis",
    "Cocaine",
    "Codeine",
    "DMT",
    "Ecstasy",
    "Fentanyl",
    "Gabapentin",
    "Heroin",
    "Hydrocodone",
    "Ibuprofen",
    "Ketamine",
    "Klonopin",
    "LSD",
    "Meth",
    "Methadone",
    "Modafinil",
    "Molly",
    "Morphine",
    "Mushrooms",
    "Nicotine",
    "Norco",
    "Oxycodone",
    "OxyContin",
    "Percocet",
    "Prednisone",
    "Prozac",
    "Ritalin",
    "Shrooms",
    "Steroids",
    "Suboxone",
    "Sudafed",
    "Trazodone",
    "Tramadol",
    "Tylenol",
    "Valium",
    "Vaping",
    "Vicodin",
    "Viagra",
    "Weed",
    "Wellbutrin",
    "Xanax",
    "Zoloft"
  ]
};

// src/dict/nsfw/explicit.json
var explicit_default = {
  description: "Curse words and explicit terms",
  explicit: [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "bastard",
    "damn",
    "piss",
    "cunt",
    "douche",
    "prick",
    "hell",
    "crap",
    "fucker",
    "shithead",
    "motherfucker",
    "ass",
    "bitchass",
    "goddamn",
    "hoe",
    "slut",
    "screw",
    "freak",
    "trash",
    "jerk",
    "tool",
    "loser",
    "nuts",
    "maniac",
    "clown",
    "psycho",
    "moron",
    "retard",
    "creep",
    "skank",
    "bimbo",
    "pig",
    "scab",
    "turd",
    "weirdo",
    "bozo",
    "poser",
    "punk",
    "whore"
  ]
};

// src/dict/nsfw/porn.json
var porn_default = {
  description: "Pure genre-based and common adult domain keywords (no branded site names)",
  porn: [
    "18",
    "3d",
    "amateur",
    "anal",
    "arab",
    "asian",
    "ass",
    "asshole",
    "aunty",
    "babes",
    "bdsm",
    "bbw",
    "bigass",
    "bigboobs",
    "bigtits",
    "black",
    "blonde",
    "blowjob",
    "bondage",
    "brunette",
    "bukkake",
    "cam",
    "cams",
    "casting",
    "celebs",
    "cheating",
    "chubby",
    "cock",
    "compilation",
    "creampie",
    "cuckold",
    "cum",
    "cumshot",
    "cunt",
    "dp",
    "ebony",
    "european",
    "facial",
    "fake",
    "famous",
    "fart",
    "feet",
    "femdom",
    "fetish",
    "fingering",
    "firsttime",
    "flashing",
    "footfetish",
    "footjob",
    "freaky",
    "fuck",
    "fucking",
    "gangbang",
    "german",
    "granny",
    "group",
    "hairy",
    "handjob",
    "hardcore",
    "hd",
    "homemade",
    "horny",
    "hotel",
    "hub",
    "interracial",
    "italian",
    "japan",
    "japanese",
    "kinky",
    "latina",
    "lesbian",
    "lingerie",
    "lofi",
    "mature",
    "milf",
    "mom",
    "mommy",
    "naked",
    "naughty",
    "nude",
    "nudist",
    "orgasm",
    "orgy",
    "panties",
    "pegging",
    "petite",
    "piss",
    "porn",
    "porno",
    "pornstar",
    "public",
    "pussy",
    "real",
    "redhead",
    "rough",
    "russian",
    "sensual",
    "sex",
    "sexy",
    "shaved",
    "slut",
    "solo",
    "spanking",
    "squirting",
    "stepbro",
    "stepdad",
    "stepmom",
    "stepsis",
    "strapon",
    "strip",
    "stripper",
    "striptease",
    "submission",
    "swallow",
    "swinger",
    "teen",
    "teens",
    "tease",
    "thai",
    "threesome",
    "tight",
    "toys",
    "tranny",
    "tugjob",
    "tube",
    "twerk",
    "twink",
    "upskirt",
    "vintage",
    "virgin",
    "voyeur",
    "webcam",
    "wife",
    "x",
    "xxx"
  ]
};

// src/dict/objects/clothing.json
var clothing_default = {
  description: "List of clothing types",
  clothes: [
    "belt",
    "bikini",
    "blazer",
    "blouse",
    "boots",
    "bowtie",
    "boxers",
    "bra",
    "briefs",
    "camisole",
    "cap",
    "cardigan",
    "cargos",
    "coat",
    "corset",
    "dress",
    "fleece",
    "gloves",
    "hat",
    "hoody",
    "jacket",
    "jeans",
    "jumper",
    "kaftan",
    "kilt",
    "knickers",
    "kurta",
    "lingerie",
    "nightgown",
    "nightwear",
    "pants",
    "poncho",
    "raincoat",
    "robe",
    "romper",
    "sandals",
    "sarong",
    "scarf",
    "shawl",
    "shirt",
    "shoes",
    "shorts",
    "skirt",
    "slacks",
    "slippers",
    "socks",
    "stockings",
    "suit",
    "sunglasses",
    "sweater",
    "sweatshirt",
    "swimwear",
    "t-shirt",
    "tailcoat",
    "tankini",
    "thong",
    "tie",
    "tights",
    "top",
    "tracksuit",
    "trainers",
    "trousers",
    "underpants",
    "undershirt",
    "underwear",
    "vest",
    "waistcoat",
    "waterproof",
    "zip"
  ]
};

// src/dict/objects/containers.json
var containers_default = {
  description: "List of objects that can contain other objects",
  containers: [
    "bag",
    "balloon",
    "barrel",
    "beaker",
    "bottle",
    "bowl",
    "box",
    "bucket",
    "briefcase",
    "cabinet",
    "can",
    "case",
    "chest",
    "cup",
    "display",
    "drawer",
    "flask",
    "glass",
    "jar",
    "mug",
    "pouch",
    "purse",
    "tray",
    "trunk",
    "tube",
    "vase",
    "wallet"
  ]
};

// src/dict/words/adverbs.json
var adverbs_default = {
  adverbs: [
    "abnormally",
    "absentmindedly",
    "accidentally",
    "acidly",
    "actually",
    "adventurously",
    "afterwards",
    "almost",
    "always",
    "angrily",
    "annually",
    "anxiously",
    "arrogantly",
    "awkwardly",
    "badly",
    "bashfully",
    "beautifully",
    "bitterly",
    "bleakly",
    "blindly",
    "blissfully",
    "boastfully",
    "boldly",
    "bravely",
    "briefly",
    "brightly",
    "briskly",
    "broadly",
    "busily",
    "calmly",
    "carefully",
    "carelessly",
    "cautiously",
    "certainly",
    "cheerfully",
    "clearly",
    "cleverly",
    "closely",
    "coaxingly",
    "colorfully",
    "commonly",
    "continually",
    "coolly",
    "correctly",
    "courageously",
    "crossly",
    "cruelly",
    "curiously",
    "daily",
    "daintily",
    "dearly",
    "deceivingly",
    "deeply",
    "defiantly",
    "deliberately",
    "delightfully",
    "diligently",
    "dimly",
    "doubtfully",
    "dreamily",
    "easily",
    "elegantly",
    "energetically",
    "enormously",
    "enthusiastically",
    "equally",
    "especially",
    "even",
    "evenly",
    "eventually",
    "exactly",
    "excitedly",
    "extremely",
    "fairly",
    "faithfully",
    "famously",
    "far",
    "fast",
    "fatally",
    "ferociously",
    "fervently",
    "fiercely",
    "fondly",
    "foolishly",
    "fortunately",
    "frankly",
    "frantically",
    "freely",
    "frenetically",
    "frightfully",
    "fully",
    "furiously",
    "generally",
    "generously",
    "gently",
    "gladly",
    "gleefully",
    "gracefully",
    "gratefully",
    "greatly",
    "greedily",
    "happily",
    "hastily",
    "healthily",
    "heavily",
    "helpfully",
    "helplessly",
    "highly",
    "honestly",
    "hopelessly",
    "hourly",
    "hungrily",
    "immediately",
    "innocently",
    "inquisitively",
    "instantly",
    "intensely",
    "intently",
    "interestingly",
    "inwardly",
    "irritably",
    "jaggedly",
    "jealously",
    "joshingly",
    "jovially",
    "joyfully",
    "joyously",
    "jubilantly",
    "judgementally",
    "justly",
    "keenly",
    "kiddingly",
    "kindheartedly",
    "kindly",
    "kissingly",
    "knavishly",
    "knottily",
    "knowingly",
    "knowledgeably",
    "kookily",
    "lazily",
    "less",
    "lightly",
    "likely",
    "limply",
    "lively",
    "loftily",
    "longingly",
    "loosely",
    "loudly",
    "lovingly",
    "loyally",
    "madly",
    "majestically",
    "meaningfully",
    "mechanically",
    "merrily",
    "miserably",
    "mockingly",
    "monthly",
    "more",
    "mortally",
    "mostly",
    "mysteriously",
    "naturally",
    "nearly",
    "neatly",
    "needily",
    "nervously",
    "never",
    "nicely",
    "noisily",
    "not",
    "obediently",
    "obnoxiously",
    "oddly",
    "offensively",
    "officially",
    "often",
    "only",
    "openly",
    "optimistically",
    "overconfidently",
    "owlishly",
    "painfully",
    "partially",
    "patiently",
    "perfectly",
    "physically",
    "playfully",
    "politely",
    "poorly",
    "positively",
    "potentially",
    "powerfully",
    "promptly",
    "properly",
    "punctually",
    "quaintly",
    "quarrelsomely",
    "queasily",
    "queerly",
    "questionably",
    "questioningly",
    "quicker",
    "quickly",
    "quietly",
    "quirkily",
    "quizzically",
    "rapidly",
    "rarely",
    "readily",
    "really",
    "reassuringly",
    "recklessly",
    "regularly",
    "reluctantly",
    "repeatedly",
    "reproachfully",
    "restfully",
    "righteously",
    "rightfully",
    "rigidly",
    "roughly",
    "rudely",
    "sadly",
    "safely",
    "scarcely",
    "scarily",
    "searchingly",
    "sedately",
    "seemingly",
    "seldom",
    "selfishly",
    "separately",
    "seriously",
    "shakily",
    "sharply",
    "sheepishly",
    "shrilly",
    "shyly",
    "silently",
    "sleepily",
    "slowly",
    "smoothly",
    "softly",
    "solemnly",
    "solidly",
    "sometimes",
    "soon",
    "speedily",
    "stealthily",
    "sternly",
    "strictly",
    "successfully",
    "suddenly",
    "surprisingly",
    "suspiciously",
    "sweetly",
    "swiftly",
    "sympathetically",
    "tenderly",
    "tensely",
    "terribly",
    "thankfully",
    "thoroughly",
    "thoughtfully",
    "tightly",
    "tomorrow",
    "too",
    "tremendously",
    "triumphantly",
    "truly",
    "truthfully",
    "ultimately",
    "unabashedly",
    "unaccountably",
    "unbearably",
    "unethically",
    "unexpectedly",
    "unfortunately",
    "unimpressively",
    "unnaturally",
    "unnecessarily",
    "upbeat",
    "upliftingly",
    "upright",
    "upside-down",
    "upward",
    "upwardly",
    "urgently",
    "usefully",
    "uselessly",
    "usually",
    "utterly",
    "vacantly",
    "vaguely",
    "vainly",
    "valiantly",
    "vastly",
    "verbally",
    "very",
    "viciously",
    "victoriously",
    "violently",
    "vivaciously",
    "voluntarily",
    "warmly",
    "weakly",
    "wearily",
    "well",
    "wetly",
    "wholly",
    "wildly",
    "willfully",
    "wisely",
    "woefully",
    "wonderfully",
    "worriedly",
    "wrongly",
    "yawningly",
    "yearly",
    "yearningly",
    "yesterday",
    "yieldingly",
    "youthfully"
  ]
};

// src/dict/words/common.json
var common_default = {
  description: "Common English words.",
  commonWords: [
    "a",
    "able",
    "about",
    "absolute",
    "accept",
    "account",
    "achieve",
    "across",
    "act",
    "active",
    "actual",
    "add",
    "address",
    "admit",
    "advertise",
    "affect",
    "afford",
    "after",
    "afternoon",
    "again",
    "against",
    "age",
    "agent",
    "ago",
    "agree",
    "air",
    "all",
    "allow",
    "almost",
    "along",
    "already",
    "alright",
    "also",
    "although",
    "always",
    "america",
    "amount",
    "and",
    "another",
    "answer",
    "any",
    "apart",
    "apparent",
    "appear",
    "apply",
    "appoint",
    "approach",
    "appropriate",
    "area",
    "argue",
    "arm",
    "around",
    "arrange",
    "art",
    "as",
    "ask",
    "associate",
    "assume",
    "at",
    "attend",
    "authority",
    "available",
    "aware",
    "away",
    "awful",
    "baby",
    "back",
    "bad",
    "bag",
    "balance",
    "ball",
    "bank",
    "bar",
    "base",
    "basis",
    "be",
    "bear",
    "beat",
    "beauty",
    "because",
    "become",
    "bed",
    "before",
    "begin",
    "behind",
    "believe",
    "benefit",
    "best",
    "bet",
    "between",
    "big",
    "bill",
    "birth",
    "bit",
    "black",
    "bloke",
    "blood",
    "blow",
    "blue",
    "board",
    "boat",
    "body",
    "book",
    "both",
    "bother",
    "bottle",
    "bottom",
    "box",
    "boy",
    "break",
    "brief",
    "brilliant",
    "bring",
    "britain",
    "brother",
    "budget",
    "build",
    "bus",
    "business",
    "busy",
    "but",
    "buy",
    "by",
    "cake",
    "call",
    "can",
    "car",
    "card",
    "care",
    "carry",
    "case",
    "cat",
    "catch",
    "cause",
    "cent",
    "centre",
    "certain",
    "chair",
    "chairman",
    "chance",
    "change",
    "chap",
    "character",
    "charge",
    "cheap",
    "check",
    "child",
    "choice",
    "choose",
    "Christ",
    "Christmas",
    "church",
    "city",
    "claim",
    "class",
    "clean",
    "clear",
    "client",
    "clock",
    "close",
    "closes",
    "clothe",
    "club",
    "coffee",
    "cold",
    "colleague",
    "collect",
    "college",
    "colour",
    "come",
    "comment",
    "commit",
    "committee",
    "common",
    "community",
    "company",
    "compare",
    "complete",
    "compute",
    "concern",
    "condition",
    "confer",
    "consider",
    "consult",
    "contact",
    "continue",
    "contract",
    "control",
    "converse",
    "cook",
    "copy",
    "corner",
    "correct",
    "cost",
    "could",
    "council",
    "count",
    "country",
    "county",
    "couple",
    "course",
    "court",
    "cover",
    "create",
    "cross",
    "cup",
    "current",
    "cut",
    "dad",
    "danger",
    "date",
    "day",
    "dead",
    "deal",
    "dear",
    "debate",
    "decide",
    "decision",
    "deep",
    "definite",
    "degree",
    "department",
    "depend",
    "describe",
    "design",
    "detail",
    "develop",
    "die",
    "difference",
    "difficult",
    "dinner",
    "direct",
    "discuss",
    "district",
    "divide",
    "do",
    "doctor",
    "document",
    "dog",
    "door",
    "double",
    "doubt",
    "down",
    "draw",
    "dress",
    "drink",
    "drive",
    "drop",
    "dry",
    "due",
    "during",
    "each",
    "early",
    "east",
    "easy",
    "eat",
    "economy",
    "educate",
    "effect",
    "egg",
    "eight",
    "either",
    "elect",
    "electric",
    "eleven",
    "else",
    "employ",
    "encourage",
    "end",
    "engine",
    "english",
    "enjoy",
    "enough",
    "enter",
    "environment",
    "equal",
    "especial",
    "europe",
    "even",
    "evening",
    "ever",
    "every",
    "evidence",
    "exact",
    "example",
    "except",
    "excuse",
    "exercise",
    "exist",
    "expect",
    "expense",
    "experience",
    "explain",
    "express",
    "extra",
    "eye",
    "face",
    "fact",
    "fair",
    "fall",
    "family",
    "far",
    "farm",
    "fast",
    "father",
    "favour",
    "feed",
    "feel",
    "few",
    "field",
    "fight",
    "figure",
    "file",
    "fill",
    "film",
    "final",
    "finance",
    "find",
    "fine",
    "finish",
    "fire",
    "first",
    "fish",
    "fit",
    "five",
    "flat",
    "floor",
    "fly",
    "follow",
    "food",
    "foot",
    "for",
    "force",
    "forget",
    "form",
    "fortune",
    "forward",
    "four",
    "france",
    "free",
    "friday",
    "friend",
    "from",
    "front",
    "full",
    "fun",
    "function",
    "fund",
    "further",
    "future",
    "game",
    "garden",
    "gas",
    "general",
    "germany",
    "get",
    "girl",
    "give",
    "glass",
    "go",
    "god",
    "good",
    "goodbye",
    "govern",
    "grand",
    "grant",
    "great",
    "green",
    "ground",
    "group",
    "grow",
    "guess",
    "guy",
    "hair",
    "half",
    "hall",
    "hand",
    "hang",
    "happen",
    "happy",
    "hard",
    "hate",
    "have",
    "he",
    "head",
    "health",
    "hear",
    "heart",
    "heat",
    "heavy",
    "hell",
    "help",
    "here",
    "high",
    "history",
    "hit",
    "hold",
    "holiday",
    "home",
    "honest",
    "hope",
    "horse",
    "hospital",
    "hot",
    "hour",
    "house",
    "how",
    "however",
    "hullo",
    "hundred",
    "husband",
    "idea",
    "identify",
    "if",
    "imagine",
    "important",
    "improve",
    "in",
    "include",
    "income",
    "increase",
    "indeed",
    "individual",
    "industry",
    "inform",
    "inside",
    "instead",
    "insure",
    "interest",
    "into",
    "introduce",
    "invest",
    "involve",
    "issue",
    "it",
    "item",
    "jesus",
    "job",
    "join",
    "judge",
    "jump",
    "just",
    "keep",
    "key",
    "kid",
    "kill",
    "kind",
    "king",
    "kitchen",
    "knock",
    "know",
    "labour",
    "lad",
    "lady",
    "land",
    "language",
    "large",
    "last",
    "late",
    "laugh",
    "law",
    "lay",
    "lead",
    "learn",
    "leave",
    "left",
    "leg",
    "less",
    "let",
    "letter",
    "level",
    "lie",
    "life",
    "light",
    "like",
    "likely",
    "limit",
    "line",
    "link",
    "list",
    "listen",
    "little",
    "live",
    "load",
    "local",
    "lock",
    "london",
    "long",
    "look",
    "lord",
    "lose",
    "lot",
    "love",
    "low",
    "luck",
    "lunch",
    "machine",
    "main",
    "major",
    "make",
    "man",
    "manage",
    "many",
    "mark",
    "market",
    "marry",
    "match",
    "matter",
    "may",
    "maybe",
    "mean",
    "meaning",
    "measure",
    "meet",
    "member",
    "mention",
    "middle",
    "might",
    "mile",
    "milk",
    "million",
    "mind",
    "minister",
    "minus",
    "minute",
    "miss",
    "mister",
    "moment",
    "monday",
    "money",
    "month",
    "more",
    "morning",
    "most",
    "mother",
    "motion",
    "move",
    "mrs",
    "much",
    "music",
    "must",
    "name",
    "nation",
    "nature",
    "near",
    "necessary",
    "need",
    "never",
    "new",
    "news",
    "next",
    "nice",
    "night",
    "nine",
    "no",
    "non",
    "none",
    "normal",
    "north",
    "not",
    "note",
    "notice",
    "now",
    "number",
    "obvious",
    "occasion",
    "odd",
    "of",
    "off",
    "offer",
    "office",
    "often",
    "okay",
    "old",
    "on",
    "once",
    "one",
    "only",
    "open",
    "operate",
    "opportunity",
    "oppose",
    "or",
    "order",
    "organize",
    "original",
    "other",
    "otherwise",
    "ought",
    "out",
    "over",
    "own",
    "pack",
    "page",
    "paint",
    "pair",
    "paper",
    "paragraph",
    "pardon",
    "parent",
    "park",
    "part",
    "particular",
    "party",
    "pass",
    "past",
    "pay",
    "pence",
    "pension",
    "people",
    "per",
    "percent",
    "perfect",
    "perhaps",
    "period",
    "person",
    "photograph",
    "pick",
    "picture",
    "piece",
    "place",
    "plan",
    "play",
    "please",
    "plus",
    "point",
    "police",
    "policy",
    "politic",
    "poor",
    "position",
    "positive",
    "possible",
    "post",
    "pound",
    "power",
    "practise",
    "prepare",
    "present",
    "press",
    "pressure",
    "presume",
    "pretty",
    "previous",
    "price",
    "print",
    "private",
    "probable",
    "problem",
    "proceed",
    "process",
    "produce",
    "product",
    "programme",
    "project",
    "proper",
    "propose",
    "protect",
    "provide",
    "public",
    "pull",
    "purpose",
    "push",
    "put",
    "quality",
    "quarter",
    "question",
    "quick",
    "quid",
    "quiet",
    "quite",
    "radio",
    "rail",
    "raise",
    "range",
    "rate",
    "rather",
    "read",
    "ready",
    "real",
    "realise",
    "really",
    "reason",
    "receive",
    "recent",
    "reckon",
    "recognize",
    "recommend",
    "record",
    "red",
    "reduce",
    "refer",
    "regard",
    "region",
    "relation",
    "remember",
    "report",
    "represent",
    "require",
    "research",
    "resource",
    "respect",
    "responsible",
    "rest",
    "result",
    "return",
    "rid",
    "right",
    "ring",
    "rise",
    "road",
    "role",
    "roll",
    "room",
    "round",
    "rule",
    "run",
    "safe",
    "sale",
    "same",
    "saturday",
    "save",
    "say",
    "scheme",
    "school",
    "science",
    "score",
    "scotland",
    "seat",
    "second",
    "secretary",
    "section",
    "secure",
    "see",
    "seem",
    "self",
    "sell",
    "send",
    "sense",
    "separate",
    "serious",
    "serve",
    "service",
    "set",
    "settle",
    "seven",
    "sex",
    "shall",
    "share",
    "she",
    "sheet",
    "shoe",
    "shoot",
    "shop",
    "short",
    "should",
    "show",
    "shut",
    "sick",
    "side",
    "sign",
    "similar",
    "simple",
    "since",
    "sing",
    "single",
    "sir",
    "sister",
    "sit",
    "site",
    "situate",
    "six",
    "size",
    "sleep",
    "slight",
    "slow",
    "small",
    "smoke",
    "so",
    "social",
    "society",
    "some",
    "son",
    "soon",
    "sorry",
    "sort",
    "sound",
    "south",
    "space",
    "speak",
    "special",
    "specific",
    "speed",
    "spell",
    "spend",
    "square",
    "staff",
    "stage",
    "stairs",
    "stand",
    "standard",
    "start",
    "state",
    "station",
    "stay",
    "step",
    "stick",
    "still",
    "stop",
    "story",
    "straight",
    "strategy",
    "street",
    "strike",
    "strong",
    "structure",
    "student",
    "study",
    "stuff",
    "stupid",
    "subject",
    "succeed",
    "such",
    "sudden",
    "suggest",
    "suit",
    "summer",
    "sun",
    "sunday",
    "supply",
    "support",
    "suppose",
    "sure",
    "surprise",
    "switch",
    "system",
    "table",
    "take",
    "talk",
    "tape",
    "tax",
    "tea",
    "teach",
    "team",
    "telephone",
    "television",
    "tell",
    "ten",
    "tend",
    "term",
    "terrible",
    "test",
    "than",
    "thank",
    "the",
    "then",
    "there",
    "therefore",
    "they",
    "thing",
    "think",
    "thirteen",
    "thirty",
    "this",
    "thou",
    "though",
    "thousand",
    "three",
    "through",
    "throw",
    "thursday",
    "tie",
    "time",
    "to",
    "today",
    "together",
    "tomorrow",
    "tonight",
    "too",
    "top",
    "total",
    "touch",
    "toward",
    "town",
    "trade",
    "traffic",
    "train",
    "transport",
    "travel",
    "treat",
    "tree",
    "trouble",
    "true",
    "trust",
    "try",
    "tuesday",
    "turn",
    "twelve",
    "twenty",
    "two",
    "type",
    "under",
    "understand",
    "union",
    "unit",
    "unite",
    "university",
    "unless",
    "until",
    "up",
    "upon",
    "use",
    "usual",
    "value",
    "various",
    "very",
    "video",
    "view",
    "village",
    "visit",
    "vote",
    "wage",
    "wait",
    "walk",
    "wall",
    "want",
    "war",
    "warm",
    "wash",
    "waste",
    "watch",
    "water",
    "way",
    "we",
    "wear",
    "wednesday",
    "wee",
    "week",
    "weigh",
    "welcome",
    "well",
    "west",
    "what",
    "when",
    "where",
    "whether",
    "which",
    "while",
    "white",
    "who",
    "whole",
    "why",
    "wide",
    "wife",
    "will",
    "win",
    "wind",
    "window",
    "wish",
    "with",
    "within",
    "without",
    "woman",
    "wonder",
    "wood",
    "word",
    "work",
    "world",
    "worry",
    "worse",
    "worth",
    "would",
    "write",
    "wrong",
    "year",
    "yes",
    "yesterday",
    "yet",
    "you",
    "young"
  ]
};

// src/dict/words/nouns.json
var nouns_default = {
  description: "A list of English nouns.",
  nouns: [
    "Armour",
    "Barrymore",
    "Cabot",
    "Catholicism",
    "Chihuahua",
    "Christianity",
    "Easter",
    "Frenchman",
    "Lowry",
    "Mayer",
    "Orientalism",
    "Pharaoh",
    "Pueblo",
    "Pullman",
    "Rodeo",
    "Saturday",
    "Sister",
    "Snead",
    "Syrah",
    "Tuesday",
    "Woodward",
    "abbey",
    "absence",
    "absorption",
    "abstinence",
    "absurdity",
    "abundance",
    "acceptance",
    "accessibility",
    "accommodation",
    "accomplice",
    "accountability",
    "accounting",
    "accreditation",
    "accuracy",
    "acquiescence",
    "acreage",
    "actress",
    "actuality",
    "adage",
    "adaptation",
    "adherence",
    "adjustment",
    "adoption",
    "adultery",
    "advancement",
    "advert",
    "advertisement",
    "advertising",
    "advice",
    "aesthetics",
    "affinity",
    "aggression",
    "agriculture",
    "aircraft",
    "airtime",
    "allegation",
    "allegiance",
    "allegory",
    "allergy",
    "allies",
    "alligator",
    "allocation",
    "allotment",
    "altercation",
    "ambulance",
    "ammonia",
    "anatomy",
    "anemia",
    "ankle",
    "announcement",
    "annoyance",
    "annuity",
    "anomaly",
    "anthropology",
    "anxiety",
    "apartheid",
    "apologise",
    "apostle",
    "apparatus",
    "appeasement",
    "appellation",
    "appendix",
    "applause",
    "appointment",
    "appraisal",
    "archery",
    "archipelago",
    "architecture",
    "ardor",
    "arrears",
    "arrow",
    "artisan",
    "artistry",
    "ascent",
    "assembly",
    "assignment",
    "association",
    "asthma",
    "atheism",
    "attacker",
    "attraction",
    "attractiveness",
    "auspices",
    "authority",
    "avarice",
    "aversion",
    "aviation",
    "babbling",
    "backlash",
    "baker",
    "ballet",
    "balls",
    "banjo",
    "baron",
    "barrier",
    "barrister",
    "bases",
    "basin",
    "basis",
    "battery",
    "battling",
    "bedtime",
    "beginner",
    "begun",
    "bending",
    "bicycle",
    "billing",
    "bingo",
    "biography",
    "biology",
    "birthplace",
    "blackberry",
    "blather",
    "blossom",
    "boardroom",
    "boasting",
    "bodyguard",
    "boldness",
    "bomber",
    "bondage",
    "bonding",
    "bones",
    "bonus",
    "bookmark",
    "boomer",
    "booty",
    "bounds",
    "bowling",
    "brainstorming",
    "breadth",
    "breaker",
    "brewer",
    "brightness",
    "broccoli",
    "broth",
    "brotherhood",
    "browsing",
    "brunch",
    "brunt",
    "building",
    "bullion",
    "bureaucracy",
    "burglary",
    "buyout",
    "by-election",
    "cabal",
    "cabbage",
    "calamity",
    "campaign",
    "canonization",
    "captaincy",
    "carcass",
    "carrier",
    "cartridge",
    "cassette",
    "catfish",
    "caught",
    "celebrity",
    "cemetery",
    "certainty",
    "certification",
    "charade",
    "chasm",
    "check-in",
    "cheerleader",
    "cheesecake",
    "chemotherapy",
    "chili",
    "china",
    "chivalry",
    "cholera",
    "cilantro",
    "circus",
    "civilisation",
    "civility",
    "clearance",
    "clearing",
    "clerk",
    "climber",
    "closeness",
    "clothing",
    "clutches",
    "coaster",
    "coconut",
    "coding",
    "collaborator",
    "colleague",
    "college",
    "collision",
    "colors",
    "combustion",
    "comedian",
    "comer",
    "commander",
    "commemoration",
    "commenter",
    "commissioner",
    "commune",
    "competition",
    "completeness",
    "complexity",
    "computing",
    "comrade",
    "concur",
    "condominium",
    "conduit",
    "confidant",
    "configuration",
    "confiscation",
    "conflagration",
    "conflict",
    "consist",
    "consistency",
    "consolidation",
    "conspiracy",
    "constable",
    "consul",
    "consultancy",
    "contentment",
    "contents",
    "contractor",
    "conversation",
    "cornerstone",
    "corpus",
    "correlation",
    "councilman",
    "counselor",
    "countdown",
    "countryman",
    "coverage",
    "covering",
    "coyote",
    "cracker",
    "creator",
    "criminality",
    "crocodile",
    "cropping",
    "cross-examination",
    "crossover",
    "crossroads",
    "culprit",
    "cumin",
    "curator",
    "curfew",
    "cursor",
    "custard",
    "cutter",
    "cyclist",
    "cyclone",
    "cylinder",
    "cynicism",
    "daddy",
    "damsel",
    "darkness",
    "dawning",
    "daybreak",
    "dealing",
    "dedication",
    "deduction",
    "defection",
    "deference",
    "deficiency",
    "definition",
    "deflation",
    "degeneration",
    "delegation",
    "delicacy",
    "delirium",
    "deliverance",
    "demeanor",
    "demon",
    "demonstration",
    "denomination",
    "dentist",
    "departure",
    "depletion",
    "depression",
    "designation",
    "despotism",
    "detention",
    "developer",
    "devolution",
    "dexterity",
    "diagnosis",
    "dialect",
    "differentiation",
    "digger",
    "digress",
    "dioxide",
    "diploma",
    "disability",
    "disarmament",
    "discord",
    "discovery",
    "dishonesty",
    "dismissal",
    "disobedience",
    "dispatcher",
    "disservice",
    "distribution",
    "distributor",
    "diver",
    "diversity",
    "docking",
    "dollar",
    "dominance",
    "domination",
    "dominion",
    "donkey",
    "doorstep",
    "doorway",
    "dossier",
    "downside",
    "drafting",
    "drank",
    "drilling",
    "driver",
    "drumming",
    "drunkenness",
    "duchess",
    "ducking",
    "dugout",
    "dumps",
    "dwelling",
    "dynamics",
    "eagerness",
    "earnestness",
    "earnings",
    "eater",
    "editor",
    "effectiveness",
    "electricity",
    "elements",
    "eloquence",
    "emancipation",
    "embodiment",
    "embroidery",
    "emperor",
    "employment",
    "encampment",
    "enclosure",
    "encouragement",
    "endangerment",
    "enlightenment",
    "enthusiasm",
    "environment",
    "environs",
    "envoy",
    "epilepsy",
    "equation",
    "equator",
    "error",
    "espionage",
    "estimation",
    "evacuation",
    "exaggeration",
    "examination",
    "exclamation",
    "expediency",
    "exploitation",
    "extinction",
    "eyewitness",
    "falls",
    "fascism",
    "fastball",
    "feces",
    "feedback",
    "ferocity",
    "fertilization",
    "fetish",
    "finale",
    "firing",
    "fixing",
    "flashing",
    "flask",
    "flora",
    "fluke",
    "folklore",
    "follower",
    "foothold",
    "footing",
    "forefinger",
    "forefront",
    "forgiveness",
    "formality",
    "formation",
    "formula",
    "foyer",
    "fragmentation",
    "framework",
    "fraud",
    "freestyle",
    "frequency",
    "friendliness",
    "fries",
    "frigate",
    "fulfillment",
    "function",
    "functionality",
    "fundraiser",
    "fusion",
    "futility",
    "gallantry",
    "gallery",
    "genesis",
    "genitals",
    "girlfriend",
    "glamour",
    "glitter",
    "glucose",
    "google",
    "grandeur",
    "grappling",
    "greens",
    "gridlock",
    "grocer",
    "groundwork",
    "grouping",
    "gunman",
    "gusto",
    "habitation",
    "hacker",
    "hallway",
    "hamburger",
    "hammock",
    "handling",
    "hands",
    "handshake",
    "happiness",
    "hardship",
    "headcount",
    "header",
    "headquarters",
    "heads",
    "headset",
    "hearth",
    "hearts",
    "heath",
    "hegemony",
    "height",
    "hello",
    "helper",
    "helping",
    "helplessness",
    "hierarchy",
    "hoarding",
    "hockey",
    "homeland",
    "homer",
    "honesty",
    "horror",
    "horseman",
    "hostility",
    "housing",
    "humility",
    "hurricane",
    "iceberg",
    "ignition",
    "illness",
    "illustration",
    "illustrator",
    "immunity",
    "immunization",
    "imperialism",
    "imprisonment",
    "inaccuracy",
    "inaction",
    "inactivity",
    "inauguration",
    "indecency",
    "indicator",
    "inevitability",
    "infamy",
    "infiltration",
    "influx",
    "iniquity",
    "innocence",
    "innovation",
    "insanity",
    "inspiration",
    "instruction",
    "instructor",
    "insurer",
    "interact",
    "intercession",
    "intercourse",
    "intermission",
    "interpretation",
    "intersection",
    "interval",
    "intolerance",
    "intruder",
    "invasion",
    "investment",
    "involvement",
    "irrigation",
    "iteration",
    "jenny",
    "jogging",
    "jones",
    "joseph",
    "juggernaut",
    "juncture",
    "jurisprudence",
    "juror",
    "kangaroo",
    "kingdom",
    "knocking",
    "laborer",
    "larceny",
    "laurels",
    "layout",
    "leadership",
    "leasing",
    "legislation",
    "leopard",
    "liberation",
    "licence",
    "lifeblood",
    "lifeline",
    "ligament",
    "lighting",
    "likeness",
    "line-up",
    "lineage",
    "liner",
    "lineup",
    "liquidation",
    "listener",
    "literature",
    "litigation",
    "litre",
    "loathing",
    "locality",
    "lodging",
    "logic",
    "longevity",
    "lookout",
    "lordship",
    "lustre",
    "ma'am",
    "machinery",
    "madness",
    "magnificence",
    "mahogany",
    "mailing",
    "mainframe",
    "maintenance",
    "majority",
    "manga",
    "mango",
    "manifesto",
    "mantra",
    "manufacturer",
    "maple",
    "martin",
    "martyrdom",
    "mathematician",
    "matrix",
    "matron",
    "mayhem",
    "mayor",
    "means",
    "meantime",
    "measurement",
    "mechanics",
    "mediator",
    "medics",
    "melodrama",
    "memory",
    "mentality",
    "metaphysics",
    "method",
    "metre",
    "miner",
    "mirth",
    "misconception",
    "misery",
    "mishap",
    "misunderstanding",
    "mobility",
    "molasses",
    "momentum",
    "monarchy",
    "monument",
    "morale",
    "mortality",
    "motto",
    "mouthful",
    "mouthpiece",
    "mover",
    "movie",
    "mowing",
    "murderer",
    "musician",
    "mutation",
    "mythology",
    "narration",
    "narrator",
    "nationality",
    "negligence",
    "neighborhood",
    "neighbour",
    "nervousness",
    "networking",
    "nexus",
    "nightmare",
    "nobility",
    "nobody",
    "noodle",
    "normalcy",
    "notification",
    "nourishment",
    "novella",
    "nucleus",
    "nuisance",
    "nursery",
    "nutrition",
    "nylon",
    "oasis",
    "obscenity",
    "obscurity",
    "observer",
    "offense",
    "onslaught",
    "operation",
    "opportunity",
    "opposition",
    "oracle",
    "orchestra",
    "organisation",
    "organizer",
    "orientation",
    "originality",
    "ounce",
    "outage",
    "outcome",
    "outdoors",
    "outfield",
    "outing",
    "outpost",
    "outset",
    "overseer",
    "owner",
    "oxygen",
    "pairing",
    "panther",
    "paradox",
    "parliament",
    "parsley",
    "parson",
    "passenger",
    "pasta",
    "patchwork",
    "pathos",
    "patriotism",
    "pendulum",
    "penguin",
    "permission",
    "persona",
    "perusal",
    "pessimism",
    "peter",
    "philosopher",
    "phosphorus",
    "phrasing",
    "physique",
    "piles",
    "plateau",
    "playing",
    "plaza",
    "plethora",
    "plurality",
    "pneumonia",
    "pointer",
    "poker",
    "policeman",
    "polling",
    "poster",
    "posterity",
    "posting",
    "postponement",
    "potassium",
    "pottery",
    "poultry",
    "pounding",
    "pragmatism",
    "precedence",
    "precinct",
    "preoccupation",
    "pretense",
    "priesthood",
    "prisoner",
    "privacy",
    "probation",
    "proceeding",
    "proceedings",
    "processing",
    "processor",
    "progression",
    "projection",
    "prominence",
    "propensity",
    "prophecy",
    "prorogation",
    "prospectus",
    "protein",
    "prototype",
    "providence",
    "provider",
    "provocation",
    "proximity",
    "puberty",
    "publicist",
    "publicity",
    "publisher",
    "pundit",
    "putting",
    "quantity",
    "quart",
    "quilting",
    "quorum",
    "racism",
    "radiance",
    "ralph",
    "rancher",
    "ranger",
    "rapidity",
    "rapport",
    "ratification",
    "rationality",
    "reaction",
    "reader",
    "reassurance",
    "rebirth",
    "receptor",
    "recipe",
    "recognition",
    "recourse",
    "recreation",
    "rector",
    "recurrence",
    "redemption",
    "redistribution",
    "redundancy",
    "refinery",
    "reformer",
    "refrigerator",
    "regularity",
    "regulator",
    "reinforcement",
    "reins",
    "reinstatement",
    "relativism",
    "relaxation",
    "rendition",
    "repayment",
    "repentance",
    "repertoire",
    "repository",
    "republic",
    "reputation",
    "resentment",
    "residency",
    "resignation",
    "restaurant",
    "resurgence",
    "retailer",
    "retention",
    "retirement",
    "reviewer",
    "riches",
    "righteousness",
    "roadblock",
    "robber",
    "rocks",
    "rubbing",
    "runoff",
    "saloon",
    "salvation",
    "sarcasm",
    "saucer",
    "savior",
    "scarcity",
    "scenario",
    "scenery",
    "schism",
    "scholarship",
    "schoolboy",
    "schooner",
    "scissors",
    "scolding",
    "scooter",
    "scouring",
    "scrimmage",
    "scrum",
    "seating",
    "sediment",
    "seduction",
    "seeder",
    "seizure",
    "self-confidence",
    "self-control",
    "self-respect",
    "semicolon",
    "semiconductor",
    "semifinal",
    "senator",
    "sending",
    "serenity",
    "seriousness",
    "servitude",
    "sesame",
    "setup",
    "sewing",
    "sharpness",
    "shaving",
    "shoplifting",
    "shopping",
    "siding",
    "simplicity",
    "simulation",
    "sinking",
    "skate",
    "sloth",
    "slugger",
    "snack",
    "snail",
    "snapshot",
    "snark",
    "soccer",
    "solemnity",
    "solicitation",
    "solitude",
    "somewhere",
    "sophistication",
    "sorcery",
    "souvenir",
    "spaghetti",
    "specification",
    "specimen",
    "specs",
    "spectacle",
    "spectre",
    "speculation",
    "sperm",
    "spoiler",
    "squad",
    "squid",
    "staging",
    "stagnation",
    "staircase",
    "stairway",
    "stamina",
    "standpoint",
    "standstill",
    "stanza",
    "statement",
    "stillness",
    "stimulus",
    "stocks",
    "stole",
    "stoppage",
    "storey",
    "storyteller",
    "stylus",
    "subcommittee",
    "subscription",
    "subsidy",
    "suburb",
    "success",
    "sufferer",
    "supposition",
    "suspension",
    "sweater",
    "sweepstakes",
    "swimmer",
    "syndrome",
    "synopsis",
    "syntax",
    "system",
    "tablespoon",
    "taker",
    "tavern",
    "technology",
    "telephony",
    "template",
    "tempo",
    "tendency",
    "tendon",
    "terrier",
    "terror",
    "terry",
    "theater",
    "theology",
    "therapy",
    "thicket",
    "thoroughfare",
    "threshold",
    "thriller",
    "thunderstorm",
    "ticker",
    "tiger",
    "tights",
    "to-day",
    "tossing",
    "touchdown",
    "tourist",
    "tourney",
    "toxicity",
    "tracing",
    "tractor",
    "translation",
    "transmission",
    "transmitter",
    "trauma",
    "traveler",
    "treadmill",
    "trilogy",
    "trout",
    "tuning",
    "twenties",
    "tycoon",
    "tyrant",
    "ultimatum",
    "underdog",
    "underwear",
    "unhappiness",
    "unification",
    "university",
    "uprising",
    "vaccination",
    "validity",
    "vampire",
    "vanguard",
    "variation",
    "vegetation",
    "verification",
    "viability",
    "vicinity",
    "victory",
    "viewpoint",
    "villa",
    "vindication",
    "violation",
    "vista",
    "vocalist",
    "vogue",
    "volcano",
    "voltage",
    "vomiting",
    "vulnerability",
    "waistcoat",
    "waitress",
    "wardrobe",
    "warmth",
    "watchdog",
    "wealth",
    "weariness",
    "whereabouts",
    "whisky",
    "whiteness",
    "widget",
    "width",
    "windfall",
    "wiring",
    "witchcraft",
    "withholding",
    "womanhood",
    "words",
    "workman",
    "youngster"
  ]
};

// src/dict/words/prepositions.json
var prepositions_default = {
  description: "A list of English prepositions, sourced from Wikipedia.",
  prepositions: [
    "aboard",
    "about",
    "above",
    "absent",
    "across",
    "after",
    "against",
    "along",
    "alongside",
    "amid",
    "amidst",
    "among",
    "amongst",
    "around",
    "as",
    "astride",
    "at",
    "atop",
    "before",
    "afore",
    "behind",
    "below",
    "beneath",
    "beside",
    "besides",
    "between",
    "beyond",
    "by",
    "circa",
    "despite",
    "down",
    "during",
    "except",
    "for",
    "from",
    "in",
    "inside",
    "into",
    "less",
    "like",
    "minus",
    "near",
    "nearer",
    "nearest",
    "of",
    "off",
    "on",
    "onto",
    "opposite",
    "outside",
    "over",
    "past",
    "per",
    "save",
    "since",
    "through",
    "to",
    "toward",
    "towards",
    "under",
    "until",
    "up",
    "upon",
    "upside",
    "versus",
    "via",
    "with",
    "within",
    "without"
  ]
};

// src/dict/world/countries.json
var countries_default = {
  description: "A list of countries.",
  countries: [
    "Argentina",
    "Australia",
    "Austria",
    "Bangladesh",
    "Belgium",
    "Brazil",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Czech Republic",
    "Denmark",
    "Egypt",
    "Ethiopia",
    "Finland",
    "France",
    "Germany",
    "Ghana",
    "Greece",
    "Hungary",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Japan",
    "Kenya",
    "Malaysia",
    "Mexico",
    "Morocco",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "North Korea",
    "Norway",
    "Pakistan",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Saudi Arabia",
    "Singapore",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Thailand",
    "Turkey",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uzbekistan",
    "Venezuela",
    "Vietnam",
    "Zimbabwe"
  ]
};

// src/dict/world/governments.json
var governments_default = {
  description: "List of different forms of government from Wikipedia https://en.wikipedia.org/wiki/List_of_forms_of_government",
  governments: [
    "autocracy",
    "democracy",
    "oligarchy",
    "anarchy",
    "confederation",
    "federation",
    "unitary state",
    "demarchy",
    "electocracy",
    "republic",
    "theocracy",
    "plutocracy",
    "technocracy",
    "monarchy",
    "dictatorship",
    "city-state",
    "commune",
    "empire",
    "colony"
  ]
};

// src/dict/world/nationalities.json
var nationalities_default = {
  description: "A list of nationalities.",
  source: "https://www.gov.uk/government/publications/nationalities/list-of-nationalities",
  license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  nationalities: [
    "Afghan",
    "Algerian",
    "American",
    "Argentine",
    "Australian",
    "Bangladeshi",
    "Belgian",
    "Brazilian",
    "British",
    "Canadian",
    "Chinese",
    "Colombian",
    "Cuban",
    "Danish",
    "Dutch",
    "Egyptian",
    "Ethiopian",
    "Filipino",
    "Finnish",
    "French",
    "German",
    "Ghanaian",
    "Greek",
    "Indian",
    "Indonesian",
    "Iranian",
    "Iraqi",
    "Irish",
    "Israeli",
    "Italian",
    "Jamaican",
    "Japanese",
    "Kenyan",
    "Malaysian",
    "Mexican",
    "Moroccan",
    "Nepalese",
    "Nigerian",
    "North Korean",
    "Norwegian",
    "Pakistani",
    "Polish",
    "Portuguese",
    "Russian",
    "Saudi Arabian",
    "South African",
    "South Korean",
    "Spanish",
    "Swedish",
    "Swiss",
    "Syrian",
    "Thai",
    "Turkish",
    "Ukrainian",
    "Vietnamese"
  ]
};

// src/dict/Dictionary.ts
var dict = {
  human: {
    authors: authors_default,
    bodyparts: bodyparts_default
  },
  materials: {
    fabrics: fabrics_default,
    metals: metals_default
  },
  music: {
    genres: genres_default,
    instruments: instruments_default
  },
  nsfw: {
    drugs: drugs_default,
    explicit: explicit_default,
    porn: porn_default
  },
  objects: {
    clothing: clothing_default,
    containers: containers_default
  },
  words: {
    adverbs: adverbs_default,
    common: common_default,
    nouns: nouns_default,
    prepositions: prepositions_default
  },
  world: {
    countries: countries_default,
    governments: governments_default,
    nationalities: nationalities_default
  }
};

// src/Interface.ts
function initInterface() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }
}
var ui = {};
function createUI() {
  initHeader();
  initCore();
  initTabs();
  initSearch();
  initFooter();
  InterfaceInitEvents.emit();
  return ui;
}
function createElement(config) {
  const el = document.createElement(config.type);
  if (config.id) el.id = config.id;
  if (config.class) el.className = config.class;
  if (config.text) el.textContent = config.text;
  if (config.html) el.innerHTML = config.html;
  if (config.placeholder) el.placeholder = config.placeholder;
  if (config.tooltip) tooltip(el, config.tooltip);
  if (config.premium) initPremium(el);
  if (config.limits) el.type = config.limits;
  if (config.min !== void 0) el.min = String(config.min);
  if (config.max !== void 0) el.max = String(config.max);
  if (config.value !== void 0) el.value = String(config.value);
  const target = config.append === "body" ? document.body : document.getElementById(config.append);
  target?.appendChild(el);
  if (config.limits && (config.min !== void 0 || config.max !== void 0)) {
    el.addEventListener("blur", () => {
      const input = el;
      let value = input.value.trim();
      if (value === "") return;
      value = value.replace(/[^a-zA-Z0-9]/g, "");
      if (config.limits === "number") {
        let num = Number(value);
        if (!Number.isInteger(num)) {
          num = Math.round(num);
        }
        if (config.min !== void 0 && num < config.min) {
          num = config.min;
        }
        if (config.max !== void 0 && num > config.max) {
          num = config.max;
        }
        input.value = String(num);
      } else if (config.limits === "string") {
        if (config.max !== void 0 && value.length > config.max) {
          value = value.slice(0, config.max);
        }
        if (config.min !== void 0 && value.length < config.min) {
          value = "";
        }
        input.value = value;
      }
    });
  }
  if (config.audio?.hover) {
    el.addEventListener("mouseenter", () => {
      playSound("hover");
    });
  }
  if (config.audio?.click) {
    el.addEventListener("click", () => {
      playSound("click");
    });
  }
  return el;
}
function initPremium(element) {
  element.classList.forEach((className) => {
    if (className.startsWith("premium_")) {
      element.classList.remove(className);
    }
  });
  element.classList.add(`premium_${STATE.PREMIUM}`);
  element.dataset.premium = "required";
}
function updatePremium() {
  document.querySelectorAll('[data-premium="required"]').forEach((element) => {
    initPremium(element);
  });
}
function initHeader() {
  ui.header = createElement(sanitize(INTERFACE.HEADER));
  ui.logo = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGO));
}
function initFooter() {
  ui.footer = createElement(sanitize(INTERFACE.FOOTER));
}
function initCore() {
  ui.main = createElement(sanitize(INTERFACE.MAIN));
  ui.topTabs = createElement(sanitize(INTERFACE.CONTAINERS.TOP_TABS));
  ui.globalTab = createElement(sanitize(INTERFACE.CONTAINERS.TOP_TABS.GLOBAL_TAB));
  ui.homeTab = createElement(sanitize(INTERFACE.CONTAINERS.TOP_TABS.HOME_TAB));
  ui.global = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL));
  ui.home = createElement(sanitize(INTERFACE.CONTAINERS.HOME));
  ui.globalTab.addEventListener("click", () => toggleTopTab(ui.globalTab));
  ui.homeTab.addEventListener("click", () => toggleTopTab(ui.homeTab));
  ui.tabs = createElement(sanitize(INTERFACE.CONTAINERS.HOME_TABS));
  ui.helpTab = createElement(sanitize(INTERFACE.CONTAINERS.HOME_TABS.HELP_TAB));
  ui.optionsTab = createElement(sanitize(INTERFACE.CONTAINERS.HOME_TABS.OPTIONS_TAB));
  ui.resultsTab = createElement(sanitize(INTERFACE.CONTAINERS.HOME_TABS.RESULTS_TAB));
  ui.helpTab.addEventListener("click", () => toggleTab(ui.helpTab));
  ui.optionsTab.addEventListener("click", () => toggleTab(ui.optionsTab));
  ui.resultsTab.addEventListener("click", () => toggleTab(ui.resultsTab));
  ui.globalTabs = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_TABS));
  ui.globalTopResultsTab = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_TABS.TOP_RESULTS));
  ui.globalSyrchersTab = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_TABS.SYRCHERS));
  ui.globalMenu = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU));
  initGlobalTables();
  toggleGlobalTab(ui.globalTopResultsTab);
  ui.globalTopResultsTab.addEventListener("click", () => toggleGlobalTab(ui.globalTopResultsTab));
  ui.globalSyrchersTab.addEventListener("click", () => toggleGlobalTab(ui.globalSyrchersTab));
  ui.help = createElement(sanitize(INTERFACE.CONTAINERS.HELP));
  ui.menu = createElement(sanitize(INTERFACE.CONTAINERS.MENU));
  ui.results = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS));
  ui.backupIcon = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS.BACKUP_ICON));
  ui.trashToggle = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS.TRASH_TOGGLE));
  ui.trashToggle.addEventListener("click", toggleTrashVisibility);
  ui.backupIcon.addEventListener("click", async () => {
    try {
      if (DEBUG.ENABLED) {
        console.log("Attempting to back up user data...");
      }
      await updateUser(true);
    } catch (err) {
      console.error("Error backing up user data:", err);
    }
  });
  ui.trashBin = createElement(sanitize(INTERFACE.CONTAINERS.TRASH_BIN_CONTAINER));
  ui.trashBinHeader = createElement(sanitize(INTERFACE.CONTAINERS.TRASH_BIN_CONTAINER.TRASH_HEADER));
  ui.trashBinEmpty = createElement(sanitize(INTERFACE.CONTAINERS.TRASH_BIN_CONTAINER.EMPTY_TRASH));
  ui.trashBinEmpty.addEventListener("click", emptyTrash);
  ui.queue = createElement(sanitize(INTERFACE.CONTAINERS.QUEUE_CONTAINER));
  ui.queueHeader = createElement(sanitize(INTERFACE.CONTAINERS.QUEUE_CONTAINER.QUEUE_HEADER));
  ui.favorites = createElement(sanitize(INTERFACE.CONTAINERS.FAVORITES_CONTAINER));
  ui.favoritesHeader = createElement(sanitize(INTERFACE.CONTAINERS.FAVORITES_CONTAINER.FAVORITES_HEADER));
  initHelpContent();
  ui.subtabs = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS));
  ui.filtersSubtab = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS.FILTERS_SUBTAB));
  ui.searchSettingsSubtab = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS.SEARCH_SETTINGS_SUBTAB));
  ui.advancedSubtab = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS.ADVANCED_SUBTAB));
  ui.filtersSubtab.addEventListener("click", () => toggleSubtab(ui.filtersSubtab));
  ui.searchSettingsSubtab.addEventListener("click", () => toggleSubtab(ui.searchSettingsSubtab));
  ui.advancedSubtab.addEventListener("click", () => toggleSubtab(ui.advancedSubtab));
  toggleTab(ui.optionsTab);
}
function initGlobalTables() {
  ui.globalResultsTable = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE));
  ui.globalResultsHeaderRow = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.HEADER_ROW));
  ui.globalResultsHeaderPosition = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.HEADER_ROW.POSITION));
  ui.globalResultsHeaderUrl = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.HEADER_ROW.URL));
  ui.globalResultsHeaderDiscoverer = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.HEADER_ROW.DISCOVERER));
  ui.globalResultsHeaderDiscoveredOn = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.HEADER_ROW.DISCOVERED_ON));
  ui.globalResultsHeaderKarma = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.HEADER_ROW.KARMA));
  ui.globalResultsPlaceholder = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.RESULTS_TABLE.PLACEHOLDER_ROW));
  ui.globalSyrchersTable = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE));
  ui.globalSyrchersHeaderRow = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.HEADER_ROW));
  ui.globalSyrchersHeaderPosition = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.HEADER_ROW.POSITION));
  ui.globalSyrchersHeaderUrl = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.HEADER_ROW.SYRCHER));
  ui.globalSyrchersHeaderDiscoverer = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.HEADER_ROW.DISCOVERIES));
  ui.globalSyrchersHeaderDiscoveredOn = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.HEADER_ROW.USER_SINCE));
  ui.globalSyrchersHeaderKarma = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.HEADER_ROW.KARMA));
  ui.globalSyrchersPlaceholder = createElement(sanitize(INTERFACE.CONTAINERS.GLOBAL_MENU.SYRCHERS_TABLE.PLACEHOLDER_ROW));
}
function initTabs() {
  toggleTopTab(ui.globalTab);
  initSubtabs();
}
function initSubtabs() {
  initFiltersSubtab();
  initSearchSettingsSubtab();
  initAdvancedSubtab();
  toggleSubtab(ui.filtersSubtab);
}
function initFiltersSubtab() {
  ui.filtersContainer = createElement(sanitize(INTERFACE.CONTAINERS.FILTERS_CONTAINER));
  ui.filters = createElement(sanitize(INTERFACE.CONTAINERS.FILTERS));
  for (const folderName in dict) {
    const folder = dict[folderName];
    const categoryID = `filter_category_${folderName}`;
    const containerID = `filter_container_${folderName}`;
    const categoryContainer = createElement({
      type: "div",
      id: categoryID,
      class: "category",
      append: "filters",
      audio: { click: true }
    });
    ui[categoryID] = categoryContainer;
    categoryContainer.addEventListener("click", (event) => {
      if (event.target.classList.contains("toggler")) return;
      const togglers = categoryContainer.querySelectorAll(".toggler");
      const allActive = Array.from(togglers).every((t) => t.classList.contains("active"));
      togglers.forEach((toggler) => {
        toggler.classList.toggle("active", !allActive);
        if (DEBUG.ENABLED) {
          console.log(`Toggled ${toggler.textContent} in ${folderName}`);
        }
      });
    });
    createElement({
      type: "h3",
      text: folderName.toUpperCase(),
      append: categoryID
    });
    const filterContainer = createElement({
      type: "div",
      id: containerID,
      class: "filters",
      append: categoryID
    });
    ui[containerID] = filterContainer;
    for (const entryName in folder) {
      const toggleID = `toggle_${folderName}_${entryName}`;
      const toggler = createElement({
        type: "div",
        id: toggleID,
        class: "toggler",
        text: entryName,
        append: containerID
      });
      toggler.addEventListener("mouseenter", () => {
        playSound("hover");
      });
      toggler.setAttribute("data-group", folderName);
      toggler.setAttribute("data-key", entryName);
      toggler.addEventListener("click", () => {
        toggler.classList.toggle("active");
        playSound("click");
        if (DEBUG.ENABLED) {
          console.log(`Toggled ${entryName} in ${folderName}`);
        }
      });
      ui[toggleID] = toggler;
    }
  }
}
function initHelpContent() {
  ui.hc00 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_00));
  ui.hc01 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_01));
  ui.hc02 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_02));
  ui.hc03 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_03));
  ui.gh00 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.GH_00));
  ui.gh01 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.GH_01));
  ui.gh02 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.GH_02));
  ui.ah00 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_00));
  ui.ah01 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_01));
  ui.ah02 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_02));
  ui.ah03 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_03));
  ui.ah04 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_04));
}
function initSearchSettingsSubtab() {
  ui.searchSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_CONTAINER));
  ui.searchSettingsToggles = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES));
  ui.stopOnFirstContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.STOP_ON_FIRST_CONTAINER));
  ui.stopOnFirstToggler = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.STOP_ON_FIRST_TOGGLER));
  ui.stopOnFirstContainer.addEventListener("click", () => {
    ui.stopOnFirstToggler.classList.toggle("active");
    SEARCH_PREFS.CUSTOM.STOP_ON_FIRST = ui.stopOnFirstToggler.classList.contains("active");
    if (DEBUG.ENABLED) {
      console.log(`Stop on first set to ${SEARCH_PREFS.CUSTOM.STOP_ON_FIRST}`);
    }
  });
  if (SEARCH_PREFS.CUSTOM.STOP_ON_FIRST) {
    ui.stopOnFirstToggler.classList.add("active");
  }
  ui.openOnFindContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.OPEN_ON_FIND_CONTAINER));
  ui.openOnFindToggler = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.OPEN_ON_FIND_TOGGLER));
  ui.openOnFindContainer.addEventListener("click", () => {
    ui.openOnFindToggler.classList.toggle("active");
    SEARCH_PREFS.CUSTOM.OPEN_ON_FIND = ui.openOnFindToggler.classList.contains("active");
    if (DEBUG.ENABLED) {
      console.log(`Open on find set to ${SEARCH_PREFS.CUSTOM.OPEN_ON_FIND}`);
    }
  });
  if (SEARCH_PREFS.CUSTOM.OPEN_ON_FIND) {
    ui.openOnFindToggler.classList.add("active");
  }
  initDomainSettings();
  ui.generationSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.GENERATION_SETTINGS_CONTAINER));
  ui.generationSettings = createElement(sanitize(INTERFACE.CONTAINERS.GENERATION_SETTINGS_CONTAINER.GENERATION_SETTINGS));
  ui.generationContainer = createElement(sanitize(INTERFACE.CONTAINERS.GENERATION_SETTINGS_CONTAINER.GENERATION_SETTINGS.GENERATION_CONTAINER));
  initCharacterSetSettings();
  initClusterWeightSettings();
  initRandomModeSettings();
}
function initDomainSettings() {
  ui.domainsContainer = createElement(sanitize(INTERFACE.CONTAINERS.DOMAIN_SETTINGS_CONTAINER));
  ui.domainSettings = createElement(sanitize(INTERFACE.CONTAINERS.DOMAIN_SETTINGS_CONTAINER.DOMAIN_SETTINGS));
  ui.domainsContainerInner = createElement(sanitize(INTERFACE.CONTAINERS.DOMAIN_SETTINGS_CONTAINER.DOMAIN_SETTINGS.DOMAINS_CONTAINER));
  const domainKeys = Object.keys(SEARCH_PREFS.DOMAINS);
  for (const domain of domainKeys) {
    const domainID = `toggle_domain_${domain.replace(/\./g, "")}`;
    const toggler = createElement(sanitize({
      ...INTERFACE.CONTAINERS.DOMAINS,
      ID: domainID,
      TEXT: domain
    }));
    toggler.addEventListener("mouseenter", () => {
      playSound("hover");
    });
    toggler.setAttribute("data-domain", domain);
    toggler.addEventListener("click", () => {
      const isActive = toggler.classList.toggle("active");
      SEARCH_PREFS.DOMAINS[domain] = isActive;
      playSound("click");
      if (DEBUG.ENABLED) {
        console.log(`Toggled domain: ${domain} \u2192 ${isActive}`);
      }
    });
    if (SEARCH_PREFS.DOMAINS[domain]) {
      toggler.classList.add("active");
    }
    ui[domainID] = toggler;
  }
}
function initCharacterSetSettings() {
  ui.characterSetSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.CHARACTER_SET_SETTINGS_CONTAINER));
  ui.characterSetSettings = createElement(sanitize(INTERFACE.CONTAINERS.CHARACTER_SET_SETTINGS_CONTAINER.CHARACTER_SET_SETTINGS));
  ui.characterSetContainer = createElement(sanitize(INTERFACE.CONTAINERS.CHARACTER_SET_SETTINGS_CONTAINER.CHARACTER_SET_SETTINGS.CHARACTER_SET_CONTAINER));
  for (const key of Object.keys(CHARACTERS.CHARACTER_SET)) {
    const toggleID = `toggle_character_set_${key}`;
    const toggler = createElement(sanitize({
      ...INTERFACE.CONTAINERS.CHARACTER_SET,
      ID: toggleID,
      TEXT: key
    }));
    toggler.addEventListener("mouseenter", () => {
      playSound("hover");
    });
    toggler.setAttribute("data-character-set", key);
    toggler.addEventListener("click", () => {
      const all = ui.characterSetContainer.querySelectorAll(".toggler");
      all.forEach((el) => el.classList.remove("active"));
      toggler.classList.add("active");
      SEARCH_PREFS.CUSTOM.CHARACTERS = CHARACTERS.CHARACTER_SET[key];
      if (key === "NUMERIC" || key === "ALPHANUMERIC") {
        SEARCH_PREFS.CUSTOM.RANDOM = RANDOM_MODE.RANDOM;
        const randomModeTogglers = ui.randomModeContainer?.querySelectorAll(".toggler");
        randomModeTogglers?.forEach((el) => el.classList.remove("active"));
        const rawToggle = ui.randomModeContainer?.querySelector('[data-random-mode="RAW"]');
        rawToggle?.classList.add("active");
        if (DEBUG.ENABLED) {
          console.log(`Auto-switched to RAW mode for ${key} character set`);
        }
      }
      playSound("click");
      if (DEBUG.ENABLED) {
        console.log(`Character set set to ${key}`);
      }
    });
    if (SEARCH_PREFS.CUSTOM.CHARACTERS === CHARACTERS.CHARACTER_SET[key]) {
      toggler.classList.add("active");
    }
    ui[toggleID] = toggler;
  }
}
function initClusterWeightSettings() {
  ui.clusterWeightSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.CLUSTER_CHANCE_SETTINGS_CONTAINER));
  ui.clusterWeightSettings = createElement(sanitize(INTERFACE.CONTAINERS.CLUSTER_CHANCE_SETTINGS_CONTAINER.CLUSTER_CHANCE_SETTINGS));
  ui.clusterWeightContainer = createElement(sanitize(INTERFACE.CONTAINERS.CLUSTER_CHANCE_SETTINGS_CONTAINER.CLUSTER_CHANCE_SETTINGS.CLUSTER_CHANCE_CONTAINER));
  ui.clusterWeightWrapper = createElement(sanitize(INTERFACE.SLIDERS.CLUSTER_CHANCE_SLIDER.WRAPPER));
  ui.clusterWeightFill = createElement(sanitize(INTERFACE.SLIDERS.CLUSTER_CHANCE_SLIDER.FILL));
  updateClusterWeightFill(SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE);
  let isDragging = false;
  ui.clusterWeightContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateFillFromMouse(e);
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateFillFromMouse(e);
    }
  });
  document.addEventListener("mouseup", () => {
    if (isDragging && DEBUG.ENABLED) {
      console.log(`Cluster weight set to ${SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE}`);
    }
    isDragging = false;
  });
  function updateFillFromMouse(e) {
    const rect = ui.clusterWeightContainer.getBoundingClientRect();
    const clampedX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const percent = clampedX / rect.width;
    const clamped = Math.min(Math.max(percent, 0), 1);
    SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE = clamped;
    updateClusterWeightFill(clamped);
  }
}
function initRandomModeSettings() {
  ui.randomModeSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.RANDOM_MODE_SETTINGS_CONTAINER));
  ui.randomModeSettings = createElement(sanitize(INTERFACE.CONTAINERS.RANDOM_MODE_SETTINGS_CONTAINER.RANDOM_MODE_SETTINGS));
  ui.randomModeContainer = createElement(sanitize(INTERFACE.CONTAINERS.RANDOM_MODE_SETTINGS_CONTAINER.RANDOM_MODE_SETTINGS.RANDOM_MODE_CONTAINER));
  for (const key of Object.keys(RANDOM_MODE)) {
    const toggleID = `toggle_random_mode_${key}`;
    const toggler = createElement(sanitize({
      ...INTERFACE.CONTAINERS.RANDOM_MODE,
      ID: toggleID,
      TEXT: key
    }));
    toggler.addEventListener("mouseenter", () => {
      playSound("hover");
    });
    toggler.setAttribute("data-random-mode", key);
    toggler.addEventListener("click", () => {
      const all = ui.randomModeContainer.querySelectorAll(".toggler");
      all.forEach((el) => el.classList.remove("active"));
      toggler.classList.add("active");
      SEARCH_PREFS.CUSTOM.RANDOM = RANDOM_MODE[key];
      if (key === "PHONETIC" || key === "SYLLABLE") {
        SEARCH_PREFS.CUSTOM.CHARACTERS = CHARACTERS.CHARACTER_SET.ALPHABETIC;
        const characterSetTogglers = ui.characterSetContainer?.querySelectorAll(".toggler");
        characterSetTogglers?.forEach((el) => el.classList.remove("active"));
        const alphabeticToggle = ui.characterSetContainer?.querySelector('[data-character-set="ALPHABETIC"]');
        alphabeticToggle?.classList.add("active");
        if (DEBUG.ENABLED) {
          console.log(`Auto-switched to ALPHABETIC character set for ${key} mode`);
        }
      }
      playSound("click");
      if (DEBUG.ENABLED) {
        console.log(`Random mode set to ${key}`);
      }
    });
    if (SEARCH_PREFS.CUSTOM.RANDOM === RANDOM_MODE[key]) {
      toggler.classList.add("active");
    }
    ui[toggleID] = toggler;
  }
}
function initAdvancedSubtab() {
  ui.advancedContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER));
  ui.searchLengthsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER));
  ui.searchLimitsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER));
  ui.timeoutLimitsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER));
  ui.fallbackLimitsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER));
  initSearchLengths();
  initSearchAmounts();
  initBatchSize();
  initBatchInterval();
  initConcurrentRequests();
  initTimeoutLimits();
  initFallbackLimits();
}
function initSearchLengths() {
  ui.searchLengths = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS));
  ui.searchLengthsInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS.SEARCH_LENGTHS_INPUT_CONTAINER));
  ui.minLengthInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS.SEARCH_LENGTHS_INPUT_CONTAINER.MIN_LENGTH_INPUT));
  ui.maxLengthInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS.SEARCH_LENGTHS_INPUT_CONTAINER.MAX_LENGTH_INPUT));
  ui.minLengthInput.addEventListener("blur", () => {
    const input = ui.minLengthInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.CUSTOM.LENGTH.MIN = num;
      if (DEBUG.ENABLED) {
        console.log(`Minimum search length set to ${SEARCH_PREFS.CUSTOM.LENGTH.MIN}`);
      }
    }
  });
  ui.maxLengthInput.addEventListener("blur", () => {
    const input = ui.maxLengthInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.CUSTOM.LENGTH.MAX = num;
      if (DEBUG.ENABLED) {
        console.log(`Maximum search length set to ${SEARCH_PREFS.CUSTOM.LENGTH.MAX}`);
      }
    }
  });
}
function initSearchAmounts() {
  ui.searchAmountContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.SEARCH_AMOUNT_CONTAINER));
  ui.searchAmountInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.SEARCH_AMOUNT_CONTAINER.SEARCH_AMOUNT_INPUT_CONTAINER));
  ui.searchAmountInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.SEARCH_AMOUNT_CONTAINER.SEARCH_AMOUNT_INPUT_CONTAINER.SEARCH_AMOUNT_INPUT));
  ui.searchAmountInput.addEventListener("blur", () => {
    const input = ui.searchAmountInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.RETRIES = num;
      if (DEBUG.ENABLED) {
        console.log(`Search amount set to ${SEARCH_PREFS.LIMITS.RETRIES}`);
      }
    }
  });
}
function initBatchSize() {
  ui.batchSizeContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_SIZE_CONTAINER));
  ui.batchSizeInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_SIZE_CONTAINER.BATCH_SIZE_INPUT_CONTAINER));
  ui.batchSizeInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_SIZE_CONTAINER.BATCH_SIZE_INPUT_CONTAINER.BATCH_SIZE_INPUT));
  ui.batchSizeInput.addEventListener("blur", () => {
    const input = ui.batchSizeInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.BATCH = num;
      if (DEBUG.ENABLED) {
        console.log(`Batch size set to ${SEARCH_PREFS.LIMITS.BATCH}`);
      }
    }
  });
}
function initBatchInterval() {
  ui.batchIntervalContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_INTERVAL_CONTAINER));
  ui.batchIntervalInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_INTERVAL_CONTAINER.BATCH_INTERVAL_INPUT_CONTAINER));
  ui.batchIntervalInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_INTERVAL_CONTAINER.BATCH_INTERVAL_INPUT_CONTAINER.BATCH_INTERVAL_INPUT));
  ui.batchIntervalInput.addEventListener("blur", () => {
    const input = ui.batchIntervalInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.BATCH_INTERVAL = num;
      if (DEBUG.ENABLED) {
        console.log(`Batch interval set to ${SEARCH_PREFS.LIMITS.BATCH_INTERVAL}`);
      }
    }
  });
}
function initConcurrentRequests() {
  ui.concurrentRequestsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.CONCURRENT_REQUESTS_CONTAINER));
  ui.concurrentRequestsInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.CONCURRENT_REQUESTS_CONTAINER.CONCURRENT_REQUESTS_INPUT_CONTAINER));
  ui.concurrentRequestsInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.CONCURRENT_REQUESTS_CONTAINER.CONCURRENT_REQUESTS_INPUT_CONTAINER.CONCURRENT_REQUESTS_INPUT));
  ui.concurrentRequestsInput.addEventListener("blur", () => {
    const input = ui.concurrentRequestsInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS = num;
      if (DEBUG.ENABLED) {
        console.log(`Concurrent requests set to ${SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS}`);
      }
    }
  });
}
function initTimeoutLimits() {
  ui.timeoutLimit = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER.TIMEOUT_LIMIT));
  ui.timeoutLimitInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER.TIMEOUT_LIMIT.TIMEOUT_LIMIT_INPUT_CONTAINER));
  ui.timeoutLimitInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER.TIMEOUT_LIMIT.TIMEOUT_LIMIT_INPUT_CONTAINER.TIMEOUT_LIMIT_INPUT));
  ui.timeoutLimitInput.addEventListener("blur", () => {
    const input = ui.timeoutLimitInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.TIMEOUT = num;
      if (DEBUG.ENABLED) {
        console.log(`Timeout limit set to ${SEARCH_PREFS.LIMITS.TIMEOUT}`);
      }
    }
  });
}
function initFallbackLimits() {
  ui.fallbackTimeoutLimit = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_TIMEOUT_LIMIT));
  ui.fallbackTimeoutLimitInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_TIMEOUT_LIMIT.FALLBACK_TIMEOUT_LIMIT_INPUT_CONTAINER));
  ui.fallbackTimeoutLimitInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_TIMEOUT_LIMIT.FALLBACK_TIMEOUT_LIMIT_INPUT_CONTAINER.FALLBACK_TIMEOUT_LIMIT_INPUT));
  ui.fallbackTimeoutLimitInput.addEventListener("blur", () => {
    const input = ui.fallbackTimeoutLimitInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT = num;
      if (DEBUG.ENABLED) {
        console.log(`Fallback timeout limit set to ${SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT}`);
      }
    }
  });
  ui.fallbackRetriesLimit = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_RETRIES_LIMIT));
  ui.fallbackRetriesLimitInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_RETRIES_LIMIT.FALLBACK_RETRIES_LIMIT_INPUT_CONTAINER));
  ui.fallbackRetriesLimitInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_RETRIES_LIMIT.FALLBACK_RETRIES_LIMIT_INPUT_CONTAINER.FALLBACK_RETRIES_LIMIT_INPUT));
  ui.fallbackRetriesLimitInput.addEventListener("blur", () => {
    const input = ui.fallbackRetriesLimitInput;
    const value = input.value.trim();
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      SEARCH_PREFS.LIMITS.FALLBACK.RETRIES = num;
      if (DEBUG.ENABLED) {
        console.log(`Fallback retries limit set to ${SEARCH_PREFS.LIMITS.FALLBACK.RETRIES}`);
      }
    }
  });
}
function initSearch() {
  ui.customInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.CUSTOM_INPUT_CONTAINER));
  ui.inputContainer = createElement(sanitize(INTERFACE.CONTAINERS.INPUT_CONTAINER));
  ui.customInput = createElement(sanitize(INTERFACE.CONTAINERS.INPUT));
  ui.insertContainer = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER));
  ui.insertPrefix = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER.INSERT_PREFIX));
  ui.insertSuffix = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER.INSERT_SUFFIX));
  ui.insertRandom = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER.INSERT_RANDOM));
  const insertOptions = [
    { el: ui.insertPrefix, value: "prefix" },
    { el: ui.insertSuffix, value: "suffix" },
    { el: ui.insertRandom, value: "random" }
  ];
  insertOptions.forEach((option) => {
    if (option.value === SEARCH_PREFS.CUSTOM.INSERT) {
      option.el.classList.add("active");
    }
    option.el.addEventListener("click", () => {
      insertOptions.forEach((opt) => opt.el.classList.remove("active"));
      option.el.classList.add("active");
      SEARCH_PREFS.CUSTOM.INSERT = option.value;
      if (DEBUG.ENABLED) {
        console.log(`Insert mode set to "${option.value}"`);
      }
    });
  });
  ui.searchContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH));
  ui.searchButton = createElement(sanitize(INTERFACE.BUTTONS.SEARCH));
  ui.progressWrapper = createElement(sanitize(INTERFACE.SLIDERS.PROGRESS_SLIDER.WRAPPER));
  ui.progressFill = createElement(sanitize(INTERFACE.SLIDERS.PROGRESS_SLIDER.FILL));
  ProgressEvents.on((percent) => {
    ui.progressFill.style.width = `${Math.floor(percent * 100)}%`;
  });
  ui.searchButton.addEventListener("mouseenter", updateSearchText);
  ui.searchButton.addEventListener("click", () => {
    if (STATE.SEARCHING) {
      cancelSearch();
      return;
    }
    ui.progressFill.style.width = "0%";
    search();
  });
}
function setText(id, text) {
  const element = ui[id];
  if (element) {
    element.textContent = text;
  }
}
function toggleTopTab(tab) {
  if (tab.classList.contains("active")) return;
  const topTabs = [ui.globalTab, ui.homeTab];
  const topContainers = [ui.global, ui.home];
  const index = topTabs.indexOf(tab);
  if (index === -1) return;
  const activeIndex = topTabs.findIndex((t) => t.classList.contains("active"));
  if (activeIndex === index) return;
  let oldContainer = topContainers[activeIndex];
  let newContainer = topContainers[index];
  if (!oldContainer || !newContainer) {
    oldContainer = ui.home;
    newContainer = ui.global;
  }
  topTabs.forEach((t) => t.classList.remove("active"));
  topTabs[index].classList.add("active");
  oldContainer.style.transform = "scale(0)";
  const animDuration = 250;
  setTimeout(() => {
    oldContainer.style.display = "none";
    newContainer.style.display = "flex";
    void newContainer.offsetWidth;
    newContainer.style.transform = "scale(1)";
  }, animDuration);
  if (DEBUG.ENABLED) {
    console.log(`Top tab switched to ${index === 0 ? "Global" : "Home"}`);
  }
}
function toggleTab(tab) {
  if (tab.classList.contains("active")) return;
  const tabs = [ui.optionsTab, ui.resultsTab, ui.helpTab];
  const containers = [ui.menu, ui.results, ui.help];
  tabs.forEach((t) => t.classList.remove("active"));
  containers.forEach((c2) => {
    c2.classList.remove("active");
    c2.classList.add("hidden");
  });
  const index = tabs.indexOf(tab);
  if (index === -1) return;
  tabs[index].classList.add("active");
  containers[index].classList.add("active");
  containers[index].classList.remove("hidden");
  if (DEBUG.ENABLED) {
    console.log(`Tab switched to ${tab.id || index}`);
  }
}
function toggleSubtab(tab) {
  ui.filtersSubtab.classList.remove("active");
  ui.searchSettingsSubtab.classList.remove("active");
  ui.advancedSubtab.classList.remove("active");
  ui.filtersContainer.classList.remove("active");
  ui.searchSettingsContainer.classList.remove("active");
  ui.advancedContainer.classList.remove("active");
  tab.classList.add("active");
  switch (tab) {
    case ui.filtersSubtab:
      ui.filtersContainer.classList.add("active");
      break;
    case ui.searchSettingsSubtab:
      ui.searchSettingsContainer.classList.add("active");
      break;
    case ui.advancedSubtab:
      ui.advancedContainer.classList.add("active");
      break;
  }
}
function toggleGlobalTab(tab) {
  if (tab.classList.contains("active")) return;
  const tabs = [ui.globalTopResultsTab, ui.globalSyrchersTab];
  const containers = [ui.globalResultsTable, ui.globalSyrchersTable];
  tabs.forEach((t) => t.classList.remove("active"));
  containers.forEach((c2) => {
    c2.classList.remove("active");
    c2.classList.add("hidden");
  });
  const index = tabs.indexOf(tab);
  if (index === -1) return;
  tabs[index].classList.add("active");
  containers[index].classList.add("active");
  containers[index].classList.remove("hidden");
  if (DEBUG.ENABLED) {
    console.log(`Global tab switched to ${index === 0 ? "Top Results" : "Syrchers"}`);
  }
}
function toggleTrashVisibility() {
  const resultsEl = document.getElementById("results");
  if (!resultsEl) return;
  const isHidden = resultsEl.classList.toggle("trash-hidden");
  ui.trashToggle.innerHTML = isHidden ? ICON.TRASH_TOGGLE.SHOW.SVG : ICON.TRASH_TOGGLE.HIDE.SVG;
  if (DEBUG.ENABLED) {
    console.log(`Trash is now ${isHidden ? "hidden" : "visible"}`);
  }
}
async function emptyTrash() {
  const trashContainer = document.getElementById("trash_bin_container");
  if (!trashContainer) return;
  const trashItems = Array.from(userTrash);
  for (const url of trashItems) {
    userTrash.delete(url);
    userDeleted.add(url);
    await saveDeleted(url);
    await removeTrash(url);
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    const displayName = match && match[1] ? match[1] : url;
    const safeName = displayName.replace(/\W+/g, "_");
    const el = document.getElementById(`result_container_${safeName}`);
    if (el) el.remove();
  }
  if (DEBUG.ENABLED) {
    console.log(`Moved ${trashItems.length} trash items to deleted.`);
  }
}
function renderValidResult(url, container) {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
  const displayName = match && match[1] ? match[1] : url;
  const safeName = displayName.replace(/\W+/g, "_");
  const existingResult = document.getElementById(`result_container_${safeName}`);
  if (existingResult) {
    if (DEBUG.ENABLED) {
      console.log("Result container already exists for:", url, safeName);
    }
    return;
  }
  const containerConfig = { ...INTERFACE.CONTAINERS.RESULT_CONTAINER };
  containerConfig.ID = `result_container_${safeName}`;
  containerConfig.APPEND = container || "queue_container";
  const containerEl = createElement(sanitize(containerConfig));
  const resultConfig = { ...INTERFACE.CONTAINERS.RESULT_CONTAINER.RESULT };
  resultConfig.ID = `result_${safeName}`;
  resultConfig.APPEND = containerConfig.ID;
  const resultEl = createElement(sanitize(resultConfig));
  const trashConfig = { ...INTERFACE.CONTAINERS.RESULT_CONTAINER.RESULT.TRASH_CONTAINER };
  trashConfig.ID = `trash_container_${safeName}`;
  trashConfig.APPEND = resultConfig.ID;
  const trashEl = createElement(sanitize(trashConfig));
  const trashIconConfig = { ...INTERFACE.CONTAINERS.RESULT_CONTAINER.RESULT.TRASH_CONTAINER.ICON };
  trashIconConfig.ID = `trash_icon_${safeName}`;
  trashIconConfig.APPEND = trashConfig.ID;
  createElement(sanitize(trashIconConfig));
  const linkContainerConfig = {
    TYPE: "div",
    ID: `link_container_${safeName}`,
    CLASS: "container",
    APPEND: resultConfig.ID
  };
  const linkContainerEl = createElement(sanitize(linkContainerConfig));
  const link = document.createElement("a");
  link.textContent = displayName;
  link.className = "result-link";
  linkContainerEl.appendChild(link);
  const favConfig = { ...INTERFACE.CONTAINERS.RESULT_CONTAINER.RESULT.FAVORITE_CONTAINER };
  favConfig.ID = `favorite_container_${safeName}`;
  favConfig.APPEND = resultConfig.ID;
  const favEl = createElement(sanitize(favConfig));
  const favIconConfig = { ...INTERFACE.CONTAINERS.RESULT_CONTAINER.RESULT.FAVORITE_CONTAINER.ICON };
  favIconConfig.ID = `favorite_icon_${safeName}`;
  favIconConfig.APPEND = favConfig.ID;
  createElement(sanitize(favIconConfig));
  containerEl.addEventListener("click", () => {
    window.open(url, "_blank", "noopener,noreferrer");
  });
  trashEl.addEventListener("click", (e) => {
    if (containerEl.closest("#trash_bin_container")) {
      if (DEBUG.ENABLED) {
        console.log("Item: ", url, " is already in trash.");
      }
      return;
    }
    e.stopPropagation();
    validResults.delete(url);
    userFavorites.delete(url);
    removeFavorite(url);
    userTrash.add(url);
    saveTrash(url);
    removeSessionResult(url);
    containerEl.remove();
    ui.trashBin.appendChild(containerEl);
  });
  favEl.addEventListener("click", (e) => {
    if (containerEl.closest("#favorites_container")) {
      if (DEBUG.ENABLED) {
        console.log("Item: ", url, " is already in favorites.");
      }
      return;
    }
    e.stopPropagation();
    validResults.delete(url);
    userTrash.delete(url);
    removeTrash(url);
    userFavorites.add(url);
    saveFavorite(url);
    removeSessionResult(url);
    containerEl.remove();
    ui.favorites.appendChild(containerEl);
  });
  playSound("result");
}
ValidResultEvents.on(renderValidResult);
function clearResults() {
  const results = document.querySelectorAll(".result");
  results.forEach((el) => el.remove());
  if (DEBUG.ENABLED) {
    console.log("All results cleared");
  }
}
function updateClusterWeightFill(value) {
  const percent = Math.floor(value * 100);
  if (ui.clusterWeightFill) {
    ui.clusterWeightFill.style.width = `${percent}%`;
  }
}
var currentSearchText = null;
function updateSearchText() {
  if (!ui.searchButton) return;
  if (ui.searchButton.textContent === "Cancel") return;
  const values = Object.values(SEARCH_TEXT);
  const englishChance = 0.5;
  let newText;
  if (currentSearchText !== SEARCH_TEXT.ENGLISH && Math.random() < englishChance) {
    newText = SEARCH_TEXT.ENGLISH;
  } else {
    do {
      newText = values[Math.floor(Math.random() * values.length)];
    } while (newText === currentSearchText);
  }
  currentSearchText = newText;
  ui.searchButton.textContent = newText;
}

// src/GenerationConfig.ts
var PATTERNS = [
  // Short patterns (3-5 chars)
  { pattern: "cvc", weight: 15 },
  //cat, dog, sun
  { pattern: "cvcc", weight: 12 },
  //hand, wolf, park
  { pattern: "ccvc", weight: 8 },
  //stop, plan, true
  { pattern: "cvcv", weight: 10 },
  //hero, data, baby
  { pattern: "vcv", weight: 6 },
  //age, ice, eye
  { pattern: "vcc", weight: 5 },
  //and, end, old
  { pattern: "ccv", weight: 4 },
  //sky, try, fly
  { pattern: "vccv", weight: 6 },
  //also, into, open
  { pattern: "cvv", weight: 4 },
  //sea, tea, zoo
  { pattern: "ccvv", weight: 3 },
  //blue, true, free
  // Medium patterns (4-7 chars)
  { pattern: "cvcvc", weight: 20 },
  //basic, magic, music
  { pattern: "cvccv", weight: 15 },
  //apple, simple, table
  { pattern: "ccvcv", weight: 8 },
  //drama, price, place
  { pattern: "cvcvv", weight: 5 },
  //video, radio, piano
  { pattern: "vccvc", weight: 6 },
  //under, after, other
  { pattern: "vcvcv", weight: 7 },
  //again, above, about
  { pattern: "ccvcc", weight: 6 },
  //block, plant, front
  { pattern: "cvccc", weight: 4 },
  //world, first, worst
  { pattern: "ccccv", weight: 2 },
  //street, strong
  { pattern: "vcvcc", weight: 5 },
  //event, actor, order
  { pattern: "cvcvcc", weight: 8 },
  //better, center, winter
  { pattern: "cvccvc", weight: 10 },
  //market, garden, person
  // Longer patterns (6+ chars)
  { pattern: "cvcvcv", weight: 12 },
  //banana, camera, canada
  { pattern: "cvccvcv", weight: 5 },
  //fantastic, calendar
  { pattern: "cvcvcvc", weight: 8 },
  //america, develop, computer
  { pattern: "vcvcvc", weight: 6 },
  //elephant, umbrella
  { pattern: "cvcvcvv", weight: 4 },
  //dangerous, beautiful
  { pattern: "ccvcvcv", weight: 5 },
  //traveling, different
  { pattern: "vcvccvc", weight: 4 },
  //important, understand
  { pattern: "cvcvccv", weight: 4 },
  //remember, september
  { pattern: "ccvcvcc", weight: 3 },
  //progress, connect
  { pattern: "cvcvcvcv", weight: 6 },
  //absolutely, television
  { pattern: "vcvcvcv", weight: 4 },
  //economy, democracy
  { pattern: "ccvcvcvc", weight: 3 },
  //practical, specific
  { pattern: "cvcccvc", weight: 3 },
  //children, standard
  { pattern: "cvccvcvc", weight: 4 },
  //wonderful, political
  { pattern: "vcvcvcvc", weight: 3 },
  //helicopter, refrigerator
  // Extra long patterns (8+ chars)
  { pattern: "cvcvcvcvc", weight: 3 },
  //communication, organization
  { pattern: "ccvcvcvcv", weight: 2 },
  //representative
  { pattern: "cvcvcvcvcv", weight: 2 },
  //responsibility
  { pattern: "vcvcvcvcv", weight: 2 }
  //international
];
var CLUSTERS = [
  // Common consonant clusters
  { pattern: "th", weight: 25 },
  //the, think, both
  { pattern: "st", weight: 20 },
  //stop, best, first
  { pattern: "ch", weight: 18 },
  //child, much, beach
  { pattern: "sh", weight: 15 },
  //show, fish, wish
  { pattern: "ng", weight: 15 },
  //sing, long, thing
  { pattern: "nt", weight: 12 },
  //want, front, point
  { pattern: "nd", weight: 12 },
  //hand, kind, around
  { pattern: "ck", weight: 10 },
  //back, check, quick
  { pattern: "ll", weight: 10 },
  //call, well, tell
  { pattern: "ss", weight: 8 },
  //class, less, kiss
  { pattern: "tt", weight: 6 },
  //better, letter, little
  { pattern: "pp", weight: 5 },
  //happy, apple, pepper
  { pattern: "ff", weight: 5 },
  //off, stuff, coffee
  { pattern: "mm", weight: 4 },
  //summer, hammer, common
  { pattern: "nn", weight: 4 },
  //funny, dinner, cannot
  { pattern: "rr", weight: 3 },
  //sorry, carry, mirror
  { pattern: "dd", weight: 3 },
  //add, middle, sudden
  { pattern: "bb", weight: 2 },
  //rabbit, hobby, bubble
  { pattern: "gg", weight: 2 },
  //bigger, egg,agger
  // Common vowel clusters
  { pattern: "ee", weight: 12 },
  //see, tree, free
  { pattern: "oo", weight: 10 },
  //book, good, food
  { pattern: "ea", weight: 8 },
  //sea, read, beach
  { pattern: "ou", weight: 8 },
  //house, about, mouth
  { pattern: "ai", weight: 6 },
  //main, rain, again
  { pattern: "ie", weight: 6 },
  //piece, field, believe
  { pattern: "ue", weight: 4 },
  //blue, true, value
  { pattern: "oa", weight: 4 },
  //boat, road, soap
  { pattern: "au", weight: 3 },
  //because, caught, laugh
  { pattern: "ei", weight: 3 },
  //receive, eight, weight
  // Common consonant-vowel clusters
  { pattern: "er", weight: 20 },
  //water, after, other
  { pattern: "re", weight: 15 },
  //more, here, where
  { pattern: "or", weight: 12 },
  //for, work, word
  { pattern: "ar", weight: 10 },
  //car, part, start
  { pattern: "le", weight: 10 },
  //table, people, little
  { pattern: "en", weight: 8 },
  //when, then, open
  { pattern: "an", weight: 8 },
  //man, can, plan
  { pattern: "on", weight: 6 },
  //on, long, front
  { pattern: "in", weight: 6 },
  //in, thing, begin
  { pattern: "al", weight: 6 },
  //all, also, small
  { pattern: "ed", weight: 6 },
  //asked, worked, played
  { pattern: "es", weight: 6 },
  //yes, goes, comes
  { pattern: "ly", weight: 5 },
  //only, really, family
  { pattern: "ty", weight: 4 },
  //city, party, empty
  { pattern: "ny", weight: 3 }
  //any, many, funny
];
var SYLLABLES = [
  // Single vowels
  { pattern: "a", weight: 10 },
  { pattern: "e", weight: 10 },
  { pattern: "i", weight: 10 },
  { pattern: "o", weight: 10 },
  { pattern: "u", weight: 10 },
  // Open syllables (CV)
  { pattern: "ka", weight: 8 },
  { pattern: "ta", weight: 8 },
  { pattern: "ma", weight: 8 },
  { pattern: "la", weight: 8 },
  { pattern: "ra", weight: 8 },
  { pattern: "sa", weight: 7 },
  { pattern: "na", weight: 7 },
  { pattern: "fa", weight: 6 },
  { pattern: "za", weight: 4 },
  { pattern: "ba", weight: 6 },
  { pattern: "da", weight: 6 },
  { pattern: "pa", weight: 6 },
  { pattern: "ga", weight: 5 },
  { pattern: "ha", weight: 4 },
  // Vowel clusters
  { pattern: "ai", weight: 6 },
  { pattern: "ea", weight: 6 },
  { pattern: "io", weight: 6 },
  { pattern: "ou", weight: 6 },
  { pattern: "ue", weight: 5 },
  { pattern: "oa", weight: 5 },
  { pattern: "ee", weight: 5 },
  { pattern: "oo", weight: 5 },
  // Closed syllables (CVC)
  { pattern: "ban", weight: 6 },
  { pattern: "ton", weight: 6 },
  { pattern: "lek", weight: 5 },
  { pattern: "dar", weight: 5 },
  { pattern: "mur", weight: 5 },
  { pattern: "vek", weight: 4 },
  { pattern: "zul", weight: 4 },
  { pattern: "tor", weight: 5 },
  { pattern: "gen", weight: 5 },
  { pattern: "val", weight: 5 },
  { pattern: "lor", weight: 4 },
  { pattern: "bur", weight: 4 },
  { pattern: "rin", weight: 4 },
  // Suffix-style or final syllables
  { pattern: "el", weight: 6 },
  { pattern: "en", weight: 6 },
  { pattern: "in", weight: 6 },
  { pattern: "on", weight: 6 },
  { pattern: "un", weight: 5 },
  { pattern: "er", weight: 6 },
  { pattern: "ar", weight: 5 },
  { pattern: "or", weight: 5 },
  { pattern: "ix", weight: 4 },
  { pattern: "us", weight: 4 },
  { pattern: "et", weight: 4 },
  { pattern: "ly", weight: 3 },
  { pattern: "sy", weight: 3 },
  { pattern: "ty", weight: 3 },
  { pattern: "ny", weight: 3 },
  // Brand/tech style
  { pattern: "lux", weight: 4 },
  { pattern: "nex", weight: 4 },
  { pattern: "kor", weight: 4 },
  { pattern: "tron", weight: 4 },
  { pattern: "dex", weight: 3 },
  { pattern: "zon", weight: 3 },
  { pattern: "bit", weight: 3 },
  { pattern: "byte", weight: 3 },
  { pattern: "pha", weight: 3 },
  { pattern: "dro", weight: 3 },
  { pattern: "chi", weight: 3 },
  { pattern: "noz", weight: 2 },
  { pattern: "xil", weight: 2 },
  { pattern: "gral", weight: 2 },
  { pattern: "tros", weight: 2 }
];

// src/Generation.ts
function getCustomWord() {
  const input = ui.customInput;
  const word = input?.value.trim();
  if (DEBUG.ENABLED && word) {
    console.log(`Getting custom word: ${word}`);
  }
  return word ? word.toLowerCase() : null;
}
function generateRandomURL(domain) {
  const selected = getSelectedFilters();
  const filterSelections = selected.filter(([group]) => group in dict);
  const length = randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX);
  let randPart = "";
  if (filterSelections.length === 0) {
    switch (SEARCH_PREFS.CUSTOM.RANDOM) {
      case RANDOM_MODE.RANDOM:
        randPart = randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, length);
        break;
      case RANDOM_MODE.PHONETIC:
        randPart = generatePhoneticWord(length);
        break;
      case RANDOM_MODE.SYLLABLE:
        randPart = generateSyllables(length);
        break;
    }
  } else {
    const parts = [];
    for (const [group, key] of selected) {
      const entry = dict[group][key];
      const wordList = getWordList(entry);
      if (wordList.length > 0) {
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        parts.push(word.toLowerCase());
        if (DEBUG.ENABLED && !DEBUG.QUIET) {
          console.log(`[${group}.${key}] \u2192 Sample: "${word}" (${wordList.length} words)`);
        }
      } else if (DEBUG.ENABLED) {
        console.warn(`[${group}.${key}] \u2192 No usable word list.`);
      }
    }
    let joined = parts.join("");
    if (joined.length > length) {
      joined = joined.slice(0, length);
    }
    const remaining = length - joined.length;
    if (remaining > 0 && Math.random() < SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE) {
      let extra = "";
      for (let attempt = 0; attempt < 10 && extra.length < remaining; attempt++) {
        let fragment = "";
        switch (SEARCH_PREFS.CUSTOM.RANDOM) {
          case RANDOM_MODE.RANDOM:
            if (Math.random() < SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE) {
              fragment = generateWithClusters(remaining - extra.length, SEARCH_PREFS.CUSTOM.LENGTH.MIN);
            } else {
              fragment = randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, remaining - extra.length);
            }
            break;
          case RANDOM_MODE.PHONETIC:
            fragment = generatePhoneticWord(remaining - extra.length);
            break;
          case RANDOM_MODE.SYLLABLE:
            fragment = generateSyllables(remaining - extra.length);
            break;
        }
        if (fragment.length + extra.length <= remaining) {
          extra += fragment;
        }
      }
      joined += extra;
    }
    randPart = joined;
  }
  let customWord = null;
  if (STATE.PREMIUM) {
    customWord = getCustomWord();
    if (customWord) {
      switch (SEARCH_PREFS.CUSTOM.INSERT) {
        case "prefix":
          randPart = customWord + randPart;
          break;
        case "suffix":
          randPart = randPart + customWord;
          break;
        default:
          randPart = insertWordRandomly(randPart, customWord);
      }
    }
  }
  let finalUrl = `${SEARCH_PREFS.BASE}${randPart}${domain}`;
  let maxRetries = 5;
  while (sessionResults.has(finalUrl) && maxRetries-- > 0) {
    randPart = SEARCH_PREFS.CUSTOM.RANDOM ? randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX)) : generateSyllables(randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX));
    if (STATE.PREMIUM && customWord) {
      switch (SEARCH_PREFS.CUSTOM.INSERT) {
        case "prefix":
          randPart = customWord + randPart;
          break;
        case "suffix":
          randPart = randPart + customWord;
          break;
        default:
          randPart = insertWordRandomly(randPart, customWord);
      }
    }
    finalUrl = `${SEARCH_PREFS.BASE}${randPart}${domain}`;
  }
  return finalUrl;
}
function generateSyllables(maxLength) {
  let word = "";
  const minLength = SEARCH_PREFS.CUSTOM.LENGTH.MIN;
  const usedSyllables = /* @__PURE__ */ new Set();
  while (word.length < maxLength && word.length < minLength + 4) {
    const validSyllables = SYLLABLES.filter(
      (syl) => syl.pattern.length <= maxLength - word.length && !usedSyllables.has(syl.pattern)
    );
    if (validSyllables.length === 0) break;
    const totalWeight = validSyllables.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const syl of validSyllables) {
      random -= syl.weight;
      if (random <= 0) {
        word += syl.pattern;
        usedSyllables.add(syl.pattern);
        break;
      }
    }
  }
  if (word.length < minLength) {
    const vowels = CHARACTERS.CHARACTER_TYPE.VOWELS;
    while (word.length < minLength) {
      word += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  return word.slice(0, maxLength);
}
function generatePhoneticWord(maxLength) {
  const vowels = CHARACTERS.CHARACTER_TYPE.VOWELS;
  const consonants = CHARACTERS.CHARACTER_TYPE.CONSONANTS;
  const minLength = SEARCH_PREFS.CUSTOM.LENGTH.MIN;
  if (Math.random() < SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE) {
    return generateWithClusters(maxLength, minLength);
  }
  return generateWithEnhancedPatterns(maxLength, minLength, vowels, consonants);
}
function generateWithClusters(maxLength, minLength) {
  let word = "";
  const usedClusters = /* @__PURE__ */ new Set();
  while (word.length < maxLength && word.length < minLength + 4) {
    const validCombos = CLUSTERS.filter(
      (combo) => combo.pattern.length <= maxLength - word.length && !usedClusters.has(combo.pattern)
    );
    if (validCombos.length === 0) break;
    const totalWeight = validCombos.reduce((sum, c2) => sum + c2.weight, 0);
    let random = Math.random() * totalWeight;
    for (const combo of validCombos) {
      random -= combo.weight;
      if (random <= 0) {
        word += combo.pattern;
        usedClusters.add(combo.pattern);
        break;
      }
    }
  }
  while (word.length < minLength) {
    const vowels = CHARACTERS.CHARACTER_TYPE.VOWELS;
    word += vowels[Math.floor(Math.random() * vowels.length)];
  }
  return word.slice(0, maxLength);
}
function generateWithEnhancedPatterns(maxLength, minLength, vowels, consonants) {
  const validPatterns = PATTERNS.filter(
    (p) => p.pattern.length >= minLength && p.pattern.length <= maxLength
  );
  if (validPatterns.length === 0) {
    return generateFallbackPattern(maxLength, minLength, vowels, consonants);
  }
  const totalWeight = validPatterns.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedPattern = validPatterns[0].pattern;
  for (const patternObj of validPatterns) {
    random -= patternObj.weight;
    if (random <= 0) {
      selectedPattern = patternObj.pattern;
      break;
    }
  }
  return buildEnhancedWordFromPattern(selectedPattern, vowels, consonants);
}
function buildEnhancedWordFromPattern(pattern, vowels, consonants) {
  let word = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const nextChar = pattern[i + 1];
    if (char === "c") {
      if (nextChar && Math.random() < 0.2) {
        const validCombos = CLUSTERS.filter(
          (combo) => combo.pattern.length === 2 && i + 1 < pattern.length && (char === "c" && nextChar === "c" || char === "c" && nextChar === "v")
        );
        if (validCombos.length > 0) {
          const combo = validCombos[Math.floor(Math.random() * validCombos.length)];
          word += combo.pattern;
          i++;
          continue;
        }
      }
      word += consonants[Math.floor(Math.random() * consonants.length)];
    } else if (char === "v") {
      if (nextChar === "v" && Math.random() < 0.15) {
        const vowelCombos = CLUSTERS.filter(
          (combo) => combo.pattern.length === 2 && /^[aeiou]{2}$/.test(combo.pattern)
        );
        if (vowelCombos.length > 0) {
          const combo = vowelCombos[Math.floor(Math.random() * vowelCombos.length)];
          word += combo.pattern;
          i++;
          continue;
        }
      }
      word += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  return word;
}
function generateFallbackPattern(maxLength, minLength, vowels, consonants) {
  let pattern = "";
  let useConsonant = true;
  for (let i = 0; i < Math.min(maxLength, Math.max(minLength, 4)); i++) {
    pattern += useConsonant ? "c" : "v";
    useConsonant = !useConsonant;
  }
  return buildEnhancedWordFromPattern(pattern, vowels, consonants);
}
function insertWordRandomly(base, word) {
  const pos = randomInt(0, base.length);
  return base.slice(0, pos) + word + base.slice(pos);
}

// src/Main.ts
var c = {};
InterfaceInitEvents.on(() => {
  if (DEBUG.ENABLED) {
    console.log("UI created:", ui);
  }
  PLUGINS.sypher.init({
    interface: {
      button: {
        type: "connect",
        text: "Login",
        modal: true,
        append: ui.header
      }
    },
    crypto: {
      chain: "base",
      contractAddress: "0x21b9D428EB20FA075A29d51813E57BAb85406620",
      poolAddress: "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
      pairAddress: "0x4200000000000000000000000000000000000006",
      overrides: {
        decimals: 18,
        name: "Sypher",
        symbol: "SYPHER",
        totalSupply: PLUGINS.ethers.utils.parseUnits("1000000", 18),
        tokenPrice: 0.086728360992
        //TODO: DELETE THIS TESTING ONLY!
      },
      version: "V3",
      icon: "https://github.com/Tukyo/sypherbot-public/blob/main/assets/img/botpic.png?raw=true"
    }
  });
});
window.addEventListener("sypher:initCrypto", function(event) {
  (async () => {
    c = event.detail;
    let tb = c.user.tokenBalance;
    if (DEBUG.ENABLED) {
      console.log("Token:", c.token);
    }
    try {
      const dbUser = await login(c.user.address, c.user.ens);
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (tb != 0 && check(tb)) {
        STATE.PREMIUM = true;
        updatePremium();
      }
      USER.address = c.user.address;
      USER.ens = c.user.ens || void 0;
      USER.ethBalance = c.user.ethBalance;
      USER.tokenBalance = c.user.tokenBalance;
      USER.value = c.user.value;
      if (DEBUG.ENABLED) {
        console.log("User:", USER);
      }
      await cloudSync(dbUser, c.user.address);
    } catch (err) {
      console.error("Login failed, USER not updated:", err);
    }
  })();
});
window.addEventListener("sypher:ens", (event) => {
  const ens = event.detail;
  USER.ens = ens;
  syncENS(ens);
});
window.addEventListener("sypher:disconnect", (event) => {
  resetAppState();
});
window.addEventListener("sypher:accountChange", (event) => {
  console.log("ACCOUNT CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!");
  resetAppState();
});
async function init() {
  initInterface();
  await loadIndexedDB();
  loadGlobalFavorites();
  loadGlobalSyrchers();
}
await init();
async function search() {
  if (STATE.SEARCHING) return;
  STATE.SEARCHING = true;
  setText("searchButton", "Cancel");
  clearQueue();
  let attempts = 0;
  let progress = 0;
  if (DEBUG.ENABLED) {
    console.log("Starting search with preferences:", SEARCH_PREFS);
  }
  try {
    const globalBatchSet = /* @__PURE__ */ new Set();
    const batchPromises = [];
    for (let i = 0; i < SEARCH_PREFS.LIMITS.RETRIES; i += SEARCH_PREFS.LIMITS.BATCH) {
      const batchDelay = i === 0 ? 0 : SEARCH_PREFS.LIMITS.BATCH_INTERVAL;
      const batchPromise = new Promise((resolve) => {
        setTimeout(async () => {
          if (!STATE.SEARCHING) {
            resolve();
            return;
          }
          const batchSet = /* @__PURE__ */ new Set();
          const batch = [];
          while (batch.length < SEARCH_PREFS.LIMITS.BATCH) {
            const enabledDomains = Object.entries(SEARCH_PREFS.DOMAINS).filter(([, isEnabled]) => isEnabled).map(([domain2]) => domain2);
            if (enabledDomains.length === 0) {
              throw new Error("No domains are enabled. Please select at least one.");
            }
            const domain = enabledDomains[Math.floor(Math.random() * enabledDomains.length)];
            const url = generateRandomURL(domain);
            if (!batchSet.has(url) && !sessionResults.has(url) && !globalBatchSet.has(url)) {
              batchSet.add(url);
              globalBatchSet.add(url);
              batch.push({ url, promise: throttle(() => checkUrl(url)) });
            }
          }
          const batchIndex = Math.floor(i / SEARCH_PREFS.LIMITS.BATCH) + 1;
          try {
            const results = await Promise.all(batch.map((b) => b.promise));
            if (!STATE.SEARCHING) {
              resolve();
              return;
            }
            attempts += SEARCH_PREFS.LIMITS.BATCH;
            if (DEBUG.ENABLED) {
              logBatchResults(batchIndex, batch);
            }
            progress = Math.max(progress, attempts / SEARCH_PREFS.LIMITS.RETRIES);
            ProgressEvents.emit(progress);
            const workingBatch = batch.filter((b, idx) => results[idx]);
            if (workingBatch.length > 0) {
              if (DEBUG.ENABLED) {
                console.log(`\u2705 Found ${workingBatch.length} valid URLs in batch ${batchIndex}`);
              }
              toggleTab(ui.resultsTab);
              if (SEARCH_PREFS.CUSTOM.OPEN_ON_FIND) {
                for (const { url } of workingBatch) {
                  window.open(url, "_blank");
                }
              }
              if (SEARCH_PREFS.CUSTOM.STOP_ON_FIRST) {
                STATE.SEARCHING = false;
              }
            }
          } catch (error) {
            if (DEBUG.ENABLED) {
              console.error(`Error in batch ${batchIndex}:`, error);
            }
          }
          resolve();
        }, batchDelay);
      });
      batchPromises.push(batchPromise);
    }
    await Promise.all(batchPromises);
  } finally {
    ProgressEvents.emit(1);
    STATE.SEARCHING = false;
    setText("searchButton", "Search");
  }
}
async function fetchWithTimeout(url, timeout, mode) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      mode,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
function cancelSearch() {
  if (DEBUG.ENABLED) console.log("\u{1F6D1} Cancelling search process");
  clearQueue();
  STATE.SEARCHING = false;
  setText("searchButton", "Search");
}
function clearQueue() {
  if (DEBUG.ENABLED) console.log("Clearing timeout queue");
  timeoutQueue.clear();
  STATE.PROCESSING_TIMEOUTS = false;
}
function getRoot(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}
async function checkUrl(url) {
  if (sessionResults.has(url)) {
    if (DEBUG.ENABLED) {
      console.log(`\u{1F501} Using cached result for ${url}`);
    }
    return sessionResults.get(url).valid;
  }
  try {
    const response = await fetchWithTimeout(url, SEARCH_PREFS.LIMITS.TIMEOUT, "cors");
    const result = {
      url,
      valid: response.status < 400,
      status: response.status,
      timeStamp: Date.now()
    };
    sessionResults.set(url, result);
    saveSessionResult({
      url,
      valid: result.valid,
      timestamp: result.timeStamp
    });
    if (result.valid) {
      validResults.set(url, result);
      ValidResultEvents.emit(url);
    } else {
      invalidResults.set(url, result);
    }
    return result.valid;
  } catch (error) {
    const result = {
      url,
      valid: false,
      timeStamp: Date.now(),
      reason: error?.message || "unknown error"
    };
    sessionResults.set(url, result);
    invalidResults.set(url, result);
    saveSessionResult({
      url,
      valid: result.valid,
      timestamp: result.timeStamp
    });
    const errMsg = error?.message || "";
    const isTimeout = errMsg.toLowerCase().includes("timeout") || errMsg.toLowerCase().includes("aborted") || error?.name === "AbortError";
    const retriesEnabled = SEARCH_PREFS.LIMITS.FALLBACK.RETRIES > 0;
    if (isTimeout && retriesEnabled) {
      timeoutQueue.add(url);
      processTimeoutQueue();
    }
    const fallbackSuccess = await fallback(url);
    if (fallbackSuccess) {
      const updatedResult = {
        url,
        valid: true,
        timeStamp: Date.now(),
        reason: "recovered via fallback"
      };
      sessionResults.set(url, updatedResult);
      validResults.set(url, updatedResult);
      ValidResultEvents.emit(url);
      invalidResults.delete(url);
      saveSessionResult({
        url,
        valid: true,
        timestamp: updatedResult.timeStamp
      });
    }
    return fallbackSuccess;
  }
}
async function fallback(url) {
  if (DEBUG.ENABLED && !DEBUG.QUIET) {
    console.log("\u{1F504} Attempting fallback for:", url);
  }
  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      // Attempt without cors
      redirect: "follow"
    });
    if (DEBUG.ENABLED && !DEBUG.QUIET) {
      console.log("\u2705 CORS bypass succeeded for:", url);
    }
    return true;
  } catch (error) {
    if (DEBUG.ENABLED && !DEBUG.QUIET) {
      console.log("\u274C CORS bypass failed for:", url, error);
    }
    return false;
  }
}
async function processTimeoutQueue() {
  if (STATE.PROCESSING_TIMEOUTS) return;
  STATE.PROCESSING_TIMEOUTS = true;
  const fallbackLimits = SEARCH_PREFS.LIMITS.FALLBACK;
  if (DEBUG.ENABLED) console.log("\u{1F552} Starting background retry for timeouts");
  while (timeoutQueue.size > 0) {
    const url = [...timeoutQueue][0];
    let success = false;
    for (let attempt = 1; attempt <= fallbackLimits.RETRIES; attempt++) {
      try {
        const response = await fetchWithTimeout(url, fallbackLimits.TIMEOUT, "cors");
        const valid = response.status < 400;
        const redirected = getRoot(url) !== getRoot(response.url);
        if (valid && !redirected) {
          const result = {
            url,
            valid: true,
            status: response.status,
            timeStamp: Date.now(),
            reason: "recovered via background retry"
          };
          sessionResults.set(url, result);
          validResults.set(url, result);
          ValidResultEvents.emit(url);
          saveSessionResult({
            url,
            valid: result.valid,
            timestamp: result.timeStamp
          });
          success = true;
          break;
        }
      } catch {
      }
      await new Promise((r2) => setTimeout(r2, 50));
    }
    timeoutQueue.delete(url);
    if (DEBUG.ENABLED) {
      console.log(`\u{1F9EA} Retried: ${url} \u2192 ${success ? "\u2705 success" : "\u274C failed"}`);
    }
  }
  if (DEBUG.ENABLED) console.log("\u2705 Timeout queue cleared.");
  STATE.PROCESSING_TIMEOUTS = false;
}
function getSelectedFilters() {
  const selected = [];
  const container = document.getElementById("filters_container");
  if (!container) return selected;
  container.querySelectorAll(".toggler.active").forEach((el) => {
    const group = el.getAttribute("data-group");
    const key = el.getAttribute("data-key");
    if (group && key) {
      selected.push([group, key]);
    }
  });
  return selected;
}
function getWordList(entry) {
  if (Array.isArray(entry)) return entry;
  if (typeof entry === "object" && entry !== null) {
    for (const value of Object.values(entry)) {
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}
export {
  cancelSearch,
  clearQueue,
  getSelectedFilters,
  getWordList,
  search
};
/*! Bundled license information:

@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/logger/dist/esm/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
@firebase/installations/dist/esm/index.esm.js:
@firebase/analytics/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/installations/dist/esm/index.esm.js:
@firebase/installations/dist/esm/index.esm.js:
@firebase/installations/dist/esm/index.esm.js:
@firebase/installations/dist/esm/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
@firebase/installations/dist/esm/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/analytics/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js:
@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/firestore/dist/index.esm.js:
  (**
  * @license
  * Copyright 2020 Google LLC
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law | agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm.js:
@firebase/firestore/dist/index.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=main.js.map
