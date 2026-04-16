import { translations } from './lang.js';
import { copyToClipboard } from './utils.js';

let currentLang = 'ja';

/**
 * Update page language.
 */
export function updateLanguage(lang) {
    currentLang = lang;
    const trans = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (trans[key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = trans[key];
            } else {
                el.textContent = trans[key];
            }
        }
    });
}

/**
 * Get a translation in the current language.
 */
export function getTrans(key) {
    return translations[currentLang][key] || key;
}

/**
 * Populate an image select dropdown.
 */
export function populateImageSelect(selectElem, detectedImages, defaultStr) {
    selectElem.innerHTML = '';
    const optEmpty = document.createElement('option');
    optEmpty.value = "";
    optEmpty.textContent = `${getTrans('img_none')}${defaultStr})`;
    selectElem.appendChild(optEmpty);

    detectedImages.forEach(imgName => {
        const option = document.createElement('option');
        option.value = imgName;
        option.textContent = imgName;
        selectElem.appendChild(option);
    });
}

/**
 * Create a hidden-song checkbox entry.
 */
export function createSongCheckbox(index, title) {
    const songListContainer = document.getElementById('song-list-container');
    const div = document.createElement('div');
    div.className = 'song-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-hidden-${index}`;
    checkbox.value = 'true';
    const label = document.createElement('label');
    label.htmlFor = `check-hidden-${index}`;
    label.textContent = `${index}: ${title}`;
    div.appendChild(checkbox);
    div.appendChild(label);
    songListContainer.appendChild(div);
}

/**
 * Show the preview modal.
 */
export function showPreviewModal(outputFiles) {
    const modal = document.getElementById('previewModal');
    const select = document.getElementById('previewFileSelect');
    const area = document.getElementById('previewArea');
    const copyBtn = document.getElementById('copyPreviewBtn');
    const closeBtn = document.getElementById('closePreviewBtn');

    // Preview text files only
    const textFiles = outputFiles.filter(f => !f.isBinary);
    
    select.innerHTML = '';
    textFiles.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.filename;
        opt.textContent = f.filename;
        select.appendChild(opt);
    });

    const updatePreview = () => {
        const file = textFiles.find(f => f.filename === select.value);
        area.textContent = file ? file.content : '';
    };

    select.onchange = updatePreview;
    updatePreview();

    copyBtn.onclick = async () => {
        const success = await copyToClipboard(area.textContent);
        if (success) alert(getTrans('copy_success'));
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    modal.style.display = 'block';
}

/**
 * Update the status message.
 */
export function setStatus(msg) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) statusDiv.textContent = msg;
}

/**
 * Update the active theme.
 */
export function updateTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.setAttribute('data-i18n', theme === 'dark' ? 'theme_light' : 'theme_dark');
        updateLanguage(currentLang); // Re-translate button text
    }
}

/**
 * Reset UI by clearing all song options.
 */
export function resetUI() {
    const songListContainer = document.getElementById('song-list-container');
    if (songListContainer) {
        songListContainer.innerHTML = '';
    }
}
