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
	('User 1', 'user_1@mail.ru', 'dsfsdfsdfsdfsdfadsfads'),
	('User 2', 'user_2@mail.ru', 'dsfsdfsdfsdfsdfadsfads'),
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
VALUES
	('Post 1', 'Post 1 short description', 'Content for post 1 of blog 1', '3948dfad-817c-48fb-8776-453f9e7bee42'),
	('Post 2', 'Post 2 short description', 'Content for post 2 of blog 1', '3948dfad-817c-48fb-8776-453f9e7bee42');

SELECT * FROM "posts";

UPDATE "posts"
SET
	"title" = 'dsa',
	"shortDescription" = 'dsadasdas',
	"content" = 'dasdasdas',
	"blogId" = 'dasdasdas',
WHERE
	"id" = 'fdnjfkalskdjfhkljadshkfjl';



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

SELECT 
	"p"."id",
	"p"."title",
	"p"."shortDescription",
	"p"."content",
	"p"."blogId",
	"b"."name" AS "blogName",
	"p"."createdAt",
	COUNT(CASE WHEN "pr"."status" = 'Like' THEN 1 END)::integer AS "likesCount",
	COUNT(CASE WHEN "pr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount",
	CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"
FROM "posts" "p"
LEFT JOIN "blogs" "b" ON "b"."id" = "p"."blogId"
LEFT JOIN "postReactions" "pr" ON "pr"."postId" = "p"."id"
LEFT JOIN "postReactions" "ur" ON
	"ur"."postId" = "p"."id" AND
	"ur"."userId" = 'bae0dd1d-f32e-4e61-9df1-06cd85214bf4' -- SELECT "id", "login" FROM "users";
GROUP BY
	"p"."id",
	"p"."title",
	"p"."shortDescription",
	"p"."content",
	"p"."blogId",
	"b"."name",
	"p"."createdAt",
	"ur"."status"
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

-- Post reaction

CREATE TABLE "postReactions" (
	"postId" UUID NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"status" Reaction NOT NULL,
	"addedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	UNIQUE ("postId", "userId")
);

DROP TABLE "postReactions";

INSERT INTO
	"postReactions" ("postId", "userId", "status")
VALUES
	(
		'655f3cdb-00d4-41e2-8e4a-257b5f50beb3', -- SELECT "id", "title" FROM "posts";
		'bae0dd1d-f32e-4e61-9df1-06cd85214bf4', -- SELECT "id", "login" FROM "users";
		'Like'
	);

SELECT * FROM "postReactions";

SELECT
	"postId",
	"userId",
	"status",
	"addedAt"
FROM "postReactions"
WHERE "postId" = '' AND "userId" = '';

UPDATE "postReactions"
SET "status" = 'Dislike'
WHERE "postId" = '8d942ec0-dbf8-434e-8a9d-4fb98bfe79a5' AND "userId" = 'bae0dd1d-f32e-4e61-9df1-06cd85214bf4';


-- USAGE 

INSERT INTO
	"users" ("login", "email", "passwordHash")
VALUES
	-- ('Test user 1', 't_user_1@mail.ru', 'dsfsdfsdfsdfsdfadsfads'),
	('Test user 2', 't_user_2@mail.ru', 'dsfsdfsdfsdfsdfadsfads'),
	('Test user 3', 't_user_3@mail.ru', 'dsfsdfsdfsdfsdfadsfads'),
	('Test user 4', 't_user_4@mail.ru', 'dsfsdfsdfsdfsdfadsfads');

SELECT * FROM "users";
INSERT INTO "blogs"
	("name", "description", "websiteUrl")
VALUES ('Test blog 1', 'Blog 1 description', 'blog_1.com')
RETURNING "id";

SELECT * FROM "blogs";

INSERT INTO "posts"
	("title", "shortDescription", "content", "blogId")
VALUES
	('Test post 1', 'Post 1 short description', 'Content for post 1 of blog 1', '3f4c42d0-128f-4c05-9824-d2bff896bb67'),
	('Test post 2', 'Post 2 short description', 'Content for post 2 of blog 2', '3f4c42d0-128f-4c05-9824-d2bff896bb67'),
	('Test post 3', 'Post 3 short description', 'Content for post 3 of blog 3', '3f4c42d0-128f-4c05-9824-d2bff896bb67'),
	('Test post 4', 'Post 4 short description', 'Content for post 4 of blog 4', '3f4c42d0-128f-4c05-9824-d2bff896bb67'),
	('Test post 5', 'Post 5 short description', 'Content for post 5 of blog 5', '3f4c42d0-128f-4c05-9824-d2bff896bb67');

SELECT * FROM "posts";

INSERT INTO
	"postReactions" ("postId", "userId", "status")
VALUES
	-- ('4ad2d825-2118-403f-92cc-a090a3d7b230', 'bf9f8a25-82a5-4244-9c4d-6fd52b41beeb', 'Like' ), -- p1 u1 l
	-- ('4ad2d825-2118-403f-92cc-a090a3d7b230', '397c1a44-e2f7-4bd3-804b-b1f12e059acb', 'Like' ), -- p1 u2 l
	-- ('4ad2d825-2118-403f-92cc-a090a3d7b230', '42f72bc2-ebf9-4043-8e88-30b69d08d3c8', 'Like' ), -- p1 u3 l
	-- ('4ad2d825-2118-403f-92cc-a090a3d7b230', '8d407297-e301-4a6d-be2c-bd0ac98112eb', 'Like' ), -- p1 u4 l
	-- ('cbf3502a-fa5f-4815-a290-48a026b9942b', 'bf9f8a25-82a5-4244-9c4d-6fd52b41beeb', 'Dislike' ), -- p2 u1 d
	-- ('d5d9bfa4-6703-4517-9c84-bdb1b5251fb2', 'bf9f8a25-82a5-4244-9c4d-6fd52b41beeb', 'Dislike' ) -- p3 u1 d
	-- ('d5d9bfa4-6703-4517-9c84-bdb1b5251fb2', '397c1a44-e2f7-4bd3-804b-b1f12e059acb', 'Like' ) -- p3 u2 d
	-- ('35f786cf-6adc-4dd1-a785-ef3abc5e17cf', '42f72bc2-ebf9-4043-8e88-30b69d08d3c8', 'Like' )
	('c40d1901-870d-4b75-abde-a2fd50de63a0', '8d407297-e301-4a6d-be2c-bd0ac98112eb', 'Like' ),
	('c40d1901-870d-4b75-abde-a2fd50de63a0', '42f72bc2-ebf9-4043-8e88-30b69d08d3c8', 'Like' )

SELECT * FROM "postReactions";



SELECT
	"l"."postId",
	"l"."userId",
	"l"."userLogin",
	"l"."addedAt"
FROM "posts" "p"
LEFT JOIN LATERAL (
	SELECT
		"pr"."postId",
		"pr"."userId",
		"u"."login" AS "userLogin",
		"pr"."addedAt"
	FROM "postReactions" "pr"
	LEFT JOIN "users" "u" ON "u"."id" = "pr"."userId"
	WHERE "pr"."postId" = "p"."id" AND "pr"."status" = 'Like'
	LIMIT 3
) "l" ON TRUE
WHERE "p"."id" = ANY (ARRAY [
	'4ad2d825-2118-403f-92cc-a090a3d7b230'::uuid,
	'cbf3502a-fa5f-4815-a290-48a026b9942b'::uuid
	]
) AND "l"."postId" IS NOT NULL;
