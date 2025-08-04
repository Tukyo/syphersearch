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
  } catch (e2) {
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
  let i2;
  let l2;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i2 = 0, l2 = obj.length; i2 < l2; i2++) {
      fn.call(null, obj[i2], i2, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i2 = 0; i2 < len; i2++) {
      key = keys[i2];
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
  let i2 = keys.length;
  let _key;
  while (i2-- > 0) {
    _key = keys[i2];
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
  for (let i2 = 0, l2 = arguments.length; i2 < l2; i2++) {
    arguments[i2] && forEach(arguments[i2], assignValue);
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
  let i2;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i2 = props.length;
    while (i2-- > 0) {
      prop = props[i2];
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
  let i2 = thing.length;
  if (!isNumber(i2)) return null;
  const arr = new Array(i2);
  while (i2-- > 0) {
    arr[i2] = thing[i2];
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
  const visit = (source, i2) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i2] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i2 + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i2] = void 0;
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
  return path.concat(key).map(function each(token, i2) {
    token = removeBrackets(token);
    return !dots && i2 ? "[" + token + "]" : token;
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
  let i2;
  const len = keys.length;
  let key;
  for (i2 = 0; i2 < len; i2++) {
    key = keys[i2];
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
    } catch (e2) {
      if (e2.name !== "SyntaxError") {
        throw e2;
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
      } catch (e2) {
        if (strictJSONParsing) {
          if (e2.name === "SyntaxError") {
            throw AxiosError_default.from(e2, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e2;
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
  let i2;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i2 = line.indexOf(":");
    key = line.substring(0, i2).trim().toLowerCase();
    val = line.substring(i2 + 1).trim();
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
    let i2 = keys.length;
    let deleted = false;
    while (i2--) {
      const key = keys[i2];
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
    let i2 = tail;
    let bytesCount = 0;
    while (i2 !== head) {
      bytesCount += bytes[i2++];
      i2 = i2 % samplesCount;
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
  return throttle_default((e2) => {
    const loaded = e2.loaded;
    const total = e2.lengthComputable ? e2.total : void 0;
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
      event: e2,
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
  let _onFinish = (e2) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e2);
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
  } catch (e2) {
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
    } catch (e2) {
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
    for (let i2 = 0; i2 < length; i2++) {
      nameOrAdapter = adapters[i2];
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
      rejectedReasons[id || "#" + i2] = adapter;
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
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i2) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i2 < 1 ? "n " : " ") + type;
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
  let i2 = keys.length;
  while (i2-- > 0) {
    const opt = keys[i2];
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
        } catch (e2) {
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
    let i2 = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i2 < len) {
        promise = promise.then(chain[i2++], chain[i2++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i2 = 0;
    while (i2 < len) {
      const onFulfilled = requestInterceptorChain[i2++];
      const onRejected = requestInterceptorChain[i2++];
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
    i2 = 0;
    len = responseInterceptorChain.length;
    while (i2 < len) {
      promise = promise.then(responseInterceptorChain[i2++], responseInterceptorChain[i2++]);
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
      let i2 = token._listeners.length;
      while (i2-- > 0) {
        token._listeners[i2](cancel);
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
    const token = new _CancelToken(function executor(c) {
      cancel = c;
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

// node_modules/unique-names-generator/dist/index.m.js
var a = (a2) => {
  a2 = 1831565813 + (a2 |= 0) | 0;
  let e2 = Math.imul(a2 ^ a2 >>> 15, 1 | a2);
  return e2 = e2 + Math.imul(e2 ^ e2 >>> 7, 61 | e2) ^ e2, ((e2 ^ e2 >>> 14) >>> 0) / 4294967296;
};
var e = class {
  constructor(a2) {
    this.dictionaries = void 0, this.length = void 0, this.separator = void 0, this.style = void 0, this.seed = void 0;
    const { length: e2, separator: i2, dictionaries: n2, style: l2, seed: r2 } = a2;
    this.dictionaries = n2, this.separator = i2, this.length = e2, this.style = l2, this.seed = r2;
  }
  generate() {
    if (!this.dictionaries) throw new Error('Cannot find any dictionary. Please provide at least one, or leave the "dictionary" field empty in the config object');
    if (this.length <= 0) throw new Error("Invalid length provided");
    if (this.length > this.dictionaries.length) throw new Error(`The length cannot be bigger than the number of dictionaries.
Length provided: ${this.length}. Number of dictionaries provided: ${this.dictionaries.length}`);
    let e2 = this.seed;
    return this.dictionaries.slice(0, this.length).reduce((i2, n2) => {
      let l2;
      e2 ? (l2 = ((e3) => {
        if ("string" == typeof e3) {
          const i3 = e3.split("").map((a2) => a2.charCodeAt(0)).reduce((a2, e4) => a2 + e4, 1), n3 = Math.floor(Number(i3));
          return a(n3);
        }
        return a(e3);
      })(e2), e2 = 4294967296 * l2) : l2 = Math.random();
      let r2 = n2[Math.floor(l2 * n2.length)] || "";
      if ("lowerCase" === this.style) r2 = r2.toLowerCase();
      else if ("capital" === this.style) {
        const [a2, ...e3] = r2.split("");
        r2 = a2.toUpperCase() + e3.join("");
      } else "upperCase" === this.style && (r2 = r2.toUpperCase());
      return i2 ? `${i2}${this.separator}${r2}` : `${r2}`;
    }, "");
  }
};
var i = { separator: "_", dictionaries: [] };
var n = (a2) => {
  const n2 = [...a2 && a2.dictionaries || i.dictionaries], l2 = { ...i, ...a2, length: a2 && a2.length || n2.length, dictionaries: n2 };
  if (!a2 || !a2.dictionaries || !a2.dictionaries.length) throw new Error('A "dictionaries" array must be provided. This is a breaking change introduced starting from Unique Name Generator v4. Read more about the breaking change here: https://github.com/andreasonny83/unique-names-generator#migration-guide');
  return new e(l2).generate();
};
var l = ["able", "above", "absent", "absolute", "abstract", "abundant", "academic", "acceptable", "accepted", "accessible", "accurate", "accused", "active", "actual", "acute", "added", "additional", "adequate", "adjacent", "administrative", "adorable", "advanced", "adverse", "advisory", "aesthetic", "afraid", "aggregate", "aggressive", "agreeable", "agreed", "agricultural", "alert", "alive", "alleged", "allied", "alone", "alright", "alternative", "amateur", "amazing", "ambitious", "amused", "ancient", "angry", "annoyed", "annual", "anonymous", "anxious", "appalling", "apparent", "applicable", "appropriate", "arbitrary", "architectural", "armed", "arrogant", "artificial", "artistic", "ashamed", "asleep", "assistant", "associated", "atomic", "attractive", "automatic", "autonomous", "available", "average", "awake", "aware", "awful", "awkward", "back", "bad", "balanced", "bare", "basic", "beautiful", "beneficial", "better", "bewildered", "big", "binding", "biological", "bitter", "bizarre", "blank", "blind", "blonde", "bloody", "blushing", "boiling", "bold", "bored", "boring", "bottom", "brainy", "brave", "breakable", "breezy", "brief", "bright", "brilliant", "broad", "broken", "bumpy", "burning", "busy", "calm", "capable", "capitalist", "careful", "casual", "causal", "cautious", "central", "certain", "changing", "characteristic", "charming", "cheap", "cheerful", "chemical", "chief", "chilly", "chosen", "christian", "chronic", "chubby", "circular", "civic", "civil", "civilian", "classic", "classical", "clean", "clear", "clever", "clinical", "close", "closed", "cloudy", "clumsy", "coastal", "cognitive", "coherent", "cold", "collective", "colonial", "colorful", "colossal", "coloured", "colourful", "combative", "combined", "comfortable", "coming", "commercial", "common", "communist", "compact", "comparable", "comparative", "compatible", "competent", "competitive", "complete", "complex", "complicated", "comprehensive", "compulsory", "conceptual", "concerned", "concrete", "condemned", "confident", "confidential", "confused", "conscious", "conservation", "conservative", "considerable", "consistent", "constant", "constitutional", "contemporary", "content", "continental", "continued", "continuing", "continuous", "controlled", "controversial", "convenient", "conventional", "convinced", "convincing", "cooing", "cool", "cooperative", "corporate", "correct", "corresponding", "costly", "courageous", "crazy", "creative", "creepy", "criminal", "critical", "crooked", "crowded", "crucial", "crude", "cruel", "cuddly", "cultural", "curious", "curly", "current", "curved", "cute", "daily", "damaged", "damp", "dangerous", "dark", "dead", "deaf", "deafening", "dear", "decent", "decisive", "deep", "defeated", "defensive", "defiant", "definite", "deliberate", "delicate", "delicious", "delighted", "delightful", "democratic", "dependent", "depressed", "desirable", "desperate", "detailed", "determined", "developed", "developing", "devoted", "different", "difficult", "digital", "diplomatic", "direct", "dirty", "disabled", "disappointed", "disastrous", "disciplinary", "disgusted", "distant", "distinct", "distinctive", "distinguished", "disturbed", "disturbing", "diverse", "divine", "dizzy", "domestic", "dominant", "double", "doubtful", "drab", "dramatic", "dreadful", "driving", "drunk", "dry", "dual", "due", "dull", "dusty", "dutch", "dying", "dynamic", "eager", "early", "eastern", "easy", "economic", "educational", "eerie", "effective", "efficient", "elaborate", "elated", "elderly", "eldest", "electoral", "electric", "electrical", "electronic", "elegant", "eligible", "embarrassed", "embarrassing", "emotional", "empirical", "empty", "enchanting", "encouraging", "endless", "energetic", "enormous", "enthusiastic", "entire", "entitled", "envious", "environmental", "equal", "equivalent", "essential", "established", "estimated", "ethical", "ethnic", "eventual", "everyday", "evident", "evil", "evolutionary", "exact", "excellent", "exceptional", "excess", "excessive", "excited", "exciting", "exclusive", "existing", "exotic", "expected", "expensive", "experienced", "experimental", "explicit", "extended", "extensive", "external", "extra", "extraordinary", "extreme", "exuberant", "faint", "fair", "faithful", "familiar", "famous", "fancy", "fantastic", "far", "fascinating", "fashionable", "fast", "fat", "fatal", "favourable", "favourite", "federal", "fellow", "female", "feminist", "few", "fierce", "filthy", "final", "financial", "fine", "firm", "fiscal", "fit", "fixed", "flaky", "flat", "flexible", "fluffy", "fluttering", "flying", "following", "fond", "foolish", "foreign", "formal", "formidable", "forthcoming", "fortunate", "forward", "fragile", "frail", "frantic", "free", "frequent", "fresh", "friendly", "frightened", "front", "frozen", "full", "fun", "functional", "fundamental", "funny", "furious", "future", "fuzzy", "gastric", "gay", "general", "generous", "genetic", "gentle", "genuine", "geographical", "giant", "gigantic", "given", "glad", "glamorous", "gleaming", "global", "glorious", "golden", "good", "gorgeous", "gothic", "governing", "graceful", "gradual", "grand", "grateful", "greasy", "great", "grieving", "grim", "gross", "grotesque", "growing", "grubby", "grumpy", "guilty", "handicapped", "handsome", "happy", "hard", "harsh", "head", "healthy", "heavy", "helpful", "helpless", "hidden", "high", "hilarious", "hissing", "historic", "historical", "hollow", "holy", "homeless", "homely", "hon", "honest", "horizontal", "horrible", "hostile", "hot", "huge", "human", "hungry", "hurt", "hushed", "husky", "icy", "ideal", "identical", "ideological", "ill", "illegal", "imaginative", "immediate", "immense", "imperial", "implicit", "important", "impossible", "impressed", "impressive", "improved", "inadequate", "inappropriate", "inc", "inclined", "increased", "increasing", "incredible", "independent", "indirect", "individual", "industrial", "inevitable", "influential", "informal", "inherent", "initial", "injured", "inland", "inner", "innocent", "innovative", "inquisitive", "instant", "institutional", "insufficient", "intact", "integral", "integrated", "intellectual", "intelligent", "intense", "intensive", "interested", "interesting", "interim", "interior", "intermediate", "internal", "international", "intimate", "invisible", "involved", "irrelevant", "isolated", "itchy", "jealous", "jittery", "joint", "jolly", "joyous", "judicial", "juicy", "junior", "just", "keen", "key", "kind", "known", "labour", "large", "late", "latin", "lazy", "leading", "left", "legal", "legislative", "legitimate", "lengthy", "lesser", "level", "lexical", "liable", "liberal", "light", "like", "likely", "limited", "linear", "linguistic", "liquid", "literary", "little", "live", "lively", "living", "local", "logical", "lonely", "long", "loose", "lost", "loud", "lovely", "low", "loyal", "ltd", "lucky", "mad", "magic", "magnetic", "magnificent", "main", "major", "male", "mammoth", "managerial", "managing", "manual", "many", "marginal", "marine", "marked", "married", "marvellous", "marxist", "mass", "massive", "mathematical", "mature", "maximum", "mean", "meaningful", "mechanical", "medical", "medieval", "melodic", "melted", "mental", "mere", "metropolitan", "mid", "middle", "mighty", "mild", "military", "miniature", "minimal", "minimum", "ministerial", "minor", "miserable", "misleading", "missing", "misty", "mixed", "moaning", "mobile", "moderate", "modern", "modest", "molecular", "monetary", "monthly", "moral", "motionless", "muddy", "multiple", "mushy", "musical", "mute", "mutual", "mysterious", "naked", "narrow", "nasty", "national", "native", "natural", "naughty", "naval", "near", "nearby", "neat", "necessary", "negative", "neighbouring", "nervous", "net", "neutral", "new", "nice", "noble", "noisy", "normal", "northern", "nosy", "notable", "novel", "nuclear", "numerous", "nursing", "nutritious", "nutty", "obedient", "objective", "obliged", "obnoxious", "obvious", "occasional", "occupational", "odd", "official", "ok", "okay", "old", "olympic", "only", "open", "operational", "opposite", "optimistic", "oral", "ordinary", "organic", "organisational", "original", "orthodox", "other", "outdoor", "outer", "outrageous", "outside", "outstanding", "overall", "overseas", "overwhelming", "painful", "pale", "panicky", "parallel", "parental", "parliamentary", "partial", "particular", "passing", "passive", "past", "patient", "payable", "peaceful", "peculiar", "perfect", "permanent", "persistent", "personal", "petite", "philosophical", "physical", "plain", "planned", "plastic", "pleasant", "pleased", "poised", "polite", "political", "poor", "popular", "positive", "possible", "potential", "powerful", "practical", "precious", "precise", "preferred", "pregnant", "preliminary", "premier", "prepared", "present", "presidential", "pretty", "previous", "prickly", "primary", "prime", "primitive", "principal", "printed", "prior", "private", "probable", "productive", "professional", "profitable", "profound", "progressive", "prominent", "promising", "proper", "proposed", "prospective", "protective", "protestant", "proud", "provincial", "psychiatric", "psychological", "public", "puny", "pure", "purring", "puzzled", "quaint", "qualified", "quarrelsome", "querulous", "quick", "quickest", "quiet", "quintessential", "quixotic", "racial", "radical", "rainy", "random", "rapid", "rare", "raspy", "rational", "ratty", "raw", "ready", "real", "realistic", "rear", "reasonable", "recent", "reduced", "redundant", "regional", "registered", "regular", "regulatory", "related", "relative", "relaxed", "relevant", "reliable", "relieved", "religious", "reluctant", "remaining", "remarkable", "remote", "renewed", "representative", "repulsive", "required", "resident", "residential", "resonant", "respectable", "respective", "responsible", "resulting", "retail", "retired", "revolutionary", "rich", "ridiculous", "right", "rigid", "ripe", "rising", "rival", "roasted", "robust", "rolling", "romantic", "rotten", "rough", "round", "royal", "rubber", "rude", "ruling", "running", "rural", "sacred", "sad", "safe", "salty", "satisfactory", "satisfied", "scared", "scary", "scattered", "scientific", "scornful", "scrawny", "screeching", "secondary", "secret", "secure", "select", "selected", "selective", "selfish", "semantic", "senior", "sensible", "sensitive", "separate", "serious", "severe", "sexual", "shaggy", "shaky", "shallow", "shared", "sharp", "sheer", "shiny", "shivering", "shocked", "short", "shrill", "shy", "sick", "significant", "silent", "silky", "silly", "similar", "simple", "single", "skilled", "skinny", "sleepy", "slight", "slim", "slimy", "slippery", "slow", "small", "smart", "smiling", "smoggy", "smooth", "social", "socialist", "soft", "solar", "sole", "solid", "sophisticated", "sore", "sorry", "sound", "sour", "southern", "soviet", "spare", "sparkling", "spatial", "special", "specific", "specified", "spectacular", "spicy", "spiritual", "splendid", "spontaneous", "sporting", "spotless", "spotty", "square", "squealing", "stable", "stale", "standard", "static", "statistical", "statutory", "steady", "steep", "sticky", "stiff", "still", "stingy", "stormy", "straight", "straightforward", "strange", "strategic", "strict", "striking", "striped", "strong", "structural", "stuck", "stupid", "subjective", "subsequent", "substantial", "subtle", "successful", "successive", "sudden", "sufficient", "suitable", "sunny", "super", "superb", "superior", "supporting", "supposed", "supreme", "sure", "surprised", "surprising", "surrounding", "surviving", "suspicious", "sweet", "swift", "symbolic", "sympathetic", "systematic", "tall", "tame", "tart", "tasteless", "tasty", "technical", "technological", "teenage", "temporary", "tender", "tense", "terrible", "territorial", "testy", "then", "theoretical", "thick", "thin", "thirsty", "thorough", "thoughtful", "thoughtless", "thundering", "tight", "tiny", "tired", "top", "tory", "total", "tough", "toxic", "traditional", "tragic", "tremendous", "tricky", "tropical", "troubled", "typical", "ugliest", "ugly", "ultimate", "unable", "unacceptable", "unaware", "uncertain", "unchanged", "uncomfortable", "unconscious", "underground", "underlying", "unemployed", "uneven", "unexpected", "unfair", "unfortunate", "unhappy", "uniform", "uninterested", "unique", "united", "universal", "unknown", "unlikely", "unnecessary", "unpleasant", "unsightly", "unusual", "unwilling", "upper", "upset", "uptight", "urban", "urgent", "used", "useful", "useless", "usual", "vague", "valid", "valuable", "variable", "varied", "various", "varying", "vast", "verbal", "vertical", "very", "vicarious", "vicious", "victorious", "violent", "visible", "visiting", "visual", "vital", "vitreous", "vivacious", "vivid", "vocal", "vocational", "voiceless", "voluminous", "voluntary", "vulnerable", "wandering", "warm", "wasteful", "watery", "weak", "wealthy", "weary", "wee", "weekly", "weird", "welcome", "well", "western", "wet", "whispering", "whole", "wicked", "wide", "widespread", "wild", "wilful", "willing", "willowy", "wily", "wise", "wispy", "wittering", "witty", "wonderful", "wooden", "working", "worldwide", "worried", "worrying", "worthwhile", "worthy", "written", "wrong", "xenacious", "xenial", "xenogeneic", "xenophobic", "xeric", "xerothermic", "yabbering", "yammering", "yappiest", "yappy", "yawning", "yearling", "yearning", "yeasty", "yelling", "yelping", "yielding", "yodelling", "young", "youngest", "youthful", "ytterbic", "yucky", "yummy", "zany", "zealous", "zeroth", "zestful", "zesty", "zippy", "zonal", "zoophagous", "zygomorphic", "zygotic"];
var r = ["aardvark", "aardwolf", "albatross", "alligator", "alpaca", "amphibian", "anaconda", "angelfish", "anglerfish", "ant", "anteater", "antelope", "antlion", "ape", "aphid", "armadillo", "asp", "baboon", "badger", "bandicoot", "barnacle", "barracuda", "basilisk", "bass", "bat", "bear", "beaver", "bedbug", "bee", "beetle", "bird", "bison", "blackbird", "boa", "boar", "bobcat", "bobolink", "bonobo", "booby", "bovid", "bug", "butterfly", "buzzard", "camel", "canid", "canidae", "capybara", "cardinal", "caribou", "carp", "cat", "caterpillar", "catfish", "catshark", "cattle", "centipede", "cephalopod", "chameleon", "cheetah", "chickadee", "chicken", "chimpanzee", "chinchilla", "chipmunk", "cicada", "clam", "clownfish", "cobra", "cockroach", "cod", "condor", "constrictor", "coral", "cougar", "cow", "coyote", "crab", "crane", "crawdad", "crayfish", "cricket", "crocodile", "crow", "cuckoo", "damselfly", "deer", "dingo", "dinosaur", "dog", "dolphin", "donkey", "dormouse", "dove", "dragon", "dragonfly", "duck", "eagle", "earthworm", "earwig", "echidna", "eel", "egret", "elephant", "elk", "emu", "ermine", "falcon", "felidae", "ferret", "finch", "firefly", "fish", "flamingo", "flea", "fly", "flyingfish", "fowl", "fox", "frog", "galliform", "gamefowl", "gayal", "gazelle", "gecko", "gerbil", "gibbon", "giraffe", "goat", "goldfish", "goose", "gopher", "gorilla", "grasshopper", "grouse", "guan", "guanaco", "guineafowl", "gull", "guppy", "haddock", "halibut", "hamster", "hare", "harrier", "hawk", "hedgehog", "heron", "herring", "hippopotamus", "hookworm", "hornet", "horse", "hoverfly", "hummingbird", "hyena", "iguana", "impala", "jackal", "jaguar", "jay", "jellyfish", "junglefowl", "kangaroo", "kingfisher", "kite", "kiwi", "koala", "koi", "krill", "ladybug", "lamprey", "landfowl", "lark", "leech", "lemming", "lemur", "leopard", "leopon", "limpet", "lion", "lizard", "llama", "lobster", "locust", "loon", "louse", "lungfish", "lynx", "macaw", "mackerel", "magpie", "mammal", "manatee", "mandrill", "marlin", "marmoset", "marmot", "marsupial", "marten", "mastodon", "meadowlark", "meerkat", "mink", "minnow", "mite", "mockingbird", "mole", "mollusk", "mongoose", "monkey", "moose", "mosquito", "moth", "mouse", "mule", "muskox", "narwhal", "newt", "nightingale", "ocelot", "octopus", "opossum", "orangutan", "orca", "ostrich", "otter", "owl", "ox", "panda", "panther", "parakeet", "parrot", "parrotfish", "partridge", "peacock", "peafowl", "pelican", "penguin", "perch", "pheasant", "pig", "pigeon", "pike", "pinniped", "piranha", "planarian", "platypus", "pony", "porcupine", "porpoise", "possum", "prawn", "primate", "ptarmigan", "puffin", "puma", "python", "quail", "quelea", "quokka", "rabbit", "raccoon", "rat", "rattlesnake", "raven", "reindeer", "reptile", "rhinoceros", "roadrunner", "rodent", "rook", "rooster", "roundworm", "sailfish", "salamander", "salmon", "sawfish", "scallop", "scorpion", "seahorse", "shark", "sheep", "shrew", "shrimp", "silkworm", "silverfish", "skink", "skunk", "sloth", "slug", "smelt", "snail", "snake", "snipe", "sole", "sparrow", "spider", "spoonbill", "squid", "squirrel", "starfish", "stingray", "stoat", "stork", "sturgeon", "swallow", "swan", "swift", "swordfish", "swordtail", "tahr", "takin", "tapir", "tarantula", "tarsier", "termite", "tern", "thrush", "tick", "tiger", "tiglon", "toad", "tortoise", "toucan", "trout", "tuna", "turkey", "turtle", "tyrannosaurus", "unicorn", "urial", "vicuna", "viper", "vole", "vulture", "wallaby", "walrus", "warbler", "wasp", "weasel", "whale", "whippet", "whitefish", "wildcat", "wildebeest", "wildfowl", "wolf", "wolverine", "wombat", "woodpecker", "worm", "wren", "xerinae", "yak", "zebra"];
var t = ["amaranth", "amber", "amethyst", "apricot", "aqua", "aquamarine", "azure", "beige", "black", "blue", "blush", "bronze", "brown", "chocolate", "coffee", "copper", "coral", "crimson", "cyan", "emerald", "fuchsia", "gold", "gray", "green", "harlequin", "indigo", "ivory", "jade", "lavender", "lime", "magenta", "maroon", "moccasin", "olive", "orange", "peach", "pink", "plum", "purple", "red", "rose", "salmon", "sapphire", "scarlet", "silver", "tan", "teal", "tomato", "turquoise", "violet", "white", "yellow"];

// src/Config.ts
var DEBUG = {
  ENABLED: true,
  QUIET: true
};
var CHARACTERS = {
  CHARACTER_SETS: {
    ALPHANUMERIC: "abcdefghijklmnopqrstuvwxyz0123456789",
    ALPHABETIC: "abcdefghijklmnopqrstuvwxyz",
    NUMERIC: "0123456789",
    SPECIAL: "!@#$%^&*()-_=+[]{}|;:',.<>?/~`"
  },
  CHARACTER_TYPES: {
    VOWELS: "aeiou",
    CONSONANTS: "bcdfghjklmnpqrstvwxyz"
  }
};
var RANDOM_MODE = {
  RAW: "raw",
  // Completely random
  PHONETIC: "phonetic",
  // Attempt to build words
  DICTIONARY: "dictionary"
  // TODO: Implement predefined dictionary
};
var SEARCH_PREFS = {
  BASE: "https://www.",
  DOMAINS: [
    ".com",
    ".net",
    ".org",
    ".gov",
    ".edu",
    ".io",
    ".xyz",
    ".info",
    ".biz",
    ".co",
    ".gay",
    ".jp",
    ".co.uk",
    ".de"
  ],
  CUSTOM: {
    LENGTH: {
      MIN: 3,
      MAX: 12
    },
    RANDOM: RANDOM_MODE.PHONETIC,
    COMBINATION_WEIGHT: 0.5,
    STOP_ON_FIRST: false,
    OPEN_ON_FIND: false,
    CHARACTERS: CHARACTERS.CHARACTER_SETS.ALPHABETIC,
    INSERT: "random"
    // Can be dynamically set to "prefix" or "suffix"
  },
  LIMITS: {
    RETRIES: 1e3,
    TIMEOUT: 1e3,
    BATCH: 10,
    BUFFER: 1e3
    // ms time between batches
  }
};
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
var COMBINATIONS = [
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
  // Common vowel combinations
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
  // Common consonant-vowel patterns
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
  LOGIN: {
    TYPE: "svg",
    SVG: `
            <svg class="header_svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6" stroke="#aaaaaa" stroke-width="1.75" stroke-linecap="round" />
                <path
                    d="M8.5 3.70605C5.26806 5.07157 3 8.27099 3 12.0001C3 14.3052 3.86656 16.4079 5.29169 18.0002M15.5 3.70605C18.7319 5.07157 21 8.27099 21 12.0001C21 16.9707 16.9706 21.0001 12 21.0001C10.9481 21.0001 9.93834 20.8197 9 20.488"
                    stroke="#aaaaaa" stroke-width="1.75" stroke-linecap="round" />
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
      },
      LOGIN: {
        TYPE: "div",
        ID: "login_container",
        CLASS: "header-logo",
        HTML: ICON.LOGIN.SVG,
        TOOLTIP: "Connect Wallet",
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
    TABS: {
      TYPE: "div",
      ID: "tabs",
      CLASS: "container",
      APPEND: "home",
      OPTIONS_TAB: {
        TYPE: "div",
        ID: "options_tab",
        CLASS: "tab",
        HTML: `
                    <h3>Options</h3>
                `,
        APPEND: "tabs"
      },
      RESULTS_TAB: {
        TYPE: "div",
        ID: "results_tab",
        CLASS: "tab",
        HTML: `
                    <h3>Results</h3>
                `,
        APPEND: "tabs"
      }
    },
    MENU: {
      TYPE: "div",
      ID: "menu",
      CLASS: "container",
      HTML: `
                <h3>tehe</h3>
            `,
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
    CUSTOM_INPUT_CONTAINER: {
      TYPE: "div",
      ID: "custom_input_container",
      CLASS: "category",
      HTML: `
                <h3>Custom Word</h3>
            `,
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
      PLACEHOLDER: "Custom Word Entry...",
      TOOLTIP: "Enter a custom word to include in the search.",
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
        TOOLTIP: "Insert word at the beginning",
        TEXT: "Prefix",
        APPEND: "insert_container"
      },
      INSERT_SUFFIX: {
        TYPE: "div",
        ID: "insert_suffix",
        CLASS: "toggler",
        TOOLTIP: "Insert word at the end",
        TEXT: "Suffix",
        APPEND: "insert_container"
      },
      INSERT_RANDOM: {
        TYPE: "div",
        ID: "insert_random",
        CLASS: "toggler",
        TOOLTIP: "Insert word randomly",
        TEXT: "Random",
        APPEND: "insert_container"
      }
    },
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
      APPEND: "search"
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

// src/Cache.ts
var sessionResults = /* @__PURE__ */ new Map();
var validResults = /* @__PURE__ */ new Map();
var redirectedResults = /* @__PURE__ */ new Map();

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
function sanitize(config) {
  return {
    type: config.TYPE,
    id: config.ID,
    class: config.CLASS,
    text: config.TEXT,
    placeholder: config.PLACEHOLDER,
    tooltip: config.TOOLTIP,
    html: config.HTML,
    append: config.APPEND
  };
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
  element.addEventListener("mouseover", (e2) => {
    if (element.contains(e2.relatedTarget)) return;
    tooltipEl.textContent = message;
    tooltipEl.style.display = "block";
    const x = e2.clientX + 12;
    const y = e2.clientY + 12;
    currentX = x;
    currentY = y;
    targetX = x;
    targetY = y;
    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y}px`;
  });
  element.addEventListener("mousemove", (e2) => {
    const dx = e2.clientX + 12 - targetX;
    const dy = e2.clientY + 12 - targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MIN_MOUSE_DISTANCE) {
      targetX = e2.clientX + 12;
      targetY = e2.clientY + 12;
      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }
    }
  });
  element.addEventListener("mouseout", (e2) => {
    if (element.contains(e2.relatedTarget)) return;
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
  initFilters();
  initSearch();
  ProgressEvents.on((percent) => {
    ui.progressFill.style.width = `${Math.floor(percent * 100)}%`;
  });
  ui.searchButton.addEventListener("click", () => {
    if (state.isSearching) {
      state.isSearching = false;
      setText("searchButton", "Search");
      return;
    }
    ui.progressFill.style.width = "0%";
    search();
  });
  if (DEBUG.ENABLED) {
    console.log("UI created:", ui);
  }
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
  const target = config.append === "body" ? document.body : document.getElementById(config.append);
  target?.appendChild(el);
  return el;
}
function initHeader() {
  ui.header = createElement(sanitize(INTERFACE.HEADER));
  ui.logo = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGO));
  ui.login = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGIN));
}
function initCore() {
  ui.main = createElement(sanitize(INTERFACE.MAIN));
  ui.home = createElement(sanitize(INTERFACE.CONTAINERS.HOME));
  ui.tabs = createElement(sanitize(INTERFACE.CONTAINERS.TABS));
  ui.optionsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.OPTIONS_TAB));
  ui.resultsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.RESULTS_TAB));
  ui.optionsTab.addEventListener("click", () => toggleTab(ui.optionsTab));
  ui.resultsTab.addEventListener("click", () => toggleTab(ui.resultsTab));
  ui.menu = createElement(sanitize(INTERFACE.CONTAINERS.MENU));
  ui.results = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS));
  toggleTab(ui.optionsTab);
}
function initFilters() {
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
      append: "filters"
    });
    ui[categoryID] = categoryContainer;
    categoryContainer.addEventListener("click", (event) => {
      if (event.target.classList.contains("toggler")) return;
      const togglers = categoryContainer.querySelectorAll(".toggler");
      const allActive = Array.from(togglers).every((t2) => t2.classList.contains("active"));
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
      toggler.setAttribute("data-group", folderName);
      toggler.setAttribute("data-key", entryName);
      toggler.addEventListener("click", () => {
        toggler.classList.toggle("active");
        if (DEBUG.ENABLED) {
          console.log(`Toggled ${entryName} in ${folderName}`);
        }
      });
      ui[toggleID] = toggler;
    }
  }
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
}
function setText(id, text) {
  const element = ui[id];
  if (element) {
    element.textContent = text;
  }
}
function toggleTab(tab) {
  const isOptionsTab = tab === ui.optionsTab;
  if (tab.classList.contains("active")) return;
  ui.optionsTab.classList.remove("active");
  ui.resultsTab.classList.remove("active");
  tab.classList.add("active");
  if (isOptionsTab) {
    ui.menu.classList.add("active");
    ui.menu.classList.remove("hidden");
    ui.results.classList.remove("active");
    ui.results.classList.add("hidden");
  } else {
    ui.menu.classList.remove("active");
    ui.menu.classList.add("hidden");
    ui.results.classList.add("active");
    ui.results.classList.remove("hidden");
  }
  if (DEBUG.ENABLED) {
    console.log(`Tab switched to ${isOptionsTab ? "Options" : "Results"}`);
  }
}
function renderValidResult(url) {
  const resultDiv = document.createElement("div");
  resultDiv.className = INTERFACE.CONTAINERS.RESULT.CLASS;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = url;
  resultDiv.appendChild(link);
  ui.results.appendChild(resultDiv);
}
ValidResultEvents.on(renderValidResult);

// src/Main.ts
var state = {
  isSearching: false
};
initInterface();
async function search() {
  if (state.isSearching) return;
  state.isSearching = true;
  setText("searchButton", "Cancel");
  let attempts = 0;
  let progress = 0;
  if (DEBUG.ENABLED) {
    console.log("Starting search with preferences:", SEARCH_PREFS);
  }
  const progressTimer = setInterval(() => {
    if (progress < 1) {
      progress += 5e-3;
      ProgressEvents.emit(progress);
    }
  }, 500);
  try {
    const globalBatchSet = /* @__PURE__ */ new Set();
    const batchPromises = [];
    for (let i2 = 0; i2 < SEARCH_PREFS.LIMITS.RETRIES; i2 += SEARCH_PREFS.LIMITS.BATCH) {
      const batchDelay = i2 === 0 ? 0 : SEARCH_PREFS.LIMITS.BUFFER;
      const batchPromise = new Promise((resolve) => {
        setTimeout(async () => {
          if (!state.isSearching) {
            resolve();
            return;
          }
          const batchSet = /* @__PURE__ */ new Set();
          const batch = [];
          while (batch.length < SEARCH_PREFS.LIMITS.BATCH) {
            const domain = SEARCH_PREFS.DOMAINS[Math.floor(Math.random() * SEARCH_PREFS.DOMAINS.length)];
            const url = generateRandomURL(domain);
            if (!batchSet.has(url) && !sessionResults.has(url) && !globalBatchSet.has(url)) {
              batchSet.add(url);
              globalBatchSet.add(url);
              batch.push({ url, promise: checkUrl(url) });
            }
          }
          const batchIndex = Math.floor(i2 / SEARCH_PREFS.LIMITS.BATCH) + 1;
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
    clearInterval(progressTimer);
    ProgressEvents.emit(1);
    state.isSearching = false;
    setText("searchButton", "Search");
  }
}
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
  const length = randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX);
  let randPart = "";
  if (selected.length === 0) {
    switch (SEARCH_PREFS.CUSTOM.RANDOM) {
      case RANDOM_MODE.RAW:
        randPart = randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, length);
        break;
      case RANDOM_MODE.PHONETIC:
        randPart = generatePhoneticWord(length);
        break;
      case RANDOM_MODE.DICTIONARY:
        randPart = generateRealisticWord(length);
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
    randPart = parts.join("");
    if (randPart.length > length) randPart = randPart.slice(0, length);
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
    randPart = SEARCH_PREFS.CUSTOM.RANDOM ? randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX)) : generateRealisticWord(randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX));
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
function generateRealisticWord(maxLength) {
  const raw = n({
    dictionaries: [l, t, r],
    length: 1,
    style: "lowerCase"
  });
  let word = raw.replace(/[^a-z0-9]/gi, "");
  if (word.length > maxLength) return word.slice(0, maxLength);
  if (word.length < SEARCH_PREFS.CUSTOM.LENGTH.MIN) return word.padEnd(SEARCH_PREFS.CUSTOM.LENGTH.MIN, "x");
  return word;
}
function generatePhoneticWord(maxLength) {
  const vowels = CHARACTERS.CHARACTER_TYPES.VOWELS;
  const consonants = CHARACTERS.CHARACTER_TYPES.CONSONANTS;
  const minLength = SEARCH_PREFS.CUSTOM.LENGTH.MIN;
  if (Math.random() < SEARCH_PREFS.CUSTOM.COMBINATION_WEIGHT) {
    return generateWithCombinations(maxLength, minLength);
  }
  return generateWithEnhancedPatterns(maxLength, minLength, vowels, consonants);
}
function generateWithCombinations(maxLength, minLength) {
  let word = "";
  const usedCombinations = /* @__PURE__ */ new Set();
  while (word.length < maxLength && word.length < minLength + 4) {
    const validCombos = COMBINATIONS.filter(
      (combo) => combo.pattern.length <= maxLength - word.length && !usedCombinations.has(combo.pattern)
    );
    if (validCombos.length === 0) break;
    const totalWeight = validCombos.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;
    for (const combo of validCombos) {
      random -= combo.weight;
      if (random <= 0) {
        word += combo.pattern;
        usedCombinations.add(combo.pattern);
        break;
      }
    }
  }
  while (word.length < minLength) {
    const vowels = CHARACTERS.CHARACTER_TYPES.VOWELS;
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
  for (let i2 = 0; i2 < pattern.length; i2++) {
    const char = pattern[i2];
    const nextChar = pattern[i2 + 1];
    if (char === "c") {
      if (nextChar && Math.random() < 0.2) {
        const validCombos = COMBINATIONS.filter(
          (combo) => combo.pattern.length === 2 && i2 + 1 < pattern.length && (char === "c" && nextChar === "c" || char === "c" && nextChar === "v")
        );
        if (validCombos.length > 0) {
          const combo = validCombos[Math.floor(Math.random() * validCombos.length)];
          word += combo.pattern;
          i2++;
          continue;
        }
      }
      word += consonants[Math.floor(Math.random() * consonants.length)];
    } else if (char === "v") {
      if (nextChar === "v" && Math.random() < 0.15) {
        const vowelCombos = COMBINATIONS.filter(
          (combo) => combo.pattern.length === 2 && /^[aeiou]{2}$/.test(combo.pattern)
        );
        if (vowelCombos.length > 0) {
          const combo = vowelCombos[Math.floor(Math.random() * vowelCombos.length)];
          word += combo.pattern;
          i2++;
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
  for (let i2 = 0; i2 < Math.min(maxLength, Math.max(minLength, 4)); i2++) {
    pattern += useConsonant ? "c" : "v";
    useConsonant = !useConsonant;
  }
  return buildEnhancedWordFromPattern(pattern, vowels, consonants);
}
function insertWordRandomly(base, word) {
  const pos = randomInt(0, base.length);
  return base.slice(0, pos) + word + base.slice(pos);
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
    }
    return fallbackSuccess;
  }
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
function getSelectedFilters() {
  const selected = [];
  document.querySelectorAll(".toggler.active").forEach((el) => {
    const group = el.getAttribute("data-group");
    const key = el.getAttribute("data-key");
    if (group && key) selected.push([group, key]);
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
  search,
  state
};
//# sourceMappingURL=main.js.map
