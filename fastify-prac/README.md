# Fastify

## Fastify란?

- Node.js를 위한 웹 프레임워크
- 성능 및 보안을 위해 설계됨
- Express 및 Hapi에서 영감을 받음

## Fastify를 사용하는 이유?

- Full async/await 지원
- 유연한 TypeScript 지원
- 다양하고 고품질의 [ecosystem](https://www.fastify.io/ecosystem/)
- 보안성
- 빠르다

Note: Will be using TypeScript, ESM & async/await Fastify does support JS, CJS and callbacks

## 다룰 내용

### 기본

- Build an instance of Fastify
- 서버 시작
- 라우트 등록
- 요청 및 응답
- Graceful shutdown

### Plugins & register

https://www.fastify.io/docs/latest/Reference/Plugins/

- Register routes as plugins
- Register external plugins
- Register with options
- 호출 순서

### Decorators

https://www.fastify.io/docs/latest/Reference/Decorators/

- 요청 객체 수정 - addHook
- Fastify 인스턴스에 기능 추가 - decorate

## Request hooks

https://www.fastify.io/docs/latest/Reference/Hooks

- Lifecycle hooks

## 유효성 검사(Validation)

- Validate requests
- Validate responses
