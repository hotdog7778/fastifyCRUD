import fp from 'fastify-plugin';
import pointOfView from '@fastify/view';
import ejs from 'ejs';

export default fp(async (fastify) => {
  fastify.register(pointOfView, {
    engine: {
      ejs,
      //   root: path.join(__dirname, 'views'),
    },
  });
});
