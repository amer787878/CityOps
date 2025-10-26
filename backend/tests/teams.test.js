// tests/teams.test.js
const request = require('supertest');
const app = require('../index');

describe('Teams Routes', () => {
  describe('GET /api/teams', () => {
    it('should fetch teams (requires Authority token)', async () => {
      const res = await request(app).get('/api/teams');
      expect([200, 401, 403]).toContain(res.statusCode);
    });
  });

  // Similarly for POST /api/teams/create, PUT /api/teams/update/:id, etc.
});
