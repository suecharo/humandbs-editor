# Dataset 編集 (Research 編集画面内)

Research 編集画面の DatasetsSection から Dataset の閲覧・編集・追加・削除を行う。
Dataset 単独のページは作らず、Research 編集画面内のダイアログで完結する。

## 方針

- **ハイブリッド方式 (C)**: DatasetsSection で一覧管理 + ダイアログで詳細編集
- **Lock スコープ**: Research lock が Dataset も含む。Dataset 個別の lock は使わない
- **保存単位**: Dataset は独立ファイル (`dataset/{datasetId}-v{N}.json`) なので、保存は `PUT /api/datasets/:datasetId` で Dataset 単位

## DatasetsSection の変更

現在の read-only テーブルを拡張し、Dataset の CRUD を可能にする。

### テーブル列

| 列 | 内容 |
|---|---|
| Dataset ID | monospace |
| Version | |
| Criteria | アクセス制限種別 |
| Type of Data (JA) | truncate |
| Experiments | 件数 |
| 操作 | Edit / Delete ボタン |

### 操作

- **追加**: テーブル上部の「追加」ボタン → Dataset 追加ダイアログ (後述)
- **編集**: 行の Edit ボタン → Dataset 編集ダイアログ (後述)
- **削除**: 行の Delete ボタン → 確認ダイアログ → `DELETE /api/datasets/:datasetId`

### データソース

latest ResearchVersion の `datasets` 配列をもとに、各 datasetId の詳細を `GET /api/datasets/:datasetId` で取得して表示する。

## Dataset 追加ダイアログ

新規 Dataset を作成するダイアログ。

### フィールド

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| Dataset ID | string (テキスト入力) | Yes | ユーザーが指定。`JGAD000XXX` 等 |
| Version | string (テキスト入力) | Yes | `v1` 等 |
| Criteria | select | Yes | `Controlled-access (Type I)` / `Controlled-access (Type II)` / `Unrestricted-access` |
| Type of Data (JA) | string | No | |
| Type of Data (EN) | string | No | |

### 動作

1. 入力内容でバリデーション
2. `POST /api/datasets` で Dataset ファイルを作成
3. バックエンドが ResearchVersion の `datasets` 配列にも `DatasetRef` を追加
4. 成功後、DatasetsSection のテーブルを更新 (React Query invalidate)

## Dataset 編集ダイアログ

既存の Dataset を編集するフルスクリーンダイアログ。

### レイアウト

`Dialog` (`fullScreen`) で表示する。AppBar 風のヘッダーに「閉じる」「保存」「変更を破棄」ボタンを配置。

内容は縦スクロールのフォーム:

1. **基本情報セクション**
2. **Experiment 一覧セクション**

### 基本情報セクション

| フィールド | 編集可否 | Widget |
|---|---|---|
| Dataset ID | read-only | Typography (monospace) |
| Version | read-only | Typography |
| Version Release Date | read-only | Typography |
| humId | read-only | Typography |
| humVersionId | read-only | Typography |
| Release Date | read-only | Typography |
| Criteria | editable | Select (3 択) |
| Type of Data (JA) | editable | TextField |
| Type of Data (EN) | editable | TextField |

### Experiment 一覧セクション

Experiment ごとに Accordion で表示する。Accordion のサマリーは `header` のテキスト。

#### Experiment の操作

- **追加**: セクション上部の「追加」ボタン → 空の Experiment を末尾に追加
- **削除**: 各 Accordion ヘッダーの Delete ボタン → 確認ダイアログ後に削除
- **並べ替え**: Move Up / Move Down ボタン

#### Experiment 編集フォーム (Accordion 展開時)

Accordion を展開すると、以下のセクションが縦に並ぶ:

##### Header

| フィールド | Widget |
|---|---|
| Header (JA) text | TextField |
| Header (EN) text | TextField |

##### Data (動的 key-value)

`data` は `Record<string, BilingualTextValue | null>` で、キーは動的。
テーブル形式で表示する:

| 列 | 内容 |
|---|---|
| Key | フィールド名 (read-only) |
| Value (JA) | TextField (text フィールド) |
| Value (EN) | TextField (text フィールド) |

- キーの追加: テーブル下部の「キー追加」ボタン → テキスト入力でキー名を指定
- キーの削除: 各行の Delete ボタン

##### Searchable Fields

`searchable` の各フィールドを型に応じた Widget で編集する。
グループ分けして表示:

**被験者・サンプル情報**

| フィールド | 型 | Widget |
|---|---|---|
| subjectCount | number \| null | NumberField |
| subjectCountType | enum \| null | Select (`individual` / `sample` / `mixed`) |
| healthStatus | enum \| null | Select (`healthy` / `affected` / `mixed`) |
| diseases | DiseaseInfo[] | 配列編集 (label: TextField, icd10: TextField) |
| tissues | string[] | TagInput (autocomplete) |
| isTumor | enum \| null | Select (`tumor` / `normal` / `mixed`) |
| cellLine | string[] | TagInput |
| population | string[] | TagInput (autocomplete) |

**人口統計**

| フィールド | 型 | Widget |
|---|---|---|
| sex | enum \| null | Select (`male` / `female` / `mixed`) |
| ageGroup | enum \| null | Select (`infant` / `child` / `adult` / `elderly` / `mixed`) |

**実験手法**

| フィールド | 型 | Widget |
|---|---|---|
| assayType | string[] | TagInput (autocomplete) |
| libraryKits | string[] | TagInput |
| platforms | PlatformInfo[] | 配列編集 (vendor: TextField, model: TextField) |
| readType | enum \| null | Select (`single-end` / `paired-end` / `mixed`) |
| readLength | number \| null | NumberField |

**シーケンシング品質**

| フィールド | 型 | Widget |
|---|---|---|
| sequencingDepth | number \| null | NumberField |
| targetCoverage | number \| null | NumberField |
| referenceGenome | string[] | TagInput |
| variantCounts | VariantCounts \| null | 5 つの NumberField (snv, indel, cnv, sv, total) |
| hasPhenotypeData | boolean \| null | TriStateCheckbox (true / false / null) |
| targets | string \| null | TextField |

**データ情報**

| フィールド | 型 | Widget |
|---|---|---|
| fileTypes | string[] | TagInput (autocomplete) |
| processedDataTypes | string[] | TagInput |
| dataVolumeGb | number \| null | NumberField |

**ポリシー**

| フィールド | 型 | Widget |
|---|---|---|
| policies | NormalizedPolicy[] | 配列編集 (id: TextField, name.ja: TextField, name.en: TextField, url: TextField) |

##### Footers

JA / EN それぞれ TextValue の配列。通常は空なので、折りたたみ表示とする。

### 状態管理

Dataset 編集ダイアログは独自の draft state を持つ:

- ダイアログを開くとき: `GET /api/datasets/:datasetId` で取得したデータをダイアログローカルの state にコピー
- 編集: ダイアログ内の state を変更 (親の Research state とは独立)
- 保存: `PUT /api/datasets/:datasetId` で API に送信
- 破棄: ダイアログを閉じる (未保存の変更がある場合は確認ダイアログ)

Jotai atom は不要。ダイアログのライフサイクルに閉じるため、`useState` または `useReducer` で管理する。

## 削除時の動作

`DELETE /api/datasets/:datasetId` の呼び出し時、バックエンドが以下を行う:

1. Dataset JSON ファイルを削除
2. 対応する ResearchVersion の `datasets` 配列から `DatasetRef` を除去
3. editor-state.json から Dataset の curation status を除去

## API

design.md で定義済みの Dataset API を使用する:

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/datasets/:datasetId` | Dataset 詳細 (experiments 含む) |
| POST | `/api/datasets` | Dataset 新規作成 |
| PUT | `/api/datasets/:datasetId` | Dataset 更新 |
| DELETE | `/api/datasets/:datasetId` | Dataset 削除 |

### POST /api/datasets リクエスト

```json
{
  "datasetId": "JGAD000XXX",
  "version": "v1",
  "humId": "hum0001",
  "humVersionId": "hum0001-v1",
  "criteria": "Controlled-access (Type I)",
  "typeOfData": { "ja": "", "en": "" }
}
```

バックエンドが以下を自動設定:

- `versionReleaseDate`: 現在日付
- `releaseDate`: 現在日付
- `experiments`: 空配列
- ResearchVersion の `datasets` 配列に `DatasetRef` を追加

### PUT /api/datasets/:datasetId リクエスト

Dataset オブジェクト全体を送信する (experiments 含む)。

## Curation Status

既存の editor-state.json の `datasets` セクションを使用する。
Dataset 編集ダイアログのヘッダーに curation status トグルを配置する。

- `PUT /api/curation-status/dataset/:datasetId` で状態更新
- Experiment 単位の curation status も将来的に使用可能 (editor-state.json に `experiments` セクションあり)

## スコープ

初回実装:

- DatasetsSection の拡張 (テーブル + CRUD 操作)
- Dataset 編集ダイアログ (基本情報 + Experiment 一覧)
- Experiment 編集 (header, data, searchable)
- Dataset の保存 (PUT)
- Dataset の追加 (POST) / 削除 (DELETE)

後続タスク:

- Experiment 単位の curation status
- Footers 編集
- TagInput の autocomplete 候補 (`GET /api/facet-values`)
- originalMetadata の read-only 表示
