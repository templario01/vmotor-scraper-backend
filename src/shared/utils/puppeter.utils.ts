import { Environment } from '../../config/dtos/config.dto';
import { PuppeteerLaunchOptions } from 'puppeteer';

export const getLaunchOptions = (
  environment: Environment,
  proxy = [],
): PuppeteerLaunchOptions => ({
  args: ['--single-proces', '--no-sandbox', '--no-zygote', ...proxy],
  ...(environment === Environment.PROD && {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  }),
  headless: true,
});
