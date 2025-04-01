// 发音函数(（使用youdao的语音API）
function playAudio(word) {
    const audio = new Audio();
    audio.src = `http://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}`;
    audio.play().catch(error => console.log('请点击页面任意位置后重试'));
}

// 启用音频
if (typeof AudioContext !== "undefined") {
    const ctx = new AudioContext();
    ctx.resume();
}