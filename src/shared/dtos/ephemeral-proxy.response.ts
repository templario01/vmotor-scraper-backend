interface SupportedProtocols {
  readonly socks4: boolean;
  readonly socks5: boolean;
  readonly http: boolean;
  readonly https: boolean;
}

interface Features {
  readonly static: boolean;
  readonly type: 'datacenter' | 'residential';
  readonly supported_protocols: SupportedProtocols;
}

interface Visibility {
  readonly ip: string;
  readonly country: string;
  readonly country_iso: string;
  readonly country_eu: false;
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone: string;
  readonly asn: string;
  readonly asn_org: string;
  readonly zip_code: string;
  readonly region_name: string;
  readonly region_code: string;
  readonly city: string;
}
export interface Proxy {
  readonly id: string;
  readonly host: string;
  readonly port: number;
  readonly expires_at: Date;
  readonly whitelisted_ips: string[];
  readonly visibility: Visibility;
  readonly features: Features;
}
export interface EphemeralProxyResponse {
  readonly success: boolean;
  readonly proxy: Proxy;
}
