(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('ethers')) :
    typeof define === 'function' && define.amd ? define(['exports', 'ethers'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.sypher = {}, global.ethers));
})(this, (function (exports, ethers) { 'use strict';

    const HelperModule = {
        validateChain: async function (chain) {
            if (!chain) {
                throw new Error("CryptoModule.validateChain: Please provide a chain to validate.");
            }
            try {
                sypher.log("Validating chain...");
                const response = await fetch("https://raw.githubusercontent.com/Tukyo/sypher-tools/refs/heads/main/config/chains.min.json");
                if (!response.ok) {
                    throw new Error("CryptoModule.validateChain: Failed to fetch chain data.");
                }
                const chainMap = await response.json();
                const chainData = chainMap[chain.toLowerCase()];
                if (!chainData || !chainData.id) {
                    throw new Error(`CryptoModule.validateChain: Chain "${chain}" is not supported. Supported Chains: https://github.com/Tukyo/sypher-tools/blob/main/config/chains.json`);
                }
                return `0x${chainData.id.toString(16)}`;
            }
            catch (error) {
                throw new Error(`CryptoModule.validateChain: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        }
    };
    const LogModule = {
        initLogger: function () {
            const logModal = document.querySelector("#log-modal");
            const logContainer = document.querySelector("#log-mc");
            const logToggle = document.querySelector("#log-mt");
            const logShowHTML = `<i class="fa-solid fa-caret-right"></i>`; // TODO: Replace FontAwesome with custom SVG 
            const logHideHTML = `<i class="fa-solid fa-caret-left"></i>`;
            const originalLog = console.log;
            const originalError = console.error;
            console.log = function (...args) { originalLog.apply(console, args); appendLog(args); };
            console.error = function (...args) { originalError.apply(console, args); appendLog(args); };
            window.onerror = function (message, source, lineno, colno, error) { appendLog([`Error: ${message} at ${source}:${lineno}:${colno}`, error]); };
            window.addEventListener("unhandledrejection", function (event) { appendLog(["Unhandled Promise Rejection:", event.reason]); });
            function appendLog(args) {
                const logItem = document.createElement("div");
                logItem.className = "log-item";
                const userTimezone = sypher.cache()?.user?.environment?.timezone || 'UTC';
                const timestamp = new Date().toLocaleString('en-US', { timeZone: userTimezone });
                // Remove `%c` and associated inline CSS styles
                const filteredArgs = args.filter((arg, index, arr) => {
                    return !(typeof arg === "string" &&
                        (arg.startsWith("%c") || (index > 0 && typeof arr[index - 1] === "string" && arr[index - 1].startsWith("%c"))));
                });
                // Prepend the timestamp to the log
                filteredArgs.unshift(`[${timestamp}]`);
                filteredArgs.forEach(arg => {
                    if (Array.isArray(arg)) {
                        arg.forEach(item => handleSingleArgument(item, logItem));
                    }
                    else {
                        handleSingleArgument(arg, logItem);
                    }
                });
                if (logContainer) {
                    logContainer.appendChild(logItem);
                    logContainer.scrollTop = logContainer.scrollHeight;
                }
            }
            function handleSingleArgument(arg, logItem) {
                const logDiv = document.createElement("div");
                if (typeof arg === "string" && arg.match(/^\[\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (AM|PM)\]$/)) {
                    logDiv.className = "log-timestamp";
                    logDiv.textContent = arg;
                }
                else if (arg instanceof Error) {
                    logItem.classList.add("log-error");
                    logDiv.className = "log-object error-object";
                    logDiv.innerHTML = `<pre>${syntaxHighlight(safeStringify({
                    message: arg.message,
                    name: arg.name,
                    stack: arg.stack
                }, 2))}</pre>`;
                }
                else if (arg instanceof HTMLElement) {
                    logDiv.className = "log-dom";
                    logDiv.innerHTML = `<pre>&lt;${arg.tagName.toLowerCase()} id="${arg.id}" class="${arg.className}"&gt;</pre>`;
                }
                else if (typeof arg === "object" && arg !== null) {
                    logDiv.className = "log-object";
                    try {
                        logDiv.innerHTML = `<pre>${syntaxHighlight(safeStringify(arg, 2))}</pre>`;
                    }
                    catch (e) {
                        logDiv.textContent = `[Unserializable object: ${e.message}]`;
                    }
                }
                else if (typeof arg === "string") {
                    logDiv.className = isAddress(arg) ? "log-address" : "log-string";
                    logDiv.textContent = arg;
                }
                else if (typeof arg === "number") {
                    logDiv.className = "log-number";
                    logDiv.textContent = arg.toString();
                }
                else {
                    logDiv.className = "log-unknown";
                    logDiv.textContent = String(arg);
                }
                logItem.appendChild(logDiv);
            }
            function safeStringify(obj, space = 2) {
                const seen = new WeakSet();
                return JSON.stringify(obj, (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (seen.has(value)) {
                            return "[Circular]";
                        }
                        seen.add(value);
                    }
                    return value;
                }, space);
            }
            function syntaxHighlight(json) {
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g, match => {
                    let cls = "log-number";
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = "log-key";
                        }
                        else if (isAddress(match.replace(/"/g, ""))) {
                            cls = "log-address";
                        }
                        else {
                            cls = "log-string";
                        }
                    }
                    else if (/true/.test(match)) {
                        cls = "log-bool-true";
                    }
                    else if (/false/.test(match)) {
                        cls = "log-bool-false";
                    }
                    else if (/null/.test(match)) {
                        cls = "log-null";
                    }
                    return `<span class="${cls}">${match}</span>`;
                });
            }
            function isAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value); }
            if (logToggle) {
                logToggle.addEventListener("click", toggleLogContainer);
            }
            function toggleLogContainer() {
                if (!logModal || !logContainer || !logToggle) {
                    return;
                }
                if (logContainer.classList.contains("lc-hide")) {
                    logContainer.classList.remove("lc-hide");
                    logContainer.classList.add("lc-show");
                    logToggle.innerHTML = logHideHTML;
                    logModal.classList.remove("lm-hide");
                    logModal.classList.add("lm-show");
                }
                else {
                    logContainer.classList.remove("lc-show");
                    logContainer.classList.add("lc-hide");
                    logToggle.innerHTML = logShowHTML;
                    logModal.classList.remove("lm-show");
                    logModal.classList.add("lm-hide");
                }
            }
            toggleLogContainer();
        },
        log: function (...args) {
            if (!sypher.prefs().dev || !sypher.prefs().dev.logs || !sypher.prefs().dev.logs.enabled)
                return;
            const userTimezone = sypher.cache()?.user?.environment?.timezone || 'UTC';
            const timestamp = new Date().toLocaleString('en-US', { timeZone: userTimezone });
            // If the first argument is a styled message (starts with %c)
            if (typeof args[0] === "string" && args[0].startsWith("%c")) {
                const [firstArg, ...restArgs] = args;
                console.log(`%c[${timestamp}] %c${firstArg.slice(2)}`, "color: gray; font-weight: bold;", ...restArgs);
            }
            else {
                console.log(`%c[${timestamp}]`, "color: gray; font-weight: bold;", ...args);
            }
        }
    };
    const TruncationModule = {
        truncate: function (string, startLength = 6, endLength = 4) {
            if (!string) {
                throw new Error("TruncationModule.truncate: Please provide a string to truncate.");
            }
            if (string.length <= startLength + endLength + 3) {
                return string;
            }
            return `${string.slice(0, startLength)}...${string.slice(-endLength)}`;
        },
        truncateBalance: function (balance, decimals = 2, maxLength = 8) {
            if (balance === null || balance === undefined) {
                throw new Error("TruncationModule.truncateBalance: Please provide a number to truncate.");
            }
            const num = parseFloat(balance.toString());
            if (num >= 1e15)
                return `${(num / 1e15).toFixed(decimals)}Q`;
            if (num >= 1e12)
                return `${(num / 1e12).toFixed(decimals)}T`;
            if (num >= 1e9)
                return `${(num / 1e9).toFixed(decimals)}B`;
            if (num >= 1e6)
                return `${(num / 1e6).toFixed(decimals)}M`;
            if (num >= 1e3)
                return `${(num / 1e3).toFixed(decimals)}K`;
            const formatted = num.toFixed(decimals);
            const [intPart, decPart = ""] = formatted.split(".");
            if (intPart.length >= maxLength) {
                return intPart;
            }
            const remainingLength = maxLength - intPart.length - 1;
            const truncatedDecimal = decPart.slice(0, Math.max(remainingLength, 0));
            return truncatedDecimal ? `${intPart}.${truncatedDecimal}` : intPart;
        }
    };
    const WindowModule = {
        pageFocus: function () {
            const pageFocused = document.visibilityState === "visible";
            if (pageFocused)
                sypher.log(`Page Focused...`);
            else
                sypher.log(`Page Unfocused...`);
            return pageFocused;
        },
        userEnvironment: function () {
            const userAgent = navigator.userAgent || navigator.vendor;
            const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS/i.test(userAgent);
            const isTablet = /iPad|Tablet/i.test(userAgent);
            const isDesktop = !isMobile && !isTablet;
            const screenDetails = {
                width: window.screen.width,
                height: window.screen.height,
                availableWidth: window.screen.availWidth,
                availableHeight: window.screen.availHeight,
                colorDepth: window.screen.colorDepth,
                pixelDepth: window.screen.pixelDepth
            };
            const browserDetails = (() => {
                const ua = userAgent.toLowerCase();
                if (/chrome|crios|crmo/i.test(ua) && !/edge|opr\//i.test(ua))
                    return 'Chrome';
                if (/firefox|fxios/i.test(ua))
                    return 'Firefox';
                if (/safari/i.test(ua) && !/chrome|crios|crmo|opr\//i.test(ua))
                    return 'Safari';
                if (/opr\//i.test(ua))
                    return 'Opera';
                if (/edg/i.test(ua))
                    return 'Edge';
                if (/msie|trident/i.test(ua))
                    return 'Internet Explorer';
                return 'Unknown';
            })();
            const osDetails = (() => {
                if (/windows phone/i.test(userAgent))
                    return 'Windows Phone';
                if (/win/i.test(userAgent))
                    return 'Windows';
                if (/android/i.test(userAgent))
                    return 'Android';
                if (/mac/i.test(userAgent))
                    return 'MacOS';
                if (/iphone|ipad|ipod/i.test(userAgent))
                    return 'iOS';
                if (/linux/i.test(userAgent))
                    return 'Linux';
                return 'Unknown';
            })();
            const environment = {
                isMobile: isMobile,
                isTablet: isTablet,
                isDesktop: isDesktop,
                deviceType: isMobile ? (isTablet ? 'Tablet' : 'Mobile') : 'Desktop',
                browser: browserDetails,
                operatingSystem: osDetails,
                userAgent: userAgent,
                ethereum: ("ethereum" in window) && typeof window.ethereum !== 'undefined',
                platform: navigator.platform,
                languages: navigator.languages || [navigator.language],
                cookiesEnabled: navigator.cookieEnabled,
                screenDetails: screenDetails,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            sypher.log(environment);
            return environment;
        }
    };

    const THEMES = ["none", "custom", "default", "light"];
    const BUTTON_TYPES = ["none", "custom", "connect", "provider"];
    const MODAL_TYPES = ["none", "custom", "log", "connect"];
    const ADDRESS_REGEXP = /^0x[a-fA-F0-9]{40}$/;
    const DISCOVERED_PROVIDERS = [];
    const PLACEHOLDER_PROVIDERS = [
        {
            info: {
                icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4IDU2YzE1LjQ2NCAwIDI4LTEyLjUzNiAyOC0yOFM0My40NjQgMCAyOCAwIDAgMTIuNTM2IDAgMjhzMTIuNTM2IDI4IDI4IDI4WiIgZmlsbD0iIzFCNTNFNCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNyAyOGMwIDExLjU5OCA5LjQwMiAyMSAyMSAyMXMyMS05LjQwMiAyMS0yMVMzOS41OTggNyAyOCA3IDcgMTYuNDAyIDcgMjhabTE3LjIzNC02Ljc2NmEzIDMgMCAwIDAtMyAzdjcuNTMzYTMgMyAwIDAgMCAzIDNoNy41MzNhMyAzIDAgMCAwIDMtM3YtNy41MzNhMyAzIDAgMCAwLTMtM2gtNy41MzNaIiBmaWxsPSIjZmZmIi8+PC9zdmc+",
                name: "Coinbase Wallet",
                rdns: "com.coinbase.wallet",
                uuid: "96b79a0d-c5cd-48de-924b-af5c7bb68b7e",
                onboard: {
                    bool: true,
                    link: "https://www.coinbase.com/wallet",
                    deeplink: "cbwallet://",
                    fallback: {
                        ios: "https://apps.apple.com/us/app/coinbase-wallet-nfts-crypto/id1278383455",
                        android: "https://play.google.com/store/apps/details?id=org.toshi"
                    }
                }
            },
            provider: {}
        },
        {
            info: {
                icon: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMzUgMzMiIHdpZHRoPSIzNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjI1Ij48cGF0aCBkPSJtMzIuOTU4MiAxLTEzLjEzNDEgOS43MTgzIDIuNDQyNC01LjcyNzMxeiIgZmlsbD0iI2UxNzcyNiIgc3Ryb2tlPSIjZTE3NzI2Ii8+PGcgZmlsbD0iI2UyNzYyNSIgc3Ryb2tlPSIjZTI3NjI1Ij48cGF0aCBkPSJtMi42NjI5NiAxIDEzLjAxNzE0IDkuODA5LTIuMzI1NC01LjgxODAyeiIvPjxwYXRoIGQ9Im0yOC4yMjk1IDIzLjUzMzUtMy40OTQ3IDUuMzM4NiA3LjQ4MjkgMi4wNjAzIDIuMTQzNi03LjI4MjN6Ii8+PHBhdGggZD0ibTEuMjcyODEgMjMuNjUwMSAyLjEzMDU1IDcuMjgyMyA3LjQ2OTk0LTIuMDYwMy0zLjQ4MTY2LTUuMzM4NnoiLz48cGF0aCBkPSJtMTAuNDcwNiAxNC41MTQ5LTIuMDc4NiAzLjEzNTggNy40MDUuMzM2OS0uMjQ2OS03Ljk2OXoiLz48cGF0aCBkPSJtMjUuMTUwNSAxNC41MTQ5LTUuMTU3NS00LjU4NzA0LS4xNjg4IDguMDU5NzQgNy40MDQ5LS4zMzY5eiIvPjxwYXRoIGQ9Im0xMC44NzMzIDI4Ljg3MjEgNC40ODE5LTIuMTYzOS0zLjg1ODMtMy4wMDYyeiIvPjxwYXRoIGQ9Im0yMC4yNjU5IDI2LjcwODIgNC40Njg5IDIuMTYzOS0uNjEwNS01LjE3MDF6Ii8+PC9nPjxwYXRoIGQ9Im0yNC43MzQ4IDI4Ljg3MjEtNC40NjktMi4xNjM5LjM2MzggMi45MDI1LS4wMzkgMS4yMzF6IiBmaWxsPSIjZDViZmIyIiBzdHJva2U9IiNkNWJmYjIiLz48cGF0aCBkPSJtMTAuODczMiAyOC44NzIxIDQuMTU3MiAxLjk2OTYtLjAyNi0xLjIzMS4zNTA4LTIuOTAyNXoiIGZpbGw9IiNkNWJmYjIiIHN0cm9rZT0iI2Q1YmZiMiIvPjxwYXRoIGQ9Im0xNS4xMDg0IDIxLjc4NDItMy43MTU1LTEuMDg4NCAyLjYyNDMtMS4yMDUxeiIgZmlsbD0iIzIzMzQ0NyIgc3Ryb2tlPSIjMjMzNDQ3Ii8+PHBhdGggZD0ibTIwLjUxMjYgMjEuNzg0MiAxLjA5MTMtMi4yOTM1IDIuNjM3MiAxLjIwNTF6IiBmaWxsPSIjMjMzNDQ3IiBzdHJva2U9IiMyMzM0NDciLz48cGF0aCBkPSJtMTAuODczMyAyOC44NzIxLjY0OTUtNS4zMzg2LTQuMTMxMTcuMTE2N3oiIGZpbGw9IiNjYzYyMjgiIHN0cm9rZT0iI2NjNjIyOCIvPjxwYXRoIGQ9Im0yNC4wOTgyIDIzLjUzMzUuNjM2NiA1LjMzODYgMy40OTQ2LTUuMjIxOXoiIGZpbGw9IiNjYzYyMjgiIHN0cm9rZT0iI2NjNjIyOCIvPjxwYXRoIGQ9Im0yNy4yMjkxIDE3LjY1MDctNy40MDUuMzM2OS42ODg1IDMuNzk2NiAxLjA5MTMtMi4yOTM1IDIuNjM3MiAxLjIwNTF6IiBmaWxsPSIjY2M2MjI4IiBzdHJva2U9IiNjYzYyMjgiLz48cGF0aCBkPSJtMTEuMzkyOSAyMC42OTU4IDIuNjI0Mi0xLjIwNTEgMS4wOTEzIDIuMjkzNS42ODg1LTMuNzk2Ni03LjQwNDk1LS4zMzY5eiIgZmlsbD0iI2NjNjIyOCIgc3Ryb2tlPSIjY2M2MjI4Ii8+PHBhdGggZD0ibTguMzkyIDE3LjY1MDcgMy4xMDQ5IDYuMDUxMy0uMTAzOS0zLjAwNjJ6IiBmaWxsPSIjZTI3NTI1IiBzdHJva2U9IiNlMjc1MjUiLz48cGF0aCBkPSJtMjQuMjQxMiAyMC42OTU4LS4xMTY5IDMuMDA2MiAzLjEwNDktNi4wNTEzeiIgZmlsbD0iI2UyNzUyNSIgc3Ryb2tlPSIjZTI3NTI1Ii8+PHBhdGggZD0ibTE1Ljc5NyAxNy45ODc2LS42ODg2IDMuNzk2Ny44NzA0IDQuNDgzMy4xOTQ5LTUuOTA4N3oiIGZpbGw9IiNlMjc1MjUiIHN0cm9rZT0iI2UyNzUyNSIvPjxwYXRoIGQ9Im0xOS44MjQyIDE3Ljk4NzYtLjM2MzggMi4zNTg0LjE4MTkgNS45MjE2Ljg3MDQtNC40ODMzeiIgZmlsbD0iI2UyNzUyNSIgc3Ryb2tlPSIjZTI3NTI1Ii8+PHBhdGggZD0ibTIwLjUxMjcgMjEuNzg0Mi0uODcwNCA0LjQ4MzQuNjIzNi40NDA2IDMuODU4NC0zLjAwNjIuMTE2OS0zLjAwNjJ6IiBmaWxsPSIjZjU4NDFmIiBzdHJva2U9IiNmNTg0MWYiLz48cGF0aCBkPSJtMTEuMzkyOSAyMC42OTU4LjEwNCAzLjAwNjIgMy44NTgzIDMuMDA2Mi42MjM2LS40NDA2LS44NzA0LTQuNDgzNHoiIGZpbGw9IiNmNTg0MWYiIHN0cm9rZT0iI2Y1ODQxZiIvPjxwYXRoIGQ9Im0yMC41OTA2IDMwLjg0MTcuMDM5LTEuMjMxLS4zMzc4LS4yODUxaC00Ljk2MjZsLS4zMjQ4LjI4NTEuMDI2IDEuMjMxLTQuMTU3Mi0xLjk2OTYgMS40NTUxIDEuMTkyMSAyLjk0ODkgMi4wMzQ0aDUuMDUzNmwyLjk2Mi0yLjAzNDQgMS40NDItMS4xOTIxeiIgZmlsbD0iI2MwYWM5ZCIgc3Ryb2tlPSIjYzBhYzlkIi8+PHBhdGggZD0ibTIwLjI2NTkgMjYuNzA4Mi0uNjIzNi0uNDQwNmgtMy42NjM1bC0uNjIzNi40NDA2LS4zNTA4IDIuOTAyNS4zMjQ4LS4yODUxaDQuOTYyNmwuMzM3OC4yODUxeiIgZmlsbD0iIzE2MTYxNiIgc3Ryb2tlPSIjMTYxNjE2Ii8+PHBhdGggZD0ibTMzLjUxNjggMTEuMzUzMiAxLjEwNDMtNS4zNjQ0Ny0xLjY2MjktNC45ODg3My0xMi42OTIzIDkuMzk0NCA0Ljg4NDYgNC4xMjA1IDYuODk4MyAyLjAwODUgMS41Mi0xLjc3NTItLjY2MjYtLjQ3OTUgMS4wNTIzLS45NTg4LS44MDU0LS42MjIgMS4wNTIzLS44MDM0eiIgZmlsbD0iIzc2M2UxYSIgc3Ryb2tlPSIjNzYzZTFhIi8+PHBhdGggZD0ibTEgNS45ODg3MyAxLjExNzI0IDUuMzY0NDctLjcxNDUxLjUzMTMgMS4wNjUyNy44MDM0LS44MDU0NS42MjIgMS4wNTIyOC45NTg4LS42NjI1NS40Nzk1IDEuNTE5OTcgMS43NzUyIDYuODk4MzUtMi4wMDg1IDQuODg0Ni00LjEyMDUtMTIuNjkyMzMtOS4zOTQ0eiIgZmlsbD0iIzc2M2UxYSIgc3Ryb2tlPSIjNzYzZTFhIi8+PHBhdGggZD0ibTMyLjA0ODkgMTYuNTIzNC02Ljg5ODMtMi4wMDg1IDIuMDc4NiAzLjEzNTgtMy4xMDQ5IDYuMDUxMyA0LjEwNTItLjA1MTloNi4xMzE4eiIgZmlsbD0iI2Y1ODQxZiIgc3Ryb2tlPSIjZjU4NDFmIi8+PHBhdGggZD0ibTEwLjQ3MDUgMTQuNTE0OS02Ljg5ODI4IDIuMDA4NS0yLjI5OTQ0IDcuMTI2N2g2LjExODgzbDQuMTA1MTkuMDUxOS0zLjEwNDg3LTYuMDUxM3oiIGZpbGw9IiNmNTg0MWYiIHN0cm9rZT0iI2Y1ODQxZiIvPjxwYXRoIGQ9Im0xOS44MjQxIDE3Ljk4NzYuNDQxNy03LjU5MzIgMi4wMDA3LTUuNDAzNGgtOC45MTE5bDIuMDAwNiA1LjQwMzQuNDQxNyA3LjU5MzIuMTY4OSAyLjM4NDIuMDEzIDUuODk1OGgzLjY2MzVsLjAxMy01Ljg5NTh6IiBmaWxsPSIjZjU4NDFmIiBzdHJva2U9IiNmNTg0MWYiLz48L2c+PC9zdmc+",
                name: "MetaMask",
                rdns: "io.metamask",
                uuid: "974b295e-a371-4e37-a428-b82abf69ec3c",
                onboard: {
                    bool: true,
                    link: "https://metamask.io/",
                    deeplink: "metamask://",
                    fallback: {
                        ios: "https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202",
                        android: "https://play.google.com/store/apps/details?id=io.metamask&pli=1"
                    }
                }
            },
            provider: {}
        }
    ];
    const CHAINLINK_ABI = [
        "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
        "function description() view returns (string)",
    ];
    const ERC20_ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
    ];
    const UNISWAP_V2_POOL_ABI = [
        "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
        "function token0() view returns (address)",
        "function token1() view returns (address)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address owner) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 value) returns (bool)",
        "function transfer(address to, uint256 value) returns (bool)",
        "function transferFrom(address from, address to, uint256 value) returns (bool)"
    ];
    const UNISWAP_V3_POOL_ABI = [
        "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
        "function token0() view returns (address)",
        "function token1() view returns (address)",
        "function fee() view returns (uint24)",
        "function decimals() view returns (uint8)",
        "function liquidity() view returns (uint128)"
    ];
    const MAINNET_RPCS = [
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth",
        "https://ethereum-rpc.publicnode.com",
        "https://1rpc.io/eth",
        "https://rpc.mevblocker.io"
    ];

    function PAccountView(params) {
        return {
            append: params.modalObj.body,
            type: "div",
            id: "account-view",
            children: [
                {
                    type: "div",
                    classes: ["av-h"],
                    children: [
                        {
                            type: "h2",
                            classes: ["av-h-ti"],
                            innerHTML: params.user.ens ? `${sypher.truncate(params.user.ens)}` : `${sypher.truncate(params.user.account)}`,
                            attributes: {
                                "s-data": `${params.user.account}`
                            }
                        },
                        {
                            type: "div",
                            classes: ["av-h-ch-c"],
                            children: [
                                {
                                    type: "img",
                                    classes: ["av-h-ch-i"],
                                    attributes: {
                                        src: `https://ipfs.io/ipfs/${params.chain.icon[0].url.replace("ipfs://", "")}`
                                    }
                                },
                                {
                                    type: "img",
                                    classes: ["av-h-ch-ar"],
                                    attributes: {
                                        src: 'https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/arrow-down-l.svg'
                                    }
                                },
                            ]
                        },
                        {
                            type: "h2",
                            classes: ["av-h-ba"],
                            innerHTML: `${sypher.truncateBalance(parseFloat(params.user.ethBalance.toString()))} ${params.chain.nativeCurrency.symbol}`,
                            attributes: {
                                "s-data": `${params.user.ethBalance}`
                            }
                        }
                    ]
                },
                {
                    type: "div",
                    classes: ["av-b"],
                    children: [
                        {
                            type: "div",
                            id: "av-b-td",
                            classes: [params.token.tokenDetailClass],
                            children: [
                                {
                                    type: "div",
                                    classes: ["av-b-td-ic"],
                                    children: [
                                        {
                                            type: "img",
                                            classes: ["av-b-td-i"],
                                            attributes: {
                                                src: params.token.icon
                                            }
                                        },
                                        {
                                            type: "div",
                                            classes: ["av-b-td-n"],
                                            innerHTML: params.token.showTokenDetails
                                                ? `$${sypher.truncateBalance(parseFloat(params.token.tokenPrice.toString()), params.token.tokenDecimals)}`
                                                : ""
                                        }
                                    ],
                                    attributes: {
                                        "s-data": `${params.token.address}`
                                    }
                                },
                                {
                                    type: "div",
                                    classes: ["av-b-td-bc"],
                                    children: [
                                        {
                                            type: "div",
                                            classes: ["av-b-td-bal"],
                                            innerHTML: params.token.showTokenDetails
                                                ? `${sypher.truncateBalance(parseFloat(params.token.userBalance.toString()))} ${params.token.tokenSymbol}`
                                                : "",
                                            attributes: {
                                                "s-data": `${params.token.userBalance}`
                                            }
                                        },
                                        {
                                            type: "div",
                                            classes: ["av-b-td-val"],
                                            innerHTML: params.token.showTokenDetails
                                                ? `$${sypher.truncateBalance(parseFloat(params.token.userValue.toString()))}`
                                                : "",
                                            attributes: {
                                                "s-data": `${sypher.truncateBalance(parseFloat(params.token.userValue.toString()))}`
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "div",
                            id: "av-b-provider",
                            classes: ["av-b-b"],
                            events: {
                                click: () => {
                                    const accountView = document.getElementById("account-view");
                                    if (accountView) {
                                        accountView.style.display = "none";
                                    }
                                    let providerName = "";
                                    const providerDetail = sypher.getProviderDetail();
                                    if (providerDetail) {
                                        providerName = providerDetail.info.name.replace(/\s+/g, '').toLowerCase();
                                    }
                                    const buttons = document.querySelectorAll(".connect-mi");
                                    buttons.forEach(button => {
                                        const buttonElement = button;
                                        if (buttonElement.id.replace(/[\s-]+/g, '').toLowerCase() === providerName) {
                                            buttonElement.style.display = "none";
                                        }
                                        else {
                                            buttonElement.style.display = "flex";
                                        }
                                    });
                                    const modalBody = document.getElementById("connect-mb");
                                    if (modalBody) {
                                        modalBody.style.padding = "15px";
                                    }
                                    params.modalObj.title.innerHTML = "Change Wallet";
                                    if (providerDetail) {
                                        const providerContainer = document.getElementById("current-provider-container");
                                        if (providerContainer) {
                                            const providerName = document.getElementById("current-provider-name");
                                            const providerIcon = document.getElementById("current-provider-icon");
                                            if (providerName) {
                                                providerName.innerHTML = providerDetail.info.name;
                                            }
                                            if (providerIcon) {
                                                providerIcon.setAttribute("src", providerDetail.info.icon);
                                            }
                                            providerContainer.style.display = "flex";
                                            providerContainer.onclick = () => {
                                                if (accountView) {
                                                    accountView.style.display = "flex";
                                                }
                                                buttons.forEach(button => {
                                                    button.style.display = "none";
                                                });
                                                if (modalBody) {
                                                    modalBody.style.padding = "0px";
                                                }
                                                params.modalObj.title.innerHTML = "Account";
                                                providerContainer.style.display = "none";
                                            };
                                        }
                                    }
                                }
                            },
                            children: [
                                {
                                    type: "div",
                                    classes: ["av-b-bn-ic"],
                                    children: [
                                        {
                                            type: "img",
                                            classes: ["av-b-bn-i"],
                                            attributes: {
                                                src: params.mergedProviders[0].info.icon
                                            }
                                        },
                                        {
                                            type: "img",
                                            classes: ["av-b-bn-i"],
                                            attributes: {
                                                src: params.mergedProviders[1].info.icon
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "div",
                                    classes: ["av-b-bn-t"],
                                    innerHTML: "Change Wallet"
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "div",
                    classes: ["av-x"],
                    events: {
                        click: () => {
                            sypher.disconnect();
                            const accountView = document.getElementById("account-view");
                            if (accountView && accountView.parentNode) {
                                accountView.parentNode.removeChild(accountView);
                            }
                            const buttons = document.querySelectorAll(".connect-mi");
                            buttons.forEach(button => {
                                button.style.display = "flex";
                            });
                            const connectButton = document.getElementById("connect-button");
                            if (connectButton && sypher._connectText) {
                                connectButton.innerHTML = sypher._connectText;
                            }
                            params.modalObj.title.innerHTML = "Connect Wallet";
                        }
                    },
                    innerHTML: "Disconnect"
                }
            ]
        };
    }
    function PBranding(params) {
        return {
            append: params.modalObj.parent,
            type: "div",
            classes: ["sypher-connect-brand"],
            children: [
                {
                    type: "p",
                    classes: ["sypher-connect-brand-text"],
                    innerHTML: "Powered by"
                },
                {
                    type: "div",
                    classes: ["sypher-connect-brand-logo-container"],
                    events: { click: () => window.open("https://sypher.tools", "_blank") },
                    children: [
                        {
                            type: "div",
                            classes: ["sypher-connect-brand-logo"],
                            innerHTML: `
                            <svg id="sypher-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105.87 120.22">
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
                            </svg>`
                        }
                    ]
                }
            ]
        };
    }

    const InterfaceModule = {
        initTheme: function (theme = "default") {
            if (typeof theme !== "string") {
                throw new Error(`InterfaceModule.initTheme: Theme must be a string.`);
            }
            if (this._theme) {
                return;
            }
            if (theme === "none") {
                theme = "custom";
            }
            const themeStylesheetId = `sypher-${theme}-theme`;
            if (!document.getElementById(themeStylesheetId)) {
                const themeLink = document.createElement('link');
                themeLink.id = themeStylesheetId;
                themeLink.rel = 'stylesheet';
                themeLink.href = `/dist/css/themes/sypher-${theme}-theme.css`;
                document.head.appendChild(themeLink);
                this._theme = theme;
            }
        },
        applyStyle: function (elements, params) {
            if (!elements || elements.length === 0) {
                throw new Error(`InterfaceModule.applyStyle: Elements are required.`);
            }
            if (!params || typeof params !== "object") {
                throw new Error(`InterfaceModule.applyStyle: Params object is required.`);
            }
            const type = params.type;
            let theme = params.theme;
            if (theme === "none") {
                theme = "custom";
            }
            if (!this._theme) {
                this.initTheme(theme);
            }
            elements.forEach((element) => { element.classList.add(`sypher`); });
            const typeStylesheetId = `sypher-${type}`;
            if (!document.getElementById(typeStylesheetId)) {
                const typeLink = document.createElement('link');
                typeLink.id = typeStylesheetId;
                typeLink.rel = 'stylesheet';
                typeLink.href = `/dist/css/sypher-${type}.css`;
                document.head.appendChild(typeLink);
            }
        },
        createButton: function (params) {
            const defaultParams = {
                type: "connect",
                text: "Connect Wallet",
                icon: "",
                modal: false,
                theme: "none",
                append: document.body,
                onClick: () => sypher.connect("ethereum"),
                initCrypto: {}
            };
            const mergedParams = { ...defaultParams, ...params };
            const { type, text, icon, modal, theme, append, onClick, initCrypto } = mergedParams;
            if (!BUTTON_TYPES.includes(type)) {
                throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`);
            }
            if (!THEMES.includes(theme)) {
                throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`);
            }
            let appliedTheme = this._theme || theme;
            if (theme === "none") {
                appliedTheme = "custom";
            }
            let appliedType = type;
            if (type === "none") {
                appliedType = "custom";
            }
            const themeParams = { type, theme: appliedTheme };
            if (!themeParams) {
                return null;
            }
            if (appliedType === "connect") {
                if (initCrypto.chain === "none") {
                    throw new Error(`InterfaceModule.createButton: Chain is required for type 'connect'.`);
                }
                const className = `${appliedType}-button`;
                const themeName = `${appliedTheme}-button`;
                const buttonId = `${appliedType}-button`;
                let button = document.getElementById(buttonId);
                if (!button) {
                    button = document.createElement('button');
                    button.id = buttonId;
                    append.appendChild(button);
                }
                button.classList.add(className, themeName);
                button.textContent = text;
                this._connectText = text;
                window.addEventListener('sypher:ens', (e) => {
                    const ens = e.detail;
                    button.textContent = ens;
                });
                const finalOnClick = onClick === defaultParams.onClick
                    ? () => sypher.connect(initCrypto.chain !== "none" ? initCrypto.chain : "ethereum")
                    : onClick;
                if (modal) {
                    sypher.log("Modal Enabled...");
                    button.onclick = () => this.createModal({ append: document.body, type: "connect", theme: appliedTheme, initCrypto });
                    sypher.initProviderSearch();
                }
                else {
                    button.onclick = finalOnClick;
                }
                this.applyStyle([button], themeParams);
                return button;
            }
            else if (appliedType === "provider") {
                if (initCrypto.chain === "none") {
                    throw new Error(`InterfaceModule.createButton: Chain is required for type 'provider'.`);
                }
                const modalItem = document.createElement('div');
                modalItem.id = text.toLowerCase().replace(/\s+/g, '-');
                modalItem.classList.add('connect-mi');
                modalItem.addEventListener('click', onClick);
                const modalIconContainer = document.createElement('div');
                modalIconContainer.classList.add('connect-mic');
                const modalItemIcon = document.createElement('img');
                modalItemIcon.classList.add('connect-mim');
                modalItemIcon.src = icon;
                const modalItemName = document.createElement('span');
                modalItemName.classList.add('connect-min');
                modalItemName.innerText = text;
                this.applyStyle([modalItem, modalItemIcon, modalItemName], themeParams);
                append.appendChild(modalItem);
                modalItem.appendChild(modalIconContainer);
                modalIconContainer.appendChild(modalItemIcon);
                modalItem.appendChild(modalItemName);
                return modalItem;
            }
            else {
                return null;
            } //TODO: Throw error
        },
        createModal: async function (params) {
            const defaultParams = { append: document.body, type: "none", theme: "none", initCrypto: {} };
            const mergedParams = { ...defaultParams, ...params };
            const { append, type, theme, initCrypto } = mergedParams;
            if (!MODAL_TYPES.includes(type)) {
                throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`);
            }
            if (!THEMES.includes(theme)) {
                throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`);
            }
            let appliedTheme = this._theme || theme;
            if (theme === "none") {
                appliedTheme = "custom";
            }
            if (type === "none") {
                return null;
            } //TODO: Enable custom modals
            const modalObj = this.initModal(type, appliedTheme);
            if (!modalObj) {
                return null;
            }
            if (modalObj.type === "log") {
                this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle], mergedParams);
                append.appendChild(modalObj.parent);
                modalObj.parent.appendChild(modalObj.container);
                modalObj.parent.appendChild(modalObj.toggle);
                sypher.initLogger();
                return modalObj;
            }
            else if (modalObj.type === "connect") {
                this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle, modalObj.head, modalObj.title, modalObj.body], mergedParams);
                modalObj.parent.addEventListener('click', (e) => { if (e.target === modalObj.parent) {
                    modalObj.parent.remove();
                } });
                append.appendChild(modalObj.parent);
                modalObj.parent.appendChild(modalObj.container);
                modalObj.container.appendChild(modalObj.head);
                modalObj.head.appendChild(modalObj.title);
                modalObj.head.appendChild(modalObj.toggle);
                modalObj.container.appendChild(modalObj.body);
                sypher.currentProviderView(modalObj);
                const account = sypher.getConnected();
                const mergedProviders = sypher.providerSelectView(account, modalObj, initCrypto, appliedTheme);
                if (account !== null && account !== undefined) {
                    sypher.accountView(account, modalObj, mergedProviders);
                }
                sypher.brandingView(modalObj);
                return modalObj;
            }
            else if (modalObj.type === "mint") {
                // TODO: Create mint modal
                return modalObj;
            }
            else {
                throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`);
            }
        },
        initModal: function (type, theme = "custom") {
            if (!type || typeof type !== "string") {
                throw new Error(`InterfaceModule.initModal: Type is required.`);
            }
            if (!MODAL_TYPES.includes(type)) {
                throw new Error(`InterfaceModule.initModal: Type '${type}' not found.`);
            }
            if (type === "none" || type === "custom") {
                return null;
            } //TODO: Enable custom modals
            if (type === "log") {
                const modal = document.createElement('div');
                modal.id = `${type}-modal`;
                modal.classList.add(`${theme}-modal`);
                const modalContainer = document.createElement('div');
                modalContainer.id = `${type}-mc`;
                modalContainer.classList.add(`${theme}-mc`);
                const modalToggle = document.createElement('div');
                modalToggle.id = `${type}-mt`;
                modalToggle.classList.add(`${theme}-mt`);
                const modalObj = {
                    type: type,
                    parent: modal,
                    container: modalContainer,
                    toggle: modalToggle
                };
                return modalObj;
            }
            else if (type === "connect") {
                const connectModal = document.createElement('div');
                connectModal.id = `${type}-modal`;
                connectModal.classList.add(`${theme}-modal`);
                const modalContainer = document.createElement('div');
                modalContainer.id = `${type}-mc`;
                modalContainer.classList.add(`${theme}-mc`);
                const modalHeader = document.createElement('div');
                modalHeader.id = `${type}-mh`;
                modalHeader.classList.add(`${theme}-mh`);
                const modalClose = document.createElement('img');
                modalClose.id = `${type}-mx`;
                modalClose.classList.add(`${theme}-mx`);
                modalClose.src = "https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/close-c.svg";
                modalClose.addEventListener('click', () => { connectModal.remove(); }); // TODO: Might need to change this
                const modalTitle = document.createElement('h2');
                modalTitle.id = `${type}-mt`;
                modalTitle.classList.add(`${theme}-mt`);
                modalTitle.innerText = "Connect Wallet";
                const modalBody = document.createElement('div');
                modalBody.id = `${type}-mb`;
                modalBody.classList.add(`${theme}-mb`);
                const modalObj = {
                    type: type,
                    parent: connectModal,
                    container: modalContainer,
                    toggle: modalClose,
                    head: modalHeader,
                    title: modalTitle,
                    body: modalBody
                };
                return modalObj;
            }
            else if (type === "mint") {
                const modalObj = {
                    type: type,
                    parent: document.body,
                    container: document.body
                };
                return modalObj;
            }
            else {
                throw new Error(`InterfaceModule.initModal: Type '${type}' not found.`);
            }
        },
        createElement: function (params) {
            const defaultParams = {
                append: document.body,
                type: "div",
                id: "",
                classes: [],
                attributes: {},
                events: {},
                innerHTML: "",
                children: []
            };
            const mergedParams = { ...defaultParams, ...params };
            const { append, type, id, theme, classes, attributes, events, innerHTML, children } = mergedParams;
            if (theme) {
                if (!THEMES.includes(theme)) {
                    throw new Error(`InterfaceModule.createElement: Theme '${theme}' not found.`);
                }
            }
            let appliedTheme = this._theme || theme;
            if (theme === "none") {
                appliedTheme = "custom";
            }
            const element = document.createElement(type);
            if (id && id !== "") {
                element.id = id;
            }
            element.classList.add(`sypher-${appliedTheme}-element`);
            element.classList.add('sypher');
            if (classes) {
                classes.forEach((className) => { element.classList.add(className); });
            }
            if (attributes) {
                for (const [key, value] of Object.entries(attributes)) {
                    element.setAttribute(key, value);
                }
            }
            if (events) {
                for (const [key, value] of Object.entries(events)) {
                    element.addEventListener(key, value);
                }
            }
            if (innerHTML && innerHTML !== "") {
                element.innerHTML = innerHTML;
            }
            if (children) {
                children.forEach((childParams) => {
                    const childElement = this.createElement(childParams);
                    if (childElement) {
                        element.appendChild(childElement);
                        childElement.classList.add('sypher');
                    }
                });
            }
            if (append) {
                append.appendChild(element);
            }
            return element;
        },
        toggleLoader: function (params) {
            const defaultParams = {
                element: document.body,
                isEnabled: true,
                newText: "",
                loaderHTML: `<div class="loader"></div>`,
                replace: true
            };
            const mergedParams = { ...defaultParams, ...params };
            const { element, isEnabled, newText, loaderHTML, replace } = mergedParams;
            if (isEnabled) {
                if (replace) {
                    element.innerHTML = loaderHTML;
                }
                else if (!element.querySelector('.loader')) {
                    const loader = document.createElement('div');
                    loader.classList.add('loader');
                    element.appendChild(loader);
                }
            }
            else {
                if (newText === "sypher.revert") {
                    const loader = element.querySelector('.loader');
                    if (loader) {
                        loader.remove();
                    }
                    return;
                }
                else {
                    element.innerHTML = newText;
                }
            }
        },
        parallax: function () {
            const parallaxElements = document.querySelectorAll('[data-speed]');
            if (parallaxElements.length === 0) {
                console.warn(`InterfaceModule.parallax: Parallax enabled, but no elements found with the [data-speed] attribute.`);
                return;
            }
            sypher.log("Parallax enabled on ", parallaxElements.length, " elements.");
            function applyParallax() {
                parallaxElements.forEach(element => {
                    const speed = parseFloat(element.dataset.speed || '0.5');
                    const offset = window.scrollY * speed;
                    element.style.transform = `translateY(${-offset}px)`;
                });
            }
            function onScroll() { requestAnimationFrame(applyParallax); }
            window.addEventListener('scroll', onScroll);
            applyParallax();
        },
        fade: function (distance = '20px', length = '0.5s') {
            if (typeof distance !== "string" || typeof length !== "string") {
                throw new Error(`InterfaceModule.fade: Params must be strings.`);
            }
            const elements = document.querySelectorAll('[data-fade]');
            if (elements.length === 0) {
                console.warn(`InterfaceModule.fade: Fade enabled, but no elements found with the [data-fade] attribute.`);
                return;
            }
            sypher.log("Fade enabled on ", elements.length, " elements.");
            elements.forEach(el => {
                el.style.opacity = "0";
                el.style.transform = `translateY(${distance})`;
                el.style.transition = `opacity ${length} ease-out, transform ${length} ease-out`;
            });
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const el = entry.target;
                    if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                        el.style.opacity = "1";
                        el.style.transform = 'translateY(0)';
                    }
                    else {
                        el.style.opacity = "0";
                        el.style.transform = `translateY(${distance})`;
                    }
                });
            }, { threshold: 0.1 });
            elements.forEach(el => observer.observe(el));
        },
        getUI: function () {
            return {
                theme: this._theme || '',
                connectText: this._connectText || ''
            };
        }
    };
    const ViewsModule = {
        brandingView: function (modalObj) {
            const brandingConfig = PBranding({ modalObj });
            const branding = sypher.createElement(brandingConfig);
            if (!branding) {
                return null;
            }
        },
        accountView: function (account, modalObj, mergedProviders) {
            modalObj.title.innerHTML = "Account";
            modalObj.body.style.padding = "0px";
            const tokenDetails = sypher.getCleaned();
            const chainDetails = sypher.getChain();
            const { user: { ens = undefined, ethBalance = 0, tokenBalance: userBalance = 0, value: userValue = "" } = {}, token: { address: address = "", icon: tokenIcon = "", symbol: tokenSymbol = "", price: tokenPrice = 0, decimals: tokenDecimals = 0 } = {} } = tokenDetails || {};
            const { name: chainName = "", icon = [{ url: "" }], nativeCurrency: { symbol: nativeCurrencySymbol = "", decimals: nativeCurrencyDecimals = 0 } = {}, explorers = [{ name: "", url: "", icon: "" }] } = chainDetails || {};
            const params = {
                sypher,
                modalObj,
                mergedProviders,
                user: {
                    ens,
                    account,
                    ethBalance
                },
                token: {
                    tokenDetailClass: tokenDetails ? "av-b-c" : "av-b-c-hide",
                    showTokenDetails: !!tokenDetails,
                    address,
                    icon: tokenIcon,
                    tokenPrice,
                    tokenDecimals,
                    userBalance,
                    tokenSymbol,
                    userValue
                },
                chain: {
                    name: chainName,
                    icon,
                    nativeCurrency: {
                        symbol: nativeCurrencySymbol,
                        decimals: nativeCurrencyDecimals
                    },
                    explorers
                }
            };
            const accountViewConfig = PAccountView(params);
            const accountView = sypher.createElement(accountViewConfig);
            if (!accountView) {
                return null;
            }
        },
        currentProviderView: function (modalObj) {
            const currentProviderContainer = document.createElement('div');
            currentProviderContainer.id = "current-provider-container";
            const currentProviderInfoContainer = document.createElement('div');
            currentProviderInfoContainer.id = "current-provider-info-container";
            const currentProviderIconContainer = document.createElement('div');
            currentProviderIconContainer.id = "current-provider-icon-container";
            const currentProviderIcon = document.createElement('img');
            currentProviderIcon.id = "current-provider-icon";
            const currentProviderName = document.createElement('span');
            currentProviderName.id = "current-provider-name";
            const backButton = document.createElement('div');
            backButton.id = "sypher-back";
            const backButtonIcon = document.createElement('img');
            backButtonIcon.id = "sypher-back-icon";
            backButtonIcon.src = "https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/arrow-left-l.svg";
            modalObj.body.appendChild(currentProviderContainer);
            currentProviderContainer.appendChild(backButton);
            backButton.appendChild(backButtonIcon);
            currentProviderContainer.appendChild(currentProviderInfoContainer);
            currentProviderInfoContainer.appendChild(currentProviderName);
            currentProviderInfoContainer.appendChild(currentProviderIconContainer);
            currentProviderIconContainer.appendChild(currentProviderIcon);
            currentProviderContainer.style.display = "none";
        },
        providerSelectView: function (account, modalObj, initCrypto, appliedTheme) {
            const mergedProviders = [
                ...PLACEHOLDER_PROVIDERS.map((placeholder) => {
                    const match = DISCOVERED_PROVIDERS.find((discovered) => discovered.info.name === placeholder.info.name);
                    const merged = match || placeholder;
                    if (match) {
                        if (!merged.info.onboard) {
                            merged.info.onboard = {
                                bool: false,
                                link: "",
                                deeplink: "",
                                fallback: {
                                    ios: "",
                                    android: "",
                                },
                            };
                        }
                        merged.info.onboard.bool = false;
                    }
                    return merged;
                }),
                ...DISCOVERED_PROVIDERS.filter((discovered) => !PLACEHOLDER_PROVIDERS.some((placeholder) => placeholder.info.name === discovered.info.name)),
            ];
            sypher.log("[EIP-6963] Providers:", mergedProviders);
            mergedProviders.forEach((providerDetail) => {
                const { name, icon } = providerDetail.info;
                const onClick = providerDetail.info.onboard?.bool
                    ? () => { sypher.onboard(providerDetail); }
                    : () => {
                        if (initCrypto.chain !== "none") {
                            sypher.initCrypto({
                                chain: initCrypto.chain,
                                contractAddress: initCrypto.contractAddress,
                                poolAddress: initCrypto.poolAddress,
                                pairAddress: initCrypto.pairAddress,
                                version: initCrypto.version,
                                detail: providerDetail,
                                icon: initCrypto.icon
                            });
                        }
                        else {
                            sypher.connect(initCrypto.chain, providerDetail);
                        }
                    };
                const button = sypher.createButton({
                    append: modalObj.body,
                    type: "provider",
                    text: name,
                    icon: icon,
                    modal: false,
                    theme: appliedTheme,
                    onClick: onClick,
                    initCrypto: initCrypto
                });
                if (button !== null) {
                    if (account !== null && account !== undefined) {
                        button.style.display = "none";
                    }
                }
            });
            return mergedProviders;
        }
    };

    const CryptoModule = {
        initCrypto: async function (params) {
            if (!params) {
                return null;
            }
            if (!params.pair) {
                params.pair = "ethereum";
            }
            this.flush();
            this._isLoading = true;
            const connectButton = document.getElementById("connect-button") || null;
            if (connectButton) {
                sypher.toggleLoader({ element: connectButton });
                connectButton.disabled = true;
            }
            try {
                const chainId = this._chain?.chainId ?? await sypher.validateChain(params.chain);
                if (!chainId) {
                    return null;
                }
                const connection = await this.connect(params.chain, params.detail);
                if (!connection) {
                    return null;
                }
                const address = connection.primaryAccount;
                if (!address) {
                    return null;
                }
                const ethBalance = connection.ethBalance;
                if (ethBalance === null || ethBalance === undefined) {
                    return null;
                }
                sypher.log("Getting details for:", params);
                const tokenDetails = await this.getTokenDetails(params.chain, params.contractAddress);
                if (!tokenDetails) {
                    return null;
                }
                const { balance, decimals, name, symbol, totalSupply } = tokenDetails;
                let tokenPrice;
                let v2Detail = undefined;
                let v3Detail = undefined;
                if (params.version === "V2") {
                    const v2Result = await this.getPriceV2(params.chain, params.poolAddress, params.pair, params.pairAddress);
                    if (!v2Result) {
                        return null;
                    }
                    tokenPrice = v2Result.price;
                    v2Detail = v2Result.details;
                }
                else if (params.version === "V3") {
                    const v3Result = await this.getPriceV3(params.chain, params.contractAddress, params.poolAddress, params.pair, params.pairAddress);
                    if (!v3Result) {
                        return null;
                    }
                    tokenPrice = v3Result.price;
                    v3Detail = v3Result.details;
                }
                else {
                    return null;
                }
                const userValue = this.getUserValue(balance, tokenPrice);
                if (userValue === null || userValue === undefined) {
                    return null;
                }
                const contractAddress = params.contractAddress;
                const poolAddress = params.poolAddress;
                const pairAddress = params.pairAddress;
                const icon = params.icon ?? "";
                const version = params.version;
                const pair = params.pair;
                const ens = this._ens ?? undefined;
                const details = {
                    address,
                    ens,
                    contractAddress,
                    poolAddress,
                    pairAddress,
                    balance,
                    ethBalance,
                    decimals,
                    name,
                    symbol,
                    icon,
                    totalSupply,
                    tokenPrice,
                    userValue,
                    version,
                    pair,
                    v2Detail,
                    v3Detail
                };
                if (!details) {
                    return null;
                }
                const cleanedDetails = this.clean(details);
                if (!cleanedDetails) {
                    return null;
                }
                const detailsObj = cleanedDetails;
                window.dispatchEvent(new CustomEvent("sypher:initCrypto", { detail: detailsObj }));
                sypher.log("%c🔵 Init Success! 🔵", "color: #0972C6;");
                const text = ens ? sypher.truncate(ens) : sypher.truncate(address);
                if (connectButton && text) {
                    sypher.toggleLoader({ element: connectButton, isEnabled: false, newText: text });
                }
                ;
                return detailsObj;
            }
            catch (error) {
                throw new Error(`CryptoModule.initCrypto: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
            finally {
                this._isLoading = false;
                let text;
                if (this._ens) {
                    text = sypher.truncate(this._ens) ?? sypher.getUI().connectText;
                }
                else if (this._connected) {
                    text = sypher.truncate(this._connected) ?? sypher.getUI().connectText;
                }
                else {
                    text = sypher.getUI().connectText;
                }
                if (connectButton) {
                    sypher.toggleLoader({ element: connectButton, isEnabled: false, newText: text });
                    connectButton.disabled = false;
                }
            }
        },
        connect: async function (chain, providerDetail = null) {
            if (!chain) {
                throw new Error("CryptoModule.connect: Chain is required");
            }
            sypher.log("Chain:", chain);
            sypher.log("Chosen Provider:", providerDetail);
            const connectButton = document.getElementById("connect-button") || null;
            if (connectButton) {
                sypher.toggleLoader({ element: connectButton });
                connectButton.disabled = true;
            }
            const details = providerDetail || this._EIP6963;
            if (this._connected && !details) {
                return { primaryAccount: this._connected, ethBalance: this._ethBalance };
            }
            if (details) {
                const connectButtons = document.querySelectorAll(".connect-mi");
                const connectBody = document.getElementById("connect-mb");
                const connectModalC = document.getElementById("connect-mc");
                const connectModal = document.getElementById("connect-modal");
                if (connectButtons.length > 0) {
                    connectButtons.forEach((button) => { button.style.display = "none"; });
                }
                if (connectBody) {
                    const params = {
                        element: connectBody,
                        loaderHTML: "<div class='loader'></div>",
                        isEnabled: true,
                        replace: false
                    };
                    sypher.toggleLoader(params);
                }
                this._EIP6963 = details;
                try {
                    const provider = details.provider;
                    sypher.log("[EIP-6963]", details.info.name);
                    const accounts = await provider.request({ method: "eth_requestAccounts" });
                    if (!Array.isArray(accounts) || !accounts.length) {
                        throw new Error("No accounts returned by the chosen provider.");
                    }
                    const primaryAccount = accounts[0];
                    await this.switchChain(chain);
                    this._connected = primaryAccount;
                    if (connectBody) {
                        connectBody.innerHTML = `
                        <div class="connect-sb">
                            <p class="connect-s">Connected to ${details.info.name}</p>
                            <p class="connect-s">Account: <span class="sypher-a">${sypher.truncate(primaryAccount)}</span></p>
                        </div>
                    `;
                        connectBody.classList.add("min-height-a");
                    }
                    if (connectModalC) {
                        connectModalC.classList.add("height-a");
                    }
                    if (connectModal) {
                        setTimeout(() => { connectModal.style.opacity = "0%"; }, 5000);
                        setTimeout(() => { connectModal.remove(); }, 6000);
                    }
                    sypher.log("%c[EIP-6963] ✔️ Connection Success! ✔️", "color: #00a82a; font-weight: bold;");
                    sypher.log(primaryAccount);
                    window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                    this.accountChange(true);
                    const ethBalance = await this.getETH();
                    this._ethBalance = ethBalance;
                    this.getENS(primaryAccount);
                    return { primaryAccount, ethBalance };
                }
                catch (error) {
                    const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                    if (error.code === 4001) {
                        sypher.log("%c❌ User Denied Wallet Access ❌", "color: #ff0000; font-weight: bold;");
                        window.dispatchEvent(new CustomEvent("sypher:connectFail", { detail: "User denied wallet access" }));
                        this.disconnect();
                        if (connectBody) {
                            const params = {
                                element: connectBody,
                                isEnabled: false,
                                newText: "sypher.revert"
                            };
                            sypher.toggleLoader(params);
                        }
                        connectButtons.forEach((button) => { button.style.display = "flex"; });
                        return null;
                    }
                    throw new Error(`CryptoModule.connect: ${detailedError}`);
                }
                finally {
                    if (!this._isLoading) {
                        let text;
                        if (this._ens) {
                            text = sypher.truncate(this._ens) ?? sypher.getUI().connectText;
                        }
                        else if (this._connected) {
                            text = sypher.truncate(this._connected) ?? sypher.getUI().connectText;
                        }
                        else {
                            text = sypher.getUI().connectText;
                        }
                        if (connectButton) {
                            sypher.toggleLoader({ element: connectButton, isEnabled: false, newText: text });
                            connectButton.disabled = false;
                        }
                    }
                }
            }
            else {
                try {
                    const ethereum = this.getProvider();
                    if (!ethereum) {
                        return null;
                    }
                    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                    if (!Array.isArray(accounts) || accounts.length === 0) {
                        throw new Error("CryptoModule.connect: No accounts returned by the Ethereum provider.");
                    }
                    const primaryAccount = accounts[0];
                    if (!primaryAccount) {
                        console.warn("CryptoModule.connect: Wallet not connected.");
                        return null;
                    }
                    await this.switchChain(chain);
                    this._connected = primaryAccount;
                    sypher.log("%c[WINDOW] ✔️ Connection Success! ✔️", "color: #00a82a; font-weight: bold;");
                    sypher.log(primaryAccount);
                    window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                    this.accountChange(true);
                    const ethBalance = await this.getETH();
                    this._ethBalance = ethBalance;
                    this.getENS(primaryAccount);
                    return { primaryAccount, ethBalance };
                }
                catch (error) {
                    const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                    throw new Error(`CryptoModule.connect: ${detailedError}`);
                }
                finally {
                    if (!this._isLoading) {
                        let text;
                        if (this._ens) {
                            text = sypher.truncate(this._ens) ?? sypher.getUI().connectText;
                        }
                        else if (this._connected) {
                            text = sypher.truncate(this._connected) ?? sypher.getUI().connectText;
                        }
                        else {
                            text = sypher.getUI().connectText;
                        }
                        if (connectButton) {
                            sypher.toggleLoader({ element: connectButton, isEnabled: false, newText: text });
                            connectButton.disabled = false;
                        }
                    }
                }
            }
        },
        disconnect: async function () {
            window.dispatchEvent(new CustomEvent("sypher:disconnect", { detail: this._connected }));
            this.accountChange(false);
            this.flush();
        },
        accountChange: function (active) {
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            if (this._connected === null || this._connected === undefined) {
                return;
            }
            if (active) {
                sypher.log("Listening for account changes...");
                provider.on("accountsChanged", (accounts) => {
                    if (!accounts.length) {
                        this.disconnect();
                        return;
                    }
                    this._connected = accounts[0];
                    window.dispatchEvent(new CustomEvent("sypher:accountChange", { detail: this.getConnected() }));
                    const modal = document.getElementById("connect-modal");
                    if (modal) {
                        modal.remove();
                    }
                    if (this._chain) {
                        if (this._details) {
                            if (this._EIP6963) {
                                this.initCrypto({
                                    chain: this._chain.shortName.toLowerCase(),
                                    contractAddress: this._details.token.address,
                                    poolAddress: this._details.token.poolAddress,
                                    pairAddress: this._details.token.pairAddress,
                                    version: this._details.token.version,
                                    pair: this._details.token.pair,
                                    icon: this._details.token.icon,
                                    detail: this._EIP6963
                                });
                            }
                            else {
                                console.log("Unknown Error Occured...");
                            }
                        }
                        else {
                            this.connect(this._chain.chainId, this._EIP6963);
                        }
                    }
                });
            }
            else {
                provider.removeAllListeners("accountsChanged");
                const modal = document.getElementById("connect-modal");
                if (modal) {
                    modal.remove();
                }
            }
        },
        onboard: async function (providerDetail) {
            const userEnv = sypher.userEnvironment();
            const isMobile = userEnv.isMobile;
            const isApple = userEnv.operatingSystem.toLowerCase() === "macos";
            const isAndroid = userEnv.operatingSystem.toLowerCase() === "android";
            if (!isMobile) {
                window.open(providerDetail.info.onboard.link, "_blank");
                return;
            }
            if (isMobile) {
                const { deeplink, fallback } = providerDetail.info.onboard;
                if (isApple || isAndroid) {
                    const platform = isApple ? "ios" : "android";
                    const fallbackTimer = setTimeout(() => {
                        sypher.log("Deeplink failed, prompting user for App Store redirection...");
                        if (platform === "ios") {
                            const userConfirmed = confirm("Unable to open the app. Please click confirm to download from the app store.");
                            if (userConfirmed) {
                                window.location.href = fallback[platform];
                            }
                            else {
                                sypher.log("User canceled App Store redirection.");
                            }
                        }
                        else {
                            const link = document.createElement("a");
                            link.href = fallback[platform];
                            link.target = "_self";
                            link.rel = "noopener";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                    }, 1000);
                    window.location.href = deeplink;
                    window.addEventListener("blur", () => clearTimeout(fallbackTimer), { once: true });
                }
                else {
                    return;
                }
            }
        },
        getETH: async function () {
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            const web3 = new ethers.ethers.providers.Web3Provider(provider);
            const signer = web3.getSigner();
            const balance = await signer.getBalance();
            const eth = parseFloat(ethers.ethers.utils.formatEther(balance));
            sypher.log("ETH Balance:", eth);
            return eth;
        },
        getENS: async function (address) {
            if (!address) {
                throw new Error("CryptoModule.getENS: Address is required");
            }
            if (this._ens) {
                return this._ens;
            }
            try {
                const providers = await this.getProvider(true);
                if (!Array.isArray(providers)) {
                    throw new Error("CryptoModule.getENS: Expected an array of providers but got something else.");
                }
                const shuffledProviders = providers.slice().sort(() => Math.random() - 0.5);
                for (const provider of shuffledProviders) {
                    try {
                        const ens = await provider.lookupAddress(address);
                        if (ens) {
                            sypher.log("[ENS Found]:", ens);
                            this._ens = ens;
                            if (!this._isLoading) {
                                window.dispatchEvent(new CustomEvent("sypher:ens", { detail: ens }));
                            }
                            return ens;
                        }
                    }
                    catch (error) {
                        console.warn(`[ENS Lookup Failed]: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
                console.warn("CryptoModule.getENS: All providers failed ENS lookup.");
                return undefined;
            }
            catch (error) {
                throw new Error(`CryptoModule.getENS: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getChain: function () {
            return this._chain;
        },
        switchChain: async function (chain) {
            if (!chain) {
                throw new Error("CryptoModule.switchChain: Chain is required");
            }
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            const chainData = await this.getChainData(chain);
            if (!chainData) {
                return;
            }
            const targetChainId = chainData.chainId;
            if (this._chain?.chainId === targetChainId) {
                return;
            }
            if (chainData) {
                this._chain = chainData;
            }
            try {
                const currentChainID = await provider.request({ method: 'eth_chainId' });
                if (currentChainID === targetChainId) {
                    if (this._chain) {
                        this._chain.chainId = targetChainId;
                    }
                    return;
                }
                sypher.log(`Switching to ${chain} chain...`);
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChainId }]
                });
                if (this._chain) {
                    this._chain.chainId = targetChainId;
                }
            }
            catch (switchError) {
                console.warn(`CryptoModule.switchChain: Attempting to add chain: ${chain}`);
                if (switchError.code === 4902) {
                    try {
                        await provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [chainData],
                        });
                        if (this._chain) {
                            this._chain.chainId = targetChainId;
                        }
                    }
                    catch (addError) {
                        throw new Error(`CryptoModule.switchChain: Unable to add chain "${chain}". Details: ${addError}`);
                    }
                }
                else {
                    throw new Error(`CryptoModule.switchChain: Unable to switch chain "${chain}". Details: ${switchError}`);
                }
            }
        },
        getChainData: async function (chain) {
            if (!chain) {
                throw new Error("CryptoModule.getChainData: Chain is required");
            }
            try {
                const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
                if (!chainId) {
                    return null;
                }
                const chainIdDecimal = parseInt(chainId, 16);
                const url = `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/chains/eip155-${chainIdDecimal}.json`;
                const response = await fetch(url);
                if (!response.ok)
                    throw new Error(`Chain data for ID ${chainId} not found`);
                const data = await response.json();
                sypher.log(`Fetched chain data:`, data);
                let iconData = undefined;
                if (data.icon) {
                    try {
                        const iconURL = `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/icons/${data.icon}.json`;
                        const iconResponse = await fetch(iconURL);
                        if (iconResponse.ok) {
                            iconData = await iconResponse.json();
                        }
                        else {
                            console.warn(`Icon data for ${data.icon} not found`);
                        }
                    }
                    catch (iconError) {
                        console.warn(`Error fetching icon data for ${data.icon}:`, iconError);
                    }
                }
                const params = {
                    name: data.name,
                    chain: data.chain,
                    icon: iconData,
                    rpc: data.rpc,
                    nativeCurrency: data.nativeCurrency,
                    infoURL: data.infoURL,
                    shortName: data.shortName,
                    chainId: `0x${parseInt(data.chainId, 10).toString(16)}`,
                    networkId: data.networkId,
                    ens: data.ens || undefined,
                    explorers: data.explorers || undefined,
                };
                return params;
            }
            catch (error) {
                throw new Error(`CryptoModule.getChainData: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getPriceFeed: async function (pair = "ethereum") {
            if (this._pairPrice && this._pairPrice.value && this._pairPrice.timestamp && (Date.now() - this._pairPrice.timestamp) < 60000) {
                return this._pairPrice.value;
            }
            if (pair.toLowerCase().replace(/\s+/g, '') === "wrappedbitcoin") {
                pair = "bitcoin";
            }
            try {
                const response = await fetch("https://raw.githubusercontent.com/Tukyo/sypher-tools/refs/heads/main/config/chainlink.min.json");
                if (!response.ok) {
                    throw new Error("CryptoModule.getPriceFeed: Unable to fetch Chainlink data");
                }
                const pairMap = await response.json();
                const pairData = pairMap[pair.toLowerCase().replace(/\s+/g, '')];
                if (!pairData) {
                    throw new Error(`CryptoModule.getPriceFeed: No data found for ${pair}. Reference: https://github.com/Tukyo/sypher-tools/blob/main/config/chainlink.json`);
                }
                const availableQuotes = Object.keys(pairData);
                sypher.log(`Available quotes for ${pair}:`, availableQuotes);
                let quoteDetails = pairData["usd"] || pairData["eth"];
                if (!quoteDetails) {
                    throw new Error(`CryptoModule.getPriceFeed: No USD, ETH, or BTC quote found for ${pair}`);
                }
                sypher.log("Chosen Quote Details:", quoteDetails);
                const { proxy, decimals } = quoteDetails;
                const providers = await this.getProvider(true);
                if (!Array.isArray(providers)) {
                    throw new Error("CryptoModule.getPriceFeed: Expected an array of providers but got something else.");
                }
                const shuffledProviders = providers.slice().sort(() => Math.random() - 0.5);
                for (const provider of shuffledProviders) {
                    try {
                        const contract = new ethers.ethers.Contract(proxy, CHAINLINK_ABI, provider);
                        const roundData = await contract.latestRoundData();
                        const description = await contract.description();
                        const price = ethers.ethers.utils.formatUnits(roundData.answer, decimals);
                        sypher.log(`${description}: ${price}`);
                        if (pairData["usd"]) {
                            this._pairPrice = { value: price, timestamp: Date.now() };
                            return price;
                        }
                        else {
                            const ethUSD = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
                            const ethUSDContract = new ethers.ethers.Contract(ethUSD, CHAINLINK_ABI, provider);
                            const ethUSDRoundData = await ethUSDContract.latestRoundData();
                            const ethUSDPrice = ethers.ethers.utils.formatUnits(ethUSDRoundData.answer, 8);
                            const finalPrice = (parseFloat(price) * parseFloat(ethUSDPrice)).toFixed(8);
                            sypher.log(`Final Price for ${pair}: $${finalPrice}`);
                            this._pairPrice = { value: finalPrice.toString(), timestamp: Date.now() };
                            return finalPrice.toString();
                        }
                    }
                    catch (error) {
                        console.warn(`[Price Fetch Failed]: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            }
            catch (error) {
                throw new Error(`CryptoModule.getPriceFeed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getTokenDetails: async function (chain, contractAddress) {
            if (!chain) {
                throw new Error("CryptoModule.getTokenDetails: Chain is required");
            }
            if (!contractAddress) {
                throw new Error("CryptoModule.getTokenDetails: Contract address is required");
            }
            if (!contractAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getTokenDetails: Invalid contract address");
            }
            try {
                let account = this._connected;
                if (account === null || account === undefined) {
                    const connection = await this.connect(chain);
                    if (!connection) {
                        return null;
                    }
                    account = connection.primaryAccount;
                }
                if (!account) {
                    return null;
                }
                let provider = this._EIP6963?.provider;
                if (!provider) {
                    provider = this.getProvider();
                }
                const web3 = new ethers.ethers.providers.Web3Provider(provider);
                const signer = web3.getSigner();
                const contract = new ethers.ethers.Contract(contractAddress, ERC20_ABI, signer);
                const balance = await contract.balanceOf(account);
                const decimals = await contract.decimals();
                const name = await contract.name();
                const symbol = await contract.symbol();
                const totalSupply = await contract.totalSupply();
                sypher.log("Raw Details:", { balance, decimals, name, symbol, totalSupply });
                return { balance, decimals, name, symbol, totalSupply };
            }
            catch (error) {
                throw new Error(`CryptoModule.getTokenDetails: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getPriceV2: async function (chain, poolAddress, pair, pairAddress) {
            if (!chain) {
                throw new Error("CryptoModule.getPriceV2: Chain is required");
            }
            if (!poolAddress) {
                throw new Error("CryptoModule.getPriceV2: Pool address is required");
            }
            if (!poolAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPriceV2: Invalid pool address");
            }
            if (!pair) {
                throw new Error("CryptoModule.getPriceV2: Pair is required");
            }
            if (!pairAddress) {
                throw new Error("CryptoModule.getPriceV2: Pair address is required");
            }
            if (!pairAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPriceV2: Invalid pair address");
            }
            try {
                const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
                if (!chainId) {
                    return null;
                }
                let account = this._connected;
                if (account === null || account === undefined) {
                    const connection = await this.connect(chain);
                    if (!connection) {
                        return null;
                    }
                    account = connection.primaryAccount;
                }
                if (!account) {
                    return null;
                }
                const chainlinkResult = await this.getPriceFeed(pair);
                if (!chainlinkResult)
                    return null;
                let provider = this._EIP6963?.provider;
                if (!provider) {
                    provider = this.getProvider();
                }
                const web3 = new ethers.ethers.providers.Web3Provider(provider);
                const signer = web3.getSigner();
                const uniswapV2 = new ethers.ethers.Contract(poolAddress, UNISWAP_V2_POOL_ABI, signer);
                const token0 = await uniswapV2.token0();
                const token1 = await uniswapV2.token1();
                const reserves = await uniswapV2.getReserves();
                const reserve0 = reserves._reserve0;
                const reserve1 = reserves._reserve1;
                const token0Contract = new ethers.ethers.Contract(token0, ERC20_ABI, signer);
                const token1Contract = new ethers.ethers.Contract(token1, ERC20_ABI, signer);
                const decimals0 = await token0Contract.decimals();
                const decimals1 = await token1Contract.decimals();
                sypher.log("Reserve 0:", reserve0);
                sypher.log("Reserve 1:", reserve1);
                sypher.log("Token 0:", token0);
                sypher.log("Token 1:", token1);
                sypher.log("Decimals 0:", decimals0);
                sypher.log("Decimals 1:", decimals1);
                if (!decimals0 || !decimals1 || !reserve0 || !reserve1 || !token0 || !token1) {
                    return null;
                }
                const reserve0BN = ethers.ethers.BigNumber.from(reserve0);
                const reserve1BN = ethers.ethers.BigNumber.from(reserve1);
                // Convert each reserve to a normal floating-point value, adjusting by its decimals
                // e.g. if reserve0 = 123456789 (raw) and decimals0 = 6, then
                // parseFloat(ethers.utils.formatUnits(reserve0BN, 6)) => 123.456789
                const reserve0Float = parseFloat(ethers.ethers.utils.formatUnits(reserve0BN, decimals0));
                const reserve1Float = parseFloat(ethers.ethers.utils.formatUnits(reserve1BN, decimals1));
                let priceRatio;
                if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                    priceRatio = reserve1Float / reserve0Float; // Price in pair = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
                }
                else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                    priceRatio = reserve0Float / reserve1Float; // Price in pair = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
                }
                else {
                    throw new Error(`CryptoModule.getPriceV2: Neither token is ${pair}`);
                }
                const tokenPriceUSD = priceRatio * parseFloat(chainlinkResult);
                sypher.log(`V2 Price for token in pool ${poolAddress}: $${tokenPriceUSD}`);
                const v2Detail = { token0, token1, decimals0, decimals1, reserve0: reserve0BN, reserve1: reserve1BN };
                return { price: tokenPriceUSD, details: v2Detail };
            }
            catch (error) {
                throw new Error(`CryptoModule.getPriceV2: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getPriceV3: async function (chain, contractAddress, poolAddress, pair, pairAddress) {
            if (!chain) {
                throw new Error("CryptoModule.getPriceV3: Chain is required");
            }
            if (!contractAddress) {
                throw new Error("CryptoModule.getPriceV3: Contract address is required");
            }
            if (!contractAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPriceV3: Invalid contract address");
            }
            if (!poolAddress) {
                throw new Error("CryptoModule.getPriceV3: Pool address is required");
            }
            if (!poolAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPriceV3: Invalid pool address");
            }
            if (!pair) {
                throw new Error("CryptoModule.getPriceV3: Pair is required");
            }
            if (!pairAddress) {
                throw new Error("CryptoModule.getPriceV3: Pair address is required");
            }
            if (!pairAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPriceV3: Invalid pair address");
            }
            try {
                const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
                if (!chainId) {
                    return null;
                }
                let account = this._connected;
                if (account === null || account === undefined) {
                    const connection = await this.connect(chain);
                    if (!connection) {
                        return null;
                    }
                    account = connection.primaryAccount;
                }
                if (!account) {
                    return null;
                }
                // 1: Get all pool details
                const v3Detail = await this.getPoolV3(chain, contractAddress, poolAddress);
                if (!v3Detail) {
                    return null;
                }
                const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = v3Detail;
                // 2: Calculate the price ratio = token1/token0 using precise big-number math
                const formattedSqrtPricex96 = ethers.ethers.BigNumber.from(sqrtPriceX96);
                const Q96 = ethers.ethers.BigNumber.from("79228162514264337593543950336");
                const numerator = formattedSqrtPricex96
                    .mul(formattedSqrtPricex96)
                    .mul(ethers.ethers.BigNumber.from(10).pow(decimals0));
                const denominator = Q96.mul(Q96).mul(ethers.ethers.BigNumber.from(10).pow(decimals1));
                const ratioBN = numerator.div(denominator);
                const remainder = numerator.mod(denominator);
                const decimalsWanted = 8;
                const scaleFactor = ethers.ethers.BigNumber.from(10).pow(decimalsWanted);
                const remainderScaled = remainder.mul(scaleFactor).div(denominator);
                const ratioFloat = parseFloat(ratioBN.toString()) +
                    parseFloat(remainderScaled.toString()) / Math.pow(10, decimalsWanted);
                // 3: Determine which token is in the pool and calculate the token price
                let tokenRatio;
                if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                    tokenRatio = ratioFloat;
                }
                else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                    tokenRatio = 1 / ratioFloat;
                }
                else {
                    throw new Error(`CryptoModule.getPriceV3: Neither token is ${pair}`);
                }
                // 4: Fetch the ETH price in USD
                const chainlinkResult = await this.getPriceFeed(pair);
                if (!chainlinkResult)
                    return null;
                // 5: Convert token price from WETH to USD
                const tokenPriceUSD = tokenRatio * parseFloat(chainlinkResult);
                sypher.log(`V3 Price for token in pool ${sypher.truncate(poolAddress)}: $${tokenPriceUSD}`);
                return { price: tokenPriceUSD, details: v3Detail };
            }
            catch (error) {
                throw new Error(`CryptoModule.getPriceV3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getPoolV3: async function (chain, contractAddress, poolAddress) {
            if (!chain) {
                throw new Error("CryptoModule.getPoolV3: Chain is required");
            }
            if (!contractAddress) {
                throw new Error("CryptoModule.getPoolV3: Contract address is required");
            }
            if (!contractAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPoolV3: Invalid contract address");
            }
            if (!poolAddress) {
                throw new Error("CryptoModule.getPoolV3: Pool address is required");
            }
            if (!poolAddress.match(ADDRESS_REGEXP)) {
                throw new Error("CryptoModule.getPoolV3: Invalid pool address");
            }
            try {
                const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
                if (!chainId) {
                    return null;
                }
                let account = this._connected;
                if (account === null || account === undefined) {
                    const connection = await this.connect(chain);
                    if (!connection) {
                        return null;
                    }
                    account = connection.primaryAccount;
                }
                if (!account) {
                    return null;
                }
                let provider = this._EIP6963?.provider;
                if (!provider) {
                    provider = this.getProvider();
                }
                const web3 = new ethers.ethers.providers.Web3Provider(provider);
                const signer = web3.getSigner();
                const pool = new ethers.ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, signer);
                const slot0 = await pool.slot0();
                const sqrtPriceX96 = slot0.sqrtPriceX96;
                sypher.log("Sqrt Price X96:", sqrtPriceX96);
                const token0 = await pool.token0();
                const token1 = await pool.token1();
                sypher.log("Token 0:", token0);
                sypher.log("Token 1:", token1);
                const token0Contract = new ethers.ethers.Contract(token0, ERC20_ABI, signer);
                const token1Contract = new ethers.ethers.Contract(token1, ERC20_ABI, signer);
                const decimals0 = await token0Contract.decimals();
                const decimals1 = await token1Contract.decimals();
                sypher.log("Decimals 0:", decimals0);
                sypher.log("Decimals 1:", decimals1);
                const liquidity = await pool.liquidity();
                sypher.log("Liquidity:", liquidity);
                const poolData = { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity };
                return poolData;
            }
            catch (error) {
                throw new Error(`CryptoModule.getPoolV3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        getUserValue: function (balance, price) {
            if (!balance) {
                throw new Error("CryptoModule.getUserValue: Balance is required");
            }
            if (!price) {
                throw new Error("CryptoModule.getUserValue: Price is required");
            }
            if (typeof balance !== "object") {
                throw new Error("CryptoModule.getUserValue: Invalid balance");
            }
            if (typeof price !== "number") {
                throw new Error("CryptoModule.getUserValue: Invalid price");
            }
            try {
                const value = parseFloat(balance.toString()) * parseFloat(price.toString());
                sypher.log(`User Value: ${value}`);
                return value;
            }
            catch (error) {
                throw new Error(`CryptoModule.getUserValue: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        },
        clean: function (details) {
            if (!details) {
                throw new Error("CryptoModule.clean: Token details are required");
            }
            const cleanedDetails = {
                user: {
                    address: details.address,
                    ens: details.ens,
                    ethBalance: details.ethBalance,
                    tokenBalance: parseFloat(ethers.ethers.utils.formatUnits(details.balance, details.decimals)),
                    value: (parseFloat(details.userValue.toString()) / Math.pow(10, details.decimals)).toFixed(details.decimals).toString()
                },
                token: {
                    address: details.contractAddress,
                    poolAddress: details.poolAddress,
                    pairAddress: details.pairAddress,
                    decimals: details.decimals,
                    name: details.name,
                    symbol: details.symbol,
                    icon: details.icon,
                    totalSupply: parseFloat(ethers.ethers.utils.formatUnits(details.totalSupply, details.decimals)),
                    price: parseFloat(details.tokenPrice.toString()),
                    version: details.version,
                    pair: details.pair,
                    v2Detail: details.v2Detail,
                    v3Detail: details.v3Detail
                }
            };
            for (const key in cleanedDetails.user) {
                if (cleanedDetails.user[key] === undefined) {
                    delete cleanedDetails.user[key];
                }
            }
            for (const key in cleanedDetails.token) {
                if (cleanedDetails.token[key] === undefined) {
                    delete cleanedDetails.token[key];
                }
            }
            this._details = cleanedDetails;
            sypher.log("Cleaned Details:", cleanedDetails);
            return cleanedDetails;
        },
        getCleaned: function () {
            return this._details ?? null;
        },
        initProviderSearch: function () {
            window.addEventListener("eip6963:announceProvider", (event) => {
                const customEvent = event;
                DISCOVERED_PROVIDERS.push(customEvent.detail);
                sypher.log("[EIP-6963] Provider Announced:", (customEvent.detail.info.name));
            });
            window.dispatchEvent(new Event("eip6963:requestProvider"));
        },
        initPublicProviders: async function () {
            for (const rpc of MAINNET_RPCS) {
                try {
                    const provider = new ethers.ethers.providers.JsonRpcProvider(rpc);
                    await provider.getBlockNumber(); // Quick test to see if the provider is working
                    sypher.log(`[Public RPC]: ${rpc}`);
                    if (!this._publicProviders) {
                        this._publicProviders = [];
                    }
                    this._publicProviders.push(provider);
                }
                catch (error) {
                    console.warn(`[Public RPC Failed]: ${rpc} - ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        getProvider: async function (isPublic = false) {
            if (isPublic) {
                if (!this._publicProviders) {
                    await this.initPublicProviders();
                }
                const workingProviders = this._publicProviders;
                return workingProviders;
            }
            else {
                if (this._EIP6963) {
                    sypher.log("[EIP6963] Stored Provider: ", this._EIP6963.provider);
                    return this._EIP6963.provider;
                }
                if (typeof window === "undefined" || !window.ethereum) {
                    throw new Error("CryptoModule.getProvider: No Ethereum provider found.");
                }
                sypher.log("[WINDOW]:", window.ethereum);
                return window.ethereum;
            }
        },
        getProviderDetail: function () {
            if (this._EIP6963) {
                return this._EIP6963;
            }
            else {
                throw new Error("CryptoModule.getProviderDetail: No provider details found.");
            }
        },
        getConnected() {
            return this._connected ?? null;
        },
        flush: function () {
            if (this._connected === null || this._connected === undefined) {
                sypher.log("Nothing to flush...");
                return;
            }
            this._connected = undefined;
            this._details = undefined;
            this._pairPrice = undefined;
            this._ethBalance = undefined;
            this._ens = undefined;
            this._isLoading = false;
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            provider.removeAllListeners("accountsChanged");
            const button = document.getElementById("connect-button");
            const txt = sypher.getUI().connectText;
            if (button) {
                button.innerHTML = txt;
            }
            const currentProv = document.getElementById("current-provider-container");
            if (currentProv) {
                currentProv.style.display = "none";
            }
        }
    };

    const PrefsModule = {
        _prefs: {
            interface: {
                theme: "custom",
                button: {}
            },
            crypto: {},
            dev: {
                logs: {
                    enabled: false,
                    modal: false
                }
            }
        },
        _cache: {
            user: {
                environment: {}
            }
        },
        init: function (params) {
            this._prefs = params;
            if (params.dev?.logs?.modal) {
                if (!params.dev.logs.enabled) {
                    console.warn('Cannot create a log modal when logs are disabled.');
                }
                else {
                    sypher.createModal({
                        append: document.body,
                        type: "log",
                        theme: params.interface.theme
                    });
                }
            }
            if (params.interface.theme === "none") {
                params.interface.theme = 'custom';
            }
            sypher.initTheme(params.interface.theme);
            if (params.crypto) {
                sypher.initPublicProviders();
            }
            if (params.interface.button) {
                const buttonParams = {
                    ...params.interface.button,
                    ...(params.crypto && { initCrypto: params.crypto })
                };
                sypher.createButton(buttonParams);
            }
            this._cache = {
                user: { environment: sypher.userEnvironment() }
            };
        },
        prefs: function () {
            const prefs = this._prefs;
            if (!prefs) {
                throw new Error('User preferences have not been initialized.');
            }
            return prefs;
        },
        cache: function () {
            const cache = this._cache;
            if (!cache) {
                throw new Error('User cache has not been initialized.');
            }
            return cache;
        }
    };

    const version = "1.0.0";
    const website = "https://sypher.tools";
    const repo = "https://github.com/Tukyo/sypher-tools";
    (function (global) {
        const sypher = {
            ...PrefsModule,
            ...CryptoModule,
            ...HelperModule,
            ...LogModule,
            ...InterfaceModule,
            ...ViewsModule,
            ...TruncationModule,
            ...WindowModule,
        };
        global.sypher = sypher;
        const info = console.info.bind(console);
        const styles = [
            "color: #fff",
            "background: linear-gradient(45deg, #ff0066, #6600ff)",
            "font-size: 12px",
            "font-weight: bold",
            "padding: 5px 10px",
            "border-radius: 5px",
            "text-shadow: 1px 1px 3px rgba(0,0,0,0.3)"
        ].join(";");
        function brandLog() {
            console.groupCollapsed("%cSypher Initialized", styles);
            info(`🔗 Website: ${website}`);
            info(`📖 Repo: ${repo}`);
            info(`⚙️ Version: ${version}`);
            console.groupEnd();
        }
        setTimeout(brandLog, 0);
    })(window);

    exports.repo = repo;
    exports.version = version;
    exports.website = website;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=sypher.umd.js.map
