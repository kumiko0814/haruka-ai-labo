/* Progressive enhancement: all existing data flows remain in their original pages. */
(function () {
  'use strict';
  var page = document.body;
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.from((root || document).querySelectorAll(s)); };

  // Long guides keep every paragraph, but readers can jump directly to their task.
  if (page.matches('.page-handover,.page-manual,.page-promo')) {
    var sections = $$('.wrap > .sec');
    if (sections.length) {
      var toc = document.createElement('details');
      toc.className = 'ui-toc';
      toc.open = window.matchMedia('(min-width: 641px)').matches;
      var summary = document.createElement('summary');
      summary.textContent = 'このページの目次';
      var nav = document.createElement('nav');
      nav.setAttribute('aria-label', '目次');
      sections.forEach(function (section, i) {
        var heading = $('h2', section);
        if (!heading) return;
        if (!section.id) section.id = 'guide-section-' + (i + 1);
        var link = document.createElement('a');
        link.href = '#' + section.id;
        var number = document.createElement('span');
        number.textContent = String(i + 1).padStart(2, '0');
        link.append(number, document.createTextNode(heading.textContent));
        nav.append(link);
      });
      toc.append(summary, nav);
      sections[0].before(toc);
    }
  }

  // Existing custom click controls receive the same keyboard behavior as buttons.
  $$('.ni,.mn,.chip,#name-skip,#clear-btn,#bugL,#memhead,#aikC,#aikL,#aikX').forEach(function (el) {
    if (!el.matches('button,a[href],input,summary') && (el.onclick || el.matches('.chip,#name-skip,#clear-btn,#bugL,#memhead,#aikC,#aikL,#aikX'))) {
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          el.click();
        }
      });
    }
  });
  $$('.ni[data-v],.mn[data-v]').forEach(function (control) {
    control.setAttribute('aria-controls', control.dataset.v);
  });
  function reflectNavigation() {
    $$('.ni[data-v],.mn[data-v]').forEach(function (control) {
      if (control.classList.contains('on')) control.setAttribute('aria-current', 'page');
      else control.removeAttribute('aria-current');
    });
  }
  reflectNavigation();
  $$('.ni,.mn').forEach(function (control) {
    control.addEventListener('click', function () {
      reflectNavigation();
      var view = control.dataset.v && document.getElementById(control.dataset.v);
      var heading = view && $('h2', view);
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
  });
  $$('a[target="_blank"]').forEach(function (link) { link.rel = 'noopener noreferrer'; });
  $$('textarea').forEach(function (input) {
    if (!input.hasAttribute('aria-label') && !input.labels.length) {
      input.setAttribute('aria-label', input.placeholder || 'メッセージ');
    }
  });
  $$('label').forEach(function (label) {
    var next = label.nextElementSibling;
    if (!label.htmlFor && next && next.matches('input,textarea,select') && next.id) label.htmlFor = next.id;
  });
  $$('#okmsg,#ntok,#bugD,#result').forEach(function (el) { el.setAttribute('role', 'status'); });
  var chatClose = $('#aikX');
  if (chatClose) chatClose.setAttribute('aria-label', 'AIはるかを閉じる');
  var main = $('#main-content');
  if (main) main.tabIndex = -1;

  // Grow the chat composer for multiline messages without moving the send button away.
  var composer = $('#user-input');
  if (composer) composer.addEventListener('input', function () {
    composer.style.height = 'auto';
    composer.style.height = Math.min(composer.scrollHeight, 144) + 'px';
  });

  // Keep focus inside existing dialogs, close cancellable dialogs with Escape,
  // and return focus to the control that opened them.
  ['bugM', 'modal', 'aikP', 'ntcOv'].forEach(function (id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    var previous = null, shown = false;
    var close = id === 'bugM' ? $('#bugC') : id === 'modal' ? $('#name-skip') : id === 'ntcOv' ? $('#ntcClose') : $('#aikX');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', id === 'bugM' ? '不具合の報告' : id === 'ntcOv' ? 'はるかからのメッセージ' : 'AIはるか');
    if (id !== 'aikP') modal.setAttribute('aria-modal', 'true');
    function visible() { return getComputedStyle(modal).display !== 'none'; }
    function focusables() { return $$('button,a[href],input,textarea,select,[tabindex="0"]', modal).filter(function (el) { return !el.disabled && getComputedStyle(el).display !== 'none'; }); }
    function update() {
      var isShown = visible();
      if (isShown && !shown) {
        previous = document.activeElement;
        shown = true;
        var first = focusables()[0];
        if (first) first.focus({ preventScroll: true });
      } else if (!isShown && shown) {
        shown = false;
        if (previous && previous.isConnected) previous.focus({ preventScroll: true });
      }
    }
    new MutationObserver(update).observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
    modal.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && close) { event.preventDefault(); close.click(); }
      if (event.key !== 'Tab' || id === 'aikP') return;
      var items = focusables(), first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); if (last) last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); if (first) first.focus(); }
    });
    update();
  });
})();
