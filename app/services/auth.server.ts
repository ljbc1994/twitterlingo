// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { TwitterOAuth2Strategy } from "~/auth/TwitterOAuth2Strategy";
import type { User } from "~/models/user.server";
import { findOrCreateFromTwitter } from "~/models/user.server";
import { sessionStorage } from "~/services/session.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

const clientID = process.env.TWITTER_CONSUMER_KEY;
const clientSecret = process.env.TWITTER_CONSUMER_SECRET;
const baseUrl = process.env.WEBSITE_BASE_URL;

if (!clientID || !clientSecret) {
  throw new Error(
    "TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET must be provided"
  );
}

authenticator.use(
  new TwitterOAuth2Strategy(
    {
      authorizationURL: "https://twitter.com/i/oauth2/authorize",
      tokenURL: "https://api.twitter.com/2/oauth2/token",
      clientID,
      clientSecret,
      callbackURL: `${baseUrl}/login/callback`,
      scope: 'bookmark.read tweet.read users.read'
    },
    async ({ accessToken, refreshToken, profile }) => {
      return await findOrCreateFromTwitter({
        profile: profile,
        accessToken,
      });
    },
  ),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "twitter"
);
