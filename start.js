/* Keep existing member IDs stable so returning students retain their records. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'ailab_my';
  var demo = new URLSearchParams(location.search).get('demo') === '1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (_) { return null; } }
  function hid(s) {
    s = s.trim().toLowerCase();
    var h = 5381; for (var i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
    var h2 = 2166136261; for (var j = s.length - 1; j >= 0; j--) h2 = ((h2 ^ s.charCodeAt(j)) * 16777619) >>> 0;
    return 'm' + h.toString(36) + h2.toString(36).slice(0, 4);
  }
  function pageUrl(id, name) {
    var url = new URL('index.html', location.href);
    url.searchParams.set('u', id); url.searchParams.set('name', name);
    if (demo) url.searchParams.set('demo', '1');
    return url.href;
  }
  function show(id) { ['create', 'back', 'result'].forEach(function (key) { $(key).hidden = key !== id; }); }
  function register(id, name) {
    if (demo || typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.enabled) return;
    try { if (localStorage.getItem('ailab_reg_' + id)) return; } catch (_) {}
    var cfg = SUPABASE_CONFIG;
    fetch(cfg.url + '/rest/v1/ailab_notes', { method: 'POST', headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ member_id: id, member_name: name, mood: '登録', worry: '', want: '入口ページで専用URLを発行' }) })
      .then(function (response) { if (response.ok) { try { localStorage.setItem('ailab_reg_' + id, '1'); } catch (_) {} } }).catch(function () {});
  }
  var saved = demo ? null : load();
  if (saved && typeof saved.id === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(saved.id)) {
    $('goback').href = pageUrl(saved.id, saved.name || '');
    $('return-name').textContent = saved.name ? saved.name + 'さん' : 'あなた';
    show('back');
  }
  $('newone').onclick = function () { show('create'); $('nm').focus(); };
  $('restore').onclick = function () {
    $('form-title').textContent = 'いつもの学びに、おかえりなさい。';
    $('form-lead').textContent = '最初と同じメールアドレスと、呼ばれたいお名前を入力してください。これまでの記録に戻れます。';
    $('make').firstElementChild.textContent = 'わたしの専用ページを開く';
    $('em').focus();
  };
  function resetError(id, errorId) { $(id).removeAttribute('aria-invalid'); $(errorId).hidden = true; $(errorId).textContent = ''; }
  [['nm', 'name-error'], ['em', 'email-error']].forEach(function (pair) { $(pair[0]).addEventListener('input', function () { resetError(pair[0], pair[1]); }); });
  $('entry-form').addEventListener('submit', function (event) {
    event.preventDefault();
    resetError('nm', 'name-error'); resetError('em', 'email-error'); $('err').textContent = '';
    var name = $('nm').value.trim(), email = $('em').value.trim(), errors = [];
    if (!name) errors.push(['nm', 'name-error', '呼ばれたいお名前を入力してください。']);
    if (!email || !$('em').checkValidity()) errors.push(['em', 'email-error', 'メールアドレスを正しく入力してください。']);
    if (errors.length) {
      errors.forEach(function (error) { $(error[0]).setAttribute('aria-invalid', 'true'); $(error[1]).textContent = error[2]; $(error[1]).hidden = false; });
      $('err').textContent = errors.map(function (e) { return e[2]; }).join(' '); $(errors[0][0]).focus(); return;
    }
    var id = hid(email), url = pageUrl(id, name);
    if (!demo) { try { localStorage.setItem(KEY, JSON.stringify({ id: id, name: name, url: url, t: Date.now() })); } catch (_) {} }
    register(id, name); $('myurl').textContent = url; $('open').href = url; show('result'); $('result-title').focus();
  });
  $('copy').onclick = async function () {
    var text = $('myurl').textContent, ok = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); ok = true; } } catch (_) {}
    if (!ok) {
      var area = document.createElement('textarea'); area.value = text; area.style.cssText = 'position:fixed;left:-10000px'; document.body.append(area); area.select();
      try { ok = document.execCommand('copy'); } catch (_) {} area.remove(); $('copy').focus();
    }
    $('copy-status').textContent = ok ? 'コピーしました。ご自身のメモなどに保存してください。' : 'コピーできませんでした。「URLを表示」を開き、URLを選択してコピーしてください。';
    if (!ok) document.querySelector('.url-details').open = true;
  };
})();
