// jshint esversion: 11
const text = (code) => code
    .replaceAll('&nbsp;', ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/<br>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<(.*?)>/g, '')
    .split('\n')
    .map((line = '') => line.trim())
    .join('\n')
    .replace(/\n\n+/g, '\n\n')
    .replace(/ +/g, ' ')
    .trim();

const tabs = (code) => code.trim()
    .replaceAll(/\\t[ \t]*/g, '\\t')
    .replaceAll('\\t', '\t');

const { any, chain, many, map, maybe, need, not } = Meal;
const highlight = (code) => {
    const ONE = food => food.eat(food.first());
    const COMMENT = any(
        chain('//', maybe(many(not('\n'))))
    );
    const keywords = [
        'async', 'await', 'break', 'case', 'catch', 'class',
        'const', 'continue', 'debugger', 'default', 'delete',
        'do', 'else', 'export', 'extends', 'finally', 'for',
        'function', 'if', 'import', 'in', 'instanceof', 'let',
        'new', 'null', 'of', 'return', 'super', 'switch',
        'this', 'throw', 'try', 'typeof', 'var', 'while',
        'with', 'yield'
    ];
    const bools = ['true', 'false'];
    const alpha = [
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ...'abcdefghijklmnopqrstuvwxyz',
        ...'_$'
    ]
    const IDENTIFIER = map(
        chain(any(...alpha), many(any(...alpha, ...'0123456789'))),
        v => {
            if (keywords.includes(v)) return `<span class="keyword">${v}</span>`;
            if (bools.includes(v)) return `<span class="boolean">${v}</span>`;
            return v;
        }
    );
    const DIGIT = any(...'0123456789');
    const NUMBER = chain(many(DIGIT), maybe(chain('.', many(DIGIT))));
    function STRING(food) {
        return food.eat(any(
            chain('"', maybe(many(any('\\"', not('"')))), '"'),
            chain("'", maybe(many(any("\\'", not("'")))), "'"),
            chain("`", maybe(many(any("\\`", chain('${', map(many(any(
                IDENTIFIER,
                map(NUMBER, v => `<span class="number">${v}</span>`),
                map(STRING, v => `<span class="string">${v}</span>`),
                not('}'))), v => `<span class="code">${v}</span>`),
                '}'), not("`")))), "`"),
        ))
    }
    function EVERYTHING(food) {
        return food.eat(map(many(any(
            map(COMMENT, v => `<span class="comment">${v}</span>`),
            IDENTIFIER,
            map(NUMBER, v => `<span class="number">${v}</span>`),
            map(STRING, v => `<span class="string">${v}</span>`),
            ONE
        )), v => `<span class="code">${v}</span>`))
    }

    let food = Meal(code);
    return food.eat(food => food.eat(EVERYTHING));
    // return code;
};

const copy = (el, code) => {
    navigator.permissions.query({ name: "clipboard-write" }).then(async (result) => {
        if (result.state == 'granted' || result.state == 'prompt') {
            await navigator.clipboard.writeText(code);
            el.innerText = 'copied!';
        } else el.innerText = 'error';
    });
    setTimeout(() => { el.innerText = 'copy' }, 2000)
};

$$('code').forEach(el => {
    let content = el.innerHTML;
    content = text(content);
    let code = content = tabs(content);
    content = highlight(content);
    code = JSON.stringify(code).replaceAll('"', '&quot;');
    const copy_span = `<span class="copy" onclick="copy(this, ${code})">copy</span>`;
    const html = `<div class="code"><code class="${el.classList.value}">${copy_span}${content}</code></div>`;
    el.insertAdjacentHTML('beforebegin', html);
    el.remove();
});

(async () => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.id = 'bubbles';
    document.body.prepend(c);
    const seed = 0 | rand(0xffffffff);
    let y = 0;
    on('resize', () => {
        const [width, height] = [c.width, c.height] = [innerWidth, innerHeight];
        const { rand } = Mulberry(seed);
        ctx.fillStyle = '#141419';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.arc(rand(width * 0.2), (y * rand(0.25, 1)) + rand(document.documentElement.scrollHeight), rand(20, 80), 0, 2 * Math.PI);
            ctx.arc(width - rand(width * 0.2), (y * rand(0.25, 1)) + rand(document.documentElement.scrollHeight), rand(20, 80), 0, 2 * Math.PI);
            ctx.fill();
        }
    }); trigger('resize');
    on('scroll', () => {
        y = -scrollY * 0.75;
        trigger('resize');
    });
})();

(async () => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.id = 'particles';
    document.body.prepend(c);
    let {width, height} = c.getBoundingClientRect();
    
    const { hash } = Mulberry();
    // todo: make this multidimensional and add it to random library
    const noise = (x, y, z) => {
      const lerp = (a, b, t) => a*(1-t) + b*t;
      const x0 = 0|x;
      const x1 = 0|x + 1;
      const y0 = 0|y;
      const y1 = 0|y + 1;
      const z0 = 0|z;
      const z1 = 0|z + 1;
      return lerp(
        lerp(
          lerp(
            hash(x0, y0, z0),
            hash(x1, y0, z0),
            x-x0
          ),
          lerp(
            hash(x0, y1, z0),
            hash(x1, y1, z0),
            x-x0
          ),
          y-y0
        ),
        lerp(
          lerp(
            hash(x0, y0, z1),
            hash(x1, y0, z1),
            x-x0
          ),
          lerp(
            hash(x0, y1, z1),
            hash(x1, y1, z1),
            x-x0
          ),
          y-y0
        ),
        z-z0
      );
    };
    Ps = [...Array(8)].map((e, i) => {
      let x = width*0.9, px = x;
      let y = innerHeight/2+scrollY, py = y;
      const inertia = 0.02 + randpom(0.005);
      return {
        render() {
          ctx.strokeStyle = '#6d6d86';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, py)
          ctx.lineTo(x, y);
          ctx.stroke();
        },
        update() {
          let X = width/10      * noise(performance.now()/2000, i, 1);
          let Y = innerHeight/2 * noise(performance.now()/2000, i, 2);
          X += width - width*0.15;
          Y += innerHeight/4;
          Y += scrollY;
          [px, py] = [x, y];
          x -= (x-X)*inertia;
          y -= (y-Y)*inertia;
        },
      }
    });
  
    on('resize', () => {
        ({ width, height } = c.getBoundingClientRect());
        [c.width, c.height] = [width, height];
    }); trigger('resize');
  
    while (true) {
      ctx.clearRect(0, 0, width, height);
      for (let p of Ps) {
        p.render();
        p.update();
      }
      await new Promise(requestAnimationFrame);
    }
    
})();









