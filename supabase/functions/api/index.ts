// AfriLove World — Mobile API gateway (Supabase Edge Function)
//
// Clean RESTful gateway for the AfriLove mobile app, served at
//   ${SUPABASE_URL}/functions/v1/api/<route>
//
// It runs server-side with the service-role key (auto-injected, never shipped to
// the app) and is the single secure entry point the mobile uses — the app only
// ever carries the publishable (anon) key plus a signed session token issued at
// login. The Next.js admin dashboard talks to the DB directly via service-role
// and does not use this function.
//
// Envelope: success → { ok: true, ...data }   error → { ok: false, error }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';
import { SignJWT, jwtVerify, importPKCS8 } from 'https://esm.sh/jose@5.9.6';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BUCKET = 'media';
const SECRET = new TextEncoder().encode(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
const ok = (extra: Record<string, unknown> = {}) => json({ ok: true, ...extra });
const fail = (error: string, status = 400) => json({ ok: false, error }, status);

const s = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const bool01 = (v: unknown) => (v === true || v === 'true' || v === 1 || v === '1' ? '1' : '0');
const normCc = (c: string) => (c ?? '').replace(/^\+/, '').trim();

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '' || v === 'null') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function ageFromBirth(b: unknown): number {
  if (!b) return 0;
  const d = new Date(String(b));
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000)));
}
function haversineKm(a: number, b: number, c: number, d: number): number {
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(c - a), dLon = toRad(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function imagesFrom(otherPic: unknown, profilePic: unknown): string[] {
  const list = s(otherPic).split('$;').map((x) => x.trim()).filter(Boolean);
  if (list.length) return list;
  const p = s(profilePic);
  return p ? [p] : [];
}
const idSet = (v: unknown) => new Set(s(v).split(',').map((x) => x.trim()).filter(Boolean));
function matchRatio(myInterest: unknown, theirInterest: unknown): number {
  const a = idSet(myInterest), b = idSet(theirInterest);
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return Math.round((inter / new Set([...a, ...b]).size) * 100);
}
function buildProfile(c: Record<string, any>, myLat: number | null, myLng: number | null, myInterest: unknown) {
  const cl = num(c.lats), cg = num(c.longs);
  let distance = '0';
  if (myLat !== null && myLng !== null && cl !== null && cg !== null) distance = haversineKm(myLat, myLng, cl, cg).toFixed(2);
  return {
    id: s(c.id), name: s(c.name), bio: s(c.profile_bio), age: ageFromBirth(c.birth_date),
    gender: s(c.gender), is_subscribe: bool01(c.is_subscribe), verified: Number(c.is_verify ?? 0) > 0,
    distance, images: imagesFrom(c.other_pic, c.profile_pic), match_ratio: matchRatio(myInterest, c.interest),
  };
}
async function getUser(uid: string | number) {
  const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
  return data;
}
function meCoords(me: any, lats: unknown, longs: unknown) {
  return { lat: num(lats) ?? num(me?.lats), lng: num(longs) ?? num(me?.longs) };
}
async function profilesByIds(ids: number[], me: any, lat: number | null, lng: number | null) {
  if (!ids.length) return [];
  const { data } = await supabase.from('users').select('*').in('id', ids).eq('status', true);
  return (data ?? []).map((c) => buildProfile(c, lat, lng, me?.interest));
}
async function catalogItems(table: string, csv: unknown, withImg: boolean) {
  const ids = [...idSet(csv)].map((x) => Number(x)).filter((n) => Number.isFinite(n));
  if (!ids.length) return [];
  const { data } = await supabase.from(table).select(withImg ? 'title,img' : 'title').in('id', ids);
  return (data ?? []).map((r: any) => ({ title: s(r.title), img: withImg ? s(r.img) : '' }));
}
/** Public-safe account shape returned to the app (never includes the password). */
function account(u: Record<string, any>) {
  return {
    id: s(u.id), name: s(u.name), email: s(u.email), mobile: s(u.mobile), ccode: s(u.ccode),
    gender: s(u.gender), birth_date: u.birth_date ?? null, profile_bio: s(u.profile_bio),
    profile_pic: s(u.profile_pic), other_pic: s(u.other_pic), images: imagesFrom(u.other_pic, u.profile_pic),
    search_preference: s(u.search_preference), radius_search: s(u.radius_search ?? ''),
    relation_goal: s(u.relation_goal ?? ''), interest: s(u.interest), language: s(u.language),
    religion: s(u.religion ?? ''), height: s(u.height), lats: s(u.lats), longs: s(u.longs),
    wallet: s(u.wallet ?? 0), coin: s(u.coin ?? 0), plan_id: s(u.plan_id ?? ''),
    is_subscribe: bool01(u.is_subscribe), is_verify: s(u.is_verify ?? 0), code: s(u.code),
    refercode: s(u.refercode ?? ''), status: bool01(u.status),
  };
}
async function uploadFile(file: File, prefix: string): Promise<string> {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const p = `users/${prefix}_${crypto.randomUUID()}.${ext}`;
  await supabase.storage.from(BUCKET).upload(p, new Uint8Array(await file.arrayBuffer()),
    { contentType: file.type || 'image/jpeg', upsert: true });
  return supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl;
}
async function planFlags(me: any) {
  let plan: any = null;
  if (me.plan_id) {
    const { data } = await supabase.from('plans').select('*').eq('id', me.plan_id).maybeSingle();
    plan = data;
  }
  const flag = (k: string) => (plan ? bool01(plan[k]) : '0');
  return { plan, flag };
}

// ── Session tokens (HS256, signed with the server-only service-role key) ──────
async function issueToken(uid: string | number): Promise<string> {
  return await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(String(uid))
    .setIssuedAt().setExpirationTime('60d').sign(SECRET);
}
async function uidFromRequest(req: Request): Promise<string | null> {
  const raw = req.headers.get('x-session-token') || req.headers.get('Authorization') || '';
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

type Handler = (req: Request, body: any, uid: string | null) => Promise<Response>;

// ── Public routes (no session required) ───────────────────────────────────────
const publicRoutes: Record<string, Handler> = {
  'GET config': async () => {
    const [{ data: st }, interests, languages, religions, goals, plans] = await Promise.all([
      supabase.from('settings').select('*').eq('id', 1).single(),
      supabase.from('interests').select('id,title,img').eq('status', true).order('id'),
      supabase.from('languages').select('id,title,img').eq('status', true).order('id'),
      supabase.from('religions').select('id,title').eq('status', true).order('id'),
      supabase.from('relation_goals').select('id,title,subtitle').eq('status', true).order('id'),
      supabase.from('plans').select('*').eq('status', true).order('id'),
    ]);
    const g = (k: string) => s(st?.[k]);
    return ok({
      settings: {
        webname: g('webname') || 'AfriLove World', currency: g('currency') || '$',
        maintenance: g('mode') || 'No', sms_type: g('sms_type'), otp_auth: g('otp_auth'),
        admob: g('admob') || 'No', gift_fun: g('coin_fun') || 'No',
        agora_app_id: g('agora_app_id'), map_key: g('map_key'),
        onesignal_key: g('one_key'), show_dark: g('show_dark') || '1',
      },
      interests: (interests.data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), img: s(r.img) })),
      languages: (languages.data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), img: s(r.img) })),
      religions: (religions.data ?? []).map((r) => ({ id: s(r.id), title: s(r.title) })),
      goals: (goals.data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), subtitle: s(r.subtitle) })),
      plans: (plans.data ?? []).map((p: any) => ({
        id: s(p.id), title: s(p.title), amt: s(p.amt), description: s(p.description), day_limit: s(p.day_limit),
        filter_include: bool01(p.filter_include), direct_chat: bool01(p.direct_chat),
        audio_video: bool01(p.audio_video), chat: bool01(p.chat), like_menu: bool01(p.like_menu),
      })),
    });
  },

  'POST auth/check-mobile': async (_r, b) => {
    const { data } = await supabase.from('users').select('id')
      .eq('mobile', s(b.mobile)).eq('ccode', normCc(s(b.ccode))).maybeSingle();
    return ok({ exists: !!data });
  },

  'POST auth/register': async (req, b) => {
    let row: Record<string, any>;
    const ct = req.headers.get('content-type') || '';
    let images: string[] = [];
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const f = (k: string) => (form.get(k) ?? '').toString();
      b = Object.fromEntries([...form.entries()].filter(([, v]) => !(v instanceof File)));
      const size = parseInt(f('size') || '0', 10) || 0;
      for (let i = 0; i < size; i++) {
        const file = form.get(`photo${i}`) ?? form.get(`otherpic${i}`);
        if (file instanceof File) images.push(await uploadFile(file, `${f('mobile')}_${i}`));
      }
    }
    const mobile = s(b.mobile), ccode = normCc(s(b.ccode));
    if (mobile) {
      const { data: exists } = await supabase.from('users').select('id').eq('mobile', mobile).eq('ccode', ccode).maybeSingle();
      if (exists) return fail('Mobile number already registered', 409);
    }
    if (b.email) {
      const { data: e } = await supabase.from('users').select('id').eq('email', s(b.email)).maybeSingle();
      if (e) return fail('Email already registered', 409);
    }
    if (!b.password) return fail('Password is required');
    row = {
      name: s(b.name), email: s(b.email) || null, mobile: mobile || null, ccode: ccode || null,
      gender: s(b.gender), birth_date: b.birth_date || null, profile_bio: s(b.profile_bio),
      search_preference: s(b.search_preference),
      radius_search: num(b.radius_search) ?? 100,
      relation_goal: num(b.relation_goal), religion: num(b.religion),
      interest: s(b.interest), language: s(b.language),
      lats: num(b.lats), longs: num(b.longs),
      profile_pic: images[0] ?? s(b.profile_pic) ?? '', other_pic: images.join('$;'),
      password: bcrypt.hashSync(s(b.password), 10),
      refercode: s(b.refercode) || '', code: crypto.randomUUID().slice(0, 8).toUpperCase(),
      user_type: 'REAL_USER', is_verify: 0, status: true,
    };
    const { data: created, error } = await supabase.from('users').insert(row).select().single();
    if (error) return fail(error.message);
    return ok({ user: account(created), token: await issueToken(created.id) });
  },

  'POST auth/login': async (_r, b) => {
    const id = s(b.identifier || b.email || b.mobile).trim();
    if (!id) return fail('Email or mobile is required');
    let q = supabase.from('users').select('*');
    q = id.includes('@') ? q.eq('email', id) : q.eq('mobile', id);
    const { data: u } = await q.maybeSingle();
    if (!u) return fail('Account not found', 404);
    if (!u.password || !bcrypt.compareSync(s(b.password), u.password)) return fail('Invalid credentials', 401);
    if (u.status === false) return fail('Your account is deactivated', 403);
    return ok({ user: account(u), token: await issueToken(u.id) });
  },

  'POST auth/forgot': async (_r, b) => {
    const id = s(b.identifier || b.email || b.mobile).trim();
    let q = supabase.from('users').select('id');
    q = id.includes('@') ? q.eq('email', id) : q.eq('mobile', id);
    const { data: u } = await q.maybeSingle();
    if (!u) return fail('Account not found', 404);
    await supabase.from('users').update({ password: bcrypt.hashSync(s(b.password), 10) }).eq('id', u.id);
    return ok({ message: 'Password updated' });
  },

  'POST otp/send': async () => ok({ otp: String(Math.floor(1000 + Math.random() * 9000)) }),

  'GET plans': async () => {
    const { data } = await supabase.from('plans').select('*').eq('status', true).order('id');
    return ok({ plans: (data ?? []).map((p: any) => ({
      id: s(p.id), title: s(p.title), amt: s(p.amt), description: s(p.description), day_limit: s(p.day_limit),
      filter_include: bool01(p.filter_include), direct_chat: bool01(p.direct_chat), audio_video: bool01(p.audio_video),
    })) });
  },
  'GET payment-gateways': async () => {
    const { data } = await supabase.from('payment_gateways').select('*').eq('status', true).eq('p_show', true).order('id');
    return ok({ gateways: (data ?? []).map((p: any) => ({
      id: s(p.id), title: s(p.title), subtitle: s(p.subtitle), img: s(p.img), attributes: p.attributes ?? {},
    })) });
  },
  'GET packages': async () => {
    const { data } = await supabase.from('packages').select('*').eq('status', true).order('id');
    return ok({ packages: (data ?? []).map((p: any) => ({ id: s(p.id), coin: s(p.coin), amt: s(p.amt) })) });
  },
  'GET gifts': async () => {
    const { data } = await supabase.from('gifts').select('*').eq('status', true).order('id');
    return ok({ gifts: (data ?? []).map((g: any) => ({ id: s(g.id), img: s(g.img), price: s(g.price) })) });
  },
  'GET faq': async () => {
    const { data } = await supabase.from('faqs').select('*').eq('status', true).order('id');
    return ok({ faqs: (data ?? []).map((q: any) => ({ id: s(q.id), question: s(q.question), answer: s(q.answer) })) });
  },
  'GET pages': async () => {
    const { data } = await supabase.from('pages').select('*').eq('status', true).order('id');
    return ok({ pages: (data ?? []).map((p: any) => ({ title: s(p.title), description: s(p.description) })) });
  },
};

// ── Protected routes (require a valid session token → uid) ───────────────────
const protectedRoutes: Record<string, Handler> = {
  'GET me': async (_r, _b, uid) => {
    const me = await getUser(uid!);
    return me ? ok({ user: account(me) }) : fail('User not found', 404);
  },

  // Mints a Firebase custom token (uid = this app user) so the client can
  // signInWithCustomToken and Firestore rules can trust request.auth.uid.
  // Requires the FIREBASE_SERVICE_ACCOUNT secret (the service-account JSON).
  'POST auth/firebase-token': async (_r, _b, uid) => {
    const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!raw) return fail('Firebase not configured', 500);
    let sa: { client_email: string; private_key: string };
    try {
      sa = JSON.parse(raw);
    } catch {
      return fail('Invalid FIREBASE_SERVICE_ACCOUNT', 500);
    }
    const key = await importPKCS8(sa.private_key, 'RS256');
    const aud = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';
    const token = await new SignJWT({ uid: String(uid) })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(sa.client_email)
      .setSubject(sa.client_email)
      .setAudience(aud)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);
    return ok({ token });
  },

  'POST home': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { lat, lng } = meCoords(me, b.lats, b.longs);
    const { data: st } = await supabase.from('settings').select('currency').eq('id', 1).single();
    const { plan, flag } = await planFlags(me);
    const [swiped, iBlocked, blockedMe] = await Promise.all([
      supabase.from('likes').select('target_id').eq('uid', me.id),
      supabase.from('blocks').select('blocked_id').eq('uid', me.id),
      supabase.from('blocks').select('uid').eq('blocked_id', me.id),
    ]);
    const exclude = new Set<number>([me.id]);
    (swiped.data ?? []).forEach((r: any) => exclude.add(r.target_id));
    (iBlocked.data ?? []).forEach((r: any) => exclude.add(r.blocked_id));
    (blockedMe.data ?? []).forEach((r: any) => exclude.add(r.uid));
    let q = supabase.from('users').select('*').eq('status', true).neq('id', me.id);
    const pref = s(me.search_preference).toUpperCase();
    if (pref === 'MALE' || pref === 'FEMALE') q = q.eq('gender', pref);
    const { data: candidates } = await q;
    const radius = num(me.radius_search) ?? 100;
    const profiles = (candidates ?? [])
      .filter((c) => !exclude.has(c.id))
      .map((c) => buildProfile(c, lat, lng, me.interest))
      .filter((p) => lat === null || lng === null || Number(p.distance) <= radius);
    return ok({
      profiles, currency: s(st?.currency ?? '$'), coin: s(me.coin ?? 0),
      plan_name: s(plan?.title), plan_id: s(me.plan_id ?? '0'), is_subscribe: bool01(me.is_subscribe),
      is_verify: s(me.is_verify ?? 0), flags: {
        direct_chat: flag('direct_chat'), like_menu: flag('like_menu'),
        audio_video: flag('audio_video'), filter_include: flag('filter_include'), chat: flag('chat'),
      },
    });
  },

  'POST like': async (_r, b, uid) => {
    const me = num(uid), target = num(b.target_id);
    if (me === null || target === null) return fail('Missing target');
    const action = s(b.type).toLowerCase();
    const type = action === 'like' ? 'like' : action === 'superlike' ? 'superlike' : 'dislike';
    await supabase.from('likes').upsert({ uid: me, target_id: target, type, created_at: new Date().toISOString() }, { onConflict: 'uid,target_id' });
    let matched = false;
    if (type !== 'dislike') {
      const { data: back } = await supabase.from('likes').select('id')
        .eq('uid', target).eq('target_id', me).in('type', ['like', 'superlike']).maybeSingle();
      if (back) {
        const [u1, u2] = me < target ? [me, target] : [target, me];
        await supabase.from('matches').upsert({ user1_id: u1, user2_id: u2 }, { onConflict: 'user1_id,user2_id' });
        matched = true;
      }
    }
    return ok({ matched });
  },

  'POST likes-me': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { lat, lng } = meCoords(me, b.lats, b.longs);
    const { data } = await supabase.from('likes').select('uid').eq('target_id', me.id).in('type', ['like', 'superlike']);
    return ok({ profiles: await profilesByIds((data ?? []).map((r: any) => r.uid), me, lat, lng) });
  },

  'POST favourites': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { lat, lng } = meCoords(me, b.lats, b.longs);
    const { data } = await supabase.from('likes').select('target_id').eq('uid', me.id).in('type', ['like', 'superlike']);
    return ok({ profiles: await profilesByIds((data ?? []).map((r: any) => r.target_id), me, lat, lng) });
  },

  'POST matches': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { lat, lng } = meCoords(me, b.lats, b.longs);
    const { data } = await supabase.from('matches').select('user1_id,user2_id').or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`);
    const others = (data ?? []).map((m: any) => (m.user1_id === me.id ? m.user2_id : m.user1_id));
    return ok({ profiles: await profilesByIds(others, me, lat, lng) });
  },

  'POST filter': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { lat, lng } = meCoords(me, b.lats, b.longs);
    const minAge = num(b.min_age) ?? 18, maxAge = num(b.max_age) ?? 100;
    const radius = num(b.radius_search) ?? num(me.radius_search) ?? 100;
    const pref = s(b.search_preference).toUpperCase();
    let q = supabase.from('users').select('*').eq('status', true).neq('id', me.id);
    if (pref === 'MALE' || pref === 'FEMALE') q = q.eq('gender', pref);
    if (num(b.relation_goal)) q = q.eq('relation_goal', num(b.relation_goal));
    if (num(b.religion)) q = q.eq('religion', num(b.religion));
    if (s(b.verified) === '1' || b.verified === true) q = q.gt('is_verify', 0);
    const { data: candidates } = await q;
    const profiles = (candidates ?? []).map((c) => buildProfile(c, lat, lng, me.interest))
      .filter((p) => p.age >= minAge && p.age <= maxAge)
      .filter((p) => lat === null || lng === null || Number(p.distance) <= radius);
    return ok({ profiles });
  },

  'POST profile': async (_r, b, uid) => {
    const me = await getUser(uid!);
    const t = await getUser(s(b.profile_id || b.id));
    if (!t) return fail('Profile not found', 404);
    const { lat, lng } = meCoords(me, b.lats, b.longs);
    const base = buildProfile(t, lat, lng, me?.interest);
    let relTitle = '', relSub = '', relgTitle = '';
    if (t.relation_goal) {
      const { data } = await supabase.from('relation_goals').select('title,subtitle').eq('id', t.relation_goal).maybeSingle();
      relTitle = s(data?.title); relSub = s(data?.subtitle);
    }
    if (t.religion) {
      const { data } = await supabase.from('religions').select('title').eq('id', t.religion).maybeSingle();
      relgTitle = s(data?.title);
    }
    return ok({
      profile: {
        ...base, height: s(t.height), relation_title: relTitle, relation_subtitle: relSub, religion_title: relgTitle,
        interests: await catalogItems('interests', t.interest, true),
        languages: await catalogItems('languages', t.language, true),
      },
    });
  },

  'PATCH profile': async (req, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const ct = req.headers.get('content-type') || '';
    let kept: string[] = [];
    const fresh: string[] = [];
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const f = (k: string) => (form.get(k) ?? '').toString();
      kept = f('keep_images').split('$;').map((x) => x.trim()).filter(Boolean);
      const size = parseInt(f('size') || '0', 10) || 0;
      for (let i = 0; i < size; i++) {
        const file = form.get(`photo${i}`);
        if (file instanceof File) fresh.push(await uploadFile(file, `${me.id}_${i}`));
      }
      b = Object.fromEntries([...form.entries()].filter(([, v]) => !(v instanceof File)));
    }
    const upd: Record<string, any> = {};
    const set = (k: string, v: any) => { if (v !== undefined && v !== '') upd[k] = v; };
    set('name', b.name); set('email', b.email); set('gender', b.gender);
    set('birth_date', b.birth_date || undefined); set('profile_bio', b.profile_bio);
    set('search_preference', b.search_preference); set('interest', b.interest);
    set('language', b.language); set('height', b.height);
    if (num(b.radius_search) !== null) upd.radius_search = num(b.radius_search);
    if (num(b.relation_goal) !== null) upd.relation_goal = num(b.relation_goal);
    if (num(b.religion) !== null) upd.religion = num(b.religion);
    if (num(b.lats) !== null) upd.lats = num(b.lats);
    if (num(b.longs) !== null) upd.longs = num(b.longs);
    const allImgs = [...kept, ...fresh];
    if (allImgs.length) { upd.other_pic = allImgs.join('$;'); upd.profile_pic = allImgs[0]; }
    if (b.password) upd.password = bcrypt.hashSync(s(b.password), 10);
    const { data: updated, error } = await supabase.from('users').update(upd).eq('id', me.id).select().single();
    if (error) return fail(error.message);
    return ok({ user: account(updated) });
  },

  'POST upload': async (req, _b, uid) => {
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('multipart/form-data')) return fail('Expected multipart form data');
    const form = await req.formData();
    const file = form.get('photo0') ?? form.get('file');
    if (!(file instanceof File)) return fail('No file provided');
    const url = await uploadFile(file, `chat_${uid}`);
    return ok({ url });
  },

  'POST identity': async (req, b, uid) => {
    let img = s(b.img);
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('photo0') ?? form.get('document');
      if (file instanceof File) img = await uploadFile(file, `kyc_${uid}`);
    }
    if (!img) return fail('No document provided');
    // is_verify: 0 = none, 1 = pending review, 2 = verified (set by admin)
    const { data } = await supabase.from('users').update({ identity_picture: img, is_verify: 1 }).eq('id', uid).select().single();
    return data ? ok({ user: account(data) }) : fail('User not found', 404);
  },

  'POST block': async (_r, b, uid) => {
    const me = num(uid), target = num(b.target_id);
    if (me === null || target === null) return fail('Missing target');
    await supabase.from('blocks').upsert({ uid: me, blocked_id: target }, { onConflict: 'uid,blocked_id' });
    return ok({ message: 'User blocked' });
  },
  'POST unblock': async (_r, b, uid) => {
    await supabase.from('blocks').delete().eq('uid', uid).eq('blocked_id', s(b.target_id));
    return ok({ message: 'User unblocked' });
  },
  'POST blocklist': async (_r, _b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { data } = await supabase.from('blocks').select('blocked_id').eq('uid', me.id);
    return ok({ profiles: await profilesByIds((data ?? []).map((r: any) => r.blocked_id), me, num(me.lats), num(me.longs)) });
  },
  'POST report': async (_r, b, uid) => {
    await supabase.from('reports').insert({ uid: num(b.target_id), reporter_id: num(uid), comment: s(b.comment) });
    return ok({ message: 'Report submitted' });
  },
  'DELETE account': async (_r, _b, uid) => {
    await supabase.from('users').delete().eq('id', uid);
    return ok({ message: 'Account deleted' });
  },

  'POST plan/purchase': async (_r, b, uid) => {
    const { data: plan } = await supabase.from('plans').select('*').eq('id', s(b.plan_id)).maybeSingle();
    if (!plan) return fail('Plan not found', 404);
    const start = new Date(), end = new Date();
    end.setDate(end.getDate() + (Number(plan.day_limit) || 30));
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    await supabase.from('plan_purchase_history').insert({
      uid: num(uid), plan_id: plan.id, p_name: s(b.method), amount: plan.amt, day: plan.day_limit,
      plan_title: plan.title, plan_description: plan.description, start_date: iso(start), expire_date: iso(end),
      trans_id: s(b.transaction_id), p_method_id: s(b.method_id),
    });
    await supabase.from('users').update({
      plan_id: plan.id, is_subscribe: true, plan_start_date: start.toISOString(), plan_end_date: end.toISOString(),
    }).eq('id', uid);
    return ok({ message: 'Plan purchased' });
  },

  'POST wallet/topup': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const amt = num(b.amount) ?? 0;
    const bal = Number(me.wallet ?? 0) + amt;
    await supabase.from('users').update({ wallet: bal }).eq('id', me.id);
    await supabase.from('wallet_reports').insert({ uid: me.id, amt, message: 'Wallet top-up', status: 'Credit' });
    return ok({ wallet: s(bal) });
  },
  'POST wallet/report': async (_r, _b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { data } = await supabase.from('wallet_reports').select('*').eq('uid', me.id).order('tdate', { ascending: false });
    return ok({ wallet: s(me.wallet ?? 0), items: (data ?? []).map((r: any) => ({ message: s(r.message), status: s(r.status), amt: s(r.amt), date: r.tdate })) });
  },
  'POST package/purchase': async (_r, b, uid) => {
    const me = await getUser(uid!);
    const { data: pkg } = await supabase.from('packages').select('*').eq('id', s(b.package_id)).maybeSingle();
    if (!me || !pkg) return fail('Invalid request');
    const coin = Number(me.coin ?? 0) + Number(pkg.coin ?? 0);
    const wallet = b.from_wallet ? Number(me.wallet ?? 0) - Number(pkg.amt ?? 0) : Number(me.wallet ?? 0);
    await supabase.from('users').update({ coin, wallet }).eq('id', me.id);
    await supabase.from('coin_reports').insert({ uid: me.id, amt: pkg.coin, message: 'Coin package purchase', status: 'Credit' });
    return ok({ coin: s(coin) });
  },
  'POST coin/report': async (_r, _b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { data: st } = await supabase.from('settings').select('coin_amt,coin_limit').eq('id', 1).single();
    const { data } = await supabase.from('coin_reports').select('*').eq('uid', me.id).order('tdate', { ascending: false });
    return ok({
      coin: s(me.coin ?? 0), coin_amt: s(st?.coin_amt ?? 0), coin_limit: s(st?.coin_limit ?? 0),
      items: (data ?? []).map((r: any) => ({ message: s(r.message), status: s(r.status), amt: s(r.amt), date: r.tdate })),
    });
  },
  'POST gift/buy': async (_r, b, uid) => {
    const sender = await getUser(uid!);
    if (!sender) return fail('User not found', 404);
    await supabase.from('user_gifts').insert({ sender_id: sender.id, receiver_id: num(b.receiver_id), gift_id: num(b.gift_id) });
    const spent = num(b.coin) ?? 0;
    await supabase.from('users').update({ coin: Number(sender.coin ?? 0) - spent }).eq('id', sender.id);
    await supabase.from('coin_reports').insert({ uid: sender.id, amt: spent, message: 'Gift sent', status: 'Debit' });
    return ok({ message: 'Gift sent' });
  },
  'POST gifts/received': async (_r, _b, uid) => {
    const { data } = await supabase.from('user_gifts')
      .select('gift:gifts(img), sender:users!user_gifts_sender_id_fkey(name,profile_pic)')
      .eq('receiver_id', uid).order('id', { ascending: false });
    return ok({ gifts: (data ?? []).map((r: any) => ({ gift_img: s(r.gift?.img), name: s(r.sender?.name), img: s(r.sender?.profile_pic) })) });
  },
  'POST withdraw': async (_r, b, uid) => {
    const me = await getUser(uid!);
    if (!me) return fail('User not found', 404);
    const { data: st } = await supabase.from('settings').select('coin_amt').eq('id', 1).single();
    const coin = num(b.coin) ?? 0;
    await supabase.from('payouts').insert({
      uid: me.id, coin, amt: coin * Number(st?.coin_amt ?? 0), status: 'pending', r_type: s(b.method),
      acc_number: s(b.acc_number), bank_name: s(b.bank_name), acc_name: s(b.acc_name),
      ifsc: s(b.ifsc), upi_id: s(b.upi_id), paypal_id: s(b.paypal_id),
    });
    await supabase.from('users').update({ coin: Number(me.coin ?? 0) - coin }).eq('id', me.id);
    return ok({ message: 'Withdrawal requested' });
  },
  'POST payouts': async (_r, _b, uid) => {
    const { data } = await supabase.from('payouts').select('*').eq('uid', uid).order('r_date', { ascending: false });
    return ok({ payouts: (data ?? []).map((p: any) => ({
      id: s(p.id), amt: s(p.amt), coin: s(p.coin), status: s(p.status), date: p.r_date, method: s(p.r_type),
    })) });
  },
  'POST notifications': async (_r, _b, uid) => {
    const { data } = await supabase.from('notifications').select('*').eq('uid', uid).order('datetime', { ascending: false });
    return ok({ notifications: (data ?? []).map((n: any) => ({ id: s(n.id), title: s(n.title), description: s(n.description), datetime: n.datetime })) });
  },
  'POST referral': async (_r, _b, uid) => {
    const me = await getUser(uid!);
    const { data: st } = await supabase.from('settings').select('scredit').eq('id', 1).single();
    return ok({ code: s(me?.code || me?.refercode || ''), signup_credit: s(st?.scredit ?? 0), refer_credit: s(st?.scredit ?? 0) });
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  // Strip the function mount prefix (/functions/v1/api or /api) → app route.
  const route = new URL(req.url).pathname
    .replace(/^\/functions\/v1/, '')
    .replace(/^\/api\/?/, '')
    .replace(/\/+$/, '');
  const key = `${req.method} ${route}`;

  try {
    if (publicRoutes[key]) {
      const body = req.method === 'GET' ? {} : await req.clone().json().catch(() => ({}));
      return await publicRoutes[key](req, body, null);
    }
    if (protectedRoutes[key]) {
      const uid = await uidFromRequest(req);
      if (!uid) return fail('Unauthorized', 401);
      const body = ['GET', 'DELETE'].includes(req.method) ? {} : await req.clone().json().catch(() => ({}));
      return await protectedRoutes[key](req, body, uid);
    }
    return fail(`Route '${key}' not found`, 404);
  } catch (e) {
    return fail(String(e), 500);
  }
});
