// AfriLove World — Mobile API gateway (Supabase Edge Function)
// Reimplements the legacy GoMeet PHP endpoints on top of the shared Supabase DB
// (project sbvlkjaifqocakgxvdea), so the mobile app and the admin dashboard use
// the SAME database. Deployed via the Supabase MCP / CLI.
//
// Phase 1 (DONE): read-only bootstrap + catalog endpoints.
// Next phases: auth, home/discovery/match, profile, monetization, chat.
//
// Security: uses the service-role key (auto-injected by Supabase, server-side
// only) to read past RLS. No secret key is ever shipped in the mobile app.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const ok = (extra: Record<string, unknown>) =>
  ({ ResponseCode: '200', Result: 'true', ResponseMsg: 'Success', ...extra });

const s = (v: unknown) => (v === null || v === undefined ? '' : String(v));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const path = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';

  try {
    switch (path) {
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
        const { data } = await supabase.from('interests')
          .select('id,title,img').eq('status', true).order('id');
        return json(ok({ interestlist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), img: s(r.img) })) }));
      }
      case 'languagelist.php': {
        const { data } = await supabase.from('languages')
          .select('id,title,img').eq('status', true).order('id');
        return json(ok({ languagelist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), img: s(r.img) })) }));
      }
      case 'religionlist.php': {
        const { data } = await supabase.from('religions')
          .select('id,title').eq('status', true).order('id');
        return json(ok({ religionlist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title) })) }));
      }
      case 'goal.php': {
        const { data } = await supabase.from('relation_goals')
          .select('id,title,subtitle').eq('status', true).order('id');
        return json(ok({ goallist: (data ?? []).map((r) => ({ id: s(r.id), title: s(r.title), subtitle: s(r.subtitle) })) }));
      }
      default:
        return json({ ResponseCode: '404', Result: 'false', ResponseMsg: `Endpoint '${path}' not implemented yet` }, 200);
    }
  } catch (e) {
    return json({ ResponseCode: '500', Result: 'false', ResponseMsg: String(e) }, 200);
  }
});
