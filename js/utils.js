/**
 * @param {string} msg 
 * @param {string} type 'ok' | 'warn' | 'err' | 'info'
 */
export function log(msg, type = '') {
    // Find the currently active step
    const currentStep = document.querySelector('.step.active');
    let logArea = null;
    
    if (currentStep) {
        const stepNum = currentStep.getAttribute('data-step');
        if (stepNum === '1') {
            logArea = document.getElementById('log-step1');
        } else if (stepNum === '5') {
            logArea = document.getElementById('log');
        }
    }
    
    // If the current step has no log area, fall back to the main log area
    if (!logArea) {
        logArea = document.getElementById('log');
    }
    
    if (!logArea) {
        console.log(`[${type.toUpperCase()}] ${msg}`); // Fallback output
        return;
    }
    
    const div = document.createElement('div');
    div.textContent = `> ${msg}`;
    if (type) div.className = `log-${type}`;
    logArea.appendChild(div);
    logArea.scrollTop = logArea.scrollHeight;
}

/**
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = e.target.result;
            try {
                // Try UTF-8 first; use fatal mode so invalid UTF-8 throws
                const decoderUTF8 = new TextDecoder('utf-8', { fatal: true });
                resolve(decoderUTF8.decode(buffer));
            } catch (err) {
                // Fall back to Shift-JIS if UTF-8 decoding fails
                const decoderSJIS = new TextDecoder('shift-jis');
                resolve(decoderSJIS.decode(buffer));
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Recursively get all files from a DataTransferItem entry
 * @param {FileSystemEntry} entry 
 * @returns {Promise<File[]>}
 */
export async function getFilesFromEntry(entry) {
    let files = [];
    if (entry.isFile) {
        const file = await new Promise((res) => entry.file(res));
        files.push(file);
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise((res) => reader.readEntries(res));
        for (const child of entries) {
            const childFiles = await getFilesFromEntry(child);
            files = files.concat(childFiles);
        }
    }
    return files;
}

/**
 * Remove invalid characters from a filename
 */
export function sanitizeFilename(name) {
    return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

/**
 * Copy text to the clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        return false;
    }
}
