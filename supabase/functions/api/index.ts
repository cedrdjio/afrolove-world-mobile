// AfriLove World — Mobile API gateway (Supabase Edge Function)
// Re-implements the legacy GoMeet PHP endpoints on top of the shared Supabase DB
// (project sbvlkjaifqocakgxvdea), so the mobile app and the admin dashboard use
// the SAME database. Deployed via the Supabase MCP / CLI.
//
// Phase 1 (DONE): read-only bootstrap + catalog endpoints.
// Phase 2 (DONE): auth — mobile_check, reg_user, user_login, forget_password.
// Next phases: home/discovery/match, profile, monetization, misc.
//
// Security: uses the service-role key (auto-injected by Supabase, server-side
// only) to read/write past RLS. No secret key is ever shipped in the mobile app.
// Passwords are bcrypt-hashed and never returned.
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
const fail = (msg: string) =>
  ({ ResponseCode: '401', Result: 'false', ResponseMsg: msg });

const s = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const bool01 = (v: unknown) => (v === true || v === 'true' || v === 1 || v === '1' ? '1' : '0');
const normCc = (c: string) => (c ?? '').replace(/^\+/, '').trim();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

// Build the exact UserLogin object the Flutter app expects. Dates stay null
// (not "") because the app calls DateTime.parse() on any non-null value.
function userLogin(u: Record<string, any>) {
  return {
    id: s(u.id),
    name: s(u.name),
    mobile: s(u.mobile),
    password: '',
    rdate: u.rdate ?? null,
    status: bool01(u.status),
    ccode: s(u.ccode),
    code: s(u.code),
    refercode: u.refercode ?? '',
    wallet: s(u.wallet ?? 0),
    email: s(u.email),
    gender: s(u.gender),
    lats: s(u.lats),
    longs: s(u.longs),
    profile_bio: s(u.profile_bio),
    profile_pic: s(u.profile_pic),
    birth_date: u.birth_date ?? null,
    search_preference: s(u.search_preference),
    radius_search: s(u.radius_search ?? ''),
    relation_goal: s(u.relation_goal ?? ''),
    interest: s(u.interest),
    language: s(u.language),
    religion: s(u.religion ?? ''),
    other_pic: s(u.other_pic),
    plan_id: s(u.plan_id ?? ''),
    plan_start_date: u.plan_start_date ?? null,
    plan_end_date: u.plan_end_date ?? null,
    is_subscribe: bool01(u.is_subscribe),
    history_id: '',
    height: s(u.height),
    identity_picture: u.identity_picture ?? '',
    is_verify: s(u.is_verify ?? 0),
  };
}

async function uploadImage(file: File, prefix: string): Promise<string> {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `users/${prefix}_${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const path = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';

  try {
    switch (path) {
      // ── Phase 1: bootstrap + catalog ───────────────────────────────────
      case 'sms_type.php': {
        const { data: st } = await supabase.from('settings').select('*').eq('id', 1).single();
        const g = (k: string) => s(st?.[k]);
        return json(ok({
          SMS_TYPE: g('sms_type'),
          Admob_Enabled: g('admob') || 'No',
          maintainance_Enabled: g('mode') || 'No',
          Social_login_enabled: 'No',
          banner_id: g('banner_id'),
          in_id: g('in_id'),
          otp_auth: g('otp_auth'),
          gift_fun: g('coin_fun') || 'No',
          ios_in_id: g('ios_in_id'),
          ios_banner_id: g('ios_banner_id'),
          agora_app_id: g('agora_app_id'),
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

      // ── Phase 2: auth ──────────────────────────────────────────────────
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
        const mobile = f('mobile');
        const ccode = normCc(f('ccode'));

        const { data: exists } = await supabase.from('users').select('id')
          .eq('mobile', mobile).eq('ccode', ccode).maybeSingle();
        if (exists) return json(fail('Mobile number already registered'));

        const size = parseInt(f('size') || '0', 10) || 0;
        const urls: string[] = [];
        for (let i = 0; i < size; i++) {
          const file = form.get(`otherpic${i}`);
          if (file instanceof File) urls.push(await uploadImage(file, `${mobile}_${i}`));
        }

        const row: Record<string, any> = {
          name: f('name'), email: f('email'), mobile, ccode,
          gender: f('gender'),
          birth_date: f('birth_date') || null,
          profile_bio: f('profile_bio'),
          search_preference: f('search_preference'),
          radius_search: parseInt(f('radius_search') || '100', 10) || 100,
          relation_goal: f('relation_goal') ? parseInt(f('relation_goal'), 10) : null,
          religion: f('religion') ? parseInt(f('religion'), 10) : null,
          interest: f('interest'),
          language: f('language'),
          lats: f('lats') ? parseFloat(f('lats')) : null,
          longs: f('longs') ? parseFloat(f('longs')) : null,
          profile_pic: urls[0] ?? '',
          other_pic: urls.join('$;'),
          password: f('password') ? bcrypt.hashSync(f('password'), 10) : null,
          refercode: f('refercode') || '',
          code: crypto.randomUUID().slice(0, 8).toUpperCase(),
          user_type: 'REAL_USER',
          is_verify: 0,
          status: true,
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

      default:
        return json({ ResponseCode: '404', Result: 'false', ResponseMsg: `Endpoint '${path}' not implemented yet` });
    }
  } catch (e) {
    return json({ ResponseCode: '500', Result: 'false', ResponseMsg: String(e) });
  }
});
