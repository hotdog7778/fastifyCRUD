let currentId = 2;
const posts = [
  {
    id: 1,
    user: 'tgkim',
    title: 'hi, hello',
  },
];

const postOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['user', 'title'],
      properties: {
        user: { type: 'string' },
        title: { type: 'string' },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          title: { type: 'string' },
        },
      },
    },
  },
};

const patchOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' }, // 요청 파라미터의 id는 정수여야 합니다.
      },
      required: ['id'], // id 파라미터가 필수적으로 있어야 합니다.
    },
    body: {
      type: 'object',
      required: ['title'],
      properties: {
        user: { type: 'string' },
        title: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          title: { type: 'string' },
        },
      },
    },
  },
};

const deleteOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' }, // 요청 파라미터의 id는 정수여야 합니다.
      },
      required: ['id'], // id 파라미터가 필수적으로 있어야 합니다.
    },
    response: {
      204: {},
    },
  },
};

/**
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {*} options
 * 이걸 추가함으로써 플러그인들을 불러오는 도움말을 사용할 수 있게된다.
 */
async function routes(fastify, options) {
  // 에러 생성 메서드
  // createError(statusCode, error message)
  const createError = fastify.httpErrors.createError;

  // Create
  // /api/posts
  fastify.post('/', postOptions, async (request, reply) => {
    try {
      const { user, title } = request.body;

      const newPost = {
        id: currentId,
        user,
        title,
      };

      posts.push(newPost);
      currentId++;

      reply.code(201);
      return newPost;
    } catch (err) {
      throw new Error('Something wrong');
    }
  });

  // Read
  // /api/posts
  // 모든 게시글 조회
  fastify.get('/', async (request, reply) => {
    // reply.status(200).send(posts);
    return posts;
  });

  // /api/posts/:id
  // 특정 게시글 조회
  fastify.get('/:id', async (request, reply) => {
    try {
      const post = posts.find((e) => e.id === +request.params.id);

      if (!post) {
        return createError(404, 'This post does not exist!');
        // return fastify.httpErrors.notFound('Post not found');
        // return reply.notFound();
        /*
        {
          "statusCode": 404,
          "error": "Not Found",
          "message": "This post does not exist!"
        }
        */
      }

      // plugin-support.js 사용 예시
      post.author = fastify.author();

      return post;
    } catch (err) {
      throw new Error('Something wrong');
    }
  });

  // Update
  // /api/posts/:id
  fastify.patch('/:id', patchOptions, async (request, reply) => {
    try {
      const postId = parseInt(request.params.id);
      const { user, title } = request.body;

      const postIndex = posts.findIndex((post) => post.id === postId);

      if (postIndex === -1) {
        return createError(404, 'This post does not exist!');
      }

      if (user) {
        posts[postIndex].user = user;
      }
      if (title) {
        posts[postIndex].title = title;
      }

      return posts[postIndex];
    } catch (err) {
      throw new Error('Something wrong');
    }
  });

  // Delete
  // /api/posts/:id
  fastify.delete('/:id', deleteOptions, async (request, reply) => {
    try {
      const postId = parseInt(request.params.id);

      const postIndex = posts.findIndex((post) => post.id === postId);

      if (postIndex === -1) {
        return createError(404, 'This post does not exist!');
      }

      // Hard delete
      posts.splice(postIndex, 1);

      // 204 응답은 클라이언트에게 성공 여부만을 알리기 위한 경우에 사용되며, 본문에 데이터를 추가할 수는 없음
      reply.code(204);
      return;
    } catch (err) {
      throw new Error('Something wrong');
    }
  });
}

export default routes;
