// 生成随机二进制流
function createBinary() {
    const chars = "01";
    const container = document.body;
    for (let i = 0; i < 50; i++) {
        const span = document.createElement("span");
        span.style.position = "fixed";
        span.style.opacity = "0.3";
        span.style.left = Math.random() * 100 + "%";
        span.style.animation = `fall ${Math.random() * 5 + 3}s linear infinite`;
        span.textContent = chars.repeat(20).split('').sort(() => 0.5 - Math.random()).join('');
        container.appendChild(span);
    }
}

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
@keyframes fall {
    from { top: -20%; }
    to { top: 120%; }
}`;
document.head.appendChild(style);

createBinary();