export const DB_BLOG_CONSTRAINTS = {
  NAME_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 500,
  WEBSITE_URL_MAX_LENGTH: 100,
};

export type TBlogModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
};
