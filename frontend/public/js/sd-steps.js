/* Step-by-step form (progressive enhancement). Without JS every step is visible as one form.
 * Markup: <form data-sd-steps> … <fieldset class="sd-step" data-title="…"> … </fieldset> … </form>
 *         <div class="sd-steps-progress" data-sd-progress></div> and <div class="sd-step-nav" data-sd-nav></div> inside the form.
 * - Shows one step at a time; Back / Next; progress "الخطوة 2 من 4" with a bar and step names.
 * - A step whose fields are all hidden (the page's own logic hides them) is skipped.
 * - Next checks only visible [required] fields of the current step and shows the message next to the field.
 * - The last step keeps the form's own submit button; the page's own submit handler runs unchanged.
 * - After submit: a "عدّل إجاباتك" button returns to step 1 without clearing answers. */
(function () {
  'use strict';
  document.querySelectorAll('form[data-sd-steps]').forEach(function (form) {
    var steps = [].slice.call(form.querySelectorAll('.sd-step'));
    if (steps.length < 2) return;
    form.classList.add('sd-steps-on');
    var prog = form.querySelector('[data-sd-progress]'), nav = form.querySelector('[data-sd-nav]');
    var cur = 0;

    var visible = function (el) { return !el.closest('[hidden]') && el.getClientRects().length > 0; };
    var shown = function (step) {
      var was = step.hidden; step.hidden = false;
      var any = [].some.call(step.querySelectorAll('input:not([type=hidden]), select, textarea'), function (f) { return !f.closest('[hidden]'); });
      step.hidden = was; return any;
    };
    var usable = function () { return steps.map(function (s, i) { return shown(s) ? i : -1; }).filter(function (i) { return i >= 0; }); };

    prog.innerHTML = '<p class="sd-steps-count" aria-live="polite"></p><div class="sd-steps-bar" aria-hidden="true"><i></i></div><ol class="sd-steps-names"></ol>';
    nav.innerHTML = '<button type="button" class="sd-btn sd-btn-outline" data-act="back">السابق</button><button type="button" class="sd-btn sd-btn-primary" data-act="next">التالي</button>';
    var back = nav.querySelector('[data-act=back]'), next = nav.querySelector('[data-act=next]');
    var submit = form.querySelector('[type=submit]');

    function render(focus) {
      var u = usable(); if (u.indexOf(cur) < 0) cur = u.filter(function (i) { return i > cur; })[0] ?? u[u.length - 1];
      var pos = u.indexOf(cur);
      steps.forEach(function (s, i) { s.hidden = i !== cur; s.setAttribute('aria-current', i === cur ? 'step' : 'false'); });
      prog.querySelector('.sd-steps-count').textContent = 'الخطوة ' + (pos + 1) + ' من ' + u.length + ': ' + steps[cur].dataset.title;
      prog.querySelector('.sd-steps-bar i').style.width = ((pos + 1) / u.length * 100) + '%';
      prog.querySelector('.sd-steps-names').innerHTML = u.map(function (i, k) {
        return '<li class="' + (k < pos ? 'done' : k === pos ? 'now' : '') + '"><button type="button" data-go="' + i + '"' + (k > pos ? ' disabled' : '') + '><span class="sd-num">' + (k + 1) + '</span>' + steps[i].dataset.title + '</button></li>';
      }).join('');
      back.hidden = pos === 0;
      var last = pos === u.length - 1;
      next.hidden = last;
      if (submit) submit.hidden = !last;
      if (focus) { var h = steps[cur].querySelector('legend') || steps[cur]; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); prog.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
    }
    function check() {
      steps[cur].querySelectorAll('.sd-field-error').forEach(function (e) { e.remove(); });
      var bad = [].filter.call(steps[cur].querySelectorAll('[required]'), function (f) { return visible(f) && !String(f.value || '').trim(); });
      bad.forEach(function (f) {
        var m = document.createElement('p'); m.className = 'sd-field-error'; m.setAttribute('role', 'alert');
        m.textContent = 'أجب عن هذا السؤال للمتابعة.';
        (f.closest('.sv-field') || f.parentNode).appendChild(m);
        f.setAttribute('aria-invalid', 'true');
        f.addEventListener('input', function clr() { f.removeAttribute('aria-invalid'); if (m.parentNode) m.remove(); f.removeEventListener('input', clr); }, { once: true });
        f.addEventListener('change', function () { f.removeAttribute('aria-invalid'); if (m.parentNode) m.remove(); }, { once: true });
      });
      if (bad[0]) bad[0].focus();
      return !bad.length;
    }
    next.addEventListener('click', function () { if (!check()) return; var u = usable(); cur = u[u.indexOf(cur) + 1]; render(true); });
    back.addEventListener('click', function () { var u = usable(); cur = u[Math.max(0, u.indexOf(cur) - 1)]; render(true); });
    prog.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b && !b.disabled) { cur = +b.dataset.go; render(true); } });
    form.addEventListener('change', function () { setTimeout(function () { render(false); }, 0); });
    form.addEventListener('submit', function () {
      form.classList.add('sd-steps-done');
      var edit = form.parentNode.querySelector('[data-sd-edit]');
      if (edit) edit.hidden = false;
    });
    var edit = form.parentNode.querySelector('[data-sd-edit]');
    if (edit) edit.addEventListener('click', function () { cur = usable()[0]; form.classList.remove('sd-steps-done'); edit.hidden = true; render(true); });
    form.sdStepsGo = function (i) { cur = i; render(false); };
    render(false);
  });
})();
