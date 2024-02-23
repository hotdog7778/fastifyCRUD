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
        description: 'description',
        tags: ['POST'],
        summary: '게시글 생성 API',
        body: {
          description: '요청 Body 파라미터',
          type: 'object',
          required: ['postHeader', 'postBody', 'postWriter', 'postPw'],
          properties: {
            postHeader: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 제목' },
            postBody: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 본문' },
            postWriter: { type: 'string', minLength: 4, maxLength: 12, pattern: '^[\\S]+$', description: '게시글 생성자' },
            postPw: { type: 'string', minLength: 4, maxLength: 12, pattern: '^[\\S]+$', description: '게시글 생성 암호' },
          },
        },
        response: {
          201: {
            description: '201 응답 스키마',
            type: 'object',
            properties: {
              result: { type: 'boolean', description: '요청 결과를 boolean 값으로 반환' },
              msg: { type: 'string', description: '요청 결과를 문자열 메세지로 반환' },
              data: {
                type: 'object',
                properties: {
                  postId: { type: 'number', description: '생성된 게시글의 ID값' },
                },
              },
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

        // 연결 해제
        connection.release();

        return reply.code(201).send({
          result: true,
          msg: '게시글 생성 처리 완료',
          data: {
            postId: rows.insertId,
          },
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
        description: 'description',
        tags: ['POST'],
        summary: '게시글 전체 조회 API',
        response: {
          // 2xx: {
          200: {
            description: '전체 게시글 목록을 객체 배열로 반환',
            type: 'array',
            minLength: 100,
            items: {
              type: 'object',
              required: ['postHeader', 'postBody', 'createdAt', 'updatedAt'],
              properties: {
                postHeader: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 제목' },
                postBody: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 본문' },
                viewCount: { type: 'number', description: '게시글의 조회수' },
                commentCount: { type: 'number', description: '게시글에 존재하는 댓글수' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          404: {
            description: 'Post Not Found ',
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const connection = await fastify.mysql.getConnection();
        const [rows, fields] = await connection.query('SELECT * FROM tb_post WHERE is_deleted = ? ORDER BY created_at DESC', [false]);
        connection.release();

        if (!rows) {
          reply.code(404).send({
            msg: 'Post Not Found',
          });
        }

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
        description: 'description',
        tags: ['POST'],
        summary: '특정 게시글 조회 API',
        params: {
          type: 'object',
          properties: {
            post_id: { type: 'number' },
          },
        },
        response: {
          200: {
            description: '조회한 게시글 정보를 응답',
            type: 'object',
            properties: {
              postHeader: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 제목' },
              postBody: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 본문' },
              viewCount: { type: 'number' },
              commentCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          404: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const postId = request.params.post_id;
        const connection = await fastify.mysql.getConnection();
        const [rows, fields] = await connection.query('SELECT * FROM tb_post WHERE post_id = ? AND is_deleted = ? ', [postId, false]);
        const [row] = rows; // 구조분해
        connection.release();

        if (!row) {
          return reply.code(404).send({
            msg: 'Post Not Found',
          });
        }

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
        description: 'description',
        tags: ['POST'],
        summary: '게시글 수정 API',
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
            postHeader: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 제목' },
            postBody: { type: 'string', minLength: 1, pattern: '^\\S.*\\S$', description: '생성할 게시글의 본문' },
            postWriter: { type: 'string', minLength: 4, maxLength: 12, pattern: '^[\\S]+$', description: '게시글 생성자' },
            postPw: { type: 'string', minLength: 4, maxLength: 12, pattern: '^[\\S]+$', description: '게시글 생성 암호' },
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
          304: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
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

        const [rows, fields] = await connection.query('SELECT * FROM tb_post WHERE post_id = ? AND is_deleted = ?', [postId, false]);
        const [post] = rows; // 구조 분해

        if (!post) {
          return reply.code(404).send({
            msg: 'Post Not Found',
          });
        }

        // 401 검사
        if (postWriter !== post.post_writer || postPw !== post.post_pw) {
          return reply.code(401).send({
            msg: 'Authentication failed',
          });
        }

        // 304 검사
        if (post.post_header === postHeader && post.post_body === postBody) {
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
      schema: {
        description: 'description',
        tags: ['POST'],
        summary: '게시글 삭제 API',
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
            postWriter: { type: 'string', minLength: 4, maxLength: 12, pattern: '^[\\S]+$', description: '게시글 생성자' },
            postPw: { type: 'string', minLength: 4, maxLength: 12, pattern: '^[\\S]+$', description: '게시글 생성 암호' },
          },
        },
        response: {
          401: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const postId = request.params.post_id;
        const { postWriter, postPw } = request.body;

        const connection = await fastify.mysql.getConnection();
        const [raws, fields] = await connection.query('SELECT * FROM tb_post WHERE post_id = ? AND is_deleted = ?', [postId, false]);
        const [post] = raws;
        console.log('!!!!!!!!', post);

        // 404 검사
        if (!post) {
          return reply.code(404).send({
            msg: 'Post Not Found',
          });
        }

        // 401 검사
        if (postWriter !== post.post_writer || postPw !== post.post_pw) {
          return reply.code(401).send({
            msg: 'Authentication failed',
          });
        }

        await connection.query('UPDATE tb_post SET is_deleted = ?, deleted_at = NOW() WHERE post_id = ?', [true, postId]);

        // 명령을 수행했고 더 이상 제공할 정보가 없는 경우 204 (No Content)
        return reply.code(204).send();
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );
}
