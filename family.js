// © 2026 김용현
/*
 * bgnl.kr 패밀리 사이트 드롭다운
 * 쓰는 법: 꼬리말에 <div data-bgnl-family></div> 를 두고
 *         <script src="https://bgnl.kr/family.js" defer></script> 를 넣는다.
 * 사이트 목록은 아래 SITES 만 고치면 모든 사이트에 함께 반영된다.
 */
(function () {
  'use strict';

  var SITES = [
    { name: 'GeoTester', url: 'https://geotester.bgnl.kr' },
    { name: 'GeoStatAtlas', url: 'https://geostatatlas.bgnl.kr' },
    { name: 'GeoGrapher', url: 'https://geographer.bgnl.kr' },
    { name: 'e-GIS', url: 'https://e-gis.kr' },
    { name: '통사랑', url: 'https://tongsarang.kr' },
    { name: '지형 형성 실험실', url: 'https://topolab.bgnl.kr' },
    { name: 'Projection 3D', url: 'https://proj3d.bgnl.kr' },
    { name: '대기 대순환', url: 'https://gcs.bgnl.kr' },
    { name: 'GeoSource', url: 'https://geosource.bgnl.kr' },
    { name: 'LocFinder', url: 'https://locfinder.bgnl.kr' },
    { name: 'GeoShelf', url: 'https://geoshelf.kr' },
    { name: 'SpaceArchive', url: 'https://yhk1m.github.io/space-archive/' },
    { name: 'bgnl.kr', url: 'https://bgnl.kr' }
  ];

  var STYLE_ID = 'bgnl-family-style';
  var CSS = [
    '[data-bgnl-family]{display:inline-block;vertical-align:middle;white-space:nowrap}',
    '.bgnl-fam{position:relative;display:inline-block;vertical-align:middle;white-space:nowrap;font:inherit;color:inherit;text-align:left;line-height:1.4;overflow-wrap:normal;word-break:keep-all;letter-spacing:normal;text-transform:none}',
    '.bgnl-fam__btn{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 10px;font:inherit;font-size:12px;line-height:1;color:inherit;',
    'background:transparent;border:1px solid rgba(127,127,127,.4);border-radius:6px;cursor:pointer;opacity:.85}',
    '.bgnl-fam__btn:hover{border-color:rgba(127,127,127,.8);opacity:1}',
    '.bgnl-fam__btn:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '.bgnl-fam__btn svg{width:11px;height:11px;flex:none;transition:transform .15s}',
    '.bgnl-fam[data-open] .bgnl-fam__btn svg{transform:rotate(180deg)}',
    '.bgnl-fam__list{box-sizing:border-box;position:absolute;left:0;bottom:calc(100% + 6px);z-index:2147483000;min-width:240px;max-width:calc(100vw - 32px);',
    'max-height:min(500px,70vh);overflow:auto;margin:0;padding:6px;list-style:none;border:1px solid rgba(127,127,127,.35);',
    'border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18)}',
    '.bgnl-fam[data-down] .bgnl-fam__list{bottom:auto;top:calc(100% + 6px)}',
    '.bgnl-fam[data-right] .bgnl-fam__list{left:auto;right:0}',
    '.bgnl-fam__list[hidden]{display:none}',
    '.bgnl-fam__item{margin:0;padding:0;border:0;list-style:none;background:none}',
    '.bgnl-fam__link{white-space:nowrap;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:36px;padding:0 10px;',
    'border:0;box-shadow:none;border-radius:6px;color:inherit;text-decoration:none;font-size:13px}',
    '.bgnl-fam__link:hover,.bgnl-fam__link:focus-visible{background:rgba(127,127,127,.14);outline:none}',
    '.bgnl-fam__host{font-size:12px;opacity:.6;white-space:nowrap}',
    '.bgnl-fam__link[aria-current]{font-weight:700;color:var(--bgnl-fam-cur);background:var(--bgnl-fam-cur-bg)}',
    '.bgnl-fam__link[aria-current] .bgnl-fam__host{opacity:.9}',
    '@media print{.bgnl-fam{display:none}}'
  ].join('');

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function hostOf(url) {
    try { return new URL(url).host.replace(/^www\./, ''); } catch (e) { return url; }
  }

  function isCurrent(url) {
    try {
      var u = new URL(url);
      var here = location.host.replace(/^www\./, '');
      if (u.host.replace(/^www\./, '') !== here) return false;
      var p = u.pathname.replace(/\/+$/, '');
      return p === '' || location.pathname.indexOf(p) === 0;
    } catch (e) { return false; }
  }

  /* 꼬리말 바탕색을 찾아 펼친 목록에 쓴다 (사이트마다 색이 달라서) */
  function solidBackground(el) {
    var node = el;
    while (node && node.nodeType === 1) {
      var bg = getComputedStyle(node).backgroundColor;
      var m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        var parts = m[1].split(/[\s,\/]+/).filter(Boolean);
        var alpha = parts.length > 3 ? parseFloat(parts[3]) : 1;
        if (alpha > 0.95) return bg;
      }
      node = node.parentElement;
    }
    var scheme = getComputedStyle(document.documentElement).colorScheme || '';
    return scheme.indexOf('dark') === 0 ? '#1e1e1e' : '#ffffff';
  }

  function rgbOf(color) {
    var probe = document.createElement('span');
    probe.style.color = color;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    var c = getComputedStyle(probe).color;
    probe.remove();
    var m = c.match(/[\d.]+/g);
    return m ? [+m[0], +m[1], +m[2]] : null;
  }

  function luminance(rgb) {
    var v = rgb.map(function (x) {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* 지금 보는 사이트 줄의 색: 사이트 강조색을 쓰고, 없거나 잘 안 보이면 파랑 */
  function currentColor(bg) {
    var bgRgb = rgbOf(bg) || [255, 255, 255];
    var dark = luminance(bgRgb) < 0.4;
    var rootStyle = getComputedStyle(document.documentElement);
    var names = ['--bgnl-fam-accent', '--accent', '--color-primary', '--primary', '--color-accent', '--accent-color', '--brand', '--brand-color'];
    for (var i = 0; i < names.length; i++) {
      var v = rootStyle.getPropertyValue(names[i]).trim();
      if (!v) continue;
      var rgb = rgbOf(v);
      if (rgb && contrast(rgb, bgRgb) >= 4.5) return { fg: 'rgb(' + rgb.join(',') + ')', rgb: rgb };
    }
    var fallback = dark ? [122, 176, 255] : [21, 101, 222];
    return { fg: 'rgb(' + fallback.join(',') + ')', rgb: fallback };
  }

  var CHEVRON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg>';

  var uid = 0;

  function build(mount) {
    if (mount.getAttribute('data-bgnl-family-ready')) return;
    mount.setAttribute('data-bgnl-family-ready', '1');
    addStyle();

    var label = mount.getAttribute('data-label') || 'Family Sites';
    var id = 'bgnl-fam-list-' + (++uid);

    var root = document.createElement('div');
    root.className = 'bgnl-fam';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bgnl-fam__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    btn.innerHTML = '<span></span>' + CHEVRON;
    btn.firstChild.textContent = label;

    var list = document.createElement('ul');
    list.className = 'bgnl-fam__list';
    list.id = id;
    list.hidden = true;

    SITES.forEach(function (site) {
      var li = document.createElement('li');
      li.className = 'bgnl-fam__item';
      var a = document.createElement('a');
      a.className = 'bgnl-fam__link';
      a.href = site.url;
      var name = document.createElement('span');
      name.textContent = site.name;
      var host = document.createElement('span');
      host.className = 'bgnl-fam__host';
      if (isCurrent(site.url)) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      host.textContent = hostOf(site.url);
      a.appendChild(name);
      a.appendChild(host);
      li.appendChild(a);
      list.appendChild(li);
    });

    function place() {
      var r = btn.getBoundingClientRect();
      var gap = 6, edge = 8;
      var above = r.top - gap - edge;
      var below = window.innerHeight - r.bottom - gap - edge;
      /* 사이트가 정한 최대 높이(휴대폰 아래 시트 등)가 있으면 그것을 넘지 않는다 */
      list.style.maxHeight = '';
      list.hidden = false;
      var cssMax = parseFloat(getComputedStyle(list).maxHeight);
      list.hidden = true;
      var want = Math.min(isNaN(cssMax) ? 500 : cssMax, 500, window.innerHeight * 0.7);
      /* 위에 다 들어가면 위로, 아니면 더 넓은 쪽으로 펼치고 그 높이에 맞춰 줄인다 */
      var down = above < want && below > above;
      if (down) root.setAttribute('data-down', '');
      else root.removeAttribute('data-down');
      list.style.maxHeight = Math.max(120, Math.min(want, down ? below : above)) + 'px';
      if (r.left + 260 > window.innerWidth) root.setAttribute('data-right', '');
      else root.removeAttribute('data-right');
    }

    function open() {
      var bg = solidBackground(mount);
      list.style.background = bg;
      var cur = currentColor(bg);
      list.style.setProperty('--bgnl-fam-cur', cur.fg);
      list.style.setProperty('--bgnl-fam-cur-bg', 'rgba(' + cur.rgb.join(',') + ',.12)');
      place();
      list.hidden = false;
      root.setAttribute('data-open', '');
      btn.setAttribute('aria-expanded', 'true');
    }

    function close(focusBtn) {
      if (list.hidden) return;
      list.hidden = true;
      root.removeAttribute('data-open');
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    }

    btn.addEventListener('click', function () {
      if (list.hidden) open(); else close(false);
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) close(false);
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(true); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var links = Array.prototype.slice.call(list.querySelectorAll('a'));
      if (list.hidden) { open(); links[0].focus(); e.preventDefault(); return; }
      var i = links.indexOf(document.activeElement);
      i = e.key === 'ArrowDown' ? Math.min(links.length - 1, i + 1) : Math.max(0, i - 1);
      links[i].focus();
      e.preventDefault();
    });

    root.appendChild(btn);
    root.appendChild(list);
    mount.appendChild(root);
  }

  function scan() {
    var mounts = document.querySelectorAll('[data-bgnl-family]');
    for (var i = 0; i < mounts.length; i++) build(mounts[i]);
  }

  function start() {
    scan();
    /* React 같은 앱은 꼬리말을 나중에 그리므로 계속 지켜본다 */
    if (window.MutationObserver) {
      var queued = false;
      new MutationObserver(function () {
        if (queued) return;
        queued = true;
        setTimeout(function () { queued = false; scan(); }, 300);
      })
        .observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  window.bgnlFamily = { sites: SITES, mount: build };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
