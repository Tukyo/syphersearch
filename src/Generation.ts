/* 
═════════════╗
| GENERATION
═════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Handles URL generation and preprocessing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { sessionResults } from "./Cache";
import { SEARCH_PREFS, RANDOM_MODE, DEBUG, CHARACTERS, STATE } from "./Config";
import { dict } from "./dict/Dictionary";
import { SYLLABLES, CLUSTERS, PATTERNS } from "./GenerationConfig";
import { ui } from "./Interface";
import { getSelectedFilters, getWordList } from "./Main";
import { randomInt, randomString } from "./Utils";

// #region > Custom Word <
//
// ━━━━┛ ▼ ┗━━━━
function getCustomWord(): string | null {
  const input = ui.customInput as HTMLInputElement;
  const word = input?.value.trim();

  if (DEBUG.ENABLED && word) {
    console.log(`Getting custom word: ${word}`);
  }

  return word ? word.toLowerCase() : null;
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Custom Word ^
//
// --ι══════════════ι--
//
// #region > Generation <
//
// ━━━━┛ ▼ ┗━━━━
export function generateRandomURL(domain: string): string {
  const selected = getSelectedFilters();
  const filterSelections = selected.filter(([group]) => group in dict);
  const length = randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX);

  let randPart = "";

  if (filterSelections.length === 0) {
    // fallback
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
    // build from selected filters
    const parts: string[] = [];
    for (const [group, key] of selected) {
      const entry = dict[group][key];
      const wordList = getWordList(entry);

      if (wordList.length > 0) {
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        parts.push(word.toLowerCase());

        if (DEBUG.ENABLED && !DEBUG.QUIET) {
          console.log(`[${group}.${key}] → Sample: "${word}" (${wordList.length} words)`);
        }
      } else if (DEBUG.ENABLED) {
        console.warn(`[${group}.${key}] → No usable word list.`);
      }
    }

    let joined = parts.join("");

    // Enforce max length from selected parts
    if (joined.length > length) {
      joined = joined.slice(0, length);
    }

    // Try to fill remaining space if under max
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

  let customWord: string | null = null;
  if (STATE.PREMIUM) {
    customWord = getCustomWord(); // Check for custom word
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

  // 🔁 Ensure this URL hasn't been searched before in session
  let maxRetries = 5;
  while (sessionResults.has(finalUrl) && maxRetries-- > 0) {
    randPart = SEARCH_PREFS.CUSTOM.RANDOM
      ? randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX))
      : generateSyllables(randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX));

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
function generateSyllables(maxLength: number): string {
  let word = "";
  const minLength = SEARCH_PREFS.CUSTOM.LENGTH.MIN;
  const usedSyllables = new Set<string>();

  while (word.length < maxLength && word.length < minLength + 4) {
    const validSyllables = SYLLABLES.filter(syl =>
      syl.pattern.length <= (maxLength - word.length) &&
      !usedSyllables.has(syl.pattern)
    );

    if (validSyllables.length === 0) break;

    // Weighted selection
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

  // Pad with vowels if still too short
  if (word.length < minLength) {
    const vowels = CHARACTERS.CHARACTER_TYPE.VOWELS;
    while (word.length < minLength) {
      word += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }

  return word.slice(0, maxLength);
}
function generatePhoneticWord(maxLength: number): string {
  const vowels = CHARACTERS.CHARACTER_TYPE.VOWELS;
  const consonants = CHARACTERS.CHARACTER_TYPE.CONSONANTS;
  const minLength = SEARCH_PREFS.CUSTOM.LENGTH.MIN;

  // Chance to use cluster-based generation
  if (Math.random() < SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE) {
    return generateWithClusters(maxLength, minLength);
  }

  // Chance to use pattern-based generation with cluster enhancements
  return generateWithEnhancedPatterns(maxLength, minLength, vowels, consonants);
}
function generateWithClusters(maxLength: number, minLength: number): string {
  let word = "";
  const usedClusters = new Set<string>();

  while (word.length < maxLength && word.length < minLength + 4) {
    // Get valid clusters that fit
    const validCombos = CLUSTERS.filter(combo =>
      combo.pattern.length <= (maxLength - word.length) &&
      !usedClusters.has(combo.pattern)
    );

    if (validCombos.length === 0) break;

    // Weighted selection
    const totalWeight = validCombos.reduce((sum, c) => sum + c.weight, 0);
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

  // Ensure minimum length
  while (word.length < minLength) {
    const vowels = CHARACTERS.CHARACTER_TYPE.VOWELS;
    word += vowels[Math.floor(Math.random() * vowels.length)];
  }

  return word.slice(0, maxLength);
}
function generateWithEnhancedPatterns(maxLength: number, minLength: number, vowels: string, consonants: string): string {
  // Filter valid patterns
  const validPatterns = PATTERNS.filter(p =>
    p.pattern.length >= minLength && p.pattern.length <= maxLength
  );

  if (validPatterns.length === 0) {
    return generateFallbackPattern(maxLength, minLength, vowels, consonants);
  }

  // Select pattern using weights
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
function buildEnhancedWordFromPattern(pattern: string, vowels: string, consonants: string): string {
  let word = "";

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const nextChar = pattern[i + 1];

    if (char === 'c') {
      // 20% chance to use a common cluster if it fits the pattern
      if (nextChar && Math.random() < 0.2) {
        const validCombos = CLUSTERS.filter(combo =>
          combo.pattern.length === 2 &&
          i + 1 < pattern.length &&
          ((char === 'c' && nextChar === 'c') ||
            (char === 'c' && nextChar === 'v'))
        );

        if (validCombos.length > 0) {
          const combo = validCombos[Math.floor(Math.random() * validCombos.length)];
          word += combo.pattern;
          i++; // Skip next character since we used a 2-char cluster
          continue;
        }
      }

      word += consonants[Math.floor(Math.random() * consonants.length)];
    } else if (char === 'v') {
      // 15% chance to use vowel clusters
      if (nextChar === 'v' && Math.random() < 0.15) {
        const vowelCombos = CLUSTERS.filter(combo =>
          combo.pattern.length === 2 &&
          /^[aeiou]{2}$/.test(combo.pattern)
        );

        if (vowelCombos.length > 0) {
          const combo = vowelCombos[Math.floor(Math.random() * vowelCombos.length)];
          word += combo.pattern;
          i++; // Skip next character
          continue;
        }
      }

      word += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }

  return word;
}
function generateFallbackPattern(maxLength: number, minLength: number, vowels: string, consonants: string): string {
  let pattern = "";
  let useConsonant = true;

  for (let i = 0; i < Math.min(maxLength, Math.max(minLength, 4)); i++) {
    pattern += useConsonant ? "c" : "v";
    useConsonant = !useConsonant;
  }

  return buildEnhancedWordFromPattern(pattern, vowels, consonants);
}
function insertWordRandomly(base: string, word: string): string {
  const pos = randomInt(0, base.length);
  return base.slice(0, pos) + word + base.slice(pos);
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Generation ^