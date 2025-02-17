import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { TestUtils } from '@/__tests__/setup/testUtils';
import { GET } from '@/app/api/users/route';

describe('User List API', () => {
  let testUser;
  let adminUser;

  beforeAll(async () => {
    // Create test users
    testUser = await TestUtils.createTestUser();
    adminUser = await TestUtils.createTestUser({
      roles: ['admin'],
      approvalStatus: 'approved'
    });
  });

  afterAll(async () => {
    // Cleanup
    await Promise.all([
      TestUtils.cleanupTestUser(testUser.uid),
      TestUtils.cleanupTestUser(adminUser.uid)
    ]);
  });

  it('should list users with pagination for admin', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        pageSize: '10'
      }
    });

    req.user = adminUser; // Simulate authenticated admin request

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toBeInstanceOf(Array);
    expect(data.pagination).toBeDefined();
  });

  // More test cases...
}); 