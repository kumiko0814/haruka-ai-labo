// ================================================================
// AI活用ラボ 設定ファイル
// ここの「 」の中を書き換えて保存するだけで、LP・AIはるか・カルテ・管理画面の
// 表示が全部変わります。前後の " や , は消さないでください。
// ================================================================
var LABO_CONFIG = {
  /* ===== ブランド・運営者 ===== */
  labo_name: "AIラボ",
  company: "合同会社Li-Li",
  instructor_name: "菅野 春香",
  instructor_nick: "はるか",
  instructor_title: "合同会社Li-Li 代表・lilisコンサル 主宰",
  ai_name: "AIはるか",

  /* ===== 募集情報（募集期ごとに書き換える） ===== */
  term_label: "第1期",
  target: "lilisコンサル 受講生・卒業生 限定",
  price: "45,000円",
  price_badge: "9月25日（金）までのお申し込み価格",
  price_note: "9月25日（金）までのお申し込みで45,000円（税込）。第2期以降は58,000円（税込）を予定しています。3ヶ月のカリキュラム修了後は、月額3,300円（税込）で継続してご利用いただけます。",
  payment: "クレジットカード決済（分割のご相談も可能）／銀行振込（同じお申し込みページで選べます）",
  start_date: "2026年10月8日（木）21:00〜（初回勉強会）",
  deadline: "2026年9月25日（金）",
  archive_note: "毎回の勉強会はアーカイブ（録画）が残るので、当日参加できなくても後から視聴できます。",

  /* ===== リンク ===== */
  apply_url: "https://checkout.univapay.com/forms/11efde4e-4f4e-addc-a16d-e3a0a3efdfde?appId=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhcHBfdG9rZW4iLCJpYXQiOjE3Mzg0NzgwMDIsIm1lcmNoYW50X2lkIjoiMTFlZTU3MDUtYjVhYi1jMmJjLTk0ZjUtODM1M2EyYzgxMjkxIiwic3RvcmVfaWQiOiIxMWVlNTcwNS1iNjM0LTE1ZDYtYWI0NC1hMzYzNDdiOTAxM2MiLCJkb21haW5zIjpbInN0ZXAubG1lLmpwIiwicy5sbWVzLmpwIl0sIm1vZGUiOiJsaXZlIiwiY3JlYXRvcl9pZCI6IjExZWU1NzA1LWI1YWItYzJiYy05NGY1LTgzNTNhMmM4MTI5MSIsInZlcnNpb24iOjEsImp0aSI6IjExZWZlMTJmLTk5NDEtNzBkNy1iOWM4LTA3YjRlMTNkMTIxOSJ9.TebU4pptaXqTD5rb2NDSwruNd0f1gzA_vcY7N7yAZdo&cvvAuthorize=true&autoRedirect=true&bankTransferExpirationPeriod=P7D&amount=45000&type=recurring&allowCardInstallments=true&successRedirectUrl=https%3A%2F%2Fkumiko0814.github.io%2Fharuka-ai-labo%2Fthanks.html&showRedirectMetadata=false",   // 2026-09-22 はるかさん指定（UnivaPay決済フォーム・完了後 thanks.html へ）
  apply_label: "お申し込みはこちら",
  tokutei_url: "https://www.lilisconsul.com/tokutei",
  privacy_url: "https://claude.ai/artifact/1m2VKXSBENfEXoLan3WHFv#privacy",
  terms_url: "https://claude.ai/artifact/1m2VKXSBENfEXoLan3WHFv#terms",

  /* ===== 管理者ボードの合言葉（本番のみ有効） =====
     ここには合言葉そのものではなく「ハッシュ（暗号化した値）」を置きます。
     合言葉を変えたいときは Claude に「管理者ボードの合言葉を〇〇に変えて」と頼んでください。 */
  admin_pass_hash: "8768e5ceb9708995add53a9c30ec83e47c3b7bd293ee9188f2fc3a4c08aa1d3c",

  /* ===== カルテ自動下書きで使ってはいけない語（任意・空でもOK） =====
     ここに入れた語を含む下書きは、投入前に自動で止まります。 */
  draft_ng_words: ["先着", "ラストチャンス"],

  /* ===== カリキュラム：週ごとの日程（第1週〜第6週の順） ===== */
  weeks: ["10月8日（木）〜","日程調整中","日程調整中","日程調整中","日程調整中","日程調整中"]
};

/* ---- ここから下は触らない（自動差し込みの仕組み） ---- */
(function(){
  var C = window.LABO_CONFIG || {};
  window.cfg = function(k, d){ return (C[k]!==undefined && C[k]!=="") ? C[k] : d; };
  window.cfgWeek = function(i, d){ return (C.weeks && C.weeks[i]) ? C.weeks[i] : (d||"日程調整中"); };
  function apply(){
    document.querySelectorAll('[data-cfg]').forEach(function(el){
      var k=el.getAttribute('data-cfg'); if(C[k]!==undefined && C[k]!=="") el.textContent=C[k];
    });
    document.querySelectorAll('[data-cfg-href]').forEach(function(el){
      var k=el.getAttribute('data-cfg-href'); if(C[k]) el.setAttribute('href',C[k]);
    });
    if(C.labo_name && document.title.indexOf("AI活用ラボ")>=0){ document.title=document.title.split("AI活用ラボ").join(C.labo_name); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply); else apply();
})();
