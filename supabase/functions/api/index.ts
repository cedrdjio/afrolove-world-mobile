// AfriLove World — Mobile API gateway (Supabase Edge Function)
// Re-implements the legacy GoMeet PHP endpoints on top of the shared Supabase DB
// (project sbvlkjaifqocakgxvdea), so the mobile app and the admin dashboard use
// the SAME database. Deployed via the Supabase MCP / CLI.
//
// Phase 1 (DONE): bootstrap + catalog.
// Phase 2 (DONE): auth — mobile_check, reg_user, user_login, forget_password.
// Phase 3 (DONE): core — home_data, like_dislike, del_unlike, like_me,
//                 favourite, passed, new_match, map_info, filter.
//
// Security: service-role key (auto-injected, server-side only). No secret in
// the app. Passwords bcrypt-hashed and never returned.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BUCKET = 'media';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const ok = (extra: Record<string, unknown>) =>
  ({ ResponseCode: '200', Result: 'true', ResponseMsg: 'Success', ...extra });
const fail = (msg: string) => ({ ResponseCode: '401', Result: 'false', ResponseMsg: msg });
const s = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const bool01 = (v: unknown) => (v === true || v === 'true' || v === 1 || v === '1' ? '1' : '0');
const normCc = (c: string) => (c ?? '').replace(/^\+/, '').trim();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

// ── helpers ────────────────────────────────────────────────────────────────
function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '' || v === 'null') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function ageFromBirth(b: unknown): number {
  if (!b) return 0;
  const d = new Date(String(b));
  if (isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
}

function haversineKm(a: number, b: number, c: number, d: number): number {
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(c - a), dLon = toRad(d - b);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function imagesFrom(otherPic: unknown, profilePic: unknown): string[] {
  const list = s(otherPic).split('$;').map((x) => x.trim()).filter(Boolean);
  if (list.length) return list;
  const p = s(profilePic);
  return p ? [p] : [];
}

const idSet = (v: unknown) =>
  new Set(s(v).split(',').map((x) => x.trim()).filter(Boolean));

function matchRatio(myInterest: unknown, theirInterest: unknown): number {
  const a = idSet(myInterest), b = idSet(theirInterest);
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = new Set([...a, ...b]).size;
  return Math.round((inter / union) * 100);
}

// Build the profile object shared by home_data / like_me / favourite / passed /
// new_match (extra keys are ignored by the app's fromJson).
function buildProfile(c: Record<string, any>, myLat: number | null, myLng: number | null, myInterest: unknown) {
  const cl = num(c.lats), cg = num(c.longs);
  let distance = '0';
  if (myLat !== null && myLng !== null && cl !== null && cg !== null) {
    distance = haversineKm(myLat, myLng, cl, cg).toFixed(2);
  }
  return {
    profile_id: s(c.id),
    profile_name: s(c.name),
    profile_bio: s(c.profile_bio),
    profile_age: ageFromBirth(c.birth_date),
    is_subscribe: bool01(c.is_subscribe),
    is_verify: s(c.is_verify ?? 0),
    profile_distance: distance,
    profile_images: imagesFrom(c.other_pic, c.profile_pic),
    match_ratio: matchRatio(myInterest, c.interest),
  };
}

async function getMe(uid: string) {
  const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
  return data;
}

// Resolve the current location: prefer the request coords, else stored.
function meCoords(me: any, lats: unknown, longs: unknown) {
  return { lat: num(lats) ?? num(me?.lats), lng: num(longs) ?? num(me?.longs) };
}

// Fetch users by a list of ids and map to profile objects.
async function profilesByIds(ids: number[], me: any, lat: number | null, lng: number | null) {
  if (!ids.length) return [];
  const { data } = await supabase.from('users').select('*').in('id', ids).eq('status', true);
  return (data ?? []).map((c) => buildProfile(c, lat, lng, me?.interest));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const path = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';

  try {
    switch (path) {
      // ── Phase 1: bootstrap + catalog ────────────────────────────────────
      case 'sms_type.php': {
        const { data: st } = await supabase.from('settings').select('*').eq('id', 1).single();
        const g = (k: string) => s(st?.[k]);
        return json(ok({
          SMS_TYPE: g('sms_type'), Admob_Enabled: g('admob') || 'No',
          maintainance_Enabled: g('mode') || 'No', Social_login_enabled: 'No',
          banner_id: g('banner_id'), in_id: g('in_id'), otp_auth: g('otp_auth'),
          gift_fun: g('coin_fun') || 'No', ios_in_id: g('ios_in_id'),
          ios_banner_id: g('ios_banner_id'), agora_app_id: g('agora_app_id'),
          one_key: g('one_key'),
        }));
      }
      case 'interest.php': {
        const { data } = await supabase.from('interests').select('id,title,img').eq('status', true).order('id');
        return json(ok({ interestlist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), img: s(r.img) })) }));
      }
      case 'languagelist.php': {
        const { data } = await supabase.from('languages').select('id,title,img').eq('status', true).order('id');
        return json(ok({ languagelist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), img: s(r.img) })) }));
      }
      case 'religionlist.php': {
        const { data } = await supabase.from('religions').select('id,title').eq('status', true).order('id');
        return json(ok({ religionlist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title) })) }));
      }
      case 'goal.php': {
        const { data } = await supabase.from('relation_goals').select('id,title,subtitle').eq('status', true).order('id');
        return json(ok({ goallist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), subtitle: s(r.subtitle) })) }));
      }

      // ── Phase 2: auth ───────────────────────────────────────────────────
      case 'mobile_check.php': {
        const b = await req.json().catch(() => ({}));
        const { data } = await supabase.from('users').select('id')
          .eq('mobile', s(b.mobile)).eq('ccode', normCc(s(b.ccode))).maybeSingle();
        return data
          ? json({ ResponseCode: '200', Result: 'false', ResponseMsg: 'Mobile number already registered' })
          : json(ok({ ResponseMsg: 'Mobile number available' }));
      }
      case 'reg_user.php': {
        const form = await req.formData();
        const f = (k: string) => (form.get(k) ?? '').toString();
        const mobile = f('mobile'), ccode = normCc(f('ccode'));
        const { data: exists } = await supabase.from('users').select('id')
          .eq('mobile', mobile).eq('ccode', ccode).maybeSingle();
        if (exists) return json(fail('Mobile number already registered'));
        const size = parseInt(f('size') || '0', 10) || 0;
        const urls: string[] = [];
        for (let i = 0; i < size; i++) {
          const file = form.get(`otherpic${i}`);
          if (file instanceof File) {
            const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
            const p = `users/${mobile}_${i}_${crypto.randomUUID()}.${ext}`;
            await supabase.storage.from(BUCKET).upload(p, new Uint8Array(await file.arrayBuffer()),
              { contentType: file.type || 'image/jpeg', upsert: true });
            urls.push(supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl);
          }
        }
        const row: Record<string, any> = {
          name: f('name'), email: f('email'), mobile, ccode, gender: f('gender'),
          birth_date: f('birth_date') || null, profile_bio: f('profile_bio'),
          search_preference: f('search_preference'),
          radius_search: parseInt(f('radius_search') || '100', 10) || 100,
          relation_goal: f('relation_goal') ? parseInt(f('relation_goal'), 10) : null,
          religion: f('religion') ? parseInt(f('religion'), 10) : null,
          interest: f('interest'), language: f('language'),
          lats: num(f('lats')), longs: num(f('longs')),
          profile_pic: urls[0] ?? '', other_pic: urls.join('$;'),
          password: f('password') ? bcrypt.hashSync(f('password'), 10) : null,
          refercode: f('refercode') || '', code: crypto.randomUUID().slice(0, 8).toUpperCase(),
          user_type: 'REAL_USER', is_verify: 0, status: true,
        };
        const { data: created, error } = await supabase.from('users').insert(row).select().single();
        if (error) return json(fail(error.message));
        return json(ok({ UserLogin: userLogin(created), ResponseMsg: 'Registration successful' }));
      }
      case 'user_login.php': {
        const b = await req.json().catch(() => ({}));
        const { data: u } = await supabase.from('users').select('*')
          .eq('mobile', s(b.mobile)).eq('ccode', normCc(s(b.ccode))).maybeSingle();
        if (!u) return json(fail('Account not found'));
        if (!u.password || !bcrypt.compareSync(s(b.password), u.password))
          return json(fail('Invalid mobile number or password'));
        if (u.status === false) return json(fail('Your account is deactivated'));
        return json(ok({ UserLogin: userLogin(u), ResponseMsg: 'Login successful' }));
      }
      case 'forget_password.php': {
        const b = await req.json().catch(() => ({}));
        const { data: u } = await supabase.from('users').select('id')
          .eq('mobile', s(b.mobile)).eq('ccode', normCc(s(b.ccode))).maybeSingle();
        if (!u) return json(fail('Account not found'));
        await supabase.from('users').update({ password: bcrypt.hashSync(s(b.password), 10) }).eq('id', u.id);
        return json(ok({ ResponseMsg: 'Password updated successfully' }));
      }

      // ── Phase 3: core (home / discovery / match) ────────────────────────
      case 'home_data.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);

        const { data: st } = await supabase.from('settings').select('currency').eq('id', 1).single();

        let plan: any = null;
        if (me.plan_id) {
          const { data } = await supabase.from('plans').select('*').eq('id', me.plan_id).maybeSingle();
          plan = data;
        }
        const flag = (k: string) => (plan ? bool01(plan[k]) : '0');

        const { data: lastPurchase } = await supabase.from('plan_purchase_history')
          .select('*').eq('uid', me.id).order('t_date', { ascending: false }).limit(1).maybeSingle();
        const plandata = {
          plan_title: s(lastPurchase?.plan_title ?? plan?.title),
          plan_start_date: s(lastPurchase?.start_date ?? me.plan_start_date),
          plan_end_date: s(lastPurchase?.expire_date ?? me.plan_end_date),
          trans_id: s(lastPurchase?.trans_id), p_name: s(lastPurchase?.p_name),
          amount: s(lastPurchase?.amount ?? plan?.amt ?? 0),
          plan_description: s(lastPurchase?.plan_description ?? plan?.description),
        };

        // Exclusions: already swiped + blocks (both directions).
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
        const pref = s(me.search_preference);
        if (pref === 'Male' || pref === 'Female') q = q.eq('gender', pref);
        const { data: candidates } = await q;

        const radius = num(me.radius_search) ?? 100;
        const profilelist = (candidates ?? [])
          .filter((c) => !exclude.has(c.id))
          .map((c) => buildProfile(c, lat, lng, me.interest))
          .filter((p) => lat === null || lng === null || Number(p.profile_distance) <= radius);

        // Profiles I already liked (for the likes overview).
        const { data: myLikes } = await supabase.from('likes').select('target_id')
          .eq('uid', me.id).in('type', ['like', 'superlike']);
        const totalliked = await profilesByIds((myLikes ?? []).map((r: any) => r.target_id), me, lat, lng);

        return json(ok({
          currency: s(st?.currency ?? '$'),
          profilelist, totalliked,
          direct_chat: flag('direct_chat'), Like_menu: flag('like_menu'),
          audio_video: flag('audio_video'), filter_include: flag('filter_include'),
          chat: flag('chat'),
          plan_name: s(plan?.title), plan_id: s(me.plan_id ?? '0'),
          plan_description: s(plan?.description),
          is_subscribe: bool01(me.is_subscribe), is_verify: s(me.is_verify ?? 0),
          coin: s(me.coin ?? 0), plandata,
        }));
      }

      case 'like_dislike.php': {
        const b = await req.json().catch(() => ({}));
        const uid = num(b.uid), target = num(b.profile_id);
        if (uid === null || target === null) return json(fail('Missing user'));
        const action = s(b.action).toUpperCase();
        const type = action === 'LIKE' ? 'like' : action === 'SUPERLIKE' ? 'superlike' : 'dislike';
        await supabase.from('likes').upsert(
          { uid, target_id: target, type, created_at: new Date().toISOString() },
          { onConflict: 'uid,target_id' });

        let matched = false;
        if (type !== 'dislike') {
          const { data: back } = await supabase.from('likes').select('id')
            .eq('uid', target).eq('target_id', uid).in('type', ['like', 'superlike']).maybeSingle();
          if (back) {
            const [u1, u2] = uid < target ? [uid, target] : [target, uid];
            await supabase.from('matches').upsert(
              { user1_id: u1, user2_id: u2 }, { onConflict: 'user1_id,user2_id' });
            matched = true;
          }
        }
        return json(ok({ ResponseMsg: matched ? "It's a match!" : 'Saved', is_match: matched ? '1' : '0' }));
      }

      case 'del_unlike.php': {
        const b = await req.json().catch(() => ({}));
        const uid = num(b.uid);
        if (uid === null) return json(fail('Missing user'));
        // Reset my passes so dismissed profiles can reappear.
        await supabase.from('likes').delete().eq('uid', uid).eq('type', 'dislike');
        return json(ok({ ResponseMsg: 'Passed list cleared' }));
      }

      case 'like_me.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('likes').select('uid')
          .eq('target_id', me.id).in('type', ['like', 'superlike']);
        const list = await profilesByIds((data ?? []).map((r: any) => r.uid), me, lat, lng);
        return json(ok({ likemelist: list }));
      }

      case 'favourite.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('likes').select('target_id')
          .eq('uid', me.id).in('type', ['like', 'superlike']);
        const list = await profilesByIds((data ?? []).map((r: any) => r.target_id), me, lat, lng);
        return json(ok({ favlist: list }));
      }

      case 'passed.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('likes').select('target_id')
          .eq('uid', me.id).eq('type', 'dislike');
        const list = await profilesByIds((data ?? []).map((r: any) => r.target_id), me, lat, lng);
        return json(ok({ passedlist: list }));
      }

      case 'new_match.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('matches').select('user1_id,user2_id')
          .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`);
        const others = (data ?? []).map((m: any) => (m.user1_id === me.id ? m.user2_id : m.user1_id));
        const list = await profilesByIds(others, me, lat, lng);
        return json(ok({ profilelist: list }));
      }

      case 'map_info.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data: candidates } = await supabase.from('users').select('*')
          .eq('status', true).neq('id', me.id);
        const list = (candidates ?? []).map((c) => buildProfile(c, lat, lng, me.interest));
        return json(ok({ profilelist: list }));
      }

      case 'filter.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const minAge = num(b.minage) ?? 18, maxAge = num(b.maxage) ?? 100;
        const radius = num(b.radius_search) ?? num(me.radius_search) ?? 100;
        const pref = s(b.search_preference);
        let q = supabase.from('users').select('*').eq('status', true).neq('id', me.id);
        if (pref === 'Male' || pref === 'Female') q = q.eq('gender', pref);
        if (num(b.relation_goal)) q = q.eq('relation_goal', num(b.relation_goal));
        if (num(b.religion)) q = q.eq('religion', num(b.religion));
        if (s(b.isverify) === '1') q = q.eq('is_verify', 1);
        const { data: candidates } = await q;
        const list = (candidates ?? [])
          .map((c) => buildProfile(c, lat, lng, me.interest))
          .filter((p) => p.profile_age >= minAge && p.profile_age <= maxAge)
          .filter((p) => lat === null || lng === null || Number(p.profile_distance) <= radius);
        return json(ok({ profilelist: list }));
      }

      default:
        return json({ ResponseCode: '404', Result: 'false', ResponseMsg: `Endpoint '${path}' not implemented yet` });
    }
  } catch (e) {
    return json({ ResponseCode: '500', Result: 'false', ResponseMsg: String(e) });
  }
});

// Build the exact UserLogin object the Flutter app expects. Dates stay null
// (not "") because the app calls DateTime.parse() on any non-null value.
function userLogin(u: Record<string, any>) {
  return {
    id: s(u.id), name: s(u.name), mobile: s(u.mobile), password: '',
    rdate: u.rdate ?? null, status: bool01(u.status), ccode: s(u.ccode),
    code: s(u.code), refercode: u.refercode ?? '', wallet: s(u.wallet ?? 0),
    email: s(u.email), gender: s(u.gender), lats: s(u.lats), longs: s(u.longs),
    profile_bio: s(u.profile_bio), profile_pic: s(u.profile_pic),
    birth_date: u.birth_date ?? null, search_preference: s(u.search_preference),
    radius_search: s(u.radius_search ?? ''), relation_goal: s(u.relation_goal ?? ''),
    interest: s(u.interest), language: s(u.language), religion: s(u.religion ?? ''),
    other_pic: s(u.other_pic), plan_id: s(u.plan_id ?? ''),
    plan_start_date: u.plan_start_date ?? null, plan_end_date: u.plan_end_date ?? null,
    is_subscribe: bool01(u.is_subscribe), history_id: '', height: s(u.height),
    identity_picture: u.identity_picture ?? '', is_verify: s(u.is_verify ?? 0),
  };
}
