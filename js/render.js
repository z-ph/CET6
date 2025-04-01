// 初始化页面结构
document.addEventListener('DOMContentLoaded', () => {
    // 创建主要容器
    const container = document.createElement('main');
    container.id = 'main-container';
    document.body.prepend(container);

    // 添加标题
    const header = document.createElement('header');
    header.innerHTML = `<h1>📚 六级词汇学习系统</h1>`;
    container.appendChild(header);

    // 加载并渲染数据
    loadAndRenderData();
});

async function loadAndRenderData() {
    try {
        const response = await fetch('./json/words.json');
        const data = await response.json();
        const sortedData = data.CET6.sort((a, b) =>
            new Date(b.time) - new Date(a.time));

        // 添加筛选控件
        addFilterControls(sortedData);

        // 初始渲染全部内容
        renderDailyContents(sortedData);

        // 添加折叠功能
        setupCollapseToggle();

    } catch (error) {
        console.error('数据加载失败:', error);
        showErrorNotice();
    }
}
// 添加筛选控件
function addFilterControls(dataList) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';

    // 日期选择器
    const dateSelect = document.createElement('select');
    dateSelect.innerHTML = `
        <option value="all">显示所有日期</option>
        ${dataList.map(day => `
            <option value="${day.time}">${day.time}</option>
        `).join('')}
    `;
    dateSelect.addEventListener('change', (e) => {
        filterByDate(e.target.value);
    });

    // 折叠控制
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.textContent = '全部折叠';
    toggleBtn.addEventListener('click', toggleAllSections);

    filterContainer.append('筛选日期:', dateSelect, toggleBtn);
    document.querySelector('header').after(filterContainer);
}

// 日期筛选功能
function filterByDate(selectedDate) {
    const allSections = document.querySelectorAll('.daily-section');

    allSections.forEach(section => {
        const sectionDate = section.querySelector('.date-header h2').textContent.slice(3);
        const shouldShow = selectedDate === 'all' || sectionDate === selectedDate;
        section.style.display = shouldShow ? 'block' : 'none';
    });
}

// 折叠功能实现
function setupCollapseToggle() {
    document.querySelectorAll('.date-header').forEach(header => {
        const toggleBtn = document.createElement('span');
        toggleBtn.className = 'toggle-icon';
        toggleBtn.innerHTML = '▼';
        header.prepend(toggleBtn);

        header.addEventListener('click', function () {
            const content = this.parentElement;
            content.classList.toggle('collapsed');
            toggleBtn.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
        });
    });
}

// 全部折叠/展开
function toggleAllSections() {
    const btn = document.querySelector('.toggle-btn');
    const isCollapsed = btn.textContent === '全部展开';

    document.querySelectorAll('.daily-section').forEach(section => {
        section.classList.toggle('collapsed', !isCollapsed);
    });

    btn.textContent = isCollapsed ? '全部折叠' : '全部展开';
}
function renderDailyContents(dataList) {
    const container = document.getElementById('main-container');
    
    dataList.forEach(dayData => {
        const section = createDailySection(dayData);
        container.appendChild(section);
    });
}

function createDailySection(dayData) {
    const section = document.createElement('section');
    section.className = 'daily-section';
    section.innerHTML = `
        <div class="date-header">
            <h2>📅 ${dayData.time}</h2>
            <span class="word-count">词汇 ${dayData.words.length} 个</span>
            <span class="phrase-count">短语 ${dayData.phrases.length} 个</span>
        </div>
    `;

    // 添加单词
    const wordsContainer = document.createElement('div');
    wordsContainer.className = 'words-container';
    dayData.words.forEach((word, index) => {
        wordsContainer.innerHTML += createWordCard(word, index + 1);
    });
    section.appendChild(wordsContainer);

    // 添加短语
    const phrasesContainer = document.createElement('div');
    phrasesContainer.className = 'phrases-container';
    dayData.phrases.forEach((phrase, index) => {
        phrasesContainer.innerHTML += createPhraseCard(phrase, index + 1);
    });
    section.appendChild(phrasesContainer);

    // 添加复习计划
    section.appendChild(createReviewPlan(dayData.time));
    
    return section;
}

// 单词卡片模板
function createWordCard(word, index) {
    return `
    <div class="word-card">
        <div class="card-header">
            <span class="index">${index}.</span>
            <h3 class="word">${word.word}</h3>
            <span class="pronounciation">[${word.pronounciation}]</span>
            <span class="pronunciation" onclick="playAudio('${word.word}')">🔊</span>
            <p class="chinese"><em>${word.chineseMeaning}</em></p>
        </div>
        <p class="example">${highlightKeyword(word.example, word.word)}</p>
    </div>`;
}

// 短语卡片模板
function createPhraseCard(phrase, index) {
    return `
    <div class="phrase-card">
        <div class="card-header">
            <span class="index">${index}.</span>
            <h3 class="phrase">${phrase.phrase}</h3>
            <p class="chinese"><em>${phrase.chineseMeaning}</em></p>
        </div>
        <p class="example">${highlightKeyword(phrase.example, phrase.phrase)}</p>
    </div>`;
}

// 创建复习计划
function createReviewPlan(startDate) {
    const plan = document.createElement('div');
    plan.className = 'review-plan';
    plan.innerHTML = `
        <h3>📌 复习计划</h3>
        <div class="plan-dates">
            <div class="plan-item">
                <span class="plan-day">Day 1</span>
                <span class="plan-date">${calculateDate(startDate, 1)}</span>
            </div>
            <div class="plan-item">
                <span class="plan-day">Day 3</span>
                <span class="plan-date">${calculateDate(startDate, 3)}</span>
            </div>
            <div class="plan-item">
                <span class="plan-day">Day 7</span>
                <span class="plan-date">${calculateDate(startDate, 7)}</span>
            </div>
        </div>
    `;
    return plan;
}

// 工具函数
function highlightKeyword(example, keyword) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    return example.replace(regex, '<strong>$&</strong>');
}

function calculateDate(baseDate, offset) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
}



function showErrorNotice() {
    const notice = document.createElement('div');
    notice.className = 'error-notice';
    notice.innerHTML = `
        <p>⚠️ 数据加载失败，请检查：</p>
        <ul>
            <li>1. 网络连接状态</li>
            <li>2. words.json文件路径</li>
            <li>3. 控制台错误信息</li>
        </ul>
    `;
    document.body.appendChild(notice);
}