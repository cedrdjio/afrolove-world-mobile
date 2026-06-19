# AfriLove World — Mobile ↔ Supabase backend mapping

The mobile app (ex‑GoMeet) and the admin dashboard share **one Supabase database**
(`sbvlkjaifqocakgxvdea`). The app keeps its existing data layer (Dio + GoMeet
`*.php` contract); a Supabase **Edge Function** (`supabase/functions/api/`)
re‑implements those endpoints on top of the shared tables.

- Function URL base: `https://sbvlkjaifqocakgxvdea.supabase.co/functions/v1/api`
- To switch the app over, set `Config.baseUrl` / `Config.baseUrlApi` to that base.
  **Do not switch until the endpoints used at startup + login + home are done**,
  otherwise unimplemented endpoints return 404 and break the app.
- The function uses the auto‑injected `SUPABASE_SERVICE_ROLE_KEY` (server‑side
  only). The mobile app never carries any Supabase secret.

## Endpoint status

| Endpoint | Table(s) | Phase | Status |
|---|---|---|---|
| `sms_type.php` | settings | 1 | ✅ done |
| `interest.php` | interests | 1 | ✅ done |
| `languagelist.php` | languages | 1 | ✅ done |
| `religionlist.php` | religions | 1 | ✅ done |
| `goal.php` | relation_goals | 1 | ✅ done |
| `mobile_check.php` | users | 2 (auth) | ✅ done |
| `reg_user.php` | users + storage | 2 | ✅ done |
| `user_login.php` | users | 2 | ✅ done |
| `forget_password.php` | users | 2 | ✅ done |
| `social_login.php` | users | 2 | ⬜ todo |
| `home_data.php` | users, settings, plans, likes, blocks, matches | 3 (core) | ✅ done |
| `map_info.php` / `filter.php` | users | 3 | ✅ done |
| `like_dislike.php` / `like_me.php` / `new_match.php` / `passed.php` / `favourite.php` / `del_unlike.php` | likes, matches, users | 3 | ✅ done |
| `profile_info.php` / `profile_view.php` / `user_info.php` | users | 4 (profile) | ⬜ todo |
| `edit_profile.php` / `pro_image.php` / `identity_doc.php` | users + storage | 4 | ⬜ todo |
| `profile_block.php` / `getblocklist.php` / `unblock.php` / `report.php` | reports, (block table TBD) | 4 | ⬜ todo |
| `plan.php` / `plan_purchase.php` | plans, plan_purchase_history | 5 (money) | ⬜ todo |
| `paymentgateway.php` | payment_gateways | 5 | ⬜ todo |
| `wallet_up.php` / `wallet_report.php` | wallet_reports, users | 5 | ⬜ todo |
| `list_package.php` / `package_purchase.php` / `coin_report.php` | packages, coin_reports, users | 5 | ⬜ todo |
| `gift_list.php` / `giftbuy.php` / `my_gift.php` | gifts | 5 | ⬜ todo |
| `request_withdraw.php` / `payout_list.php` | payouts | 5 | ⬜ todo |
| `u_notification_list.php` | notifications | 6 (misc) | ⬜ todo |
| `faq.php` / `pagelist.php` | faqs, pages | 6 | ⬜ todo |
| `acc_delete.php` | users | 6 | ⬜ todo |
| `getdata.php` (referral) | users | 6 | ⬜ todo |
| `msg_otp.php` / `twilio_otp.php` | settings (provider creds) | 6 | ⬜ todo |

## Migrations applied (this project)
- `mobile_match_tables`: added `likes`, `matches`, `blocks`, `user_gifts`
  (RLS on, no public policies — accessed via the Edge Function service role).
- `users_password_and_height`: added `users.password` (bcrypt) + `users.height`,
  required by the mobile `mobile + password` auth flow.

## Notes / decisions
- **Auth**: validated against `users` (bcrypt); Firebase OTP kept for phone
  verification. The 13 existing demo users have `password = null` (added column)
  so they must use "forgot password" before they can log in.
- **Images**: registration/profile uploads go to the public `media` Storage
  bucket; `other_pic` is a `"$;"`-joined list of URLs, `profile_pic` = first.
- **Chat**: stays on Firebase Firestore (unchanged) — not part of the REST API.
- **Testing**: the dev sandbox can't reach `*.supabase.co`, so endpoints are
  validated by schema + code review here; run the app (or Postman) against
  `…/functions/v1/api/<endpoint>` to confirm before switching `baseUrl`.
