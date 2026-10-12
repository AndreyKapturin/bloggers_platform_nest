import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1789473820896 implements MigrationInterface {
    name = 'Init1789473820896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "emailConfirmationCodes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "code" character varying NOT NULL, "codeExpirationDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "REL_b6b69f6ebd1321f109e3ae66d4" UNIQUE ("userId"), CONSTRAINT "PK_50aa121573970fa1699e40ea97b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b6b69f6ebd1321f109e3ae66d4" ON "emailConfirmationCodes" ("userId") `);
        await queryRunner.query(`CREATE TABLE "passwordRecoveryCodes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "code" character varying NOT NULL, "codeExpirationDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "REL_0b607d57ffedc2963267437032" UNIQUE ("userId"), CONSTRAINT "PK_6dac56199869427207913d5c330" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0b607d57ffedc2963267437032" ON "passwordRecoveryCodes" ("userId") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "login" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deviceSessions" ("deviceId" uuid NOT NULL, "deviceName" character varying NOT NULL, "ip" character varying NOT NULL, "tokenIat" TIMESTAMP WITH TIME ZONE NOT NULL, "tokenExp" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_249b6e2458633f65ff08ff4e5c5" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`CREATE TABLE "blogs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying NOT NULL, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "shortDescription" character varying NOT NULL, "content" text NOT NULL, "blogId" uuid NOT NULL, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."postReactions_status_enum" AS ENUM('Like', 'Dislike', 'None')`);
        await queryRunner.query(`CREATE TABLE "postReactions" ("postId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."postReactions_status_enum" NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_662d55aba1a89cdf63292e5e782" PRIMARY KEY ("postId", "userId"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "content" text NOT NULL, "postId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."commentReactions_status_enum" AS ENUM('Like', 'Dislike', 'None')`);
        await queryRunner.query(`CREATE TABLE "commentReactions" ("userId" uuid NOT NULL, "commentId" uuid NOT NULL, "status" "public"."commentReactions_status_enum" NOT NULL, "createdAt " TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_25ffb641288a5e2018a09096b0c" PRIMARY KEY ("userId", "commentId"))`);
        await queryRunner.query(`ALTER TABLE "emailConfirmationCodes" ADD CONSTRAINT "FK_b6b69f6ebd1321f109e3ae66d41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "passwordRecoveryCodes" ADD CONSTRAINT "FK_0b607d57ffedc2963267437032a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deviceSessions" ADD CONSTRAINT "FK_1d73c2f344c0fe67cf90bdc0b25" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "postReactions" ADD CONSTRAINT "FK_739b0b68b3b0604171d795f3b22" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "postReactions" ADD CONSTRAINT "FK_1c9f6f9feacc1419206685eec2b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "commentReactions" ADD CONSTRAINT "FK_09a6b96af92f5f86cab899509cd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "commentReactions" ADD CONSTRAINT "FK_da4cba507d4c59c2eb534187c7b" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commentReactions" DROP CONSTRAINT "FK_da4cba507d4c59c2eb534187c7b"`);
        await queryRunner.query(`ALTER TABLE "commentReactions" DROP CONSTRAINT "FK_09a6b96af92f5f86cab899509cd"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`ALTER TABLE "postReactions" DROP CONSTRAINT "FK_1c9f6f9feacc1419206685eec2b"`);
        await queryRunner.query(`ALTER TABLE "postReactions" DROP CONSTRAINT "FK_739b0b68b3b0604171d795f3b22"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "deviceSessions" DROP CONSTRAINT "FK_1d73c2f344c0fe67cf90bdc0b25"`);
        await queryRunner.query(`ALTER TABLE "passwordRecoveryCodes" DROP CONSTRAINT "FK_0b607d57ffedc2963267437032a"`);
        await queryRunner.query(`ALTER TABLE "emailConfirmationCodes" DROP CONSTRAINT "FK_b6b69f6ebd1321f109e3ae66d41"`);
        await queryRunner.query(`DROP TABLE "commentReactions"`);
        await queryRunner.query(`DROP TYPE "public"."commentReactions_status_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "postReactions"`);
        await queryRunner.query(`DROP TYPE "public"."postReactions_status_enum"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "blogs"`);
        await queryRunner.query(`DROP TABLE "deviceSessions"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0b607d57ffedc2963267437032"`);
        await queryRunner.query(`DROP TABLE "passwordRecoveryCodes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6b69f6ebd1321f109e3ae66d4"`);
        await queryRunner.query(`DROP TABLE "emailConfirmationCodes"`);
    }

}
