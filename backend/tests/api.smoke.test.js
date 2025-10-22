const request = require('supertest');
const app = require('../src/index');

const API_KEY = process.env.API_KEY || 'dev-key';

// Valid payload aligned with your existing items (garbage + Chennai coords)
const validIssue = {
  title: 'Overflowing Garbage Bin',
  description: 'Garbage bin at 4th street is overflowing for 2 days.',
  category: 'garbage',
  lat: 13.0827,
  lng: 80.2707
};

describe('API smoke', () => {
  it('health 200', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ ok: true });
  });

  it('create -> upvote -> list -> analytics', async () => {
    // Create
    const create = await request(app)
      .post('/issues')
      .set('x-api-key', API_KEY)
      .send(validIssue);

    // If it fails, surface the body for quick diagnosis
    if (create.status !== 201) {
      // Helpful assertion to show why it failed
      throw new Error(`Create failed: status=${create.status}, body=${JSON.stringify(create.body)}`);
    }

    const id = create.body._id || create.body.id;
    expect(id).toBeTruthy();

    // Upvote
    const up = await request(app)
      .post(`/issues/${id}/upvote`)
      .set('x-api-key', API_KEY);
    if (up.status !== 200) {
      throw new Error(`Upvote failed: status=${up.status}, body=${JSON.stringify(up.body)}`);
    }

    // List
    const list = await request(app).get('/issues');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.items)).toBe(true);

    // Analytics
    const analytics = await request(app).get('/issues/analytics');
    expect(analytics.status).toBe(200);
    const { total, open, resolved } = analytics.body;
    expect(typeof total).toBe('number');
    expect(typeof open).toBe('number');
    expect(typeof resolved).toBe('number');
  });

  // Optional: enable if you want to smoke the upload endpoint too
  it.skip('upload issue (multipart) returns 201', async () => {
    const tinyJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]); // minimal JPEG bytes
    const upload = await request(app)
      .post('/issues/upload')
      .set('x-api-key', API_KEY)
      .field('title', 'Overflowing Garbage Bin')
      .field('description', 'Bin overflowing for 2 days.')
      .field('category', 'garbage')
      // If you want to provide coords fallback, pass both lat and lng as strings:
      .field('lat', '13.0827')
      .field('lng', '80.2707')
      .attach('photo', tinyJpeg, 'photo.jpg');

    if (upload.status !== 201) {
      throw new Error(`Upload failed: status=${upload.status}, body=${JSON.stringify(upload.body)}`);
    }
  });

  // Clean up server handle to avoid open-handle warning (temporary workaround)
  afterAll(() => {
    if (app.locals?.server) {
      try { app.locals.server.close(); } catch (_) {}
    }
  });
});
