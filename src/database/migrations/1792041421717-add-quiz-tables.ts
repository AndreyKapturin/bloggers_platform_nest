import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuizTables1792041421717 implements MigrationInterface {
    name = 'AddQuizTables1792041421717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gameQuestions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "questionId" uuid NOT NULL, "gameId" uuid NOT NULL, CONSTRAINT "PK_9be35be1b386d1d9c496142a128" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "pairCreatedDate" TIMESTAMP NOT NULL DEFAULT now(), "startGameDate" date, "finishGameDate" date, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "gameId" uuid NOT NULL, CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playerAnswers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "gameQuestionId" uuid NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_bfa0c079c149db657b0582f1c4" UNIQUE ("playerId"), CONSTRAINT "REL_f9affd3ebb4c44a658a0d713ba" UNIQUE ("gameQuestionId"), CONSTRAINT "PK_26cda23b727f958cc81ac6b47f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gameQuestions" ADD CONSTRAINT "FK_2a023eb88bc48c2729d84a2cc3e" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gameQuestions" ADD CONSTRAINT "FK_421d09442211e036e6849891edc" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_e987db4cbe03070958e54074005" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playerAnswers" ADD CONSTRAINT "FK_bfa0c079c149db657b0582f1c47" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playerAnswers" ADD CONSTRAINT "FK_f9affd3ebb4c44a658a0d713ba0" FOREIGN KEY ("gameQuestionId") REFERENCES "gameQuestions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playerAnswers" DROP CONSTRAINT "FK_f9affd3ebb4c44a658a0d713ba0"`);
        await queryRunner.query(`ALTER TABLE "playerAnswers" DROP CONSTRAINT "FK_bfa0c079c149db657b0582f1c47"`);
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_e987db4cbe03070958e54074005"`);
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad"`);
        await queryRunner.query(`ALTER TABLE "gameQuestions" DROP CONSTRAINT "FK_421d09442211e036e6849891edc"`);
        await queryRunner.query(`ALTER TABLE "gameQuestions" DROP CONSTRAINT "FK_2a023eb88bc48c2729d84a2cc3e"`);
        await queryRunner.query(`DROP TABLE "playerAnswers"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP TABLE "games"`);
        await queryRunner.query(`DROP TABLE "gameQuestions"`);
    }

}
