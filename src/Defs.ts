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
  redirectedTo?: string;
  checkedAt: number;
  reason?: string;
};


export type Resource = HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
export type ResourceType = "image" | "audio" | "video";
export interface ResourceEntry {
  key: string;
  src: string;
  type: ResourceType;
}