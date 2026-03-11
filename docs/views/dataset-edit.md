# Dataset 編集 (Research 編集画面内)

Research 編集画面の Dataset タブから Dataset の閲覧・編集・追加・削除を行う。

## 方針

- Dataset は Research 編集画面の **Dataset タブ**内にインラインカード形式で表示する (別ページや fullScreen ダイアログは使わない)
- **Lock スコープ**: Research lock が Dataset も含む。Dataset 個別の lock は使わない
- **保存単位**: Dataset は独立ファイル (`dataset/{datasetId}-v{N}.json`) なので、保存は `PUT /api/datasets/:datasetKey` で Dataset 単位
- **状態管理**: Research と統合して Jotai atoms (`datasetsServerAtom` / `datasetsDraftAtom`) で管理

## DatasetsSection

Dataset タブの最上位コンポーネント。latest ResearchVersion の `datasets` 配列をもとに、各 dataset を `DatasetCard` で表示する。

### 操作

- **追加**: 上部の「Add Dataset」ボタン → `DatasetAddDialog` で新規作成
- **削除**: 各 `DatasetCard` の削除ボタン → 確認ダイアログ → `DELETE /api/datasets/:datasetKey`

## DatasetCard

各 Dataset をインラインの `Paper` で表示する。

### ヘッダー行

- Dataset ID (monospace, bold) + version (Chip) + releaseDate
- Modified インジケーター (Chip、draft が server と異なる場合)
- 「破棄」ボタン: draft を server state にリセット
- 「保存」ボタン: `PUT /api/datasets/:datasetKey` で個別保存
- `SectionCurationToggle`: dataset 単位の curation 状態
- 削除ボタン (IconButton, error color)

### 基本情報フィールド

| フィールド | 編集可否 | Widget |
|---|---|---|
| Criteria | editable | Select (3 択) |
| Type of Data (JA) | editable | TextField |
| Type of Data (EN) | editable | TextField |

Dataset ID, Version, humId 等の read-only フィールドはヘッダーに表示。

### Experiment 一覧

`SectionHeader` (small) で「Experiments」+ 件数を表示。

- **追加**: 「追加」ボタンで空の Experiment を末尾に追加
- 各 Experiment は `ExperimentCard` で表示

## ExperimentCard

各 Experiment を `Paper` で表示する。

### ヘッダー

- ラベル: assayType 配列を join、なければ `Experiment {index + 1}`
- Modified インジケーター
- Move Up / Move Down ボタン
- Delete ボタン (確認ダイアログ)

### タブ構成

Experiment 内に 2 つのタブ:

| タブ | 内容 |
|---|---|
| Mol Data | `data` フィールド (動的 key-value) のテーブル編集 |
| Searchable | `searchable` フィールドの型別フォーム編集 |

#### Mol Data タブ

`data` は `Record<string, BilingualTextValue | null>` で、キーは動的。

テーブル形式:

| 列 | 内容 |
|---|---|
| Key | フィールド名 (JA/EN 切替可能、`moldata-headers.json` で日英ラベル管理) |
| JA | InputBase (multiline) |
| EN | InputBase (multiline) |
| 削除 | IconButton |

- キーの追加: テーブル下部の Autocomplete で `moldata-headers.json` から選択
- Key 表示言語: ToggleButtonGroup (JA / EN) で切替

#### Searchable タブ

`searchable` の各フィールドを型に応じた Widget で編集する。セクションごとにグループ分けし、各セクションに ProgressChip (入力済み/全件) とヘルプボタンを配置する。

| セクション | フィールド |
|---|---|
| 実験の概要 | assayType, tissues, diseases, healthStatus, isTumor |
| 被験者 | subjectCount, subjectCountType, sex, ageGroup, population, cellLine |
| プラットフォーム・手法 | platforms, libraryKits, readType, readLength |
| シーケンシング品質 | sequencingDepth, targetCoverage, referenceGenome, variantCounts, hasPhenotypeData, targets |
| データ形式 | fileTypes, processedDataTypes, dataVolumeGb |
| ポリシー | policies |

Widget は型に応じて使い分ける:

- `string[]` → `TagInput` (autocomplete 候補あり)
- `enum | null` → `NullableEnumSelect`
- `number | null` → `NullableNumberField`
- `boolean | null` → `TriStateToggle`
- `DiseaseInfo[]` → 配列編集 (label: Autocomplete + icd10: TextField)
- `PlatformInfo[]` → 配列編集 (vendor: Autocomplete + model: Autocomplete)
- `VariantCounts | null` → 5 つの NumberField (snv, indel, cnv, sv, total)
- `NormalizedPolicy[]` → 配列編集 (id: Select, name.ja/en: TextField, url: TextField)

各 TagInput の autocomplete 候補は `facet-suggestions.json` (ビルド時に `scripts/generate-facet-suggestions.ts` で生成) から読み込む。

## Dataset 追加ダイアログ

`DatasetAddDialog` で新規 Dataset を作成する。

### フィールド

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| Dataset ID | string (テキスト入力) | Yes | `JGAD000XXX` 等 |
| Version | string (テキスト入力) | Yes | `v1` 等 |
| Criteria | select | Yes | 3 択 |
| Type of Data (JA) | string | No | |
| Type of Data (EN) | string | No | |

### 動作

1. 入力内容でバリデーション
2. `POST /api/datasets` で Dataset ファイルを作成
3. バックエンドが ResearchVersion の `datasets` 配列にも `DatasetRef` を追加
4. 成功後、React Query invalidate でテーブル更新

## 削除時の動作

`DELETE /api/datasets/:datasetKey` の呼び出し時、バックエンドが以下を行う:

1. Dataset JSON ファイルを削除
2. 対応する ResearchVersion の `datasets` 配列から `DatasetRef` を除去
3. editor-state.json から Dataset の curation status を除去
