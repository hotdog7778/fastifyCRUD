import fp from 'fastify-plugin';
import mysql from '@fastify/mysql';

export default fp(async (fastify) => {
  const { DB_URL } = fastify.config;

  fastify.register(mysql, {
    promise: true, // Async/await is supported
    connectionString: process.env.DB_URL, // "mysql://유저이름:db비밀번호@127.0.0.1/db이름",
  });

  // using Example
  /*
    const connection = await fastify.mysql.getConnection()
    const [rows, fields] = await connection.query(
      'SELECT id, username, hash, salt FROM users WHERE id=?', [req.params.id],
    )
    connection.release()
    return rows[0]
  */
});
