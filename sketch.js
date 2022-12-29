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
    const c = $('canvas#bubbles');
    const seed = 0 | rand(0xffffffff);
    let y = 0;
    on('resize', () => {
        const [width, height] = [c.width, c.height] = [innerWidth, innerHeight];
        const ctx = c.getContext('2d');
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









