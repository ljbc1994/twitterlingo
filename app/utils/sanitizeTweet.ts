function stripNonAscii(str: string): string {
  return str.replace(
    /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
    ""
  );
}

function stripEmbeddedAnchors(str: string): string {
  return str.replace(/(?:https):\/\/[\n\S/"]+/gimu, " ");
}

function sanitizeTweet(tweet: string) {
  return stripNonAscii(stripEmbeddedAnchors(tweet)).trim();
}

export default sanitizeTweet;
