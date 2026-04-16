/**
 * Parse an EXAM command line.
 * @param {string} line
 */
export function parseExamLine(line) {
    let content = line.replace(/^EXAM\d*[:\s]*/i, '').trim();
    const parts = content.split(/,\s*/);
    if (parts.length < 2) return null;

    const typeRaw = parts[0].toLowerCase();
    const red = parseFloat(parts[1]);
    const gold = parseFloat(parts[2]);

    if (isNaN(red)) return null;
    const valObj = { red: red, gold: isNaN(gold) ? red : gold };

    if (['g', 'gauge'].includes(typeRaw)) {
        return { type: 'Gauge', val: valObj, isGauge: true };
    }

    let typeName = "";
    if (['p', 'jp', 'perfect', 'judge_p', 'gr'].includes(typeRaw)) typeName = "Great";
    else if (['g', 'jg', 'good', 'judge_g', 'gd'].includes(typeRaw)) typeName = "Good";
    else if (['b', 'jb', 'bad', 'miss', 'judge_b'].includes(typeRaw)) typeName = "Miss";
    else if (['r', 'jr', 'roll', 'judge_r'].includes(typeRaw)) typeName = "Roll";
    else if (['h', 'jh', 'hit', 'judge_h'].includes(typeRaw)) typeName = "HitCount";
    else if (['c', 'jc', 'combo'].includes(typeRaw)) typeName = "MaxCombo";
    else if (['s', 'js', 'score'].includes(typeRaw)) typeName = "Score";
    else if (['a', 'adlib'].includes(typeRaw)) typeName = "ADLIB";

    if (!typeName) return null;
    return { type: typeName, val: valObj, isGauge: false };
}

/**
 * Count balloon notes by scanning for 7 and 9.
 * @param {string[]} lines
 */
export function count79(lines) {
    let count = 0;
    for (let line of lines) {
        let trim = line.trim();
        if (!trim || trim.startsWith('//') || trim.includes(':') || trim.startsWith('#')) continue;
        for (let char of trim.split('//')[0]) {
            if (char === '7' || char === '9') count++;
        }
    }
    return count;
}

/**
 * Parse #NEXTSONG arguments.
 * @param {string} tag
 */
export function parseNextSongArgs(tag) {
    return tag.replace(/^#NEXTSONG\s+/i, '').split(',').map(s => s.trim());
}

/**
 * Map course index text to course name.
 */
export function mapCourseStr(val) {
    const map = ["Easy", "Normal", "Hard", "Oni", "Edit"];
    return map[parseInt(val)] || "Oni";
}

/**
 * Map course name to numeric difficulty ID.
 */
export function mapCourseToInt(str) {
    const map = { "Easy": 0, "Normal": 1, "Hard": 2, "Oni": 3, "Edit": 4 };
    return map[str] !== undefined ? map[str] : 3;
}
