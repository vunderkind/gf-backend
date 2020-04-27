let whitelist = ['https://angelsamong.us/', 'https://give.angelsamong.us/', 'https://angelspeople.glitch.me/']

if (process.env.ISPROD === "FALSE") {
  whitelist.push( "http://localhost:3000" );
}

module.exports = {
  cors: {
    origin: whitelist,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
}