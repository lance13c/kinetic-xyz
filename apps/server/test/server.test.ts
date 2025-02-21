import type { FastifyInstance } from 'fastify';
import type { CreateUserInput } from '../src/generated/graphql';
import { createServer } from '../src/server';

let app: FastifyInstance;
let createdUserId: string | null = null;

beforeAll(async () => {
  // Create and prepare the Fastify server for testing
  app = await createServer();
  await app.ready();
});

afterAll(async () => {
  // If a user was created, delete it to clean up
  if (createdUserId) {
    const deleteMutation = `
      mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;
    const deleteResponse = await app.inject({
      method: 'POST',
      url: '/graphql',
      payload: { query: deleteMutation, variables: { id: createdUserId } },
    });
    expect(deleteResponse.statusCode).toBe(200);
    const deleteResult = JSON.parse(deleteResponse.body);
    expect(deleteResult.data.deleteUser).toBe(true);
  }
  // Close the server
  await app.close();
});

describe('GraphQL API tests', () => {
  it('should return an array for query users', async () => {
    const query = `
      query {
        users {
          id
          email
        }
      }
    `;
    const response = await app.inject({
      method: 'POST',
      url: '/graphql',
      payload: { query },
    });
    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.data).toHaveProperty('users');
    expect(Array.isArray(result.data.users)).toBe(true);
  });

  it('should create a user with mutation createUser', async () => {
    const input: CreateUserInput = {
      username: 'testUser',
      email: 'test@example.com',
    };

    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          username
          email
          watchlist
        }
      }
    `;
    const response = await app.inject({
      method: 'POST',
      url: '/graphql',
      payload: {
        query: mutation,
        variables: { input },
      },
    });
    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.body);
    expect(result.data).toHaveProperty('createUser');
    expect(result.data.createUser.email).toBe(input.email);
    // Save the created user's id for cleanup
    createdUserId = result.data.createUser.id;
  });
});
