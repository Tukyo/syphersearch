export type Interface = Record<string, HTMLElement>;

export type UIConfig = {
  premium?: boolean;
  type: string;
  id?: string;
  class?: string;
  text?: string;
  placeholder?: string;
  tooltip?: string;
  html?: string;
  append?: string;
  audio?: {
    hover?: boolean;
    click?: boolean;
  };
  limits?: string;
  min?: number;
  max?: number;
};

export type SessionResult = {
  url: string;
  valid: boolean;
  status?: number;
  timeStamp: number;
  reason?: string;
};

export type CleanResults = {
  url: string;
  valid: boolean;
  timestamp: number;
}

export type DBResult = {
  discovery: {
    timestamp: number; // Unix ms of when the URL was discovered
    uid: string; // Wallet address of the user who discovered the URL originally
    ens?: string; // Optional ENS name of the discoverer
  };
  favorites: string[]; // Array of user wallets who favorited the URL
}

export type DBUser = {
  created: number; // Unix timestamp of when the user was created
  discoveries?: string[]; // Array of URLs discovered by the user
  ens?: string | null; // Optional ENS name to be recorded in DB
  favorites: string[]; // Array of URLs favorited by the user
  karma: number; // User's karma
  trash: string[]; // Array of valid URLs deleted by the user
}

export type GlobalResult = {
  doc: string;
  url: string;
  discoverer: string;
  discoveredOn: string;
  karma: number;
}

export type Resource = HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
export type ResourceType = "image" | "audio" | "video";
export interface ResourceEntry {
  key: string;
  src: string;
  type: ResourceType;
}