export const USER_CONSTRAINTS = {
  LOGIN_MIN_LENGTH: 3,
  LOGIN_MAX_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
};

export type TUserModel = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  isConfirmed: boolean;
};
