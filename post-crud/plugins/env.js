import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

export default fp(async (fastify) => {
  const schema = {
    type: 'object',
    required: ['PORT', 'DB_URL'],
    properties: {
      PORT: {
        type: 'string',
        default: 3000,
      },
      DB_URL: {
        type: 'string',
      },
    },
  };

  const options = {
    confKey: 'config', // optional, default: 'config'
    schema: schema,
    // data: data, // optional, default: process.env
  };

  fastify.register(fastifyEnv, options).ready((err) => {
    if (err) {
      console.error(err);
    }
    console.log('loading .env : ', fastify.config);
  });
});
