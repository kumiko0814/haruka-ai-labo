// ================================================================
// AI活用ラボ 設定ファイル
// ここの「 」の中を書き換えて保存するだけで、LP・AIはるか・カルテ・管理画面の
// 表示が全部変わります。前後の " や , は消さないでください。
// ================================================================
var LABO_CONFIG = {
  /* ===== ブランド・運営者 ===== */
  labo_name: "AI活用ラボ",
  company: "合同会社Li-Li",
  instructor_name: "菅野 春香",
  instructor_nick: "はるか",
  instructor_title: "合同会社Li-Li 代表・lilisコンサル 主宰",
  ai_name: "AIはるか",

  /* ===== 募集情報（募集期ごとに書き換える） ===== */
  term_label: "第1期",
  target: "lilisコンサル 受講生・卒業生 限定",
  price: "45,000円",
  price_badge: "第1期 特別価格｜受講生・卒業生 限定",
  price_note: "第2期以降の一般募集では58,000円（税込）を予定しています。第1期は特別価格でご案内します。",
  payment: "クレジットカード決済（分割のご相談も可能）／銀行振込",
  start_date: "2026年10月上旬（予定・詳細日程は調整中）",
  deadline: "2026年9月15日（火）",
  archive_note: "毎回の勉強会はアーカイブ（録画）が残るので、当日参加できなくても後から視聴できます。",

  /* ===== リンク ===== */
  apply_url: "https://univa.cc/zgpD3J",
  apply_label: "クレジットカードで申し込む",
  tokutei_url: "https://www.lilisconsul.com/tokutei",

  /* ===== 管理者ボードの合言葉（本番のみ有効） =====
     ここには合言葉そのものではなく「ハッシュ（暗号化した値）」を置きます。
     合言葉を変えたいときは Claude に「管理者ボードの合言葉を〇〇に変えて」と頼んでください。 */
  admin_pass_hash: "8768e5ceb9708995add53a9c30ec83e47c3b7bd293ee9188f2fc3a4c08aa1d3c",

  /* ===== カリキュラム：週ごとの日程（第1週〜第6週の順） ===== */
  weeks: ["日程調整中","日程調整中","日程調整中","日程調整中","日程調整中","日程調整中"]
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
