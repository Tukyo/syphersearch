export type Interface = Record<string, HTMLElement>;

export type UIConfig = {
    type: string;
    id?: string;
    class?: string;
    text?: string;
    placeholder?: string;
    tooltip?: string;
    html?: string;
    append?: string;
};

export type SessionResult = {
  url: string;
  valid: boolean;
  status?: number;
  redirectedTo?: string;
  checkedAt: number;
  reason?: string;
};