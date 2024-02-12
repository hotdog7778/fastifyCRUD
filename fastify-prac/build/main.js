import Fastify from 'fastify';
import fastifyMongo from '@fastify/mongodb';
const fastify = Fastify({
    // logger: true,
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    },
});
async function userRoutes(fastify) {
    fastify.post('/', {
        handler: async (request, reply) => {
            const body = request.body;
            return reply.code(201).send(request.user);
        },
    });
    fastify.log.info('User routes registered');
}
async function dbConnector(fastify) {
    fastify.register(fastifyMongo, {
        url: 'mongodb://localhost:27017/fastify',
    });
    fastify.log.info('Connect to database');
}
fastify.addHook('preHandler', (request, reply) => {
    request.user = 'Bob Jones';
});
fastify.register(dbConnector);
fastify.register(userRoutes, { prefix: '/api/users' });
async function main() {
    await fastify.listen({
        port: 3000,
        host: '0.0.0.0',
    });
}
// SIGINT (Ctrl+C로 발생하는 종료 신호)
// SIGTERM (운영 체제에서 종료하도록 요청되는 신호)
['SIGINT', 'SIGTERM'].forEach((signal) => {
    // 이벤트 리스너
    process.on(signal, async () => {
        // 현재 수행 중인 연결 및 요청을 처리한 후 서버를 종료합니다.
        await fastify.close();
        // 서버가 정상적으로 종료되면 프로세스를 종료합니다. 여기서 0은 정상적인 종료임을 나타냅니다.
        process.exit(0);
    });
});
main();
