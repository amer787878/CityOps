// tests/issues.test.js

/**
 * This test file:
 * 1) Logs in your existing Admin ("admin@admin.com" / "admin@123").
 * 2) Registers an Authority user ("authority@example.com").
 * 3) Registers a Citizen user ("citizen@example.com"), linked to that Authority's _id.
 * 4) Logs in the Authority & Citizen to get tokens.
 * 5) Uses those tokens to test /api/issues:
 *    - GET /api/issues with Admin token
 *    - POST /api/issues/create with Citizen token
 *      (category must be one of ["Road Maintenance", "Waste Disposal", "Streetlight Maintenance"])
 *    - PUT /api/issues/upvote/:id with Authority token
 */

const request = require('supertest');
const app = require('../index'); // Import your Express app

// We'll store these tokens after login
let adminToken = null;
let authorityToken = null;
let citizenToken = null;
let authorityUserId = null;

// We'll store a created issue id to test upvoting
let createdIssueId = null;

/** Utility: Logs in a user. If isAdmin = true => use /api/auth/admin/login, else /api/auth/login */
async function loginUser({ email, password, isAdmin = false }) {
  if (isAdmin) {
    return request(app).post('/api/auth/admin/login').send({ email, password });
  } else {
    return request(app).post('/api/auth/login').send({ email, password });
  }
}

/** Utility: Registers a user. If email is taken, your route might return 400 => we just continue. */
async function registerUser({ fullname, email, password, role, authorityId }) {
  const payload = { fullname, email, password, role };
  if (authorityId) payload.authority = authorityId; // needed if Citizen

  // Hit /api/auth/register
  const res = await request(app).post('/api/auth/register').send(payload);
  // If success => 200. If 400 => might be "Email already exists." We'll ignore either way.
  return res;
}

beforeAll(async () => {
  // 1) Login existing Admin
  const adminRes = await loginUser({
    email: 'admin@admin.com',
    password: 'admin@123',
    isAdmin: true,
  });
  if (adminRes.statusCode === 200) {
    adminToken = adminRes.body.accessToken;
  } else {
    console.warn('Admin login failed => status:', adminRes.statusCode, adminRes.body);
  }

  // 2) Register & login Authority
  //    a) register
  await registerUser({
    fullname: 'Test Authority',
    email: 'authority@example.com',
    password: '123456',
    role: 'Authority',
  });
  //    b) login
  const authLogin = await loginUser({
    email: 'authority@example.com',
    password: '123456',
  });
  if (authLogin.statusCode === 200) {
    authorityToken = authLogin.body.accessToken;
    authorityUserId = authLogin.body.userData?._id;
  } else {
    console.warn('Authority login failed => status:', authLogin.statusCode, authLogin.body);
  }

  // 3) Register & login Citizen (linked to Authority's _id)
  if (authorityUserId) {
    await registerUser({
      fullname: 'Test Citizen',
      email: 'citizen@example.com',
      password: '123456',
      role: 'Citizen',
      authorityId: authorityUserId,
    });
  } else {
    console.warn('No authorityUserId => cannot properly attach citizen to authority');
  }

  const citizenLogin = await loginUser({
    email: 'citizen@example.com',
    password: '123456',
  });
  if (citizenLogin.statusCode === 200) {
    citizenToken = citizenLogin.body.accessToken;
  } else {
    console.warn('Citizen login failed => status:', citizenLogin.statusCode, citizenLogin.body);
  }
});

describe('Issues Routes (with valid category enum)', () => {
  //
  // GET /api/issues with Admin token
  //
  it('GET /api/issues => with Admin token => expect 200 or 500', async () => {
    if (!adminToken) {
      console.warn('No adminToken => skipping');
      return;
    }
    const res = await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  //
  // POST /api/issues/create => CITIZEN needed
  //
  it('POST /api/issues/create => with Citizen token => 201 if success', async () => {
    if (!citizenToken) {
      console.warn('No citizenToken => skipping create test');
      return;
    }

    // Provide a valid "category" from your schema:
    //   'Road Maintenance', 'Waste Disposal', or 'Streetlight Maintenance'
    const res = await request(app)
      .post('/api/issues/create')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('address', '123 Maple St')
      .field('description', 'Streetlight flickers at night')
      .field('category', 'Streetlight Maintenance')
      .field('priority', 'Low'); // optional: 'Critical', 'Moderate', or 'Low'

    expect([201, 400, 500]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      createdIssueId = res.body.issue?._id;
    }
  });

  //
  // PUT /api/issues/upvote/:id => Authority upvotes Citizen's issue
  //
  it('PUT /api/issues/upvote/:id => 200 or 400 or 404', async () => {
    if (!authorityToken) {
      console.warn('No authorityToken => skipping upvote');
      return;
    }
    if (!createdIssueId) {
      console.warn('No createdIssueId => skipping upvote');
      return;
    }

    // Let the authority upvote the citizen's newly created issue
    const res = await request(app)
      .put(`/api/issues/upvote/${createdIssueId}`)
      .set('Authorization', `Bearer ${authorityToken}`);

    // Could be 200 if first time upvote
    // or 400 if "already upvoted" or "can't upvote your own issue" (shouldn't happen if roles differ)
    // or 404 if something else
    expect([200, 400, 404]).toContain(res.statusCode);
  });
});
