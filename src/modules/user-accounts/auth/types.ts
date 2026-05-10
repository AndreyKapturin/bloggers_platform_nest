export type JwtAccessTokenSignPayload = {
  userId: string;
};

export type JwtAccessTokenDecodedPayload = JwtAccessTokenSignPayload;

export type JwtRefreshTokenSignPayload = {
  userId: string;
  deviceId: string;
};

export type JwtRefreshTokenDecodedPayload = JwtRefreshTokenSignPayload & {
  exp: number;
  iat: number;
};
