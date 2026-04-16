# TaikoNauts 段位変換ツール (TaikoNautsdan-Conversion-tool)

[English](README.en.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

**[https://fjfjdkdk706-lgtm.github.io/TaikoNautsdan-Conversion-tool/]**

OpenTaikoやTNDE（次郎系シミュレータ）向けの段位道場TJAファイルを、TaikoNautsで再生可能な形式（分割TJA + dan.json）に一括変換するWebツールです。

## 概要
従来の段位TJAファイル（#NEXTSONG で繋がった1つのファイル）と音源が入ったフォルダをドラッグ＆ドロップするだけで、TaikoNautsの仕様に合わせたZIPファイルを生成します。

特に、手動での作成が面倒な dan.json（合格条件定義ファイル）を、TJA内の EXAM 命令を解析して自動生成する機能が特徴です。

## 特徴
- 完全自動分割: #NEXTSONG で連結された曲を 1.tja, 2.tja... に分割し、必要な音源のみを同梱します。
- 高度な条件解析: OpenTaiko/TNDE特有の EXAM 表記（judge_p, perfect, jp など）の揺らぎを吸収し、TaikoNauts用の dan.json に正規化して出力します。
- 補正機能: #DELAY を OFFSET に変換し、再生ズレを防止します。
- 不要命令の除去: TaikoNautsでの単曲再生に不要な EXAM や #LEVELHOLD などの命令をTJA本文から削除します。

## 使い方
1. ツールを開きます。
2. 変換したい段位のTJAファイルと音源ファイルが入ったフォルダを、枠内にドラッグ＆ドロップします。
3. 段位ランクやタイトル、必要に応じて画像設定を行います。
4. 出力方法（ZIPまたはプレビュー）を選択します。
5. 変換開始ボタンを押します。

## クレジット・謝辞
本ツールの dan.json 生成ロジックおよび正規表現による解析アルゴリズムは、miokamioka 氏の DaniGeneratorTN (dantja2json) をベースに許諾を得て移植・統合しています。

- Core Logic (TJA Splitting & Conversion): Developed for this repository.
- JSON Parsing Logic: Based on dantja2json by miokamioka.
- Zip Generation: JSZip (MIT License).

## ライセンス
本ソフトウェアは MIT License の下で公開されています。LICENSE を参照してください。
