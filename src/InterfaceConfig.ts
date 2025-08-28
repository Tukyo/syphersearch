/* 
════════════════════╗
| INTERFACE CONFIG
════════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Stores configuration details for the interface.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { SEARCH_PREFS } from "./Config"

// #region > Interface <
//
// ━━━━┛ ▼ ┗━━━━
export const ICON = {
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
}
export const SEARCH_TEXT = {
    // 🌍 Latin-based
    ENGLISH: "Search",
    SPANISH: "Buscar",
    FRENCH: "Chercher",
    GERMAN: "Suchen",
    ITALIAN: "Cercare",
    PORTUGUESE: "Procurar",
    DUTCH: "Zoeken",
    SWEDISH: "Sök",
    NORWEGIAN: "Søk",
    DANISH: "Søg",
    FINNISH: "Hae",
    POLISH: "Szukaj",
    CZECH: "Hledat",
    SLOVAK: "Hľadať",
    HUNGARIAN: "Keresés",
    ROMANIAN: "Căutare",
    CROATIAN: "Pretraži",
    SERBIAN_LATIN: "Pretraga",
    BOSNIAN: "Pretraga",
    SLOVENIAN: "Iskanje",
    ICELANDIC: "Leita",
    MALAY: "Cari",
    INDONESIAN: "Cari",
    FILIPINO: "Maghanap",
    ESPERANTO: "Serĉi",

    // 🔠 Greek
    GREEK: "Αναζήτηση",

    // 🔡 Cyrillic
    RUSSIAN: "Поиск",
    UKRAINIAN: "Пошук",
    BELARUSIAN: "Пошук",
    BULGARIAN: "Търсене",
    SERBIAN_CYRILLIC: "Претрага",
    MACEDONIAN: "Пребарување",
    MONGOLIAN_CYRILLIC: "Хайх",

    // 🌏 CJK & Asian scripts
    JAPANESE: "検索",
    CHINESE_SIMPLIFIED: "搜索",
    CHINESE_TRADITIONAL: "搜尋",
    KOREAN: "검색",
    THAI: "ค้นหา",
    VIETNAMESE: "Tìm kiếm",
    KHMER: "ស្វែងរក",
    LAO: "ຄົ້ນຫາ",

    // 🕋 Arabic & RTL
    ARABIC: "بحث",
    PERSIAN: "جستجو",
    URDU: "تلاش",
    PASHTO: "لټون",

    // 🇮🇳 Indic scripts
    HINDI: "खोज",
    BENGALI: "অনুসন্ধান",
    TAMIL: "தேடல்",
    TELUGU: "శోధన",
    KANNADA: "ಹುಡುಕಿ",
    MALAYALAM: "തിരയുക",
    MARATHI: "शोधा",
    GUJARATI: "શોધો",
    PUNJABI: "ਖੋਜ",

    // ✡ Hebrew
    HEBREW: "חיפוש",

    // 🏝 Pacific & others
    MAORI: "Rapua",
    SAMOAN: "Saili",
    TONGAN: "Kumi",
    HAWAIIAN: "Huli"
};
export const INTERFACE = {
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
            HTML: `<h3>tehe</h3>`, // Creates light blur effect
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
            ID: " ", // Generate dynamically
            CLASS: "result",
            APPEND: " ", // Apply dynamically
            RESULT: {
                TYPE: "div",
                ID: " ", // Apply dynamically
                CLASS: "container",
                APPEND: " ", // Dynamically apend to parent
                FAVORITE_CONTAINER: {
                    TYPE: "div",
                    ID: " ", // Generate dynamically
                    CLASS: "container favorite_icon",
                    APPEND: " ", // Append dynamically to the Result Container
                    ICON: {
                        TYPE: "div",
                        ID: " ", // Generate dynamically
                        CLASS: "result-icon favorite_icon",
                        HTML: ICON.FAVORITE.SVG,
                        APPEND: " " // Append to parent container
                    }
                },
                TRASH_CONTAINER: {
                    TYPE: "div",
                    ID: " ", // Generate dynamically
                    CLASS: "container trash_icon",
                    APPEND: " ", // Append dynamically to the Result Container
                    ICON: {
                        TYPE: "div",
                        ID: " ", // Generate dynamically
                        CLASS: "result-icon trash_icon",
                        HTML: ICON.TRASH.SVG,
                        APPEND: " " // Append to parent container
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
            ID: " ", // Apply dynamically
            CLASS: "category",
            APPEND: "filters"
        },
        FILTER_CONTAINTERS: {
            TYPE: "div",
            ID: " ",  // Apply dynamically
            CLASS: "filters",
            APPEND: " "  // Apply dynamically
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
                APPEND: "insert_container",
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
            ID: " ", // Apply dynamically
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
            ID: " ", // Apply dynamically
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
            ID: " ", // Apply dynamically
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
                            MAX: 100000,
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
                            MIN: 100, // 1 second
                            MAX: 60000, // 1 minute
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
                            MAX: 1000,
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
                            MIN: 100, // 0.1 second
                            MAX: 30000, // 30 seconds
                            VALUE: SEARCH_PREFS.LIMITS.TIMEOUT,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.TIMEOUT),
                            AUDIO: { CLICK: true },
                            APPEND: "timeout_limit_input_container"
                        }
                    }
                },
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
                            MIN: 1000, // 1 second
                            MAX: 30000, // 30 seconds
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
                },
            },
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
                TEXT: " ", // Apply dynamically
                APPEND: "filters"
            }
        }
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Interface ^