import { LikeStatus } from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';

export const LIKE_STATUSES_REG_EXP = new RegExp(Object.values(LikeStatus).join('|'));
export const DATE_ISO_STRING_REGEXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
