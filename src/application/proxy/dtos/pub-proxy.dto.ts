interface Support {
  readonly https: number;
  readonly get: number;
  readonly post: number;
  readonly cookies: number;
  readonly referer: number;
  readonly user_agent: number;
  readonly google: number;
}

export interface PubProxy {
  readonly ipPort: string;
  readonly ip: string;
  readonly port: string;
  readonly country: string;
  readonly last_checked: string;
  readonly proxy_level: string;
  readonly type: string;
  readonly speed: string;
  readonly support: Support;
}

export interface PubProxyResponse {
  readonly data: PubProxy[];
  readonly count: number;
}
