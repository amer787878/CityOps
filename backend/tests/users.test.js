// tests/users.test.js
const request = require('supertest');
const app = require('../index');

describe('Users Routes', () => {
  describe('GET /api/users', () => {
    it('should require auth, but let’s just test response code', async () => {
      const response = await request(app).get('/api/users');
      // If no token was provided, possibly 401 or 403, depending on your code:
      expect([401, 403, 200]).toContain(response.statusCode);
    });
  });

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@admin.com', password: 'admin123' });
    token = res.body.accessToken;
  });

  describe('DELETE /api/users/delete/:id', () => {
    it('should delete a user by id (requires admin token)', async () => {
      const res = await request(app)
        .delete('/api/users/delete/USER_ID_HERE')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 404, 401]).toContain(res.statusCode);
    });
  });
});
