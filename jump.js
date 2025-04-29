// 这个脚本用于处理页面的 PJAX 跳转
document.addEventListener('DOMContentLoaded', function () {
    function loadContent(url) {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                // 只取目标页面的 #main 内容
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const newMain = temp.querySelector('#main');
                if (newMain) {
                    document.getElementById('main').innerHTML = newMain.innerHTML;
                    window.history.pushState({}, '', url);
                }
            });
    }

    document.body.addEventListener('click', function (e) {
        const a = e.target.closest('a.pjax');
        if (a) {
            e.preventDefault();
            loadContent(a.getAttribute('href'));
        }
    });

    // 支持浏览器前进后退
    window.addEventListener('popstate', function () {
        loadContent(location.pathname);
    });
});