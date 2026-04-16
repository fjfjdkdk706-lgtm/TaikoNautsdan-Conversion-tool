import { log, readFileContent, sanitizeFilename } from './utils.js';
import { 
    parseExamLine, count79, parseNextSongArgs, 
    mapCourseStr, mapCourseToInt 
} from './tjaParser.js';

/**
 * Core conversion function.
 * @returns {Promise<{filename: string, content: string, type: string, blob?: Blob}[]>}
 */
export async function processConversion(targetTjaFile, fileMap) {
    try {
        console.log('processConversion 開始...');
        const text = await readFileContent(targetTjaFile);
        const lines = text.split(/\r?\n/);
        console.log(`讀取檔案，共 ${lines.length} 行`);
        
        const rankSelect = document.getElementById('rank-select');
        const danTitleInput = document.getElementById('dan-title-input');
        
        if (!rankSelect || !danTitleInput) {
            throw new Error('無法找到必要的 DOM 元素 (rank-select 或 dan-title-input)');
        }
        
        const rankValue = parseInt(rankSelect.value);
        const userTitle = danTitleInput.value.trim() || "段位";
        const danIndexValue = rankValue - 1;
        console.log(`段位: ${rankValue}, 標題: ${userTitle}`);

    let sections = [];
    let buffer = [];
    let nextTag = "";
    
    if(lines.length > 0 && lines[0].charCodeAt(0) === 0xFEFF) lines[0] = lines[0].substr(1);

    for (let line of lines) {
        if (line.trim().toUpperCase().startsWith('#NEXTSONG')) {
            sections.push({ lines: buffer, tag: nextTag });
            buffer = [];
            nextTag = line.trim();
        } else {
            buffer.push(line);
        }
    }
    sections.push({ lines: buffer, tag: nextTag });

    let globalExam = { gauge: null, conditions: {} }; 
    let songExams = []; 

    if (sections.length > 0) {
        sections[0].lines.forEach(l => {
            const line = l.trim();
            if (line.toUpperCase().startsWith('EXAM')) {
                const parsed = parseExamLine(line);
                if (parsed) {
                    if (parsed.isGauge) globalExam.gauge = parsed.val;
                    else globalExam.conditions[parsed.type] = parsed.val; 
                }
            }
        });
    }
    
    let danSongs = [];
    let outputFiles = []; // {filename, content, isBinary, fileRef?}
    let currentBpm = 0;
    let balloonCursor = 0;
    
    let globalBalloons = [];
    let tempBalloonStr = "";
    lines.forEach(l => {
        if (l.trim().toUpperCase().startsWith('BALLOON:')) tempBalloonStr += l.trim().substring(8) + ",";
    });
    if (tempBalloonStr) {
        globalBalloons = tempBalloonStr.split(/[,、\s]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
    }

    if (sections.length > 0) {
        sections[0].lines.forEach(l => {
            if(l.trim().toUpperCase().startsWith('BPM:')) currentBpm = parseFloat(l.split(':')[1]);
        });
        balloonCursor += count79(sections[0].lines);
    }

    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        const args = parseNextSongArgs(section.tag);
        const title = args[0] || `Song_${i}`;
        let subTitle = args[1] === "--" ? "" : (args[1] || "");
        const genre = args[2] || "バラエティ";
        const wave = args[3] || "";
        const scoreInit = args[4] || "0";
        const scoreDiff = args[5] || "0";

        let courseStr = "Oni";
        let level = "10";
        if (args.length >= 8) {
            if (parseFloat(args[6]) > 4) { level = args[6]; courseStr = mapCourseStr(args[7]); }
            else { courseStr = mapCourseStr(args[6]); level = args[7]; }
        } else if (args[6]) {
            level = args[6];
        }

        let myExam = {}; 
        section.lines.forEach(l => {
            const t = l.trim();
            if (t.toUpperCase().startsWith('EXAM')) {
                const parsed = parseExamLine(t);
                if (parsed && !parsed.isGauge) {
                    myExam[parsed.type] = parsed.val;
                }
            }
        });
        songExams[i] = myExam;

        const needed = count79(section.lines);
        let myBalloons = [];
        for (let k = 0; k < needed; k++) {
            if (balloonCursor < globalBalloons.length) myBalloons.push(globalBalloons[balloonCursor++]);
            else myBalloons.push(5);
        }

        let bodyLines = [];
        let totalDelay = 0;
        section.lines.forEach(l => {
            const t = l.trim().toUpperCase();
            if (t.startsWith('EXAM') || t.startsWith('#LEVELHOLD') || t.startsWith('#SECTION') ||
                t.startsWith('#START') || t.startsWith('#END') || t.startsWith('BALLOON:') || t.startsWith('TITLE:')) return;
            
            if (t.startsWith('#DELAY')) {
                const val = parseFloat(l.trim().split(/\s+/)[1]);
                if (!isNaN(val)) totalDelay += val;
                return;
            }
            if (t.startsWith('#BPMCHANGE')) {
                const parts = l.trim().split(/\s+/);
                if (parts[1]) currentBpm = parseFloat(parts[1]);
            }
            bodyLines.push(l);
        });

        let outLines = [];
        outLines.push(`TITLE:${title}`);
        if (subTitle) outLines.push(`SUBTITLE:${subTitle}`);
        outLines.push(`BPM:${currentBpm}`);
        outLines.push(`WAVE:${wave}`);
        outLines.push(`OFFSET:${-totalDelay}`);
        outLines.push(`GENRE:${genre}`);
        outLines.push(`COURSE:${courseStr}`);
        outLines.push(`LEVEL:${level}`);
        outLines.push(`BALLOON:${myBalloons.join(',')}`);
        outLines.push(`SCOREINIT:${scoreInit}`);
        outLines.push(`SCOREDIFF:${scoreDiff}`);
        outLines.push(`SCOREMODE:2`);
        outLines.push('');
        outLines.push('#START');
        outLines = outLines.concat(bodyLines);
        if (outLines[outLines.length-1].trim() !== "") outLines.push("");
        outLines.push('#END');

        // Use a dynamic output filename
        const fileName = `${sanitizeFilename(title)}.tja`;
        outputFiles.push({ filename: fileName, content: outLines.join('\r\n'), isBinary: false });

        if (wave) {
            const wName = wave.split(/[/\\]/).pop();
            if (fileMap.has(wName)) {
                outputFiles.push({ filename: wName, content: null, isBinary: true, fileRef: fileMap.get(wName) });
            }
        }

        const checkEl = document.getElementById(`check-hidden-${i}`);
        const isHidden = checkEl ? checkEl.checked : false;

        danSongs.push({
            path: fileName,
            difficulty: mapCourseToInt(courseStr),
            genre: genre,
            isHidden: isHidden
        });
    }

    let finalConditions = [];
    const allTypes = new Set([
        ...Object.keys(globalExam.conditions),
        ...songExams.flatMap(e => e ? Object.keys(e) : [])
    ]);

    allTypes.forEach(type => {
        let hasIndividual = false;
        for(let i=1; i<sections.length; i++) {
            if(songExams[i] && songExams[i][type]) {
                hasIndividual = true;
                break;
            }
        }

        if (hasIndividual) {
            let thresholdArr = [];
            for(let i=1; i<sections.length; i++) {
                let val = (songExams[i] && songExams[i][type]) 
                          ? songExams[i][type] 
                          : (globalExam.conditions[type] || {red:0, gold:0});
                thresholdArr.push(val);
            }
            finalConditions.push({ type: type, threshold: thresholdArr });
        } else {
            if (globalExam.conditions[type]) {
                finalConditions.push({ type: type, threshold: [ globalExam.conditions[type] ] });
            }
        }
    });

    const getImagePath = (selectId, defaultName) => {
        const selectElem = document.getElementById(selectId);
        let path = selectElem.value || defaultName;
        if (selectElem.value && fileMap.has(selectElem.value)) {
            outputFiles.push({ filename: selectElem.value, content: null, isBinary: true, fileRef: fileMap.get(selectElem.value) });
        }
        return path;
    };

    const danJson = {
        title: userTitle,
        danIndex: danIndexValue,
        danPlatePath: getImagePath('plate-select', "Plate.png"),
        danPanelSidePath: getImagePath('panel-side-select', "panelside.png"),
        danTitlePlatePath: getImagePath('title-plate-select', "titleplate.png"),
        danMiniPlatePath: getImagePath('mini-plate-select', "miniplate.png"),
        danSongs: danSongs,
        conditionGauge: globalExam.gauge || { red: 80, gold: 100 },
        conditions: finalConditions
    };
    
    outputFiles.push({ filename: "dan.json", content: JSON.stringify(danJson, null, 2), isBinary: false });

    console.log(`轉換完成，輸出 ${outputFiles.length} 個檔案，包括 ${danSongs.length} 首曲目`);
    return { outputFiles, rankValue, userTitle };
    } catch (error) {
        console.error('轉換過程中出錯:', error);
        throw new Error(`轉換失敗: ${error.message}`);
    }
}
