import { LikeStatus } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';

export const LIKE_STATUSES_REG_EXP = new RegExp(Object.values(LikeStatus).join('|'));
