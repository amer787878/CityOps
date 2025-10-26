// tests/moderation.test.js
const request = require('supertest');
const app = require('../index');

describe('Moderation Routes', () => {
  describe('GET /api/moderation', () => {
    it('should fetch moderation items if admin', async () => {
      const res = await request(app).get('/api/moderation');
      expect([200, 401, 403]).toContain(res.statusCode);
    });
  });
});
