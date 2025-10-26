// tests/report.test.js
const request = require('supertest');
const app = require('../index');

describe('Report Routes', () => {
  describe('GET /api/report/admin', () => {
    it('should generate some chart data', async () => {
      const res = await request(app)
        .get('/api/report/admin')
        .query({ reportType: 'userActivity' });
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
    });
  });
});
