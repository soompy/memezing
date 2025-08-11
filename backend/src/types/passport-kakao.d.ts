declare module 'passport-kakao' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface StrategyOptions {
    clientID: string;
    callbackURL: string;
    clientSecret?: string;
  }

  export interface Profile {
    id: string;
    _json: {
      kakao_account?: {
        email?: string;
        profile?: {
          nickname?: string;
          profile_image_url?: string;
        };
      };
    };
  }

  export type VerifyCallback = (err?: Error | null, user?: any, info?: any) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
  }
}