(function () {
  'use strict';
  var icons = {
    v_new: '<path d="M12 5v14M5 12h14"/>',
    v_list: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    v_adv: '<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0Z"/><path d="M7 10h10M7 14h6"/>',
    v_ana: '<path d="M4 4v16h16M8 15v-4M12 15V7M16 15V9"/>',
    v_cur: '<path d="M12 6C8 3 4 4 2 5v14c4-2 7-1 10 1 3-2 6-3 10-1V5c-4-2-7-1-10 1Zm0 0v14"/>',
    v_set: '<path d="m9 3-1 3-3 1-2 4 2 3v4l4 2 3-1 3 1 4-2v-4l2-3-2-4-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>'
  };
  document.querySelectorAll('.ni,.mn').forEach(function (item, i) {
    if (item.querySelector('svg')) return;
    var path = icons[item.dataset.v] || Object.values(icons)[i % 6];
    var holder = document.createElement('span');
    holder.innerHTML = '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
    item.prepend(holder.firstChild);
  });
  // Links in the compact marketing header remain available on small screens.
  document.querySelectorAll('.ui-topnav nav').forEach(function (nav) {
    nav.setAttribute('aria-label', 'サイトナビゲーション');
    if (!nav.id) nav.id = 'studio-site-nav';
    var toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'studio-menu-toggle'; toggle.textContent = 'メニュー';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', nav.id);
    toggle.addEventListener('click', function () { var open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
    nav.before(toggle);
    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }); });
    nav.addEventListener('keydown', function (event) { if (event.key === 'Escape') { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
  });
  var body = document.body;
  if (body.classList.contains('page-index')) {
    // Keep the principal writing task prominent; optional attachments stay collapsible.
    var imageButton = document.getElementById('imgBtn');
    var attachment = imageButton && imageButton.closest('.q');
    if (attachment) {
      var details = document.createElement('details'); details.className = 'attachment-options';
      var summary = document.createElement('summary'); summary.textContent = '画像の添付・報告のオプション';
      attachment.before(details); details.append(summary, attachment);
    }
  }
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) { link.rel = 'noopener noreferrer'; });
})();
