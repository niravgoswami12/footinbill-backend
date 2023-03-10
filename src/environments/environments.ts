const env = process.env;

export const environments = {
  port: Number(env.PORT || 3000),
  mongoUri: env.MONGO_URI,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  accessTokenExpiration: env.ACCESS_TOKEN_EXPIRATION,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: env.REFRESH_TOKEN_EXPIRATION,
  recoverCodeExpiration: Number(env.RECOVER_CODE_EXPIRATION),
};
