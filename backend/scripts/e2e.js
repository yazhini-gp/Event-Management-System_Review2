/* eslint-disable no-console */
(async () => {
  const base = 'http://localhost:5000';
  const j = async (r) => {
    const t = await r.text();
    try { return JSON.parse(t); } catch { return t; }
  };
  async function post(url, body, token) {
    return j(await fetch(base + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body || {}),
    }));
  }
  async function get(url, token) {
    return j(await fetch(base + url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }));
  }
  function log(step, data) {
    console.log(`\n=== ${step} ===`);
    if (typeof data === 'string') console.log(data);
    else console.log(JSON.stringify(data));
  }

  // Health
  const health = await get('/api/health');
  log('Health', health);

  // Organizer signup/login
  let orgSignup = await post('/api/auth/signup', { name: 'Org', email: 'org@example.com', password: 'pass123', role: 'admin' });
  if (orgSignup.error && /exists/i.test(orgSignup.error)) {
    // user exists, continue
  } else {
    log('Signup organizer', orgSignup);
  }
  const orgLogin = await post('/api/auth/login', { email: 'org@example.com', password: 'pass123' });
  log('Login organizer', orgLogin);
  const orgToken = orgLogin.token;

  // Create event
  const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const endAt = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();
  const createEv = await post('/api/events/create', { title: 'Launch Event', description: 'Test event', startAt, endAt, timezone: 'UTC', location: 'Online', status: 'published', guests: ['att@example.com'] }, orgToken);
  log('Create event', createEv);
  const eventId = createEv?.event?._id;

  // Invitations
  if (eventId) {
    const inv = await post(`/api/invitations/${eventId}`, { emails: ['att@example.com'] }, orgToken);
    log('Create invitations', inv);
  }

  // Attendee signup/login
  let attSignup = await post('/api/auth/signup', { name: 'Att', email: 'att@example.com', password: 'pass123' });
  if (!(attSignup.error && /exists/i.test(attSignup.error))) {
    log('Signup attendee', attSignup);
  }
  const attLogin = await post('/api/auth/login', { email: 'att@example.com', password: 'pass123' });
  log('Login attendee', attLogin);
  const attToken = attLogin.token;

  // RSVP
  if (eventId) {
    const rsvp = await post(`/api/rsvps/${eventId}`, { status: 'going' }, attToken);
    log('RSVP going (attendee)', rsvp);

    // Seed reminders
    const seed = await post(`/api/reminders/seed/${eventId}`, {}, orgToken);
    log('Seed reminders', seed);

    // Recommendations
    const recs = await get('/api/recommendations', attToken);
    log('Recommendations (attendee)', recs);

    // Certificate status check (head is fine but GET returns pdf)
    const me = await get('/api/auth/me', attToken);
    const certRes = await fetch(`${base}/api/certificates/${eventId}/${me.id}`, { headers: { Authorization: `Bearer ${attToken}` } });
    console.log(`\n=== Certificate status ===\n${certRes.status} ${certRes.headers.get('content-type')}`);
  }

  console.log('\nAll done.');
})().catch((e) => { console.error(e); process.exit(1); });





