/* 
═════════════════════╗
| GENERATION CONFIG
═════════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Configuration details for word generation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// #region > Generation <
//
// ━━━━┛ ▼ ┗━━━━
export const PATTERNS = [
    // Short patterns (3-5 chars)
    { pattern: "cvc", weight: 15 }, //cat, dog, sun
    { pattern: "cvcc", weight: 12 }, //hand, wolf, park
    { pattern: "ccvc", weight: 8 }, //stop, plan, true
    { pattern: "cvcv", weight: 10 }, //hero, data, baby
    { pattern: "vcv", weight: 6 }, //age, ice, eye
    { pattern: "vcc", weight: 5 }, //and, end, old
    { pattern: "ccv", weight: 4 }, //sky, try, fly
    { pattern: "vccv", weight: 6 }, //also, into, open
    { pattern: "cvv", weight: 4 }, //sea, tea, zoo
    { pattern: "ccvv", weight: 3 }, //blue, true, free

    // Medium patterns (4-7 chars)
    { pattern: "cvcvc", weight: 20 }, //basic, magic, music
    { pattern: "cvccv", weight: 15 }, //apple, simple, table
    { pattern: "ccvcv", weight: 8 }, //drama, price, place
    { pattern: "cvcvv", weight: 5 }, //video, radio, piano
    { pattern: "vccvc", weight: 6 }, //under, after, other
    { pattern: "vcvcv", weight: 7 }, //again, above, about
    { pattern: "ccvcc", weight: 6 }, //block, plant, front
    { pattern: "cvccc", weight: 4 }, //world, first, worst
    { pattern: "ccccv", weight: 2 }, //street, strong
    { pattern: "vcvcc", weight: 5 }, //event, actor, order
    { pattern: "cvcvcc", weight: 8 }, //better, center, winter
    { pattern: "cvccvc", weight: 10 }, //market, garden, person

    // Longer patterns (6+ chars)
    { pattern: "cvcvcv", weight: 12 }, //banana, camera, canada
    { pattern: "cvccvcv", weight: 5 }, //fantastic, calendar
    { pattern: "cvcvcvc", weight: 8 }, //america, develop, computer
    { pattern: "vcvcvc", weight: 6 }, //elephant, umbrella
    { pattern: "cvcvcvv", weight: 4 }, //dangerous, beautiful
    { pattern: "ccvcvcv", weight: 5 }, //traveling, different
    { pattern: "vcvccvc", weight: 4 }, //important, understand
    { pattern: "cvcvccv", weight: 4 }, //remember, september
    { pattern: "ccvcvcc", weight: 3 }, //progress, connect
    { pattern: "cvcvcvcv", weight: 6 }, //absolutely, television
    { pattern: "vcvcvcv", weight: 4 }, //economy, democracy
    { pattern: "ccvcvcvc", weight: 3 }, //practical, specific
    { pattern: "cvcccvc", weight: 3 }, //children, standard
    { pattern: "cvccvcvc", weight: 4 }, //wonderful, political
    { pattern: "vcvcvcvc", weight: 3 }, //helicopter, refrigerator

    // Extra long patterns (8+ chars)
    { pattern: "cvcvcvcvc", weight: 3 }, //communication, organization
    { pattern: "ccvcvcvcv", weight: 2 }, //representative
    { pattern: "cvcvcvcvcv", weight: 2 }, //responsibility
    { pattern: "vcvcvcvcv", weight: 2 }, //international
]
export const CLUSTERS = [
    // Common consonant clusters
    { pattern: "th", weight: 25 }, //the, think, both
    { pattern: "st", weight: 20 }, //stop, best, first
    { pattern: "ch", weight: 18 }, //child, much, beach
    { pattern: "sh", weight: 15 }, //show, fish, wish
    { pattern: "ng", weight: 15 }, //sing, long, thing
    { pattern: "nt", weight: 12 }, //want, front, point
    { pattern: "nd", weight: 12 }, //hand, kind, around
    { pattern: "ck", weight: 10 }, //back, check, quick
    { pattern: "ll", weight: 10 }, //call, well, tell
    { pattern: "ss", weight: 8 }, //class, less, kiss
    { pattern: "tt", weight: 6 }, //better, letter, little
    { pattern: "pp", weight: 5 }, //happy, apple, pepper
    { pattern: "ff", weight: 5 }, //off, stuff, coffee
    { pattern: "mm", weight: 4 }, //summer, hammer, common
    { pattern: "nn", weight: 4 }, //funny, dinner, cannot
    { pattern: "rr", weight: 3 }, //sorry, carry, mirror
    { pattern: "dd", weight: 3 }, //add, middle, sudden
    { pattern: "bb", weight: 2 }, //rabbit, hobby, bubble
    { pattern: "gg", weight: 2 }, //bigger, egg,agger

    // Common vowel clusters
    { pattern: "ee", weight: 12 }, //see, tree, free
    { pattern: "oo", weight: 10 }, //book, good, food
    { pattern: "ea", weight: 8 }, //sea, read, beach
    { pattern: "ou", weight: 8 }, //house, about, mouth
    { pattern: "ai", weight: 6 }, //main, rain, again
    { pattern: "ie", weight: 6 }, //piece, field, believe
    { pattern: "ue", weight: 4 }, //blue, true, value
    { pattern: "oa", weight: 4 }, //boat, road, soap
    { pattern: "au", weight: 3 }, //because, caught, laugh
    { pattern: "ei", weight: 3 }, //receive, eight, weight

    // Common consonant-vowel clusters
    { pattern: "er", weight: 20 }, //water, after, other
    { pattern: "re", weight: 15 }, //more, here, where
    { pattern: "or", weight: 12 }, //for, work, word
    { pattern: "ar", weight: 10 }, //car, part, start
    { pattern: "le", weight: 10 }, //table, people, little
    { pattern: "en", weight: 8 }, //when, then, open
    { pattern: "an", weight: 8 }, //man, can, plan
    { pattern: "on", weight: 6 }, //on, long, front
    { pattern: "in", weight: 6 }, //in, thing, begin
    { pattern: "al", weight: 6 }, //all, also, small
    { pattern: "ed", weight: 6 }, //asked, worked, played
    { pattern: "es", weight: 6 }, //yes, goes, comes
    { pattern: "ly", weight: 5 }, //only, really, family
    { pattern: "ty", weight: 4 }, //city, party, empty
    { pattern: "ny", weight: 3 }, //any, many, funny
]
export const SYLLABLES = [
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
]
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Generation ^