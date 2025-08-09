var __defProp = Object.defineProperty;
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// node_modules/axios/lib/utils.js
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var { iterator, toStringTag } = Symbol;
var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
var kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
var { isArray } = Array;
var isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
var isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
var isString = typeOfTest("string");
var isFunction = typeOfTest("function");
var isNumber = typeOfTest("number");
var isObject = (thing) => thing !== null && typeof thing === "object";
var isBoolean = (thing) => thing === true || thing === false;
var isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype3 = getPrototypeOf(val);
  return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(toStringTag in val) && !(iterator in val);
};
var isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
var isDate = kindOfTest("Date");
var isFile = kindOfTest("File");
var isBlob = kindOfTest("Blob");
var isFileList = kindOfTest("FileList");
var isStream = (val) => isObject(val) && isFunction(val.pipe);
var isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
var isURLSearchParams = kindOfTest("URLSearchParams");
var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
var _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
var extend = (a2, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a2[key] = bind(val, thisArg);
    } else {
      a2[key] = val;
    }
  }, { allOwnKeys });
  return a2;
};
var stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
var inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
var endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
var toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
var isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
var forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
var matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
var freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
var toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
var noop = () => {
};
var toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
var isAsyncFn = kindOfTest("AsyncFunction");
var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction(_global.postMessage)
);
var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
var utils_default = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};

// node_modules/axios/lib/core/AxiosError.js
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils_default.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils_default.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
var prototype = AxiosError.prototype;
var descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype);
  utils_default.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var AxiosError_default = AxiosError;

// node_modules/axios/lib/helpers/null.js
var null_default = null;

// node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (null_default || FormData)();
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils_default.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils_default.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var toFormData_default = toFormData;

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype2 = AxiosURLSearchParams.prototype;
prototype2.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype2.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode);
  } : encode;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
var AxiosURLSearchParams_default = AxiosURLSearchParams;

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  if (utils_default.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}

// node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils_default.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
};
var InterceptorManager_default = InterceptorManager;

// node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

// node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;

// node_modules/axios/lib/platform/browser/classes/FormData.js
var FormData_default = typeof FormData !== "undefined" ? FormData : null;

// node_modules/axios/lib/platform/browser/classes/Blob.js
var Blob_default = typeof Blob !== "undefined" ? Blob : null;

// node_modules/axios/lib/platform/browser/index.js
var browser_default = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams_default,
    FormData: FormData_default,
    Blob: Blob_default
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};

// node_modules/axios/lib/platform/common/utils.js
var utils_exports = {};
__export(utils_exports, {
  hasBrowserEnv: () => hasBrowserEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  navigator: () => _navigator,
  origin: () => origin
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var _navigator = typeof navigator === "object" && navigator || void 0;
var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
var hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
var origin = hasBrowserEnv && window.location.href || "http://localhost";

// node_modules/axios/lib/platform/index.js
var platform_default = {
  ...utils_exports,
  ...browser_default
};

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}

// node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default = formDataToJSON;

// node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var defaults = {
  transitional: transitional_default,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils_default.isObject(data);
    if (isObjectPayload && utils_default.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils_default.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
    }
    if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (utils_default.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils_default.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData_default(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform_default.classes.FormData,
    Blob: platform_default.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
var defaults_default = defaults;

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};

// node_modules/axios/lib/core/AxiosHeaders.js
var $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value)) return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var AxiosHeaders = class {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils_default.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders_default(header), valueOrRewrite);
    } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils_default.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils_default.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils_default.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils_default.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils_default.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils_default.forEach(this, (value, header) => {
      const key = utils_default.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils_default.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype3 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype3, _header);
        accessors[lHeader] = true;
      }
    }
    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils_default.freezeMethods(AxiosHeaders);
var AxiosHeaders_default = AxiosHeaders;

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// node_modules/axios/lib/cancel/CanceledError.js
function CanceledError(message, config, request) {
  AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils_default.inherits(CanceledError, AxiosError_default, {
  __CANCEL__: true
});
var CanceledError_default = CanceledError;

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default(
      "Request failed with status code " + response.status,
      [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
var speedometer_default = speedometer;

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default = throttle;

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return throttle_default((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
var progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform_default.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform_default.origin),
  platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
) : () => true;

// node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils_default.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils_default.isString(path) && cookie.push("path=" + path);
      utils_default.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a2, b, prop, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a2, b, prop, caseless);
    } else if (!utils_default.isUndefined(a2)) {
      return getMergedValue(void 0, a2, prop, caseless);
    }
  }
  function valueFromConfig2(a2, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a2, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils_default.isUndefined(a2)) {
      return getMergedValue(void 0, a2);
    }
  }
  function mergeDirectKeys(a2, b, prop) {
    if (prop in config2) {
      return getMergedValue(a2, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a2);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a2, b, prop) => mergeDeepProperties(headersToObject(a2), headersToObject(b), prop, true)
  };
  utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}

// node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default = (config) => {
  const newConfig = mergeConfig({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders_default.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  let contentType;
  if (utils_default.isFormData(data)) {
    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || "multipart/form-data", ...tokens].join("; "));
    }
  }
  if (platform_default.hasStandardBrowserEnv) {
    withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhr_default = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig_default(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders_default.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError() {
      reject(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitional_default;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError_default(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils_default.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils_default.asap(unsubscribe);
    return signal;
  }
};
var composeSignals_default = composeSignals;

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
var readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
var readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
var trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};

// node_modules/axios/lib/adapters/fetch.js
var isFetchSupported = typeof fetch === "function" && typeof Request === "function" && typeof Response === "function";
var isReadableStreamSupported = isFetchSupported && typeof ReadableStream === "function";
var encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Response(str).arrayBuffer()));
var test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
var supportsRequestStream = isReadableStreamSupported && test(() => {
  let duplexAccessed = false;
  const hasContentType = new Request(platform_default.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
});
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var supportsResponseStream = isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
var resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};
isFetchSupported && ((res) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
    !resolvers[type] && (resolvers[type] = utils_default.isFunction(res[type]) ? (res2) => res2[type]() : (_, config) => {
      throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
    });
  });
})(new Response());
var getBodyLength = async (body) => {
  if (body == null) {
    return 0;
  }
  if (utils_default.isBlob(body)) {
    return body.size;
  }
  if (utils_default.isSpecCompliantForm(body)) {
    const _request = new Request(platform_default.origin, {
      method: "POST",
      body
    });
    return (await _request.arrayBuffer()).byteLength;
  }
  if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
    return body.byteLength;
  }
  if (utils_default.isURLSearchParams(body)) {
    body = body + "";
  }
  if (utils_default.isString(body)) {
    return (await encodeText(body)).byteLength;
  }
};
var resolveBodyLength = async (headers, body) => {
  const length = utils_default.toFiniteNumber(headers.getContentLength());
  return length == null ? getBodyLength(body) : length;
};
var fetch_default = isFetchSupported && (async (config) => {
  let {
    url,
    method,
    data,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = "same-origin",
    fetchOptions
  } = resolveConfig_default(config);
  responseType = responseType ? (responseType + "").toLowerCase() : "text";
  let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
  let request;
  const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
    composedSignal.unsubscribe();
  });
  let requestContentLength;
  try {
    if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
      let _request = new Request(url, {
        method: "POST",
        body: data,
        duplex: "half"
      });
      let contentTypeHeader;
      if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
        headers.setContentType(contentTypeHeader);
      }
      if (_request.body) {
        const [onProgress, flush] = progressEventDecorator(
          requestContentLength,
          progressEventReducer(asyncDecorator(onUploadProgress))
        );
        data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
      }
    }
    if (!utils_default.isString(withCredentials)) {
      withCredentials = withCredentials ? "include" : "omit";
    }
    const isCredentialsSupported = "credentials" in Request.prototype;
    request = new Request(url, {
      ...fetchOptions,
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data,
      duplex: "half",
      credentials: isCredentialsSupported ? withCredentials : void 0
    });
    let response = await fetch(request, fetchOptions);
    const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
    if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
      const options = {};
      ["status", "statusText", "headers"].forEach((prop) => {
        options[prop] = response[prop];
      });
      const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
      const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
        responseContentLength,
        progressEventReducer(asyncDecorator(onDownloadProgress), true)
      ) || [];
      response = new Response(
        trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
          flush && flush();
          unsubscribe && unsubscribe();
        }),
        options
      );
    }
    responseType = responseType || "text";
    let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
    !isStreamResponse && unsubscribe && unsubscribe();
    return await new Promise((resolve, reject) => {
      settle(resolve, reject, {
        data: responseData,
        headers: AxiosHeaders_default.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      });
    });
  } catch (err) {
    unsubscribe && unsubscribe();
    if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
      throw Object.assign(
        new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request),
        {
          cause: err.cause || err
        }
      );
    }
    throw AxiosError_default.from(err, err && err.code, config, request);
  }
});

// node_modules/axios/lib/adapters/adapters.js
var knownAdapters = {
  http: null_default,
  xhr: xhr_default,
  fetch: fetch_default
};
utils_default.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
var renderReason = (reason) => `- ${reason}`;
var isResolvedHandle = (adapter) => utils_default.isFunction(adapter) || adapter === null || adapter === false;
var adapters_default = {
  getAdapter: (adapters) => {
    adapters = utils_default.isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError_default(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state2]) => `adapter ${id} ` + (state2 === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError_default(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters_default.getAdapter(config.adapter || defaults_default.adapter);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders_default.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}

// node_modules/axios/lib/env/data.js
var VERSION = "1.11.0";

// node_modules/axios/lib/helpers/validator.js
var validators = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
var deprecatedWarnings = {};
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError_default(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError_default.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator ? validator(value, opt, opts) : true;
  };
};
validators.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === void 0 || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validator_default = {
  assertOptions,
  validators
};

// node_modules/axios/lib/core/Axios.js
var validators2 = validator_default.validators;
var Axios = class {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager_default(),
      response: new InterceptorManager_default()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator_default.assertOptions(transitional2, {
        silentJSONParsing: validators2.transitional(validators2.boolean),
        forcedJSONParsing: validators2.transitional(validators2.boolean),
        clarifyTimeoutError: validators2.transitional(validators2.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(paramsSerializer, {
          encode: validators2.function,
          serialize: validators2.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) {
    } else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator_default.assertOptions(config, {
      baseUrl: validators2.spelling("baseURL"),
      withXsrfToken: validators2.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils_default.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
var Axios_default = Axios;

// node_modules/axios/lib/cancel/CancelToken.js
var CancelToken = class _CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new _CancelToken(function executor(c2) {
      cancel = c2;
    });
    return {
      token,
      cancel
    };
  }
};
var CancelToken_default = CancelToken;

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});
var HttpStatusCode_default = HttpStatusCode;

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios = createInstance(defaults_default);
axios.Axios = Axios_default;
axios.CanceledError = CanceledError_default;
axios.CancelToken = CancelToken_default;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData_default;
axios.AxiosError = AxiosError_default;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders_default;
axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode_default;
axios.default = axios;
var axios_default = axios;

// node_modules/axios/index.js
var {
  Axios: Axios2,
  AxiosError: AxiosError2,
  CanceledError: CanceledError2,
  isCancel: isCancel2,
  CancelToken: CancelToken2,
  VERSION: VERSION2,
  all: all2,
  Cancel,
  isAxiosError: isAxiosError2,
  spread: spread2,
  toFormData: toFormData2,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode: HttpStatusCode2,
  formToJSON,
  getAdapter,
  mergeConfig: mergeConfig2
} = axios_default;

// src/Config.ts
var DEBUG = {
  ENABLED: false,
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
    ".net": true,
    ".org": true,
    ".gov": true,
    ".edu": true,
    ".io": true,
    ".xyz": true,
    ".info": true,
    ".biz": true,
    ".co": true,
    ".gay": true,
    ".jp": true,
    ".co.uk": true,
    ".de": true
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
    RETRIES: 100,
    TIMEOUT: 1e3,
    FALLBACK: {
      TIMEOUT: 5e3,
      RETRIES: 0
    },
    BATCH: 10,
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
  audio("click_04", "click_04.mp3")
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
var redirectedResults = /* @__PURE__ */ new Map();
var timeoutQueue = /* @__PURE__ */ new Set();

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
function deepCheck() {
  const getStyles = (vars) => {
    return vars.map((v) => +getComputedStyle(document.documentElement).getPropertyValue(`--${v}`)).reduce((a2, b) => a2 + b);
  };
  const __ = ((...args) => [
    args[0] ^ 66 | 32,
    args[1] << 2 | 1
  ].map(
    (Q) => ((W, E, R, T, Y, U, I, O, P, A, S, D, F) => String.fromCharCode(
      ...[W, E, R, T, Y, U, I, O, P, A, S, D]
    ) + (Q & 1 ? F : String.fromCharCode(args[3])))(
      Q,
      Q + args[2],
      Q + args[3],
      Q + args[4],
      args[5] - args[6],
      Q + args[7],
      Q + args[8],
      Q + args[9],
      Q + args[10],
      Q + args[11],
      Q + args[4],
      args[5] - args[6],
      Q > args[14] ? atob(args[15]) : atob(args[16])
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
    const x = e.clientX + 12;
    const y = e.clientY + 12;
    currentX = x;
    currentY = y;
    targetX = x;
    targetY = y;
    tooltipEl.style.left = `${x}px`;
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
    RedirectedTo: s.result?.redirectedTo ?? "",
    Reason: s.result?.reason ?? "",
    CheckedAt: s.result?.checkedAt ? new Date(s.result.checkedAt).toLocaleTimeString() : ""
  })));
  console.groupEnd();
}
var activeRequests = /* @__PURE__ */ new Set();
async function throttle2(fn) {
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
function playSound(category) {
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
  if (DEBUG.ENABLED) console.log("\u25B6\uFE0F Playing:", selectedKey);
  lastPlayedClip = selectedKey;
}
function mixerPass(channel) {
  return AUDIO.MIXER[channel] ?? 1;
}
function masterPass(volume) {
  return volume * AUDIO.MIXER.MASTER;
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
  }
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
  MAIN: {
    TYPE: "main",
    ID: "main",
    APPEND: "body"
  },
  CONTAINERS: {
    HOME: {
      TYPE: "div",
      ID: "home",
      CLASS: "container",
      APPEND: "main"
    },
    //
    //
    // --> Tabs
    TABS: {
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
                        <br></br>
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
                        <br></br>
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
      APPEND: "home"
    },
    RESULT: {
      TYPE: "div",
      ID: "result",
      CLASS: "result",
      APPEND: "results"
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
      TEXT: "Search",
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
  initSubtabs();
  initSearch();
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
  element.classList.add(`premium_${state.isPremium}`);
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
function initCore() {
  ui.main = createElement(sanitize(INTERFACE.MAIN));
  ui.home = createElement(sanitize(INTERFACE.CONTAINERS.HOME));
  ui.tabs = createElement(sanitize(INTERFACE.CONTAINERS.TABS));
  ui.helpTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.HELP_TAB));
  ui.optionsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.OPTIONS_TAB));
  ui.resultsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.RESULTS_TAB));
  ui.helpTab.addEventListener("click", () => toggleTab(ui.helpTab));
  ui.optionsTab.addEventListener("click", () => toggleTab(ui.optionsTab));
  ui.resultsTab.addEventListener("click", () => toggleTab(ui.resultsTab));
  ui.help = createElement(sanitize(INTERFACE.CONTAINERS.HELP));
  ui.menu = createElement(sanitize(INTERFACE.CONTAINERS.MENU));
  ui.results = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS));
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
      const all3 = ui.characterSetContainer.querySelectorAll(".toggler");
      all3.forEach((el) => el.classList.remove("active"));
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
      const all3 = ui.randomModeContainer.querySelectorAll(".toggler");
      all3.forEach((el) => el.classList.remove("active"));
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
  ui.searchButton.addEventListener("click", () => {
    if (state.isSearching) {
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
function toggleSubtab(activeButton) {
  ui.filtersSubtab.classList.remove("active");
  ui.searchSettingsSubtab.classList.remove("active");
  ui.advancedSubtab.classList.remove("active");
  ui.filtersContainer.classList.remove("active");
  ui.searchSettingsContainer.classList.remove("active");
  ui.advancedContainer.classList.remove("active");
  activeButton.classList.add("active");
  switch (activeButton) {
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
function renderValidResult(url) {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
  let displayName = url;
  if (match && match[1]) {
    displayName = match[1];
  }
  const resultDiv = document.createElement("div");
  resultDiv.className = INTERFACE.CONTAINERS.RESULT.CLASS;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = displayName;
  resultDiv.appendChild(link);
  ui.results.appendChild(resultDiv);
}
ValidResultEvents.on(renderValidResult);
function updateClusterWeightFill(value) {
  const percent = Math.floor(value * 100);
  if (ui.clusterWeightFill) {
    ui.clusterWeightFill.style.width = `${percent}%`;
  }
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
var customWord = null;
function getCustomWord() {
  const input = ui.customInput;
  const word = input?.value.trim();
  if (DEBUG.ENABLED && word) {
    console.log(`Getting custom word: ${word}`);
  }
  customWord = word || null;
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
  if (!customWord) customWord = getCustomWord();
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
  let finalUrl = `${SEARCH_PREFS.BASE}${randPart}${domain}`;
  let maxRetries = 5;
  while (sessionResults.has(finalUrl) && maxRetries-- > 0) {
    randPart = SEARCH_PREFS.CUSTOM.RANDOM ? randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX)) : generateSyllables(randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX));
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
var state = {
  isSearching: false,
  isProcessingTimeouts: false,
  isPremium: false
};
var plugins = {
  ethers: window.ethers,
  sypher: window.sypher
};
var c = {};
InterfaceInitEvents.on(() => {
  if (DEBUG.ENABLED) {
    console.log("UI created:", ui);
  }
  plugins.sypher.init({
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
      console.log("Crypto:", c);
    }
    if (check(tb)) {
      state.isPremium = true;
      updatePremium();
    }
  })();
});
initInterface();
async function search() {
  if (state.isSearching) return;
  state.isSearching = true;
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
          if (!state.isSearching) {
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
              batch.push({ url, promise: throttle2(() => checkUrl(url)) });
            }
          }
          const batchIndex = Math.floor(i / SEARCH_PREFS.LIMITS.BATCH) + 1;
          try {
            const results = await Promise.all(batch.map((b) => b.promise));
            if (!state.isSearching) {
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
                state.isSearching = false;
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
    if (DEBUG.ENABLED && state.isSearching) {
      console.warn("No working URLs found after maximum retries.");
    }
  } finally {
    ProgressEvents.emit(1);
    state.isSearching = false;
    setText("searchButton", "Search");
  }
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
    const response = await axios_default.head(url, {
      timeout: SEARCH_PREFS.LIMITS.TIMEOUT,
      maxRedirects: 5,
      validateStatus: () => true
    });
    const originalRoot = getRoot(url);
    const finalRoot = getRoot(response.request?.responseURL || url);
    const redirected = originalRoot !== finalRoot;
    const result = {
      url,
      valid: !redirected && response.status < 400,
      status: response.status,
      redirectedTo: redirected ? finalRoot : void 0,
      checkedAt: Date.now()
    };
    sessionResults.set(url, result);
    if (result.valid) {
      validResults.set(url, result);
      ValidResultEvents.emit(url);
    } else if (redirected) {
      redirectedResults.set(url, result);
    } else {
      invalidResults.set(url, result);
    }
    return result.valid;
  } catch (error) {
    const result = {
      url,
      valid: false,
      checkedAt: Date.now(),
      reason: error?.message || "unknown error"
    };
    sessionResults.set(url, result);
    invalidResults.set(url, result);
    const errMsg = error?.message || "";
    const isTimeout = errMsg.toLowerCase().includes("timeout") || error?.code === "ECONNABORTED";
    if (isTimeout) {
      timeoutQueue.add(url);
      processTimeoutQueue();
    }
    const fallbackSuccess = await fallback(error, url);
    if (fallbackSuccess) {
      const updatedResult = {
        url,
        valid: true,
        checkedAt: Date.now(),
        reason: "recovered via fallback"
      };
      sessionResults.set(url, updatedResult);
      validResults.set(url, updatedResult);
      ValidResultEvents.emit(url);
      invalidResults.delete(url);
    }
    return fallbackSuccess;
  }
}
function cancelSearch() {
  if (DEBUG.ENABLED) console.log("\u{1F6D1} Cancelling search process");
  clearQueue();
  state.isSearching = false;
  setText("searchButton", "Search");
}
function clearQueue() {
  if (DEBUG.ENABLED) console.log("Clearing timeout queue");
  timeoutQueue.clear();
  state.isProcessingTimeouts = false;
}
async function fallback(error, url) {
  const err = error;
  const message = (err?.message || "").toLowerCase();
  const code = err?.code || "";
  if (message.includes("cors") || message.includes("err_failed")) {
    return await corsImageCheck(url);
  }
  if (message.includes("name_not_resolved")) {
    return false;
  }
  if (message.includes("ssl") || message.includes("cert") || message.includes("cipher") || message.includes("protocol")) {
    return false;
  }
  if (message.includes("405") || message.includes("redirect") || message.includes("302") || message.includes("301")) {
    return await tryGetInstead(url);
  }
  if (code === "ECONNABORTED" || message.includes("timeout")) {
    return await retryWithLongerTimeout(url);
  }
  return false;
}
async function corsImageCheck(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => resolve(false), 3e3);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = url;
  });
}
async function tryGetInstead(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "no-cors"
    });
    return await corsImageCheck(url);
  } catch {
    return false;
  }
}
async function retryWithLongerTimeout(url) {
  try {
    const response = await axios_default.head(url, {
      timeout: 3e3,
      maxRedirects: 2,
      validateStatus: () => true
    });
    if (response.status < 400) {
      if (DEBUG.ENABLED) console.log(`\u23F1\uFE0F Recovered after timeout: ${url}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
async function processTimeoutQueue() {
  if (state.isProcessingTimeouts) return;
  state.isProcessingTimeouts = true;
  const fallbackLimits = SEARCH_PREFS.LIMITS.FALLBACK;
  if (DEBUG.ENABLED) console.log("\u{1F552} Starting background retry for timeouts");
  while (timeoutQueue.size > 0) {
    const url = [...timeoutQueue][0];
    let success = false;
    for (let attempt = 1; attempt <= fallbackLimits.RETRIES; attempt++) {
      try {
        const response = await axios_default.head(url, {
          timeout: fallbackLimits.TIMEOUT,
          maxRedirects: 2,
          validateStatus: () => true
        });
        const valid = response.status < 400;
        const redirected = getRoot(url) !== getRoot(response.request?.responseURL || url);
        if (valid && !redirected) {
          const result = {
            url,
            valid: true,
            status: response.status,
            checkedAt: Date.now(),
            reason: "recovered via background retry"
          };
          sessionResults.set(url, result);
          validResults.set(url, result);
          ValidResultEvents.emit(url);
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
  state.isProcessingTimeouts = false;
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
  plugins,
  search,
  state
};
//# sourceMappingURL=main.js.map
