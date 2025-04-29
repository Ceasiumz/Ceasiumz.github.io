document.addEventListener('DOMContentLoaded', function () {
    console.log('md.js::DOM loading');
});
function loadMarkdown(url) {
    fetch(url)
        .then(res => res.text())
        .then(md => {
            document.getElementById('markdown-container').innerHTML = marked.parse(md);
        });
}



console.log('md.js::NATW');
if (window.__fromPjax) {
    console.log('md.js::fromPjax');
    console.log('markingdown...')
    loadMarkdown('/article/C%23/C%23instru4_28.md');
} else {
    console.log('md.js::not fromPjax');
    window.onload = function () {
        console.log('markingdown...')
        loadMarkdown('/article/C%23/C%23instru4_28.md');
    };
}