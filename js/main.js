import { log, readFileContent, getFilesFromEntry } from './utils.js';
import { parseNextSongArgs } from './tjaParser.js';
import { 
    populateImageSelect, createSongCheckbox, setStatus, 
    resetUI, updateLanguage, getTrans, showPreviewModal, updateTheme 
} from './ui.js';
import { processConversion } from './converter.js';

let targetTjaFile = null;
let fileMap = new Map();
let detectedImages = [];
let currentStep = 1;
const totalSteps = 5;

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const runBtn = document.getElementById('runBtn');
const langSelect = document.getElementById('lang-select');
const exportMode = document.getElementById('export-mode');
const themeBtn = document.getElementById('theme-toggle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Verify that key DOM elements are loaded
console.log('DOM 元素檢查:');
console.log('- fileInput:', !!fileInput);
console.log('- dropZone:', !!dropZone);
console.log('- runBtn:', !!runBtn);
console.log('- langSelect:', !!langSelect);
console.log('- exportMode:', !!exportMode);
console.log('- themeBtn:', !!themeBtn);
console.log('- prevBtn:', !!prevBtn);
console.log('- nextBtn:', !!nextBtn);

// --- Theme ---
const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
updateTheme(savedTheme);

themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// --- i18n ---
langSelect.addEventListener('change', e => updateLanguage(e.target.value));
updateLanguage('ja');

// --- Wizard navigation ---
function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Hide the current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');

    // Show the target step
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');

    // Update navigation buttons
    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevBtn.classList.toggle('disabled', currentStep === 1);
    
    if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden');
        runBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        runBtn.classList.add('hidden');
    }
}

prevBtn.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
});

nextBtn.addEventListener('click', () => {
    // Step 1 validation
    if (currentStep === 1 && !targetTjaFile) {
        alert(getTrans('log_no_tja'));
        return;
    }
    // Step 2 validation
    if (currentStep === 2 && !document.getElementById('dan-title-input').value.trim()) {
        alert('段位タイトルを入力してください。');
        return;
    }
    if (currentStep < totalSteps) goToStep(currentStep + 1);
});

// Initialization
updateNavigationButtons();

// Enable clicking on step indicators
document.querySelectorAll('.step').forEach(stepEl => {
    stepEl.addEventListener('click', () => {
        const stepNum = parseInt(stepEl.getAttribute('data-step'));
        // Do not allow moving beyond Step 1 if no file is selected
        if (stepNum > 1 && !targetTjaFile) {
            alert(getTrans('log_no_tja'));
            return;
        }
        goToStep(stepNum);
    });
});

// --- File Handling ---
fileInput.addEventListener('change', e => handleFiles(Array.from(e.target.files)));
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#4a90e2'; });
dropZone.addEventListener('dragleave', e => { e.preventDefault(); dropZone.style.borderColor = '#bdc3c7'; });
dropZone.addEventListener('drop', async e => {
    e.preventDefault();
    dropZone.style.borderColor = '#bdc3c7';
    
    let allFiles = [];
    const items = e.dataTransfer.items;
    if (items) {
        for (const item of items) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                const files = await getFilesFromEntry(entry);
                allFiles = allFiles.concat(files);
            }
        }
    }
    handleFiles(allFiles);
});

async function handleFiles(files) {
    fileMap.clear();
    targetTjaFile = null;
    detectedImages = [];
    resetUI();
    document.getElementById('log-step1').innerHTML = '';

    let tjaCount = 0;
    files.forEach(f => {
        fileMap.set(f.name, f);
        const lowerName = f.name.toLowerCase();
        if (lowerName.endsWith('.tja')) {
            targetTjaFile = f;
            tjaCount++;
        }
        if (/\.(png|jpe?g|bmp|gif)$/i.test(lowerName)) {
            detectedImages.push(f.name);
        }
    });

    if (targetTjaFile) {
        setStatus(`${getTrans('status_idle')} (${targetTjaFile.name})`);
        log(`${getTrans('log_tja_found')}${targetTjaFile.name}`, 'ok');
        if (tjaCount > 1) log(`${getTrans('log_multiple_tja')}${targetTjaFile.name}`, 'warn');
        
        await scanSongsAndTitle(targetTjaFile);
        
        // Enable moving to Step 2 when files are detected successfully
        nextBtn.disabled = false;
    } else {
        log(getTrans('log_no_tja'), 'err');
        nextBtn.disabled = true;
    }
}

async function scanSongsAndTitle(file) {
    try {
        const text = await readFileContent(file);
        const lines = text.split(/\r?\n/);
        let songCount = 0;
        let foundTitle = "";

        if(lines.length > 0 && lines[0].charCodeAt(0) === 0xFEFF) lines[0] = lines[0].substr(1);

        for(let line of lines) {
            const t = line.trim();
            if(!foundTitle && t.toUpperCase().startsWith('TITLE:')) {
                foundTitle = t.substring(6).trim();
            }
            if(t.toUpperCase().startsWith('#NEXTSONG')) {
                songCount++;
                const args = parseNextSongArgs(t);
                const title = args[0] || `Song ${songCount}`;
                createSongCheckbox(songCount, title);
            }
        }
        
        document.getElementById('dan-title-input').value = foundTitle || "New Dan";

        populateImageSelect(document.getElementById('plate-select'), detectedImages, "Plate.png");
        populateImageSelect(document.getElementById('panel-side-select'), detectedImages, "panelside.png");
        populateImageSelect(document.getElementById('title-plate-select'), detectedImages, "titleplate.png");
        populateImageSelect(document.getElementById('mini-plate-select'), detectedImages, "miniplate.png");

        if (detectedImages.length > 0) log(`${detectedImages.length}${getTrans('log_images_found')}`, 'info');
        if (songCount > 0) log(`${songCount} ${getTrans('log_scan_done')}`, 'info');
        else log(getTrans('log_no_nextsong'), 'warn');

    } catch(e) {
        log(`Error: ${e.message}`, 'warn');
    }
}

// --- Main Process ---
runBtn.addEventListener('click', async () => {
    if (!targetTjaFile) {
        alert(getTrans('log_no_tja'));
        return;
    }
    
    log(getTrans('log_convert_start'), 'info');
    runBtn.textContent = getTrans('run_btn_processing');
    runBtn.disabled = true;

    try {
        log(getTrans('log_processing'), 'info');
        const { outputFiles, rankValue, userTitle } = await processConversion(targetTjaFile, fileMap);
        
        log(`${getTrans('log_convert_done')} ${outputFiles.length} 個檔案`, 'ok');
        
        if (exportMode.value === 'zip') {
            log(getTrans('log_generating_zip'), 'info');
            const zip = new JSZip();
            const rootFolder = zip.folder(`${rankValue} ${userTitle}`);
            
            outputFiles.forEach(f => {
                if (f.isBinary) {
                    rootFolder.file(f.filename, f.fileRef);
                    log(`${getTrans('log_file_added_binary')}${f.filename} (二進制)`, 'info');
                } else {
                    rootFolder.file(f.filename, f.content);
                    log(`${getTrans('log_file_added')}${f.filename}`, 'info');
                }
            });

            log(getTrans('log_compressing_zip'), 'info');
            const content = await zip.generateAsync({type:"blob"});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `TaikoNauts_${rankValue}_${userTitle}.zip`;
            link.click();
            log(getTrans('log_done'), 'ok');
        } else {
            log(getTrans('log_showing_preview'), 'info');
            showPreviewModal(outputFiles);
        }

        runBtn.textContent = getTrans('run_btn_done');
    } catch (e) {
        console.error('轉換錯誤:', e);
        log(`${getTrans('log_failed')}${e.message}`, 'err');
        runBtn.textContent = getTrans('run_btn_error');
    }

    setTimeout(() => {
        runBtn.textContent = getTrans('run_btn');
        runBtn.disabled = false;
    }, 3000);
});
