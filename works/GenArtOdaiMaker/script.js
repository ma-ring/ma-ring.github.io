document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const colorBoxes = document.querySelectorAll('.color-box');
    const colorCodesDiv = document.getElementById('colorCodes');
    const themeWordsDiv = document.getElementById('themeWords');
    const wordBoxes = document.querySelectorAll('.word-box');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const randomTimeBtn = document.getElementById('randomTime');
    const generateColorsBtn = document.getElementById('generateColors');
    const generateWordsBtn = document.getElementById('generateWords');
    const generateAllBtn = document.getElementById('generateAll');
    const copyPromptBtn = document.getElementById('copyPrompt');
    const tweetPromptBtn = document.getElementById('tweetPrompt');
    const finalPromptEl = document.getElementById('finalPrompt');

    // Theme word lists
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

    // Generate random color in hex format
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Generate harmonious color palette
    function generateColorPalette() {
        // Generate base color
        const baseColor = getRandomColor();
        const baseHsl = hexToHSL(baseColor);
        
        // Generate palette based on color theory
        const palette = [];
        
        // Add base color
        palette.push(baseColor);
        
        // Add complementary color (opposite on color wheel)
        const complementaryHue = (baseHsl.h + 180) % 360;
        palette.push(hslToHex(complementaryHue, baseHsl.s, baseHsl.l));
        
        // Add analogous color (adjacent on color wheel)
        const analogousHue1 = (baseHsl.h + 30) % 360;
        palette.push(hslToHex(analogousHue1, baseHsl.s, baseHsl.l));
        
        // Add triadic color
        const triadicHue = (baseHsl.h + 120) % 360;
        palette.push(hslToHex(triadicHue, baseHsl.s, baseHsl.l));
        
        // Add variation with different lightness
        palette.push(hslToHex(baseHsl.h, baseHsl.s, (baseHsl.l + 30) % 100));
        
        return palette;
    }

    // Convert hex to HSL
    function hexToHSL(hex) {
        // Remove the # if present
        hex = hex.replace(/^#/, '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h = Math.round(h * 60);
        }
        
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return { h, s, l };
    }

    // Convert HSL to hex
    function hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Display color palette
    function displayColorPalette(palette) {
        colorBoxes.forEach((box, index) => {
            box.style.backgroundColor = palette[index];
        });
        
        // Display color codes
        colorCodesDiv.innerHTML = '';
        palette.forEach(color => {
            const colorCode = document.createElement('span');
            colorCode.textContent = color.toUpperCase();
            colorCodesDiv.appendChild(colorCode);
        });
    }

    // Generate random theme words
    function generateThemeWords() {
        const words = [];
        
        // Get one word from each category
        words.push(getRandomItem(themeWordCategories.concepts));
        words.push(getRandomItem(themeWordCategories.adjectives));
        words.push(getRandomItem(themeWordCategories.techniques));
        
        return words;
    }

    // Get random item from array
    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Display theme words
    function displayThemeWords(words) {
        wordBoxes.forEach((box, index) => {
            box.textContent = words[index];
        });
    }

    // Generate random time
    function generateRandomTime() {
        // Generate random time between 5 minutes and 3 hours
        const minMinutes = 5;
        const maxMinutes = 180;
        
        let totalMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
        
        // Convert to hours and minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        // Update inputs
        hoursInput.value = hours;
        minutesInput.value = minutes;
        
        // Update final prompt
        updateFinalPrompt();
    }

    // Generate final prompt
    function generateFinalPrompt() {
        const colors = [];
        colorBoxes.forEach(box => {
            colors.push(box.style.backgroundColor);
        });
        
        const words = [];
        wordBoxes.forEach(box => {
            words.push(box.textContent);
        });
        
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const totalTime = (hours > 0 ? `${hours}時間` : '') + (minutes > 0 ? `${minutes}分` : '');
        
        let promptText = `【Generative Art プロンプト】\n\n`;
        promptText += `■ カラーパレット:\n`;
        
        const colorCodes = [];
        colorBoxes.forEach(box => {
            if (box.style.backgroundColor) {
                const rgb = box.style.backgroundColor;
                const hex = rgbToHex(rgb);
                colorCodes.push(hex);
            }
        });
        
        promptText += colorCodes.join(', ') + '\n\n';
        promptText += `■ テーマワード:\n${words.join('、')}\n\n`;
        promptText += `■ 制限時間:\n${totalTime || '指定なし'}`;
        
        return promptText;
    }

    // Convert RGB to Hex
    function rgbToHex(rgb) {
        // If already in hex format, return as is
        if (rgb.startsWith('#')) return rgb;
        
        // Extract the RGB values
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return rgb;
        
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        
        // Convert to hex
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Share prompt on X
    function shareOnX() {
        const promptText = finalPromptEl.textContent;
        const tweetText = encodeURIComponent(`${promptText}\n\n#GenerativeArt #ジェネラティブアート #創作お題`);
        const xUrl = `https://x.com/intent/tweet?text=${tweetText}`;
        
        // Open X in a new window
        window.open(xUrl, '_blank');
    }

    // Initialize the app
    function init() {
        // Generate initial color palette
        const initialPalette = generateColorPalette();
        displayColorPalette(initialPalette);
        
        // Generate initial theme words
        const initialWords = generateThemeWords();
        displayThemeWords(initialWords);
        
        // Update final prompt
        updateFinalPrompt();
    }

    // Update the final prompt
    function updateFinalPrompt() {
        const promptText = generateFinalPrompt();
        finalPromptEl.textContent = promptText;
    }

    // Event Listeners
    generateColorsBtn.addEventListener('click', () => {
        const palette = generateColorPalette();
        displayColorPalette(palette);
        updateFinalPrompt();
    });

    generateWordsBtn.addEventListener('click', () => {
        const words = generateThemeWords();
        displayThemeWords(words);
        updateFinalPrompt();
    });

    randomTimeBtn.addEventListener('click', generateRandomTime);

    generateAllBtn.addEventListener('click', () => {
        const palette = generateColorPalette();
        displayColorPalette(palette);
        
        const words = generateThemeWords();
        displayThemeWords(words);
        
        generateRandomTime();
        
        updateFinalPrompt();
    });

    copyPromptBtn.addEventListener('click', () => {
        const promptText = finalPromptEl.textContent;
        navigator.clipboard.writeText(promptText)
            .then(() => {
                alert('プロンプトをクリップボードにコピーしました！');
            })
            .catch(err => {
                console.error('コピーに失敗しました:', err);
                alert('コピーに失敗しました。手動でコピーしてください。');
            });
    });

    // X share button event listener
    tweetPromptBtn.addEventListener('click', shareOnX);

    // Initialize the app
    init();
});
