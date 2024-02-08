
## Description

Welcome to the RAG (Retrieval-Augmented Generation) Repository as Personal-API, an AI project that leverages the OpenAI API for generating responses and integrates PostgreSQL for robust long-term data storage.
With the addition of Qdrant for high-performance vector similarity search, this repository is designed to provide highly relevant and context-aware AI responses.
## Features - **OpenAI API Integration**: Harness the power of GPT-4 for state-of-the-art natural language processing and text generation.
- **PostgreSQL Database**: Ensure reliable data persistence with a robust and scalable database solution for storing conversational contexts and metadata.
- **Qdrant Vector Search**: Implement efficient vector similarity searches to retrieve the most relevant data for AI responses.
- **TypeScript**: Benefit from strong typing and object-oriented programming for maintainable and scalable codebase.
- **Langchain Library**: Utilize this library to bridge language models with various applications, enhancing the capabilities of our RAG system.

## Abilities

| Skill     | Name                | State                     | Description                                                        |
| ----------| ------------------- | ------------------------- | ------------------------------------------------------------------ |
| talk      | Chat                | Working                   | Ability to ask for knowledge                                       |
| learn     | Learn               | In-progress               | Ability to learn new skills                                        |
| memory    | Memories            | Working                   | Ability to find to look over stored memories                       |


## Installation
copy env and add your own OPENAI key to have application be fully operational
```bash
$ cp .env.example .env

$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

##  Databases

I'm using [Qdrant](https://qdrant.tech/documentation/quick-start/) as Vector Database and [Postgres](https://www.postgresql.org/docs/) as storage for data. You can run it
locally using Docker:

```bash
# Pull docker image and run it
docker pull qdrant/qdrant
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```
or

```bash
# Pull docker image and run it
docker pull postgres:latest
docker run -p 5433:5433 -v $(pwd)/postgres:/data/postgres postgres:latest
```

## Resources

- [Prompts examples when working with dates](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/guides/prompts-applications.md)
