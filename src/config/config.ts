/**
 * Backend configuration — faithful port of lib/core/config.dart.
 *
 * The app speaks the legacy GoMeet `*.php` REST contract. The same contract is
 * being re-implemented on a shared Supabase Edge Function (see BACKEND_MAPPING).
 *
 * - GOMEET base  : original fully-working PHP API.
 * - SUPABASE base: Supabase Edge Function that re-implements the same endpoints
 *   on the shared DB used by the admin dashboard. Switch `baseUrlApi` to this
 *   once all consumed endpoints are implemented there.
 */

export const Config = {
  // Active API base. Keep GoMeet until the Supabase function covers
  // startup + login + home, otherwise unimplemented endpoints 404.
  baseUrl: 'https://gomeet.cscodetech.cloud/',
  baseUrlApi: 'https://gomeet.cscodetech.cloud/api',

  // Supabase Edge Function base (shared DB with afrilove-world-admin).
  supabaseApi: 'https://sbvlkjaifqocakgxvdea.supabase.co/functions/v1/api',

  header: { 'Content-Type': 'application/json' } as Record<string, string>,

  oneSignal: 'd8d58117-dba0-4da5-8ed5-0e5a25505ab4',

  // ── Endpoints (identical paths to the Flutter app) ──────────────
  endpoints: {
    relationGoalList: '/goal.php',
    getInterestList: '/interest.php',
    languageList: '/languagelist.php',
    religionList: '/religionlist.php',
    registerUser: '/reg_user.php',
    socialLogin: '/social_login.php',
    mobileCheck: '/mobile_check.php',
    homeData: '/home_data.php',
    profileInfo: '/profile_info.php',
    userLogin: '/user_login.php',
    mapInfo: '/map_info.php',
    likeDislike: '/like_dislike.php',
    editProfile: '/edit_profile.php',
    likeMe: '/like_me.php',
    favourite: '/favourite.php',
    passed: '/passed.php',
    newMatch: '/new_match.php',
    delUnlike: '/del_unlike.php',
    profileView: '/profile_view.php',
    filter: '/filter.php',
    plan: '/plan.php',
    paymentGateway: '/paymentgateway.php',
    planPurchase: '/plan_purchase.php',
    faq: '/faq.php',
    accDelete: '/acc_delete.php',
    pageList: '/pagelist.php',
    notificationList: '/u_notification_list.php',
    userInfo: '/user_info.php',
    forgetPassword: '/forget_password.php',
    proPic: '/pro_image.php',
    profileBlock: '/profile_block.php',
    report: '/report.php',
    blockList: '/blocklist.php',
    unblock: '/unblock.php',
    getBlockList: '/getblocklist.php',
    identity: '/identity_doc.php',
    smsType: '/sms_type.php',
    msgOtp: '/msg_otp.php',
    twilioOtp: '/twilio_otp.php',
    walletUp: '/wallet_up.php',
    walletReport: '/wallet_report.php',
    giftList: '/gift_list.php',
    packageList: '/list_package.php',
    packagePurchase: '/package_purchase.php',
    coinReport: '/coin_report.php',
    requestWithdraw: '/request_withdraw.php',
    payoutList: '/payout_list.php',
    giftBuy: '/giftbuy.php',
    myGift: '/my_gift.php',
    referAndEarn: '/getdata.php',
  },
} as const;

export type Endpoint = keyof typeof Config.endpoints;
