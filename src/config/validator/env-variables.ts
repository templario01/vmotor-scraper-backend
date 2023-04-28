import * as Joi from 'joi';
import { StringSchema, NumberSchema } from 'joi';

export interface EnvVariablesConfig {
  readonly NEOAUTO_URL: StringSchema<string>;
  readonly MERCADOLIBRE_URL: StringSchema<string>;
  readonly PORT: NumberSchema<number>;
  readonly APP_HOST: StringSchema<string>;
  readonly EPHEMERAL_PROXIES_API: StringSchema<string>;
  readonly EPHEMERAL_PROXIES_HOST: StringSchema<string>;
  readonly CURRENCY_CONVERTER_API: StringSchema<string>;
  readonly CURRENCY_CONVERTER_HOST: StringSchema<string>;
  readonly RAPIDAPI_KEY: StringSchema<string>;
  readonly MAIL_SENDER: StringSchema<string>;
  readonly MAIL_PASSWORD: StringSchema<string>;
  readonly MAIL_PORT: NumberSchema<number>;
  readonly MAIL_HOST: StringSchema<string>;
  readonly PUB_PROXY_API: StringSchema<string>;
  readonly DEFAULT_EXCHANGE_RATE: NumberSchema<number>;
}

export const envVariablesConfig: EnvVariablesConfig = {
  NEOAUTO_URL: Joi.string().required(),
  MERCADOLIBRE_URL: Joi.string().required(),
  PORT: Joi.number().required(),
  APP_HOST: Joi.string().required(),
  EPHEMERAL_PROXIES_API: Joi.string().required(),
  EPHEMERAL_PROXIES_HOST: Joi.string().required(),
  CURRENCY_CONVERTER_API: Joi.string().required(),
  CURRENCY_CONVERTER_HOST: Joi.string().required(),
  RAPIDAPI_KEY: Joi.string().required(),
  MAIL_SENDER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_HOST: Joi.string().required(),
  PUB_PROXY_API: Joi.string().required(),
  DEFAULT_EXCHANGE_RATE: Joi.number().required(),
};
