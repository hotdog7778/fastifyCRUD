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
            postHeader: { type: 'string' },
            postBody: { type: 'string' },
            postWriter: { type: 'string' },
            postPw: { type: 'string' },
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
        console.log(rows);
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
  fastify.get('/:id', async function (request, reply) {
    return 'this is an example';
  });

  // PATCH 게시글 수정
  // /posts/:id
  fastify.patch('/:id', async function (request, reply) {
    return 'this is an example';
  });

  // DELETE 게시글 삭제
  // /posts/:id
  fastify.delete('/:id', async function (request, reply) {
    return 'this is an example';
  });
}
