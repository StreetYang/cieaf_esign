
/**
 * @returns {HTMLElement}
 */
function createEl(tag, atts, parent) {
    const el = document.createElement(tag);
    atts && Object.assign(el, atts);
    parent && parent.appendChild(el);
    return el;
}

export function create(opts) {

    opts = {
        // 笔刷颜色
        color: 'black',

        // 背景颜色
        background: 'white',

        // 笔刷宽度
        lineWidth: 2,

        // 左上角标题
        title: '',

        // 父容器
        parent: document.body,

        // 确认回调函数
        ok(dataUrl) { console.log(dataUrl) },

        ...opts
    }

    const root = createEl('div', { className: 'cieaf-esign' }, opts.parent);
    if (opts.parent.tagName === 'BODY') {
        Object.assign(root.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10000,
            width: '100vw',
            height: '100vh',
        });
    } else {
        Object.assign(root.style, {
            position: 'relative',
            width: '100%',
            height: '100%',
        });
    }


    const width = root.offsetWidth;
    const height = root.offsetHeight;

    const header = createEl('header', { className: 'cieaf-esign-header', innerHTML: opts.title }, root);
    Object.assign(header.style, {
        position: 'absolute',
    });

    const canvas = createEl('canvas', { width, height, className: 'cieaf-esign-canvas' }, root);
    Object.assign(canvas.style, {
        background: opts.background
    });

    const context = canvas.getContext('2d');
    context.strokeStyle = opts.color;
    context.lineWidth = opts.lineWidth;
    context.lineCap = 'round';

    let lastX = undefined;
    let lastY = undefined;
    let offsetX = 0;
    let offsetY = 0;

    function updateOffsetXY(target) {
        let el = target;
        offsetX = offsetY = 0;
        while (el) {
            if (el.nodeType === 11 && el.host) {
                el = el.host;
            }
            const ol = el.offsetLeft;
            const ot = el.offsetTop;
            if (isNaN(ot)) return;

            offsetX += ol;
            offsetY += ot;
            el = el.parentNode;
        }
    }

    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.targetTouches[0];
        lastX = touch.pageX;
        lastY = touch.pageY;
        updateOffsetXY(e.target);
    })

    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const touch = e.targetTouches[0];
        const { pageX, pageY } = touch;

        context.beginPath();
        context.moveTo(lastX - offsetX, lastY - offsetY);
        context.lineTo(pageX - offsetX, pageY - offsetY);
        context.stroke()

        lastX = pageX;
        lastY = pageY;
    })

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        lastX = lastX = undefined;
    })

    canvas.addEventListener('touchcancel', e => {
        e.preventDefault();
        lastX = lastX = undefined;
    })

    const footer = createEl('footer', { className: 'cieaf-esign-footer' }, root);
    Object.assign(footer.style, {
        position: 'absolute',
        bottom: 0,
        right: 0
    })

    const confirmBtn = createEl('button', { innerHTML: 'confirm', className: 'cieaf-esign-confirm' }, footer);
    confirmBtn.addEventListener('click', () => {
        const imgData = context.getImageData(0, 0, width, height).data;
        let t = height, b = 0, l = width, r = 0;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let pos = (i + width * j) * 4;
                if (imgData[pos + 3] > 0) {
                    l = Math.min(i, l);
                    r = Math.max(i, r);
                    t = Math.min(j, t);
                    b = Math.max(j, b);
                }
            }
        }
        if (b == 0) return;
        const w = r - l;
        const h = b - t;
        let tmpData = context.getImageData(l, t, w, h);
        const tmpEl = createEl('canvas', { width: w, height: h });
        const tmpCtx = tmpEl.getContext('2d');
        tmpCtx.putImageData(tmpData, 0, 0);
        opts.ok(tmpEl.toDataURL());
    })

    const clearBtn = createEl('button', { innerHTML: 'clear', className: 'cieaf-esign-clear' }, footer);
    clearBtn.addEventListener('click', () => {
        context.clearRect(0, 0, width, height);
    })

    const cancelBtn = createEl('button', { innerHTML: 'cancel', className: 'cieaf-esign-cancel' }, footer);
    cancelBtn.addEventListener('click', () => {
        root.remove();
    })

    return root;
}