# TaikoNauts Dan Conversion Tool

[English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

**Live Demo:**
https://fjfjdkdk706-lgtm.github.io/TaikoNautsdan-Conversion-tool/

This web tool converts Dan Dojo TJA files for OpenTaiko / TNDE into a TaikoNauts-compatible package (split TJA files + dan.json).

## Overview
Drag and drop a folder that contains a Dan TJA file and audio files. The tool parses the TJA structure, splits songs by #NEXTSONG, generates dan.json, and exports a ready-to-use ZIP package.

## Features
- Automatic song splitting by #NEXTSONG.
- EXAM command normalization for TaikoNauts condition format.
- #DELAY to OFFSET conversion to reduce timing drift.
- Removes commands not needed for single-song playback in TaikoNauts.

## How To Use
1. Open the tool page.
2. Drag and drop a folder containing the target TJA and audio files.
3. Configure rank/title and optional image settings.
4. Choose export mode (ZIP or preview).
5. Click Start Conversion.

## Credits
The dan.json parsing logic is based on DaniGeneratorTN (dantja2json) by miokamioka, integrated with permission.

- Core conversion flow for this repository.
- JSON parsing approach based on dantja2json by miokamioka.
- ZIP generation powered by JSZip (MIT License).

## License
Released under the MIT License. See LICENSE.
