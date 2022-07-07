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
});
