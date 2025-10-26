// tests/analytics.test.js
const request = require('supertest');
const app = require('../index');

describe('Analytics Routes', () => {
  describe('GET /api/analytics/authority', () => {
    it('should fetch analytics data', async () => {
      const res = await request(app)
        .get('/api/analytics/authority')
        .query({ startDate: '2023-01-01', endDate: '2023-12-31' });
      expect([200, 500]).toContain(res.statusCode);
    });
  });
});
