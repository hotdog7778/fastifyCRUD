/**
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function (fastify, opts) {
  // POST
  // 댓글 생성
  fastify.post(
    '/',
    {
      schema: {
        description: 'description',
        tags: ['COMMENT'],
        summary: '댓글 생성 API',
        body: {
          description: '요청 Body 파라미터',
          type: 'object',
          required: ['postId', 'commentBody', 'commentWriter', 'commentPw'],
          properties: {
            postId: { type: 'number', description: '댓글이 달릴 게시글의ID' },
            commentBody: { type: 'string', description: '댓글의 내용' },
            commentWriter: { type: 'string', description: '댓글의 작성자' },
            commentPw: { type: 'string', description: '댓글의 암호' },
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
                  commentUuid: { type: 'string', description: '생성된 댓글 UUID' },
                },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        // 게시글ID, 댓글 내용, 댓글 작성자, 댓글 암호
        const { postId, commentBody, commentWriter, commentPw } = request.body;

        // DB
        const connection = await fastify.mysql.getConnection();
        const [rows, fields] = await connection.query(
          `INSERT INTO tb_comment 
          (post_id, comment_body, comment_writer, comment_pw)
          VALUES 
          (?, ?, ?, ?)
          `,
          [postId, commentBody, commentWriter, commentPw]
        );

        // 생성 댓글 조회
        const createdCommentId = rows.insertId;
        const [commentArray] = await connection.query(
          `
          SELECT *, HEX(comment_uuid) AS comment_uuid
          FROM tb_comment
          WHERE comment_id = ?
          `,
          [createdCommentId]
        );
        const [comment] = commentArray;

        // 연결 해제
        connection.release();

        return reply.code(201).send({
          result: true,
          msg: '댓글 생성 처리 완료',
          data: {
            commentUuid: comment.comment_uuid,
          },
        });
      } catch (err) {
        return reply.code(500).send(err);
      }
    }
  );

  // GET
  // 전체 댓글 조회

  // PATCH
  // 댓글 수정

  // DELETE
  // 댓글 삭제
}
