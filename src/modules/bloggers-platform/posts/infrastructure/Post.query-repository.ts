import { Injectable } from '@nestjs/common';
import {
  Post,
  TExtendedPost,
  TExtendedPostWithLikes,
  TNewestLike,
  TViewNewestLike,
  type TPostModel,
} from '../domain/Post.entity';
import { ViewPostDto } from '../api/dto/ViewPost.dto';
import { PostsQueryParamsDto } from '../api/dto/PostQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { PostReaction } from '../domain/PostReaction.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postEntityRepo: Repository<Post>,
    @InjectRepository(PostReaction)
    private readonly postReactionsEntityRepo: Repository<PostReaction>,
  ) {}

  async findById(postId: string, userId: string | null): Promise<ViewPostDto> {
    const post = await this.postEntityRepo
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .leftJoin('p.reactions', 'pr')
      .leftJoin('p.reactions', 'ur', 'ur.userId = :userId', { userId })
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.blogId', 'blogId')
      .addSelect('p.createdAt', 'createdAt')
      .addSelect('b.name', 'blogName')
      .addSelect(
        `COUNT(CASE WHEN "pr"."status" = 'Like' THEN 1 END)::int`,
        'likesCount',
      )
      .addSelect(
        `COUNT(CASE WHEN "pr"."status" = 'Dislike' THEN 1 END)::int`,
        'dislikesCount',
      )
      .addSelect(
        `CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END`,
        'myStatus',
      )
      .where('p.id = :postId', { postId })
      .limit(1)
      .groupBy(
        `"p"."id",
        "p"."title",
        "p"."shortDescription",
        "p"."content",
        "p"."blogId",
        "b"."name",
        "p"."createdAt",
        "ur"."status"`,
      )
      .getRawOne<TExtendedPost>();

    if (!post) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Post with id ${postId} not found`,
        [{ field: 'postId', message: `Post with id ${postId} not found` }],
      );
    }

    const newestLikes = await this._findNewestLikesForPost(postId);

    const postWithLikes: TExtendedPostWithLikes = {
      ...post,
      newestLikes,
    };

    return ViewPostDto.toView(postWithLikes);
  }

  async find(
    query: PostsQueryParamsDto,
    userId: string | null,
  ): Promise<PaginatedView<ViewPostDto>> {
    return this._find({}, query, userId);
  }

  async findForBlog(
    blogId: string,
    query: PostsQueryParamsDto,
    userId: string | null,
  ): Promise<PaginatedView<ViewPostDto>> {
    return this._find({ blogId }, query, userId);
  }

  private async _find(
    filter: Partial<TPostModel>,
    query: PostsQueryParamsDto,
    userId: string | null,
  ): Promise<PaginatedView<ViewPostDto>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = query;

    const whereParams: (string | number | null)[] = [];
    const conditions: string[] = [];

    const fromPart = `FROM "posts" "p"`;

    let wherePart = '';

    if (filter.blogId) {
      whereParams.push(filter.blogId);
      conditions.push(`"blogId" = $${whereParams.length}`);
    }

    if (conditions.length > 0) {
      wherePart += 'WHERE ' + conditions.join(' OR ');
    }

    const params = [...whereParams];

    params.push(userId);
    const joinPart = `
    LEFT JOIN "blogs" "b" ON "b"."id" = "p"."blogId"
    LEFT JOIN "postReactions" "pr" ON "pr"."postId" = "p"."id"
    LEFT JOIN "postReactions" "ur" ON
	    "ur"."postId" = "p"."id" AND
	    "ur"."userId" = $${params.length}`;

    params.push(pageSize);
    const limitPart = `LIMIT $${params.length}`;

    params.push(skip);
    const offsetPart = `OFFSET $${params.length}`;

    const getPostsSql = `
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
      ${fromPart}
      ${joinPart}
      ${wherePart}
      GROUP BY
        "p"."id",
        "p"."title",
        "p"."shortDescription",
        "p"."content",
        "p"."blogId",
        "b"."name",
        "p"."createdAt",
        "ur"."status"
      ORDER BY "${sortBy}" ${sortDirection}
      ${limitPart}
      ${offsetPart}`;

    const posts = await this.dataSource.query<TExtendedPost[]>(
      getPostsSql,
      params,
    );

    const getTotalCountSql = `
      SELECT
        COUNT(*)::integer as "totalCount"
      ${fromPart}
      ${wherePart};`;

    const [{ totalCount }] = await this.dataSource.query<
      { totalCount: number }[]
    >(getTotalCountSql, whereParams);

    const postIds = posts.map(({ id }) => id);
    const newestLikes = await this._findNewestLikesForPosts(postIds);

    const postLikesDictionary = this._createNewestLikesDict(newestLikes);

    const postsWithNewestLikes: TExtendedPostWithLikes[] = posts.map((p) => {
      return {
        ...p,
        newestLikes: postLikesDictionary[p.id] ?? [],
      };
    });

    const viewPosts = postsWithNewestLikes.map((post) =>
      ViewPostDto.toView(post),
    );
    const paginatedPosts = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewPosts,
    );
    return paginatedPosts;
  }

  private async _findNewestLikesForPost(
    postId: string,
  ): Promise<TViewNewestLike[]> {
    return this.postReactionsEntityRepo.query<TViewNewestLike[]>(
      `SELECT
        "pr"."userId",
        "u"."login",
        "pr"."addedAt"
      FROM "postReactions" "pr"
      LEFT JOIN "users" "u" ON "u"."id" = "pr"."userId"
      WHERE "pr"."postId" = $1 AND "pr"."status" = 'Like'
      ORDER BY "pr"."addedAt" DESC
      LIMIT 3;`,
      [postId],
    );
  }

  private async _findNewestLikesForPosts(
    postIds: string[],
  ): Promise<TNewestLike[]> {
    return this.dataSource.query<TNewestLike[]>(
      `SELECT
        "l"."postId",
        "l"."userId",
        "l"."login",
        "l"."addedAt"
      FROM "posts" "p"
      LEFT JOIN LATERAL (
        SELECT
          "pr"."postId",
          "pr"."userId",
          "u"."login",
          "pr"."addedAt"
        FROM "postReactions" "pr"
        LEFT JOIN "users" "u" ON "u"."id" = "pr"."userId"
        WHERE "pr"."postId" = "p"."id" AND "pr"."status" = 'Like'
        ORDER BY "pr"."addedAt" DESC
        LIMIT 3
      ) "l" ON TRUE
      WHERE "p"."id" = ANY ($1) AND "l"."postId" IS NOT NULL;`,
      [postIds],
    );
  }

  private _createNewestLikesDict(newestLikes: TNewestLike[]) {
    return newestLikes.reduce<Record<string, TViewNewestLike[]>>((acc, nl) => {
      let likes: TViewNewestLike[] = acc[nl.postId]
        ? acc[nl.postId]
        : (acc[nl.postId] = []);
      if (nl.postId) likes.push(this._mapNewestLikesToView(nl));
      return acc;
    }, {});
  }

  private _mapNewestLikesToView(newestLike: TNewestLike): TViewNewestLike {
    return {
      login: newestLike.login,
      userId: newestLike.userId,
      addedAt: newestLike.addedAt.toISOString(),
    };
  }
}
