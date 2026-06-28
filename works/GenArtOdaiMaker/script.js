document.addEventListener('DOMContentLoaded', () => {
    const colorBoxes = document.querySelectorAll('.color-box');
    const colorCodesDiv = document.getElementById('colorCodes');
    const wordBoxes = document.querySelectorAll('.word-box');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const constraintValueEl = document.getElementById('constraintValue');
    const seedDisplayEl = document.getElementById('seedDisplay');
    const finalPromptEl = document.getElementById('finalPrompt');

    const randomTimeBtn = document.getElementById('randomTime');
    const generateColorsBtn = document.getElementById('generateColors');
    const generateWordsBtn = document.getElementById('generateWords');
    const generateConstraintBtn = document.getElementById('generateConstraint');
    const generateAllBtn = document.getElementById('generateAll');
    const copyPromptBtn = document.getElementById('copyPrompt');
    const tweetPromptBtn = document.getElementById('tweetPrompt');

    const themeWordCategories = {
        concepts: [
            '自然', '都市', '宇宙', '海', '山', '森', '夢', '記憶', '感情', '時間',
            '光', '闇', '静寂', '騒音', '混沌', '秩序', '生命', '死', '愛', '憎しみ',
            '平和', '戦争', '過去', '未来', '現在', '瞬間', '永遠', '変化', '静止', '動き',
            'サイバー', 'オーガニック', 'メカニカル', 'フラクタル', 'ミニマル', 'マキシマル'
        ],
        adjectives: [
            '明るい', '暗い', '鮮やかな', '淡い', '透明な', '不透明な', '柔らかい', '硬い',
            '流れる', '止まる', '複雑な', '単純な', '古い', '新しい', '冷たい', '熱い',
            '乾いた', '湿った', '重い', '軽い', '鋭い', '鈍い', '滑らかな', '粗い',
            '対称的な', '非対称な', '規則的な', '不規則な', '幾何学的な', '有機的な',
            'デジタルな', 'アナログな', 'グリッチした', 'ノスタルジックな', 'フューチャリスティックな'
        ],
        techniques: [
            'ピクセルアート', 'ベクターアート', '水彩画', '油絵', 'コラージュ', 'モザイク',
            'ドット絵', '線画', '点描', 'グラデーション', 'パターン', 'テクスチャ',
            '3Dモデリング', 'アニメーション', 'シルエット', 'スケッチ', 'マンダラ',
            'グラフィティ', 'タイポグラフィ', 'カリグラフィ', 'スクラッチアート',
            'ジェネラティブアート', 'フラクタルアート', 'グリッチアート', 'ニューラルアート',
            'プロシージャル', 'パーティクル', 'ボロノイ', 'セルオートマトン', 'L-システム'
        ]
    };

    const constraints = [
        '円だけで描く',
        '線だけで描く',
        '左右対称にする',
        '1色だけ使う',
        'マウス入力を使う',
        'ランダム性を入れる',
        'ノイズを使わない',
        '画面の半分だけ使う',
        '100個以内の図形で描く',
        '15分以内でラフを作る',
        '文字を1つだけ入れる',
        '背景を塗りつぶさない',
        '余白を必ず残す',
        '同じ形を反復する',
        '直線と曲線を両方入れる'
    ];

    let currentSeed = null;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i += 1) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function hexToHSL(hex) {
        const normalizedHex = hex.replace(/^#/, '');
        const r = parseInt(normalizedHex.substring(0, 2), 16) / 255;
        const g = parseInt(normalizedHex.substring(2, 4), 16) / 255;
        const b = parseInt(normalizedHex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                default:
                    h = (r - g) / d + 4;
                    break;
            }

            h = Math.round(h * 60);
        }

        return {
            h,
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToHex(h, s, l) {
        let r;
        let g;
        let b;

        const normalizedH = h / 360;
        const normalizedS = s / 100;
        const normalizedL = l / 100;

        if (normalizedS === 0) {
            r = normalizedL;
            g = normalizedL;
            b = normalizedL;
        } else {
            const hue2rgb = (p, q, t) => {
                let adjustedT = t;
                if (adjustedT < 0) adjustedT += 1;
                if (adjustedT > 1) adjustedT -= 1;
                if (adjustedT < 1 / 6) return p + (q - p) * 6 * adjustedT;
                if (adjustedT < 1 / 2) return q;
                if (adjustedT < 2 / 3) return p + (q - p) * (2 / 3 - adjustedT) * 6;
                return p;
            };

            const q = normalizedL < 0.5
                ? normalizedL * (1 + normalizedS)
                : normalizedL + normalizedS - normalizedL * normalizedS;
            const p = 2 * normalizedL - q;

            r = hue2rgb(p, q, normalizedH + 1 / 3);
            g = hue2rgb(p, q, normalizedH);
            b = hue2rgb(p, q, normalizedH - 1 / 3);
        }

        const toHex = (value) => {
            const hex = Math.round(value * 255).toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function rgbToHex(rgb) {
        if (!rgb) return '';
        if (rgb.startsWith('#')) return rgb.toUpperCase();

        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return rgb;

        const [r, g, b] = rgbValues.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    function generateColorPalette() {
        const baseColor = getRandomColor();
        const baseHsl = hexToHSL(baseColor);
        const lightness = Math.min(baseHsl.l + 18, 82);

        return [
            baseColor,
            hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
            hslToHex(baseHsl.h, Math.max(baseHsl.s - 10, 18), lightness)
        ];
    }

    function displayColorPalette(palette) {
        colorCodesDiv.innerHTML = '';

        colorBoxes.forEach((box, index) => {
            const color = palette[index];
            box.style.backgroundColor = color;
            box.setAttribute('aria-label', `Color ${index + 1}: ${color}`);

            const colorCode = document.createElement('span');
            colorCode.textContent = color;
            colorCodesDiv.appendChild(colorCode);
        });
    }

    function generateThemeWords() {
        return [
            getRandomItem(themeWordCategories.concepts),
            getRandomItem(themeWordCategories.adjectives),
            getRandomItem(themeWordCategories.techniques)
        ];
    }

    function displayThemeWords(words) {
        wordBoxes.forEach((box, index) => {
            box.textContent = words[index];
        });
    }

    function formatTime(hours, minutes) {
        const safeHours = Number.parseInt(hours, 10) || 0;
        const safeMinutes = Number.parseInt(minutes, 10) || 0;

        if (safeHours <= 0 && safeMinutes <= 0) {
            return '指定なし';
        }

        if (safeHours > 0 && safeMinutes > 0) {
            return `${safeHours}時間 ${safeMinutes}分`;
        }

        if (safeHours > 0) {
            return `${safeHours}時間`;
        }

        return `${safeMinutes}分`;
    }

    function generateRandomTime() {
        const totalMinutes = getRandomInt(5, 180);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        hoursInput.value = hours;
        minutesInput.value = minutes;
    }

    function generateConstraint() {
        return getRandomItem(constraints);
    }

    function displayConstraint(constraint) {
        constraintValueEl.textContent = constraint;
    }

    function getCurrentPalette() {
        return Array.from(colorBoxes).map((box) => rgbToHex(box.style.backgroundColor));
    }

    function getCurrentWords() {
        return Array.from(wordBoxes).map((box) => box.textContent.trim());
    }

    function generateSeed() {
        currentSeed = getRandomInt(10000, 99999);
        seedDisplayEl.textContent = `Seed: #${currentSeed}`;
    }

    function generateFinalPrompt() {
        const palette = getCurrentPalette();
        const words = getCurrentWords();
        const time = formatTime(hoursInput.value, minutesInput.value);
        const constraint = constraintValueEl.textContent.trim();
        const seedLine = currentSeed ? `Seed: #${currentSeed}\n` : '';

        return `${seedLine}Palette: ${palette.join(', ')}\nWords: ${words.join(' / ')}\nTime: ${time}\nConstraint: ${constraint}`;
    }

    function updateFinalPrompt() {
        finalPromptEl.textContent = generateFinalPrompt();
    }

    function refreshPrompt() {
        generateSeed();
        updateFinalPrompt();
    }

    function generateAll() {
        displayColorPalette(generateColorPalette());
        displayThemeWords(generateThemeWords());
        generateRandomTime();
        displayConstraint(generateConstraint());
        refreshPrompt();
    }

    async function copyPrompt() {
        const promptText = finalPromptEl.textContent;

        try {
            await navigator.clipboard.writeText(`${promptText}\n#GenArtOdaiMaker #MAHOLAB #generativeart`);
            alert('プロンプトをクリップボードにコピーしました。');
        } catch (error) {
            console.error('コピーに失敗しました:', error);
            alert('コピーに失敗しました。手動でコピーしてください。');
        }
    }

    function shareOnX() {
        const promptText = `${finalPromptEl.textContent}\n\n#GenArtOdaiMaker #generativeart`;
        const shareUrl = encodeURIComponent(window.location.href);
        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(promptText)}&url=${shareUrl}`;
        window.open(xUrl, '_blank', 'noopener');
    }

    generateColorsBtn.addEventListener('click', () => {
        displayColorPalette(generateColorPalette());
        refreshPrompt();
    });

    generateWordsBtn.addEventListener('click', () => {
        displayThemeWords(generateThemeWords());
        refreshPrompt();
    });

    randomTimeBtn.addEventListener('click', () => {
        generateRandomTime();
        refreshPrompt();
    });

    generateConstraintBtn.addEventListener('click', () => {
        displayConstraint(generateConstraint());
        refreshPrompt();
    });

    generateAllBtn.addEventListener('click', generateAll);
    copyPromptBtn.addEventListener('click', copyPrompt);
    tweetPromptBtn.addEventListener('click', shareOnX);

    [hoursInput, minutesInput].forEach((input) => {
        input.addEventListener('input', updateFinalPrompt);
    });

    generateAll();
});
