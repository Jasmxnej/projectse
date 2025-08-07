module.exports = {
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'suparuthong0808',
    database: process.env.DB_DATABASE || 'tripplanners'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret'
  },
  amadeus: {
    clientId: process.env.AMADEUS_CLIENT_ID || 'qOKjln8m74nBo9P4wtXeqe67K91Oz2V7',
    clientSecret: process.env.AMADEUS_CLIENT_SECRET || 'lGbaXcM1vdkIY243'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY
  },
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY || 'fc-ArSt0D1zg7mPII2gpxeWtGMxxdPi_DzcrGuIoVl8'
  }
};