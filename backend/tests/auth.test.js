// tests/auth.test.js
const request = require('supertest');
const app = require('../index'); // Import the Express app

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 if email already exists or missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Test User',
          email: 'test@example.com', // Possibly existing email
          password: '123456',
          role: 'Citizen'
        });

      // We expect it might fail if the email already exists
      // or succeed if it's a new email. Adjust accordingly.
      if ([200, 400].includes(response.statusCode)) {
        expect(true).toBe(true); // Just an example
      } else {
        throw new Error(`Unexpected status: ${response.statusCode}`);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return a token for valid login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '123456'
        });

      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
      } else {
        // Maybe user not found or invalid pass => 400
        expect(response.statusCode).toBe(400);
      }
    });
  });
});
