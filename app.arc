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

note
  pk *String  # userId
  sk **String # noteId

translation
  pk *String  # userId
  sk **String # bookmarkId
