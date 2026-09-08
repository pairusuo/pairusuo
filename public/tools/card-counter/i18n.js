// Lightweight i18n helper for static pages
// Usage: window.t(key, vars?) reads language from <html lang>

(function(){
  const dict = {
    zh: {
      'app.title': '扑克牌计数器',
      'app.description': '简单的扑克牌计数器：3–A、2、大小王，每张牌按一副牌上限计数，支持设置多副牌。',
      'app.tips': '点击牌面计数加一；点击牌面上的减号计数减一；达到上限不再增加。',

      'controls.decks.label': '几副牌',
      'controls.decks.decAria': '减少一副',
      'controls.decks.incAria': '增加一副',
      'controls.reset': '重置',

      'card.dec': '减一',
      'card.inc': '加一',
      'card.ariaCount': '{label}，已计数 {v}/{cap}',

      'card.label.3': '3',
      'card.label.4': '4',
      'card.label.5': '5',
      'card.label.6': '6',
      'card.label.7': '7',
      'card.label.8': '8',
      'card.label.9': '9',
      'card.label.10': '10',
      'card.label.J': 'J',
      'card.label.Q': 'Q',
      'card.label.K': 'K',
      'card.label.A': 'A',
      'card.label.2': '2',
      'card.label.joker_small': '小王',
      'card.label.joker_big': '大王',

      'lang.current': '中文',
      'lang.switch': '切换语言',
    },
    en: {
      'app.title': 'Poker card counter',
      'app.description': 'A simple poker card counter: 3-A, 2, Jokers, each card counts according to the upper limit of a deck, and supports setting multiple decks.',
      'app.tips': 'Click on the card face to increase the count by one; click on the minus sign on the card face to decrease the count by one; the count will no longer increase when the upper limit is reached.',

      'controls.decks.label': 'Several decks of cards',
      'controls.decks.decAria': 'Reduce one pair',
      'controls.decks.incAria': 'Add one',
      'controls.reset': 'Reset',

      'card.dec': 'Minus one',
      'card.inc': 'Plus one',
      'card.ariaCount': '{label}, {v}/{cap} counted',

      'card.label.3': '3',
      'card.label.4': '4',
      'card.label.5': '5',
      'card.label.6': '6',
      'card.label.7': '7',
      'card.label.8': '8',
      'card.label.9': '9',
      'card.label.10': '10',
      'card.label.J': 'J',
      'card.label.Q': 'Q',
      'card.label.K': 'K',
      'card.label.A': 'A',
      'card.label.2': '2',
      'card.label.joker_small': 'Joker',
      'card.label.joker_big': 'Joker',

      'lang.current': 'EN',
      'lang.switch': 'Switch language',
    },
    ja: {
      'app.title': 'ポーカーカードカウンター',
      'app.description': 'シンプルなポーカーカードカウンター：3-A、2、ジョーカー、各カードはデッキの上限に応じてカウントされ、複数のデッキの設定をサポートします。',
      'app.tips': 'カードの表面をクリックするとカウントが 1 つ増え、カードの表面のマイナス記号をクリックするとカウントが 1 つ減ります。上限に達するとカウントはそれ以上増加しなくなります。',

      'controls.decks.label': 'いくつかのカードデッキ',
      'controls.decks.decAria': '1組減らす',
      'controls.decks.incAria': '1つ追加',
      'controls.reset': 'リセット',

      'card.dec': 'マイナス1',
      'card.inc': 'プラス1',
      'card.ariaCount': '{label}、{v}/{cap} をカウント',

      'card.label.3': '3',
      'card.label.4': '4',
      'card.label.5': '5',
      'card.label.6': '6',
      'card.label.7': '7',
      'card.label.8': '8',
      'card.label.9': '9',
      'card.label.10': '10',
      'card.label.J': 'J',
      'card.label.Q': 'Q',
      'card.label.K': 'K',
      'card.label.A': 'A',
      'card.label.2': '2',
      'card.label.joker_small': 'Joker',
      'card.label.joker_big': 'Joker',

      'lang.current': '日本語',
      'lang.switch': '言語を切り替える',
    },
    ko: {
      'app.title': '포커 카드 카운터',
      'app.description': '간단한 포커 카드 카운터: 3-A, 2, 조커, 각 카드는 덱의 상한에 따라 계산되며, 여러 덱을 설정할 수 있습니다.',
      'app.tips': '카드 앞면을 클릭하면 숫자가 하나 증가합니다. 카드 앞면의 빼기 기호를 클릭하면 숫자가 하나 감소합니다. 상한선에 도달하면 숫자가 더 이상 증가하지 않습니다.',

      'controls.decks.label': '여러 벌의 카드',
      'controls.decks.decAria': '한 쌍을 줄이세요',
      'controls.decks.incAria': '하나 추가',
      'controls.reset': '다시 놓기',

      'card.dec': '마이너스 하나',
      'card.inc': '플러스 하나',
      'card.ariaCount': '{label}, {v}/{cap} 계산됨',

      'card.label.3': '3',
      'card.label.4': '4',
      'card.label.5': '5',
      'card.label.6': '6',
      'card.label.7': '7',
      'card.label.8': '8',
      'card.label.9': '9',
      'card.label.10': '10',
      'card.label.J': 'J',
      'card.label.Q': 'Q',
      'card.label.K': 'K',
      'card.label.A': 'A',
      'card.label.2': '2',
      'card.label.joker_small': 'Joker',
      'card.label.joker_big': 'Joker',

      'lang.current': '한국어',
      'lang.switch': '언어 전환',
    }
  };

  function getLang(){
    const el = document.documentElement;
    const l = (el.getAttribute('lang') || 'zh').toLowerCase();
    if (l.startsWith('zh')) return 'zh';
    if (l.startsWith('en')) return 'en';
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('ko')) return 'ko';
    return 'en';
  }

  function format(str, vars){
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
  }

  function t(key, vars){
    const lang = getLang();
    const pack = dict[lang] || {};
    let s = pack[key];
    if (s == null) s = (dict.en && dict.en[key]) || key;
    return format(String(s), vars);
  }

  const basePath = new URL('.', document.currentScript.src).pathname;

  function pathForLang(target){
    const { search, hash } = window.location;
    return basePath + (target === 'zh' ? '' : target + '/') + search + hash;
  }

  function wireLangMenu(){
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (!btn || !menu) return;

    function setState(open){
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
    }

    function refreshLabels(){
      const current = getLang();
      btn.textContent = t('lang.current');
      btn.title = t('lang.switch');
      menu.querySelectorAll('[data-lang]').forEach(el => {
        const v = el.getAttribute('data-lang');
        el.setAttribute('aria-checked', v === current ? 'true' : 'false');
      });
    }

    refreshLabels();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = btn.getAttribute('aria-expanded') === 'true';
      setState(!open);
    });

    menu.addEventListener('click', (e) => {
      const target = e.target.closest('[data-lang]');
      if (!target) return;
      const lang = target.getAttribute('data-lang');
      const to = pathForLang(lang);
      window.location.assign(to);
    });

    document.addEventListener('click', () => setState(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setState(false);
    });
  }

  window.t = t;
  window.addEventListener('DOMContentLoaded', wireLangMenu);
})();
