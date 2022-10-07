# cieaf_esign
create a canvas for signature

# 安装
```
> npm i cieaf_esign
```

# 使用
```
import { create } from 'cieaf_esign'

// default
create();

// common
create({
    // 笔刷颜色
    color: '#333',

    // 背景颜色
    background: '#aaa',

    // 笔刷宽度
    lineWidth: 5,

    // 左上角标题
    title: 'DEMO',

    // 父容器，会根据宽和高填充画布
    parent: document.body,

    // 确认回调函数
    ok(dataUrl) {
        const img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img)
    },
})
```