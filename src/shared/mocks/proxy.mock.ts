import {
  randAwsRegion,
  randBetweenDate,
  randBoolean,
  randCity,
  randCountry,
  randCountryCode,
  randIp,
  randLatitude,
  randLongitude,
  randPort,
  randTimeZone,
  randUrl,
  randUuid,
  randWord,
  randZipCode,
} from '@ngneat/falso';
import { EphemeralProxyResponse } from '../../application/proxy/dtos/ephemeral-proxy.response';
import { Proxy } from '../../application/proxy/dtos/proxy.dto';

export const buildProxyResponse = (): Proxy => ({ host: randIp(), port: randPort() });

export const buildeEphemeralProxyResponse = (): EphemeralProxyResponse => ({
  proxy: {
    expires_at: randBetweenDate({ from: new Date('10/07/2020'), to: new Date() }),
    host: randUrl(),
    id: randUuid(),
    port: randPort(),
    whitelisted_ips: randIp({ length: 3 }),
    features: {
      static: randBoolean(),
      supported_protocols: {
        http: randBoolean(),
        https: randBoolean(),
        socks4: randBoolean(),
        socks5: randBoolean(),
      },
      type: 'datacenter',
    },
    visibility: {
      asn: randWord(),
      asn_org: randWord(),
      city: randCity(),
      country: randCountry(),
      country_eu: randBoolean(),
      country_iso: randCountryCode(),
      ip: randIp(),
      latitude: randLatitude(),
      longitude: randLongitude(),
      region_code: randCountryCode(),
      region_name: randAwsRegion(),
      timezone: randTimeZone(),
      zip_code: randZipCode(),
    },
  },
  success: randBoolean(),
});
