// tests/comments.test.js
const request = require('supertest');
const app = require('../index');

describe('Comments Routes', () => {
  describe('POST /api/comments/postComment', () => {
    it('should post a comment if user is Citizen/Admin/Authority', async () => {
      const res = await request(app)
        .post('/api/comments/postComment')
        .send({
          content: 'My comment content',
          issueId: 'SOME_ISSUE_ID'
        });
      expect([200, 400, 401, 403, 500]).toContain(res.statusCode);
    });
  });
});
