# TaikoNauts 段位轉換工具

[English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

**線上版本：**
https://fjfjdkdk706-lgtm.github.io/TaikoNautsdan-Conversion-tool/

這是一個 Web 轉換工具，用於將 OpenTaiko / TNDE 的段位道場 TJA 轉換為 TaikoNauts 可用格式（分割 TJA + dan.json）。

## 概要
將包含段位 TJA 與音源的資料夾拖放進工具後，系統會自動解析 TJA，依 #NEXTSONG 分割曲目、生成 dan.json，並輸出可直接使用的 ZIP。

## 特色
- 依 #NEXTSONG 自動分割段位歌曲。
- 解析並正規化 EXAM 命令為 TaikoNauts 條件格式。
- 將 #DELAY 轉為 OFFSET，降低譜面時間偏移問題。
- 移除 TaikoNauts 單曲播放不需要的命令。

## 使用方式
1. 開啟工具頁面。
2. 拖放包含目標 TJA 與音源檔的資料夾。
3. 設定段位等級、標題與可選圖片參數。
4. 選擇輸出模式（ZIP 或預覽）。
5. 點擊開始轉換。

## 致謝
dan.json 解析邏輯基於 miokamioka 的 DaniGeneratorTN（dantja2json），並在授權下整合。

- 本專案實作核心轉換流程。
- JSON 解析方法基於 miokamioka 的 dantja2json。
- ZIP 生成使用 JSZip（MIT License）。

## 授權
本專案採用 MIT License，請參閱 LICENSE。
