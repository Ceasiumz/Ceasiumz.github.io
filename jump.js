// ==================== PJAX相关函数 ====================

// 加载外部脚本
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// 加载图片库
async function loadGallery() {
    const response = await fetch('/image_files.json');
    const images = await response.json();
    const galleryContainer = document.querySelector('.container-gallery'); // 使用 querySelector 获取单个元素

    if (!galleryContainer) {
        console.error('Gallery container not found!');
        return;
    }

    const categorized = {};
    images.forEach(image => {
        const relativePath = image.url.replace('/Ceasiumz.github.io/gallery/', ''); // 修正路径
        const [category, ...rest] = relativePath.split('/');
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push(relativePath);
    });

    Object.keys(categorized).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `<h2>${category}</h2>`;
        categorized[category].forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = url.split('/').pop();
            img.className = 'gallery-image';
            categoryDiv.appendChild(img);
        });
        galleryContainer.appendChild(categoryDiv); // 修复 appendChild 调用
    });
}

/* 使用 JavaScript 实现滚动到图片尾部 */
document.addEventListener('mousedown', function (e) {
    // console.log('mousedown event detected:', e.target);
    const activeImage = e.target.closest('.gallery-image');
    if (activeImage) {
        console.log('Image mousedown:', activeImage.src);
        activeImage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
});

// PJAX加载内容
function loadContentpjax(url) {
    if (new URL(url, location.href).pathname.startsWith('/article')) {
        location.assign(url);
        return;
    }
    fetch(url)
        .then(res => res.text())
        .then(html => {
            window.__fromPjax = true;
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const newMain = temp.querySelector('#main');
            if (newMain) {
                document.getElementById('main').innerHTML = newMain.innerHTML;
                const scripts = newMain.querySelectorAll('script');
                if (scripts.length > 0) {
                    scripts.forEach(script => {
                        if (script.src.length > 0) {
                            loadScript(script.src).catch(err => {
                                console.error('脚本加载失败:', err);
                            });
                        } else {
                            try {
                                eval(script.textContent);
                                // 将 loadGallery 绑定到全局作用域
                                if (script.textContent.includes('loadGallery')) {
                                    window.loadGallery = loadGallery;
                                }
                            } catch (err) {
                                console.error('脚本执行失败:', err);
                            }
                        }
                    });
                }
                if (url.includes('/gallery/')) {
                    try {
                        window.loadGallery();
                    } catch (err) {
                        console.error('loadGallery 调用失败:', err);
                    }
                }
            }
            window.history.pushState({}, '', url);
        })
        .catch(err => {
            console.error('PJAX 加载失败:', err);
        });
    console.log('pjax loading!');
}

// 加载Markdown内容
function loadContentMd(url) {
    // Use theme.css to load md
    fetch(url)
        .then(res => res.text())
        .then(mdContent => {
            const mdContainer = document.getElementById('markdown-container');
            if (mdContainer) {
                mdContainer.innerHTML = mdContent;
                window.history.pushState({}, '', url);
                console.log('Markdown content loaded!');
            }
        })
        .catch(err => console.error('Error loading markdown content:', err));
}

// PJAX阻挡直接访问
function PjaxBlock() {
    if (document.querySelector('[data-markdown-directory]')) return;
    // 只在主站首页豁免，其它页面都拦截
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') {
        const params = new URLSearchParams(window.location.search);
        console.log('URL Parameters:', params.toString());
        const pjaxTarget = params.get('pjax');
        if (pjaxTarget) {
            console.log('?pjax main site detected! PJAX needed: ', pjaxTarget);
            loadContentpjax(pjaxTarget);
            // // 可选：清除参数
            // window.history.replaceState({}, '', '/');
        }
        else {
            console.log('Clean main site detected, no PJAX needed.');
        }
        return;
    }
    // if (path === '/code/' || path === '/code/index.html') {
    //     console.log('?pjax main site detected! CC needed: ', path);
    //     // loadContentcc(path);
    //     // // 可选：清除参数
    //     // window.history.replaceState({}, '', '/');
    //     return;
    // }

    if (!window.__fromPjax) {
        // 用 PJAX 方式加载主站的 index.html 内容
        const url = '../';
        //transfer url to absolute url
        console.log('Can not enter without PJAX! Fetching URL:', url);
        const absoluteUrl = new URL(url, window.location.origin).href;
        // 带着?pjax网址退回到主站首页
        window.location.href = '/?pjax=' + encodeURIComponent(path);
    } else {
        // PJAX 进入，直接加载当前页面的内容
        console.log('Loaded current page content with PJAX.');
    }
}

// ==================== 菜单相关 ====================

if (!window.gMenu) {
    window.gMenu = ['Resume', 'resume', 'Portfolio', 'portfolio'];
}

// 处理页面菜单显示
if (gMenu[0] != null && gMenu[0] != '') {
    const m1 = document.getElementById('menuL1');
    if (m1) {
        m1.style.visibility = 'visible';
        m1.lastElementChild.href = gMenu[1];
        m1.lastElementChild.textContent = gMenu[0];
    }
}
if (gMenu[2] != null && gMenu[2] != '') {
    const m2 = document.getElementById('menuL2');
    if (m2) {
        m2.style.visibility = 'visible';
        m2.lastElementChild.href = gMenu[3];
        m2.lastElementChild.textContent = gMenu[2];
    }
}

// ==================== 鼠標特效 ====================

const emojis = ['🌸', '🌼', '🍃', '🌺', '🌷', '🥰'];
document.addEventListener('click', function (e) {
    let thisEmo = emojis[Math.floor(Math.random() * emojis.length)];
    for (let i = 0; i < 10; i++) {
        const petal = document.createElement('div');
        petal.innerText = thisEmo;
        petal.style.position = 'fixed';
        // 不要除以 zoom，直接用 clientX/clientY
        petal.style.left = (e.clientX + (Math.random() - 0.5) * 40) + 'px';
        petal.style.top = (e.clientY + (Math.random() - 0.5) * 40) + 'px';
        petal.style.fontSize = (16 + Math.random() * 16) + 'px';
        petal.style.pointerEvents = 'none';
        petal.style.opacity = 1;
        petal.style.transition = 'all 1.2s cubic-bezier(.17,.67,.83,.67)';
        document.body.appendChild(petal);

        setTimeout(() => {
            petal.style.transform = `translateY(${80 + Math.random() * 40}px) scale(${0.5 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`;
            petal.style.opacity = 0;
        }, 10);

        setTimeout(() => {
            petal.remove();
        }, 1300);
    }
    console.log('petal clicked!' + thisEmo);
});

// ==================== 主题切换与持久化 ====================

// 切换主题
function ToggleTheme() {
    const topRightText = document.getElementById('topRightText');
    if (topRightText) {
        let lastTheme = null;
        // 悬浮时临时切换主题
        topRightText.onmouseenter = function () {
            const body = document.body;
            lastTheme = body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
            if (lastTheme === 'theme-dark') {
                body.classList.remove('theme-dark');
                body.classList.add('theme-light');
            } else {
                body.classList.remove('theme-light');
                body.classList.add('theme-dark');
            }
            // 不记录到localStorage
        };
        // 悬浮结束恢复原主题
        topRightText.onmouseleave = function () {
            const body = document.body;
            if (lastTheme === 'theme-dark') {
                body.classList.remove('theme-light');
                body.classList.add('theme-dark');
            } else {
                body.classList.remove('theme-dark');
                body.classList.add('theme-light');
            }
        };
        // 点击时切换主题并记录
        topRightText.onclick = function () {
            const body = document.body;
            if (body.classList.contains('theme-light')) {
                // body.classList.remove('theme-light');
                // body.classList.add('theme-dark');
                localStorage.setItem('theme', 'theme-light');
            } else {
                // body.classList.remove('theme-dark');
                // body.classList.add('theme-light');
                localStorage.setItem('theme', 'theme-dark');
            }
            //refresh the page
            window.location.reload();
            console.log('theme changed! now is: ' + localStorage.getItem('theme'));
        };
    } else {
        console.log('topRightText not found!');
    }
}

// 读取主题并初始化
window.onload = function () {
    // 读取主题
    var theme = localStorage.getItem('theme');
    if (theme !== 'theme-light') {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
    }
    document.body.style.zoom = "90%";
    ToggleTheme();
    console.log('win loaded!');
};

// ==================== DOM事件绑定与PJAX支持 ====================

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loading');

    document.body.addEventListener('click', function (e) {
        const pjax = e.target.closest('a#pjax');
        const md = e.target.closest('a#md');

        // 优先处理 gpart 延迟跳转
        if (pjax && pjax.querySelector('.gpart')) {
            const gpart = pjax.querySelector('.gpart');
            e.preventDefault();
            // 添加active类，触发transition
            gpart.classList.add('active-delay');
            // 监听transitionend
            const onTransitionEnd = function (event) {
                if (event.propertyName === 'transform') {
                    gpart.removeEventListener('transitionend', onTransitionEnd);
                    gpart.classList.remove('active-delay');
                    // 跳转
                    loadContentpjax(pjax.getAttribute('href'));
                }
            };
            gpart.addEventListener('transitionend', onTransitionEnd);
            const delay = 2000; // 2000ms延迟
            console.log('gpart delay: ' + delay);
            // 手动触发active样式
            setTimeout(() => {
                gpart.classList.remove('active-delay');
            }, delay); // 300ms为transition时间，需与css一致
            return; // 阻止后续执行
        }

        // 普通PJAX跳转
        if (pjax) {
            e.preventDefault();
            loadContentpjax(pjax.getAttribute('href'));
            return;
        }
        // Markdown跳转
        if (md) {
            e.preventDefault();
            loadContentMd(md.getAttribute('href'));
            return;
        }
    });

    PjaxBlock();

    // 支持浏览器前进后退
    window.addEventListener('popstate', function () {
        if (!document.querySelector('[data-markdown-directory]')) loadContentpjax(location.pathname);
    });

    if (window.__fromPjax) {
        document.addEventListener('pjax:complete', () => {
            const main = document.getElementById('main');
            const script = main.querySelector('script');
            if (script) {
                eval(script.textContent);
            }
            // Explicitly call loadGallery after PJAX navigation
            if (location.pathname.includes('/gallery/')) {
                loadGallery();
            }
        });
    }
});
