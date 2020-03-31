const whitelist = ['http://localhost:3000', 'https://angelsamong.us/']

module.exports = {
  cors: {
    origin: whitelist,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
}