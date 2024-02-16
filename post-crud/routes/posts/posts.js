/**
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function (fastify, opts) {
  // POST 게시글 생성
  // /posts/:id
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['postHeader', 'postBody', 'postWriter', 'postPw'],
          properties: {
            postHeader: { type: 'string', minLength: 1 },
            postBody: { type: 'string', minLength: 1 },
            postWriter: { type: 'string', minLength: 1 },
            postPw: { type: 'string', minLength: 1 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              result: { type: 'boolean' },
              msg: { type: 'string' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        // 요청 본문 확인
        const { postHeader, postBody, postWriter, postPw } = request.body;

        // DB
        const connection = await fastify.mysql.getConnection();
        const [rows, fields] = await connection.query('INSERT INTO tb_post (post_header, post_body, post_writer, post_pw) VALUES (?, ?, ?, ?)', [postHeader, postBody, postWriter, postPw]);

        connection.release();

        return reply.code(201).send({
          result: true,
          msg: '게시글 생성 처리 완료',
        });
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );

  // GET 게시글 전체 조회
  // /posts
  fastify.get(
    '/',
    {
      schema: {
        response: {
          // 2xx: {
          200: {
            type: 'array',
            minLength: 100,
            items: {
              type: 'object',
              required: ['postHeader', 'postBody', 'createdAt', 'updatedAt'],
              properties: {
                postHeader: { type: 'string' },
                postBody: { type: 'string' },
                viewCount: { type: 'number' },
                commentCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const connection = await fastify.mysql.getConnection();
        const [rows, fields] = await connection.query('SELECT * FROM tb_post WHERE is_deleted = 0 ORDER BY created_at DESC');
        connection.release();

        const posts = rows.map((item) => ({
          postHeader: item.post_header,
          postBody: item.post_body,
          viewCount: item.view_count,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

        return reply.code(200).send(posts);
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );

  // GET 게시글 조회
  // /posts/:id
  fastify.get(
    '/:post_id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            post_id: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              postHeader: { type: 'string' },
              postBody: { type: 'string' },
              viewCount: { type: 'number' },
              commentCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const postId = request.params.post_id;
        const connection = await fastify.mysql.getConnection();
        const [rows] = await connection.query('SELECT * FROM tb_post WHERE post_id = ?', [postId]);
        const [row] = rows; // 구조분해
        connection.release();

        const post = {
          postHeader: row.post_header,
          postBody: row.post_body,
          viewCount: row.view_count,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        return reply.code(200).send(post);
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );

  // PATCH 게시글 수정
  // /posts/:id
  fastify.patch(
    '/:post_id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            post_id: { type: 'number' },
          },
        },
        body: {
          type: 'object',
          required: ['postWriter', 'postPw'],
          properties: {
            postHeader: { type: 'string', minLength: 1 },
            postBody: { type: 'string', minLength: 1 },
            postWriter: { type: 'string', minLength: 4, pattern: '^[\\S]+$' },
            postPw: { type: 'string', minLength: 4, pattern: '^[\\S]+$' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              result: { type: 'boolean' },
              msg: { type: 'string' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const postId = request.params.post_id;
        const { postHeader, postBody, postWriter, postPw } = request.body;

        const connection = await fastify.mysql.getConnection();

        const [rows, fields] = await connection.query('SELECT * FROM tb_post WHERE post_id = ?', [postId]);
        const [beforePost] = rows; // 구조 분해

        // 401 검사
        if (postWriter !== beforePost.post_writer || postPw !== beforePost.post_pw) {
          return reply.code(401).send({
            msg: 'Authentication failed',
          });
        }

        // 304 검사
        if (beforePost.post_header === postHeader && beforePost.post_body === postBody) {
          // PATCH는 변경값이 없으면 304(Not Modified)를 반환해주는게 맞다고 한다.
          connection.release();
          return reply.code(304).send({
            msg: 'Not Modified',
          });
        }

        if (postHeader && postBody) {
          const [updateRow, updateFields] = await connection.query('UPDATE tb_post SET post_header = ?, post_body = ?, updated_at = NOW() WHERE post_id = ?', [postHeader, postBody, postId]);
          connection.release();

          return reply.code(200).send({
            result: true,
            msg: '게시글 제목/내용 수정 처리 완료',
          });
        }

        if (postHeader) {
          const [updateRow, updateFields] = await connection.query('UPDATE tb_post SET post_header = ?, updated_at = NOW() WHERE post_id = ?', [postHeader, postId]);
          connection.release();

          return reply.code(200).send({
            result: true,
            msg: '게시글 제목 수정 처리 완료',
          });
        }

        if (postBody) {
          const [updateRow, updateFields] = await connection.query('UPDATE tb_post SET post_body = ?, updated_at = NOW() WHERE post_id = ?', [postBody, postId]);
          connection.release();

          return reply.code(200).send({
            result: true,
            msg: '게시글 내용 수정 처리 완료',
          });
        }
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );

  // DELETE 게시글 삭제
  // /posts/:id
  fastify.delete(
    '/:post_id',
    {
      params: {
        type: 'object',
        properties: {
          post_id: { type: 'number' },
        },
      },
      body: {
        type: 'object',
        required: ['postWriter', 'postPw'],
        properties: {
          postWriter: { type: 'string', minLength: 4, pattern: '^[\\S]+$' },
          postPw: { type: 'string', minLength: 4, pattern: '^[\\S]+$' },
        },
      },
    },
    async function (request, reply) {
      try {
        const postId = request.params.post_id;
        const { postWriter, postPw } = request.body;

        const connection = await fastify.mysql.getConnection();
        const [raws, fields] = await connection.query('SELECT * FROM tb_post WHERE post_id = ?', [postId]);
        const [post] = raws;

        // 401 검사
        if (postWriter !== post.post_writer || postPw !== post.post_pw) {
          return reply.code(401).send({
            msg: 'Authentication failed',
          });
        }

        // 404 검사
        if (post.is_deleted) {
          return reply.code(404).send({
            msg: 'Post Not Found',
          });
        }

        await connection.query('UPDATE tb_post SET is_deleted = ?, deleted_at = NOW() WHERE post_id = ?', [true, postId]);
        return reply.code(200).send({
          msg: 'Post Deleted',
        });
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );
}
