# TaikoNauts 段位変換ツール (TaikoNautsdan-Conversion-tool)

**[https://fjfjdkdk706-lgtm.github.io/TaikoNautsdan-Conversion-tool/]**

OpenTaikoやTNDE（TJAP3系シミュレータ）向けの段位道場TJAファイルを、**TaikoNauts** で再生可能な形式（分割TJA + `dan.json`）に一括変換するWebツールです。

## 概要
従来の段位TJAファイル（`#NEXTSONG` で繋がった1つのファイル）と音源が入ったフォルダをドラッグ＆ドロップするだけで、TaikoNautsの仕様に完全に合わせたZIPファイルを自動生成します。

手動での作成が面倒な `dan.json`（合格条件定義ファイル）の生成だけでなく、複数の段位フォルダを一度に処理し、ゲーム内でコースとして認識させるための `dan.def` ファイルの作成までを一画面で完結できるのが最大の特徴です。

## 主な機能と特徴
- **複数フォルダ一括処理 (Multi-Folder Edition):** 複数の段位フォルダをまとめてドロップ可能。一括で変換し、コースを束ねる `dan.def` も自動生成して1つのZIPにまとめます。
- **段位・ランクの自動判別:** フォルダ名やTJAのタイトルから「初段」「達人」「五級」などのキーワードを検出し、内部の `DanIndex` を自動設定します。
- **装飾画像の自動取得・適用:** 設定された段位に基づき、対応する段位プレート（`plate.png`）、サイドパネル（`panelside.png`）、タイトルプレート（`titleplate.png`）をGitHubから自動ダウンロードして組み込みます。※フォルダ内に独自の `Plate.png` を同梱している場合はそちらを最優先で適用します。
- **隠し曲 (???) 設定:** ツール上のUIからチェックを入れるだけで、特定の曲のタイトルを `???` に隠蔽し、ゲーム内でシークレット曲として扱えるようにします。
- **完全自動分割:** `#NEXTSONG` で連結された曲を `1.tja`, `2.tja`... に分割し、必要な音源のみを同梱します。
- **高度な条件解析:** OpenTaiko/TNDE特有の `EXAM` 表記（`judge_p`, `perfect`, `jp` など）の揺らぎを吸収し、TaikoNauts用の `dan.json` に正規化して出力します。
- **不要命令の除去と補正:** `#DELAY` を `OFFSET` に変換して再生ズレを防止し、TaikoNautsでの単曲再生に不要な `EXAM` や `#LEVELHOLD` などの命令をTJA本文から綺麗に削除します。

## 使い方
1. [ツール(Webページ)](https://fjfjdkdk706-lgtm.github.io/TaikoNautsdan-Conversion-tool/) を開きます。
2. 変換したい段位の「TJAファイル」と「音源ファイル」が入ったフォルダ（複数可）を、画面の枠内にドラッグ＆ドロップします。
3. 読み込みが完了すると設定パネルが表示されます。
   - コース全体タイトル（複数フォルダ時のみ）
   - 段位のランク設定（自動判別されますが、手動調整も可能）
   - 隠し曲の設定
4. 設定を確認し、「変換開始」ボタンを押します。
5. 生成されたZIPファイルがダウンロードされます。解凍して、中身のフォルダをそのまま TaikoNauts の `Dans` フォルダに配置するだけで遊べます。（画像もすべて設定済みです！）

## クレジット・謝辞 (Credits)
本ツールの `dan.json` 生成ロジックおよび正規表現による解析アルゴリズムは、**miokamioka** 氏の [DaniGeneratorTN](https://github.com/miokamioka/DaniGeneratorTN) (dantja2json) をベースに許諾を得て移植・統合しています。
また、自動取得される画像素材については、A-Style素材集のものを使用させていただいております。

- **Core Logic (TJA Splitting, Batch Conversion, UI):** Developed for this repository.
- **JSON Parsing Logic:** Based on **dantja2json** by [miokamioka](https://github.com/miokamioka).
- **Zip Generation:** [JSZip](https://github.com/Stuk/jszip) (MIT License).

## ライセンス
本ソフトウェアは [MIT License](LICENSE) の下で公開されています。
