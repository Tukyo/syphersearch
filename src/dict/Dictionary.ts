import human_authors from './human/authors.json';
import human_bodyparts from './human/bodyparts.json';
import materials_fabrics from './materials/fabrics.json';
import materials_metals from './materials/metals.json';
import music_genres from './music/genres.json';
import music_instruments from './music/instruments.json';
import nsfw_drugs from './nsfw/drugs.json';
import nsfw_explicit from './nsfw/explicit.json';
import nsfw_porn from './nsfw/porn.json';
import objects_clothing from './objects/clothing.json';
import objects_containers from './objects/containers.json';
import words_adverbs from './words/adverbs.json';
import words_common from './words/common.json';
import words_nouns from './words/nouns.json';
import words_prepositions from './words/prepositions.json';
import world_countries from './world/countries.json';
import world_governments from './world/governments.json';
import world_nationalities from './world/nationalities.json';

export const dict = {
  human: {
    authors: human_authors,
    bodyparts: human_bodyparts,
  },
  materials: {
    fabrics: materials_fabrics,
    metals: materials_metals,
  },
  music: {
    genres: music_genres,
    instruments: music_instruments,
  },
  nsfw: {
    drugs: nsfw_drugs,
    explicit: nsfw_explicit,
    porn: nsfw_porn,
  },
  objects: {
    clothing: objects_clothing,
    containers: objects_containers,
  },
  words: {
    adverbs: words_adverbs,
    common: words_common,
    nouns: words_nouns,
    prepositions: words_prepositions,
  },
  world: {
    countries: world_countries,
    governments: world_governments,
    nationalities: world_nationalities,
  },
} as const;

export type Dictionary = typeof dict;
