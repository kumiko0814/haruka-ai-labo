/* A coordinated stationery world, layered onto the existing application flows. */
(function () {
  'use strict';
  var page = document.body;
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.from((root || document).querySelectorAll(s)); };
  function art(name, className) {
    var img = document.createElement('img');
    img.src = 'assets/atelier-' + name + '.svg';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'atelier-art ' + (className || '');
    img.width = 120; img.height = 120;
    return img;
  }
  var symbols = { v_new: 'note', v_list: 'letter', v_cur: 'book', v_adv: 'letter', v_ana: 'bloom', v_set: 'ribbon' };
  $$('.slogo,.ui-brand').forEach(function (logo) {
    if (logo.hasAttribute('data-cfg')) {
      var label = document.createElement('span');
      label.setAttribute('data-cfg', logo.getAttribute('data-cfg'));
      label.textContent = logo.textContent;
      logo.removeAttribute('data-cfg');
      logo.replaceChildren(label);
    }
    logo.prepend(art('ribbon', 'brand-ribbon'));
  });
  if (page.matches('.page-index,.page-kanri')) {
    var adminSymbols = ['note', 'letter', 'letter', 'book', 'ribbon', 'bloom', 'palette'];
    $$('.ni').forEach(function (item, i) { item.prepend(art(symbols[item.dataset.v] || (item.id === 'niCur' ? 'book' : adminSymbols[i] || 'note'), 'nav-art')); });
    $$('.mn').forEach(function (item, i) { item.prepend(art(symbols[item.dataset.v] || adminSymbols[i] || 'note', 'nav-art')); });
    $$('.card h2,.ihead h2').forEach(function (heading) {
      var view = heading.closest('.view');
      heading.prepend(art(view ? symbols[view.id] : /進捗|カリキュラム/.test(heading.textContent) ? 'book' : /傾向|分析/.test(heading.textContent) ? 'bloom' : 'letter', 'heading-art'));
    });
  }
  if (page.matches('.page-index')) {
    var title = $('.hero h1');
    title.textContent = 'わたしのAIカルテ';
    var welcome = document.createElement('div'); welcome.className = 'atelier-script';
    welcome.textContent = 'My little AI lab'; $('.hero').prepend(welcome);
    var speech = $('.herochar .speech'); if (speech) speech.innerHTML = 'あなたのペースで、<br>一緒に進めよう。';
    var phoneSpeech = $('.mspeech'); if (phoneSpeech) phoneSpeech.innerHTML = '今日の気持ちを、<br>明日のヒントに。';
    $$('.aican .fi').forEach(function (item, i) { item.prepend(art(['letter', 'palette', 'tea'][i], 'feature-art')); });
    var summary = $('.curcard summary'); if (summary) summary.prepend(art('book', 'summary-art'));
    var course = $('#curpage');
    if (course) {
      var chapter;
      Array.from(course.children).forEach(function (node, i) {
        if (node.matches('.curwk')) {
          chapter = document.createElement('section'); chapter.className = 'atelier-chapter';
          node.before(chapter);
          var count = course.querySelectorAll('.atelier-chapter').length;
          chapter.append(art(['note','letter','tea','palette','laptop','bloom','book'][count-1] || 'book', 'chapter-art'));
        }
        if (chapter) chapter.append(node);
      });
    }
    var success = $('#okmsg'); if (success) success.prepend(art('letter', 'success-art'));
  }
  if (page.matches('.page-lp')) {
    $$('.feature-number').forEach(function (slot, i) {
      var number = document.createElement('span'); number.textContent = slot.textContent;
      slot.replaceChildren(art(['note','letter','book','bloom'][i], 'service-art'), number);
    });
    $('.hero .chars').prepend(art('ribbon', 'portrait-ribbon'));
  }
  if (page.matches('.page-start')) {
    $('.hero').prepend(art('ribbon', 'invitation-ribbon'));
  }
  if (page.matches('.page-ai')) {
    $('.hero').append(art('tea', 'chat-tea'));
  }
  if (page.matches('.page-handover,.page-manual,.page-promo,.page-setup')) {
    var heading = $('h1'); if (heading) heading.prepend(art('ribbon', 'guide-ribbon'));
    $$('.maprow').forEach(function (row) {
      var text = row.textContent;
      row.prepend(art(/カルテ/.test(text) ? 'note' : /チャット|はるか/.test(text) ? 'letter' : /ガイド|マニュアル/.test(text) ? 'book' : 'laptop', 'map-art'));
    });
    $$('.page-promo .card .hd').forEach(function (head, i) { head.prepend(art(['ribbon','letter','note','tea','laptop','book','letter','palette'][i] || 'note', 'map-art')); });
  }
  $$('a[target="_blank"]').forEach(function (link) { link.rel = 'noopener noreferrer'; });
})();
