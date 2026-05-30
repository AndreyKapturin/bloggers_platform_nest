-- INIT
CREATE TYPE Reaction AS ENUM ('Like', 'Dislike', 'None');

-- Users
CREATE TABLE IF NOT EXISTS "users" (
	"id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
	"login" VARCHAR UNIQUE NOT NULL,
	"email" VARCHAR UNIQUE NOT NULL,
	"passwordHash" VARCHAR NOT NULL,
	"createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	"isConfirmed" BOOLEAN DEFAULT FALSE
);

INSERT INTO
	"users" ("login", "email", "passwordHash")
VALUES
	-- ('User 1', 'user_1@mail.ru', 'dsfsdfsdfsdfsdfadsfads');
	-- ('User 2', 'user_2@mail.ru', 'dsfsdfsdfsdfsdfadsfads');
	('User 3', 'user_3@mail.ru', 'dsfsdfsdfsdfsdfadsfads');

SELECT * FROM "users";

SELECT
	"id",
	"login",
	"email",
	"createdAt",
	"isConfirmed"
FROM
	"users"
WHERE
	"login" ILIKE '%EUmOnMba1Z%'
	OR "email" ILIKE '%%';
	
TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;

SELECT
	"id",
	"login",
	"email",
	"createdAt",
	"isConfirmed"
FROM
	"users"
WHERE
	"login" ILIKE '%pW%' OR "email" ILIKE '%%'
ORDER BY "createdAt" DESC
LIMIT 5 OFFSET 5;

SELECT COUNT(*) AS "totalCount"
FROM
	"users"
WHERE
	"login" ILIKE '%pW%' OR "email" ILIKE '%ss%';

DELETE FROM "users" WHERE "id" = '21d6fc30-9eea-416d-a6a1-7ef504a03186';


-- Email confirmation codes

CREATE TABLE IF NOT EXISTS "emailConfirmationCodes" (
	"userId" UUID UNIQUE NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
	"code" VARCHAR NOT NULL,
	"codeExpirationDate" TIMESTAMPTZ NOT NULL
);

DROP TABLE "emailConfirmationCodes";

SELECT * FROM "emailConfirmationCodes";

INSERT INTO "emailConfirmationCodes" ("userId","code", "codeExpirationDate") VALUES (
	'5bd693c4-3a0d-4898-980a-5dfa00b9de4d',
	'abcd',
	CURRENT_TIMESTAMP + INTERVAL '2h'
);

INSERT INTO
	"emailConfirmationCodes" ("userId", "code", "codeExpirationDate")
VALUES
	('5bd693c4-3a0d-4898-980a-5dfa00b9de4d', 'qwerty', CURRENT_TIMESTAMP + INTERVAL '2h')
ON CONFLICT ("userId") DO UPDATE
SET
	"code" = "excluded"."code",
	"codeExpirationDate" = "excluded"."codeExpirationDate";

-- DELETE FROM "emailConfirmationCodes" WHERE "userId" = '5bd693c4-3a0d-4898-980a-5dfa00b9de4d';


-- Password recovery codes

CREATE TABLE IF NOT EXISTS "passwordRecoveryCodes" (
	"userId" UUID UNIQUE NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
	"code" VARCHAR NOT NULL,
	"codeExpirationDate" TIMESTAMPTZ NOT NULL
);

DROP TABLE "passwordRecoveryCodes";

INSERT INTO
	"passwordRecoveryCodes" ("userId", "code", "codeExpirationDate")
VALUES
	('21d6fc30-9eea-416d-a6a1-7ef504a03186', 'abcd', CURRENT_TIMESTAMP + INTERVAL '10m');

SELECT * FROM "passwordRecoveryCodes";

-- Device sessions

CREATE TABLE "deviceSessions" (
	"userId" UUID NOT NULL REFERENCES "users"("id"),
	"deviceId" UUID NOT NULL UNIQUE,
	"deviceName" VARCHAR NOT NULL,
	"ip" VARCHAR NOT NULL,
	"tokenIat" TIMESTAMPTZ NOT NULL,
	"tokenExp" TIMESTAMPTZ NOT NULL
);

DROP TABLE "deviceSessions";

SELECT * FROM "deviceSessions";

SELECT
	"userId",
	"deviceId",
	"deviceName",
	"ip",
	"tokenIat",
	"tokenExp"
FROM
	"deviceSessions"
WHERE
	"deviceId" = '789f9ddb-92c0-41c6-a9a9-504dd676ae05'
	AND "tokenExp" > CURRENT_TIMESTAMP
LIMIT
	1;

INSERT INTO
	"deviceSessions" ("userId", "deviceId", "deviceName", "ip", "tokenIat", "tokenExp")
VALUES
	(
		'2ca536e3-3842-413d-a1dd-2025e0279fde',
		GEN_RANDOM_UUID(),
		'Chrome MacOS',
		'127.0.0.1',
		CURRENT_TIMESTAMP,
		CURRENT_TIMESTAMP + INTERVAL '1w'
	);

SELECT * FROM "deviceSessions";


-- Blogs
CREATE TABLE "blogs" (
	"id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
	"name" VARCHAR NOT NULL,
	"description" VARCHAR NOT NULL,
	"websiteUrl" VARCHAR NOT NULL,
	"createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE "blogs";

INSERT INTO "blogs"
	("name", "description", "websiteUrl")
VALUES ('Blog 1', 'Blog 1 description', 'blog_1.com')
RETURNING "id";

SELECT * FROM "blogs";

SELECT 
	"id",
	"name",
	"description",
	"websiteUrl",
	"createdAt"
FROM "blogs";

SELECT 
	"id",
	"name",
	"description",
	"websiteUrl",
	"createdAt"
FROM "blogs"
WHERE "name" ILIKE '%%'
ORDER BY "createdAt" DESC
LIMIT 10 OFFSET 0;

SELECT 
	COUNT(*) AS "totalCount"
FROM "blogs"
WHERE "name" ILIKE '%%';

UPDATE "blogs"
SET
	"name" = 'New name',
	"description" = 'New description',
	"websiteUrl" = 'newurl.com'
WHERE
	"id" = 'dsfsdfsdfadf';

DELETE FROM "blogs" WHERE "id" = 'fsdfadsfads';
	
-- Posts

CREATE TABLE "posts" (
	"id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
	"title" VARCHAR NOT NULL,
	"shortDescription" VARCHAR NOT NULL,
	"content" TEXT NOT NULL,
	"blogId" UUID NOT NULL REFERENCES "blogs"("id"),
	"createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE "posts";

INSERT INTO "posts"
	("title", "shortDescription", "content", "blogId")
VALUES ('Post 1', 'Post 1 short description', 'Content for post 1 of blog 1', '4854bbb5-429d-44cf-a7d5-979de2a3fa23');

UPDATE "posts"
SET
	"title" = 'dsa',
	"shortDescription" = 'dsadasdas',
	"content" = 'dasdasdas',
	"blogId" = 'dasdasdas',
WHERE
	"id" = 'fdnjfkalskdjfhkljadshkfjl';

SELECT * FROM "posts";

SELECT 
	"p"."id",
	"p"."title",
	"p"."shortDescription",
	"p"."content",
	"p"."blogId",
	"b"."name" AS "blogName",
	"p"."createdAt"
FROM "posts" "p"
LEFT JOIN "blogs" "b" ON "b"."id" = "p"."blogId"
ORDER BY "createdAt" DESC
LIMIT 10 OFFSET 0;

SELECT COUNT(*) AS "totalCount" FROM "posts";

DELETE FROM "posts" WHERE "id" = 'fsdfadsfads';

-- Comments
CREATE TABLE "comments" (
	"id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
	"content" VARCHAR NOT NULL,
	"postId" UUID NOT NULL REFERENCES "posts"("id"),
	"createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	"userId" UUID NOT NULL REFERENCES "users"("id")
);

DROP TABLE "comments" CASCADE;

INSERT INTO "comments"
	("content", "postId", "userId")
VALUES ('Comment 2 for post', '117c27fd-19cf-4b1b-a1aa-d7637e8b2a18', '28b4025f-c045-46ec-8217-f9e125532990');

SELECT * FROM "comments";

SELECT
	"id",
	"content",
	"postId",
	"createdAt",
	"userId"
FROM "comments"
WHERE "id" = 'ddasdas'
LIMIT 1;

SELECT
	"c"."id",
	"c"."content",
	"c"."postId",
	"c"."createdAt",
	"c"."userId",
	"u"."login" AS "userLogin"
FROM "comments" "c"
LEFT JOIN "users" "u" ON "u"."id" = "c"."userId";

SELECT
	"c"."id",
	"c"."content",
	"c"."postId",
	"c"."createdAt",
	"c"."userId",
	"u"."login" AS "userLogin",
	COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END) AS "likesCount",
	COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END) AS "dislikesCount",
	CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"
FROM "comments" "c"
LEFT JOIN "users" "u" ON "u"."id" = "c"."userId"
LEFT JOIN "commentReactions" "cr" ON "cr"."commentId" = "c"."id"
LEFT JOIN "commentReactions" "ur" ON "ur"."userId" = '7ab5f20d-ef11-4c8d-8806-4274eec05e55'
WHERE "c"."id" = 'bdc98e03-1007-49bb-aad0-9e8846ea3ff7'
GROUP BY "c"."id", "c"."content", "c"."postId", "c"."createdAt", "c"."userId", "u"."login", "cr"."status", "ur"."status"
LIMIT 1;

SELECT
	"c"."id",
	"c"."content",
	"c"."postId",
	"c"."createdAt",
	"c"."userId",
	"u"."login" AS "userLogin",
	COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END)::integer AS "likesCount",
	COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount",
	CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"
FROM "comments" "c"
LEFT JOIN "users" "u" ON "u"."id" = "c"."userId"
LEFT JOIN "commentReactions" "cr" ON "cr"."commentId" = "c"."id"
LEFT JOIN "commentReactions" "ur" ON
	"ur"."userId" = NULL AND
	"ur"."commentId" = "c"."id"
WHERE "c"."postId" = '117c27fd-19cf-4b1b-a1aa-d7637e8b2a18'
GROUP BY "c"."id", "c"."content", "c"."postId", "c"."createdAt", "c"."userId", "u"."login", "ur"."status"
ORDER BY "c"."createdAt" DESC
LIMIT 10 OFFSET 0;

-- Comment reaction
CREATE TABLE "commentReactions" (
	"userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"commentId" UUID NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
	"status" Reaction NOT NULL,
	"createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	UNIQUE ("userId", "commentId")
);

DROP TABLE "commentReactions";

INSERT INTO
	"commentReactions" ("userId", "commentId", "status")
VALUES
	-- ('28b4025f-c045-46ec-8217-f9e125532990', 'bdc98e03-1007-49bb-aad0-9e8846ea3ff7', 'Dislike');
	-- ('ec4a2c0f-b2fd-444a-a6a3-7eca624ef6b4', 'bdc98e03-1007-49bb-aad0-9e8846ea3ff7', 'Like');
	('ec4a2c0f-b2fd-444a-a6a3-7eca624ef6b4', '0749a88d-3b32-4142-97cf-daa1dce5c3de', 'Like');

-- '28b4025f-c045-46ec-8217-f9e125532990'
-- 'ec4a2c0f-b2fd-444a-a6a3-7eca624ef6b4'
-- '7ab5f20d-ef11-4c8d-8806-4274eec05e55'


SELECT * FROM "commentReactions";

SELECT
	"userId",
	"commentId",
	"status",
	"createdAt"
FROM "commentReactions"
WHERE "userId" = '' AND "commentId" = '';