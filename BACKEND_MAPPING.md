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
| `mobile_check.php` | users | 2 (auth) | ⬜ todo |
| `reg_user.php` | users | 2 | ⬜ todo |
| `user_login.php` | users | 2 | ⬜ todo |
| `social_login.php` | users | 2 | ⬜ todo |
| `forget_password.php` | users | 2 | ⬜ todo |
| `home_data.php` | users, settings, plans | 3 (core) | ⬜ todo |
| `map_info.php` / `filter.php` | users | 3 | ⬜ todo |
| `like_dislike.php` / `like_me.php` / `new_match.php` / `passed.php` / `favourite.php` / `del_unlike.php` | users, (match tables TBD) | 3 | ⬜ todo |
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

## Notes / decisions still needed
- **Match/like storage**: the GoMeet API has like/match/block flows but the
  current Supabase schema has no `likes` / `matches` / `block` tables. These must
  be added (migration) for Phase 3/4 — confirm before creating.
- **Auth**: GoMeet used its own user table + Firebase OTP. Phase 2 will validate
  credentials against `users` (bcrypt) and keep Firebase OTP for phone.
- **Images**: `edit_profile` / `pro_image` uploads go to Supabase Storage.
- **Chat**: stays on Firebase Firestore (unchanged) — not part of the REST API.
