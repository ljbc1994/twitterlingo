import sanitizeTweet from "./sanitizeTweet";

describe("sanitizeTweet", () => {
  test("sanitize tweet with links", () => {
    expect(
      sanitizeTweet(
        "Imagine the challenge of trying to accurately simulate all the physics and mathematics of the fluid interactions seen here. Source: https://t.co/9mVD9ifd4J https://t.co/Ri80FnDEqT"
      )
    ).toEqual(
      "Imagine the challenge of trying to accurately simulate all the physics and mathematics of the fluid interactions seen here. Source:"
    );
  });

  test("sanitize greek tweet", () => {
    expect(
      sanitizeTweet("@NemesisGRE Προσοχή Νέμεσις ,από τα τουρκικά στα αγγλικά και μετά στα ελληνικά ,είναι πιο σωστό ,δεν το έχουμε αντιληφθεί ακόμα")
    ).toEqual('@NemesisGRE Προσοχή Νέμεσις ,από τα τουρκικά στα αγγλικά και μετά στα ελληνικά ,είναι πιο σωστό ,δεν το έχουμε αντιληφθεί ακόμα')
  })

  test('sanitize url', () => {
    expect(sanitizeTweet('c’est le moment de le redire que naruto est l’anime avec les meilleurs opening et ending https://t.co/mjQYDoCh4W'))
      .toEqual('c’est le moment de le redire que naruto est l’anime avec les meilleurs opening et ending')
  })
});
