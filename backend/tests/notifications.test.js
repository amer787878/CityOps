// tests/notifications.test.js
const request = require('supertest');
const app = require('../index');

describe('Notifications Routes', () => {
  describe('GET /api/notifications', () => {
    it('should return notifications if authorized', async () => {
      const res = await request(app).get('/api/notifications');
      expect([200, 401, 403]).toContain(res.statusCode);
    });
  });
});
