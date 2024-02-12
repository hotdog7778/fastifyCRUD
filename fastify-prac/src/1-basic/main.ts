import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyMongo from '@fastify/mongodb';

const fastify = Fastify({
  // logger: true,
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
});

async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async () => {
    fastify.log.info('Got a request');
  });

  fastify.addHook('onResponse', async (request, reply: FastifyReply) => {
    fastify.log.info(`Responding: ${reply.getResponseTime()}`);
  });

  // 유효성 검사
  fastify.addSchema({
    $id: 'createUseSchema',
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
      },
    },
  });

  fastify.post('/', {
    schema: {
      body: { $ref: 'createUseSchema#' },
      response: {
        201: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
      },
    },
    handler: async (
      request: FastifyRequest<{
        Body: {
          name: string;
          age: number;
        };
      }>,
      reply: FastifyReply
    ) => {
      const body = request.body;

      const jwt = fastify.signJwt();
      const verified = fastify.verifyJwt();
      // return reply.code(201).send({ jwt, verified });
      // return reply.code(201).send(request.user);
      return reply.code(201).send(body);
    },
  });

  fastify.log.info('User routes registered');
}

fastify.get('/err', () => {
  return { message: 'hello' };
});

async function dbConnector(fastify: FastifyInstance) {
  fastify.register(fastifyMongo, {
    url: 'mongodb://localhost:27017/fastify',
  });

  fastify.log.info('Connect to database');
}

declare module 'fastify' {
  export interface FastifyRequest {
    user: {
      name: string;
    };
  }
  export interface FastifyInstance {
    signJwt: () => string;
    verifyJwt: () => {
      name: string;
    };
  }
}

// 이거 잘 이해안됨
fastify.decorateRequest('user', null);

// 여기서 async 를제거하면 요청이 계속해서 processing 되는데 이유가 잘 이해안됨
fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  request.user = {
    name: 'Bob Jones',
  };
});

fastify.decorate('signJwt', () => {
  return 'Signed JWT';
});

fastify.decorate('verifyJwt', () => {
  return {
    name: 'TOM',
  };
});

fastify.register(dbConnector);
fastify.after((err) => console.log(err));

fastify.register(userRoutes, { prefix: '/api/users' });
fastify.after((err) => console.log(err));

fastify.ready((err) => console.log(err));
async function main() {
  await fastify.listen({
    port: 3000,
    host: '0.0.0.0',
  });
}

[('SIGINT', 'SIGTERM')].forEach((signal) => {
  // 이벤트 리스너
  process.on(signal, async () => {
    // 현재 수행 중인 연결 및 요청을 처리한 후 서버를 종료합니다.
    await fastify.close();

    // 서버가 정상적으로 종료되면 프로세스를 종료합니다. 여기서 0은 정상적인 종료임을 나타냅니다.
    process.exit(0);
  });
});
// SIGINT (Ctrl+C로 발생하는 종료 신호)
// SIGTERM (운영 체제에서 종료하도록 요청되는 신호)
main();
