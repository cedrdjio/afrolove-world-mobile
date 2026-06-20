// AfriLove World — Mobile API gateway (Supabase Edge Function)
// Re-implements the legacy GoMeet PHP endpoints on top of the shared Supabase DB
// (project sbvlkjaifqocakgxvdea). Mobile app + admin dashboard = same database.
//
// Phase 1: bootstrap + catalog · Phase 2: auth · Phase 3: home/match
// Phase 4: profile (info/edit/photos/block/report) · Phase 5: monetization
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
    profile_id: s(c.id), profile_name: s(c.name), profile_bio: s(c.profile_bio),
    profile_age: ageFromBirth(c.birth_date), is_subscribe: bool01(c.is_subscribe),
    is_verify: s(c.is_verify ?? 0), profile_distance: distance,
    profile_images: imagesFrom(c.other_pic, c.profile_pic),
    match_ratio: matchRatio(myInterest, c.interest),
  };
}
async function getMe(uid: string) {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const path = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';

  try {
    switch (path) {
      // ── Phase 1 ──────────────────────────────────────────────────────────
      case 'sms_type.php': {
        const { data: st } = await supabase.from('settings').select('*').eq('id', 1).single();
        const g = (k: string) => s(st?.[k]);
        return json(ok({
          SMS_TYPE: g('sms_type'), Admob_Enabled: g('admob') || 'No',
          maintainance_Enabled: g('mode') || 'No', Social_login_enabled: 'No',
          banner_id: g('banner_id'), in_id: g('in_id'), otp_auth: g('otp_auth'),
          gift_fun: g('coin_fun') || 'No', ios_in_id: g('ios_in_id'),
          ios_banner_id: g('ios_banner_id'), agora_app_id: g('agora_app_id'), one_key: g('one_key'),
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

      // ── Phase 2: auth ────────────────────────────────────────────────────
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
          if (file instanceof File) urls.push(await uploadFile(file, `${mobile}_${i}`));
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
        if (!u.password || !bcrypt.compareSync(s(b.password), u.password)) return json(fail('Invalid mobile number or password'));
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

      // ── Phase 3: home / match ────────────────────────────────────────────
      case 'home_data.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data: st } = await supabase.from('settings').select('currency').eq('id', 1).single();
        const { plan, flag } = await planFlags(me);
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
        const { data: myLikes } = await supabase.from('likes').select('target_id')
          .eq('uid', me.id).in('type', ['like', 'superlike']);
        const totalliked = await profilesByIds((myLikes ?? []).map((r: any) => r.target_id), me, lat, lng);
        return json(ok({
          currency: s(st?.currency ?? '$'), profilelist, totalliked,
          direct_chat: flag('direct_chat'), Like_menu: flag('like_menu'),
          audio_video: flag('audio_video'), filter_include: flag('filter_include'), chat: flag('chat'),
          plan_name: s(plan?.title), plan_id: s(me.plan_id ?? '0'), plan_description: s(plan?.description),
          is_subscribe: bool01(me.is_subscribe), is_verify: s(me.is_verify ?? 0), coin: s(me.coin ?? 0), plandata,
        }));
      }
      case 'like_dislike.php': {
        const b = await req.json().catch(() => ({}));
        const uid = num(b.uid), target = num(b.profile_id);
        if (uid === null || target === null) return json(fail('Missing user'));
        const action = s(b.action).toUpperCase();
        const type = action === 'LIKE' ? 'like' : action === 'SUPERLIKE' ? 'superlike' : 'dislike';
        await supabase.from('likes').upsert({ uid, target_id: target, type, created_at: new Date().toISOString() }, { onConflict: 'uid,target_id' });
        let matched = false;
        if (type !== 'dislike') {
          const { data: back } = await supabase.from('likes').select('id')
            .eq('uid', target).eq('target_id', uid).in('type', ['like', 'superlike']).maybeSingle();
          if (back) {
            const [u1, u2] = uid < target ? [uid, target] : [target, uid];
            await supabase.from('matches').upsert({ user1_id: u1, user2_id: u2 }, { onConflict: 'user1_id,user2_id' });
            matched = true;
          }
        }
        return json(ok({ ResponseMsg: matched ? "It's a match!" : 'Saved', is_match: matched ? '1' : '0' }));
      }
      case 'del_unlike.php': {
        const b = await req.json().catch(() => ({}));
        const uid = num(b.uid);
        if (uid === null) return json(fail('Missing user'));
        await supabase.from('likes').delete().eq('uid', uid).eq('type', 'dislike');
        return json(ok({ ResponseMsg: 'Passed list cleared' }));
      }
      case 'like_me.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('likes').select('uid').eq('target_id', me.id).in('type', ['like', 'superlike']);
        return json(ok({ likemelist: await profilesByIds((data ?? []).map((r: any) => r.uid), me, lat, lng) }));
      }
      case 'favourite.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('likes').select('target_id').eq('uid', me.id).in('type', ['like', 'superlike']);
        return json(ok({ favlist: await profilesByIds((data ?? []).map((r: any) => r.target_id), me, lat, lng) }));
      }
      case 'passed.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('likes').select('target_id').eq('uid', me.id).eq('type', 'dislike');
        return json(ok({ passedlist: await profilesByIds((data ?? []).map((r: any) => r.target_id), me, lat, lng) }));
      }
      case 'new_match.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data } = await supabase.from('matches').select('user1_id,user2_id').or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`);
        const others = (data ?? []).map((m: any) => (m.user1_id === me.id ? m.user2_id : m.user1_id));
        return json(ok({ profilelist: await profilesByIds(others, me, lat, lng) }));
      }
      case 'map_info.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { lat, lng } = meCoords(me, b.lats, b.longs);
        const { data: candidates } = await supabase.from('users').select('*').eq('status', true).neq('id', me.id);
        return json(ok({ profilelist: (candidates ?? []).map((c) => buildProfile(c, lat, lng, me.interest)) }));
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
        const list = (candidates ?? []).map((c) => buildProfile(c, lat, lng, me.interest))
          .filter((p) => p.profile_age >= minAge && p.profile_age <= maxAge)
          .filter((p) => lat === null || lng === null || Number(p.profile_distance) <= radius);
        return json(ok({ profilelist: list }));
      }

      // ── Phase 4: profile ─────────────────────────────────────────────────
      case 'profile_info.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        const t = await getMe(s(b.profile_id));
        if (!t) return json(fail('Profile not found'));
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
        return json(ok({
          profileinfo: {
            ...base, height: s(t.height),
            relation_title: relTitle, relation_subtitle: relSub, religion_title: relgTitle,
            interest_list: await catalogItems('interests', t.interest, true),
            language_list: await catalogItems('languages', t.language, true),
          },
        }));
      }
      case 'profile_view.php': {
        await req.json().catch(() => ({}));
        return json(ok({ ResponseMsg: 'Viewed' }));
      }
      case 'user_info.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { plan, flag } = await planFlags(me);
        return json(ok({
          direct_chat: flag('direct_chat'), Like_menu: flag('like_menu'),
          audio_video: flag('audio_video'), filter_include: flag('filter_include'),
          plan_name: s(plan?.title), plan_id: s(me.plan_id ?? '0'),
          plan_description: s(plan?.description), is_subscribe: bool01(me.is_subscribe),
        }));
      }
      case 'edit_profile.php': {
        const form = await req.formData();
        const f = (k: string) => (form.get(k) ?? '').toString();
        const me = await getMe(f('uid'));
        if (!me) return json(fail('User not found'));
        const kept = f('imlist').split('$;').map((x) => x.trim()).filter(Boolean);
        const size = parseInt(f('size') || '0', 10) || 0;
        const fresh: string[] = [];
        for (let i = 0; i < size; i++) {
          const file = form.get(`otherpic${i}`);
          if (file instanceof File) fresh.push(await uploadFile(file, `${f('uid')}_${i}`));
        }
        const allImgs = [...kept, ...fresh];
        const upd: Record<string, any> = {
          name: f('name'), email: f('email'), gender: f('gender'),
          birth_date: f('birth_date') || null, profile_bio: f('profile_bio'),
          search_preference: f('search_preference'),
          radius_search: f('radius_search') ? parseInt(f('radius_search'), 10) : me.radius_search,
          relation_goal: f('relation_goal') ? parseInt(f('relation_goal'), 10) : me.relation_goal,
          religion: f('religion') ? parseInt(f('religion'), 10) : me.religion,
          interest: f('interest'), language: f('language'), height: f('height'),
          lats: num(f('lats')) ?? me.lats, longs: num(f('longs')) ?? me.longs,
        };
        if (allImgs.length) { upd.other_pic = allImgs.join('$;'); upd.profile_pic = allImgs[0]; }
        if (f('password')) upd.password = bcrypt.hashSync(f('password'), 10);
        const { data: updated, error } = await supabase.from('users').update(upd).eq('id', me.id).select().single();
        if (error) return json(fail(error.message));
        return json(ok({ UserLogin: userLogin(updated), ResponseMsg: 'Profile updated' }));
      }
      case 'pro_image.php': {
        const b = await req.json().catch(() => ({}));
        const { data: updated } = await supabase.from('users').update({ profile_pic: s(b.img) }).eq('id', s(b.uid)).select().single();
        if (!updated) return json(fail('User not found'));
        return json(ok({ UserLogin: userLogin(updated), ResponseMsg: 'Profile picture updated' }));
      }
      case 'identity_doc.php': {
        const b = await req.json().catch(() => ({}));
        const { data: updated } = await supabase.from('users').update({ identity_picture: s(b.img) }).eq('id', s(b.uid)).select().single();
        if (!updated) return json(fail('User not found'));
        return json(ok({ UserLogin: userLogin(updated), ResponseMsg: 'Identity submitted for review' }));
      }
      case 'profile_block.php': {
        const b = await req.json().catch(() => ({}));
        const uid = num(b.uid), target = num(b.profile_id);
        if (uid === null || target === null) return json(fail('Missing user'));
        await supabase.from('blocks').upsert({ uid, blocked_id: target }, { onConflict: 'uid,blocked_id' });
        return json(ok({ ResponseMsg: 'User blocked' }));
      }
      case 'unblock.php': {
        const b = await req.json().catch(() => ({}));
        await supabase.from('blocks').delete().eq('uid', s(b.uid)).eq('blocked_id', s(b.profile_id));
        return json(ok({ ResponseMsg: 'User unblocked' }));
      }
      case 'getblocklist.php': {
        const b = await req.json().catch(() => ({}));
        const [mine, others] = await Promise.all([
          supabase.from('blocks').select('blocked_id').eq('uid', s(b.uid)),
          supabase.from('blocks').select('uid').eq('blocked_id', s(b.uid)),
        ]);
        return json(ok({
          block_by_me: (mine.data ?? []).map((r: any) => s(r.blocked_id)),
          block_by_other: (others.data ?? []).map((r: any) => s(r.uid)),
        }));
      }
      case 'blocklist.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { data } = await supabase.from('blocks').select('blocked_id').eq('uid', me.id);
        const list = await profilesByIds((data ?? []).map((r: any) => r.blocked_id), me, num(me.lats), num(me.longs));
        return json(ok({ blocklist: list }));
      }
      case 'report.php': {
        const b = await req.json().catch(() => ({}));
        await supabase.from('reports').insert({ uid: num(b.reporter_id), reporter_id: num(b.uid), comment: s(b.comment) });
        return json(ok({ ResponseMsg: 'Report submitted' }));
      }
      case 'acc_delete.php': {
        const b = await req.json().catch(() => ({}));
        await supabase.from('users').delete().eq('id', s(b.uid));
        return json(ok({ ResponseMsg: 'Account deleted' }));
      }

      // ── Phase 5: monetization ────────────────────────────────────────────
      case 'plan.php': {
        const { data } = await supabase.from('plans').select('*').eq('status', true).order('id');
        return json(ok({
          PlanData: (data ?? []).map((p: any) => ({
            id: s(p.id), title: s(p.title), amt: s(p.amt), description: s(p.description),
            filter_include: bool01(p.filter_include), day_limit: s(p.day_limit),
            direct_chat: bool01(p.direct_chat), audio_video: bool01(p.audio_video), status: bool01(p.status),
          })),
        }));
      }
      case 'paymentgateway.php': {
        const { data } = await supabase.from('payment_gateways').select('*').eq('status', true).eq('p_show', true).order('id');
        return json(ok({
          paymentdata: (data ?? []).map((p: any) => ({
            id: s(p.id), title: s(p.title), img: s(p.img), attributes: p.attributes ?? {},
            status: bool01(p.status), subtitle: s(p.subtitle), p_show: bool01(p.p_show),
          })),
        }));
      }
      case 'plan_purchase.php': {
        const b = await req.json().catch(() => ({}));
        const { data: plan } = await supabase.from('plans').select('*').eq('id', s(b.plan_id)).maybeSingle();
        if (!plan) return json(fail('Plan not found'));
        const start = new Date(), end = new Date();
        end.setDate(end.getDate() + (Number(plan.day_limit) || 30));
        const iso = (d: Date) => d.toISOString().slice(0, 10);
        await supabase.from('plan_purchase_history').insert({
          uid: num(b.uid), plan_id: plan.id, p_name: s(b.pname), amount: plan.amt,
          day: plan.day_limit, plan_title: plan.title, plan_description: plan.description,
          start_date: iso(start), expire_date: iso(end),
          trans_id: s(b.transaction_id), p_method_id: s(b.p_method_id),
        });
        await supabase.from('users').update({
          plan_id: plan.id, is_subscribe: true,
          plan_start_date: start.toISOString(), plan_end_date: end.toISOString(),
        }).eq('id', s(b.uid));
        return json(ok({ ResponseMsg: 'Plan purchased successfully' }));
      }
      case 'wallet_up.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const amt = num(b.wallet) ?? 0;
        const bal = Number(me.wallet ?? 0) + amt;
        await supabase.from('users').update({ wallet: bal }).eq('id', me.id);
        await supabase.from('wallet_reports').insert({ uid: me.id, amt, message: 'Wallet top-up', status: 'Credit' });
        return json(ok({ wallet: s(bal), ResponseMsg: 'Wallet updated' }));
      }
      case 'wallet_report.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { data } = await supabase.from('wallet_reports').select('*').eq('uid', me.id).order('tdate', { ascending: false });
        return json(ok({
          wallet: s(me.wallet ?? 0),
          Walletitem: (data ?? []).map((r: any) => ({ message: s(r.message), status: s(r.status), amt: s(r.amt) })),
        }));
      }
      case 'list_package.php': {
        const { data } = await supabase.from('packages').select('*').eq('status', true).order('id');
        return json(ok({ packlist: (data ?? []).map((p: any) => ({ id: s(p.id), coin: s(p.coin), amt: s(p.amt) })) }));
      }
      case 'package_purchase.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        const { data: pkg } = await supabase.from('packages').select('*').eq('id', s(b.package_id)).maybeSingle();
        if (!me || !pkg) return json(fail('Invalid request'));
        const coin = Number(me.coin ?? 0) + Number(pkg.coin ?? 0);
        const wallet = num(b.wall_amt) !== null ? Number(me.wallet ?? 0) - Number(pkg.amt ?? 0) : Number(me.wallet ?? 0);
        await supabase.from('users').update({ coin, wallet }).eq('id', me.id);
        await supabase.from('coin_reports').insert({ uid: me.id, amt: pkg.coin, message: 'Coin package purchase', status: 'Credit' });
        return json(ok({ ResponseMsg: 'Coins added' }));
      }
      case 'coin_report.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { data: st } = await supabase.from('settings').select('coin_amt,coin_limit').eq('id', 1).single();
        const { data } = await supabase.from('coin_reports').select('*').eq('uid', me.id).order('tdate', { ascending: false });
        return json(ok({
          coin: s(me.coin ?? 0), coin_amt: s(st?.coin_amt ?? 0), coin_limit: s(st?.coin_limit ?? 0),
          Coinitem: (data ?? []).map((r: any) => ({ message: s(r.message), status: s(r.status), amt: s(r.amt) })),
        }));
      }
      case 'gift_list.php': {
        const { data } = await supabase.from('gifts').select('*').eq('status', true).order('id');
        return json(ok({ giftlist: (data ?? []).map((g: any) => ({ id: s(g.id), img: s(g.img), price: s(g.price) })) }));
      }
      case 'giftbuy.php': {
        const b = await req.json().catch(() => ({}));
        const sender = await getMe(s(b.sender_id));
        if (!sender) return json(fail('User not found'));
        let giftId: number | null = null;
        if (b.gift_img) {
          const { data: g } = await supabase.from('gifts').select('id').eq('img', s(b.gift_img)).maybeSingle();
          giftId = g?.id ?? null;
        }
        await supabase.from('user_gifts').insert({ sender_id: sender.id, receiver_id: num(b.receiver_id), gift_id: giftId });
        const spent = num(b.coin) ?? 0;
        await supabase.from('users').update({ coin: Number(sender.coin ?? 0) - spent }).eq('id', sender.id);
        await supabase.from('coin_reports').insert({ uid: sender.id, amt: spent, message: 'Gift sent', status: 'Debit' });
        return json(ok({ ResponseMsg: 'Gift sent' }));
      }
      case 'my_gift.php': {
        const b = await req.json().catch(() => ({}));
        const { data } = await supabase.from('user_gifts')
          .select('gift:gifts(img), sender:users!user_gifts_sender_id_fkey(name,profile_pic)')
          .eq('receiver_id', s(b.uid)).order('id', { ascending: false });
        return json(ok({
          giflist: (data ?? []).map((r: any) => ({
            gift_img: s(r.gift?.img), name: s(r.sender?.name), img: s(r.sender?.profile_pic),
          })),
        }));
      }
      case 'request_withdraw.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        if (!me) return json(fail('User not found'));
        const { data: st } = await supabase.from('settings').select('coin_amt').eq('id', 1).single();
        const coin = num(b.coin) ?? 0;
        await supabase.from('payouts').insert({
          uid: me.id, coin, amt: coin * Number(st?.coin_amt ?? 0), status: 'pending',
          r_type: s(b.r_type), acc_number: s(b.acc_number), bank_name: s(b.bank_name),
          acc_name: s(b.acc_name), ifsc: s(b.ifsc_code), upi_id: s(b.upi_id), paypal_id: s(b.paypal_id),
        });
        await supabase.from('users').update({ coin: Number(me.coin ?? 0) - coin }).eq('id', me.id);
        return json(ok({ ResponseMsg: 'Withdrawal requested' }));
      }
      case 'payout_list.php': {
        const b = await req.json().catch(() => ({}));
        const { data } = await supabase.from('payouts').select('*').eq('uid', s(b.uid)).order('r_date', { ascending: false });
        return json(ok({
          Payoutlist: (data ?? []).map((p: any) => ({
            payout_id: s(p.id), amt: s(p.amt), coin: s(p.coin), status: s(p.status), proof: s(p.proof),
            r_date: p.r_date ?? new Date().toISOString(), r_type: s(p.r_type), acc_number: s(p.acc_number),
            bank_name: s(p.bank_name), acc_name: s(p.acc_name), ifsc_code: s(p.ifsc),
            upi_id: s(p.upi_id), paypal_id: s(p.paypal_id),
          })),
        }));
      }

      // ── Phase 6: misc (notifications / faq / pages / referral / otp) ─────
      case 'u_notification_list.php': {
        const b = await req.json().catch(() => ({}));
        const { data } = await supabase.from('notifications').select('*')
          .eq('uid', s(b.uid)).order('datetime', { ascending: false });
        return json(ok({
          NotificationData: (data ?? []).map((n: any) => ({
            id: s(n.id), uid: s(n.uid), datetime: n.datetime ?? null,
            title: s(n.title), description: s(n.description),
          })),
        }));
      }
      case 'faq.php': {
        await req.json().catch(() => ({}));
        const { data } = await supabase.from('faqs').select('*').eq('status', true).order('id');
        return json(ok({
          FaqData: (data ?? []).map((q: any) => ({
            id: s(q.id), question: s(q.question), answer: s(q.answer), status: bool01(q.status),
          })),
        }));
      }
      case 'pagelist.php': {
        const { data } = await supabase.from('pages').select('*').eq('status', true).order('id');
        return json(ok({ pagelist: (data ?? []).map((p: any) => ({ title: s(p.title), description: s(p.description) })) }));
      }
      case 'getdata.php': {
        const b = await req.json().catch(() => ({}));
        const me = await getMe(s(b.uid));
        const { data: st } = await supabase.from('settings').select('scredit').eq('id', 1).single();
        return json(ok({
          code: s(me?.code || me?.refercode || ''),
          signupcredit: s(st?.scredit ?? 0), refercredit: s(st?.scredit ?? 0),
        }));
      }
      case 'msg_otp.php':
      case 'twilio_otp.php': {
        await req.json().catch(() => ({}));
        // GoMeet verifies the OTP client-side, so it expects the code back.
        // To actually send the SMS, wire Msg91/Twilio here using the provider
        // credentials stored in `settings` (auth_key / acc_id / auth_token …).
        const otp = String(Math.floor(1000 + Math.random() * 9000));
        return json(ok({ otp }));
      }
      case 'social_login.php': {
        const b = await req.json().catch(() => ({}));
        const { data: u } = await supabase.from('users').select('*').eq('email', s(b.email)).maybeSingle();
        if (u) return json(ok({ UserLogin: userLogin(u), ResponseMsg: 'Login successful' }));
        return json({ ResponseCode: '201', Result: 'false', ResponseMsg: 'New user' });
      }

      default:
        return json({ ResponseCode: '404', Result: 'false', ResponseMsg: `Endpoint '${path}' not implemented yet` });
    }
  } catch (e) {
    return json({ ResponseCode: '500', Result: 'false', ResponseMsg: String(e) });
  }
});
