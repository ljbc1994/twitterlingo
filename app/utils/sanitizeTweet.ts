function stripEmbeddedAnchors(str: string): string {
  return str.replace(/(?:https):\/\/[\n\S/"]+/gimu, " ");
}

function sanitizeTweet(tweet: string) {
  return stripEmbeddedAnchors(tweet).trim();
}

export default sanitizeTweet;
