export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.view('/templates/index.ejs', { text: 'tgkim' });
    // return { root: true };
  });
}
