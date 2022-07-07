@app
twitterlingo-895b

@http
/*
  method any
  src server

@static

@tables
user
  pk *String

password
  pk *String # userId

translation
  pk *String  # userId
  sk **String # bookmarkId
