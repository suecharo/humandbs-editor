# JGA 申請フォーム (PoC)

## 1. 概要

JGA の利用申請 (J-DU) と提供申請 (J-DS) を Web フォームで入力し、申請管理システムに流し込むための EAV 形式 JSON をクリップボードにコピーする PoC。

- 既存の humandbs-editor に独立した 2 ページを追加
- `/jga/ds` : J-DS (データ提供申請) フォーム
- `/jga/du` : J-DU (データ利用申請) フォーム
- ヘッダーにナビゲーションリンクを追加
- バックエンド不要 (純粋にクライアントサイドのフォーム)

## 2. スコープ

**PoC 範囲:**

- Web フォームで申請内容を入力
- language_type (ja/en) を選択
- 入力内容を EAV 形式 JSON に変換
- JSON をクリップボードにコピー
- 申請管理システムの作成ページへのリンク

**範囲外:**

- 申請管理システムとの API 連携
- 申請の保存・読み込み
- バリデーション (PoC では最低限)
- ファイルアップロード

## 3. 画面フロー

```
+---------------------+     +-------------------+
| /jga/ds             |     | shinsei-kanri      |
| [lang: ja/en]       |     | /json-submission   |
| [form]              | --> | [paste JSON]       |
| [copy JSON] [link]  |     | [create]           |
+---------------------+     +-------------------+
```

## 4. フォーム項目

### 4.1 共通設定

| 項目 | 型 | 説明 |
|------|------|------|
| languageType | `1` (ja) / `2` (en) | 申請書の言語。出力 JSON の `language_type` にマッピング |

### 4.2 J-DS (データ提供申請)

実システムのタブ構成に対応するカード構成。

**Card 1: グループ (実システム Tab 1)**

申請管理システム側で入力 (PoC 範囲外)。備考カードとして表示。

**Card 2: アカウント (実システム Tab 2)**

申請管理システム側で入力 (PoC 範囲外)。備考カードとして表示。

**Card 3: 研究内容 (実システム Tab 3)**

| 項目 | component key (ja / en) | 入力形式 |
|------|-------------------------|----------|
| 目的 | `aim` / `aim_en` | BilingualText テキストエリア |
| 対象 | `participant` / `participant_en` | BilingualText テキストエリア |
| ICD10 分類コード | `icd10` | テキスト |
| 方法 | `method` / `method_en` | BilingualText テキストエリア |
| 発表論文 | `submission_publication` | テキストエリア |
| 研究題目 | `submission_study_title` / `_en` | BilingualText |

**Card 4: データ (実システム Tab 4)**

データの種類及び量 (`data[]`, multiValue):

| 項目 | component key | 入力形式 |
|------|---------------|----------|
| アクセス制限 | `data_access` | セレクト: `submission_open` / `submission_type1` / `submission_type2` |
| 研究種別 | `study_type` | テキスト |
| 研究種別 (その他) | `study_type_other` | テキスト |
| 対象 | `target` | テキスト |
| ファイル形式 | `file_format` | テキスト |
| 総データ量 | `file_size` | テキスト |

| 項目 | component key (ja / en) | 入力形式 |
|------|-------------------------|----------|
| 制限事項 | `restriction` / `restriction_en` | BilingualText テキストエリア |
| 公開予定日 | `release_date` | 日付 |

**Card 5: 倫理審査 (実システム Tab 5)**

| 項目 | component key | 入力形式 |
|------|---------------|----------|
| NBDCガイドライン確認 | `guideline_status` | ラジオ: `unconfirmed` / `confirmed` |
| 匿名化状況 | `de_identification_status` | ラジオ: `completed` / `scheduled` / `unnecessary` |
| 匿名化予定日 | `de_identification_date` | 日付 (scheduled の場合) |
| 匿名化不要理由 | `de_identification_reason` | テキスト (unnecessary の場合) |
| 倫理審査状況 | `ethics_review_status` | ラジオ: `completed` / `notyet` / `unnecessary` |
| 審査日 | `ethics_review_date` | 日付 |
| 民間企業利用 | `commercial_use_status` | ラジオ: `approved` / `denied` |
| 多施設共同研究 | `multi_institution_status` | ラジオ: `confirmed` / `unconfirmed` / `single` / `completed` |
| DBCLSデータ加工 | `dbcls_processing_status` | ラジオ: `approved` / `denied` |
| DBCLS不承認理由 | `dbcls_processing_reason` | テキスト (denied の場合) |

**Card 6: 添付ファイル (実システム Tab 6)**

申請管理システム側で入力 (PoC 範囲外)。備考カードとして表示。

**研究分担者 (`collaborators[]`, multiValue):**

| 項目 | component key | 入力形式 |
|------|---------------|----------|
| 氏名 | `collaborator_name` | テキスト |
| 所属 | `collaborator_division` | テキスト |
| 職名 | `collaborator_job` | テキスト |
| e-Rad ID | `collaborator_eradid` | テキスト |
| ORCID | `collaborator_orcid` | テキスト |

### 4.3 J-DU (データ利用申請)

実システムのタブ構成に対応する 5 カード構成。

**Card 1: グループ (実システム Tab 1)**

申請管理システム側で入力 (PoC 範囲外)。備考カードとして表示。
- データ利用申請グループ ID (`group_id`)

**Card 2: アカウント (実システム Tab 2)**

申請管理システム側で入力 (PoC 範囲外)。備考カードとして表示。
- 研究代表者に関する情報 (PI)
- 所属機関の長について (head)

**Card 3: 研究分担者 (実システム Tab 3)**

研究分担者 (`collaborators[]`): J-DS と同一
- 備考: `collaborator_seminar` (情報管理講習受講) は PoC では除外。NBDC 受講システムとの連携が必要なため、後から追加可能。

メンバー (`members[]`, multiValue):

| 項目 | component key | 入力形式 |
|------|---------------|----------|
| 名 (en) | `member_first_name_en` | テキスト |
| ミドルネーム (en) | `member_middle_name_en` | テキスト |
| 姓 (en) | `member_last_name_en` | テキスト |
| メール | `member_email` | テキスト |
| 所属 (en) | `member_institution_en` | テキスト |
| 部署 (en) | `member_division_en` | テキスト |
| 職名 (en) | `member_job_en` | テキスト |
| e-Rad ID | `member_eradid` | テキスト |
| ORCID | `member_orcid` | テキスト |

**Card 4: 研究内容 (実システム Tab 4)**

| 項目 | component key | 入力形式 |
|------|---------------|----------|
| 利用データセット | `use_dataset_request` / `use_dataset_purpose` | 配列 (multiValue) |
| 研究の概要 | `use_summary` | テキストエリア |
| NBDCガイドライン確認 | `guideline_status` | ラジオ: `unconfirmed` / `confirmed` |
| 研究題目 (ja/en) | `use_study_title` / `_en` | BilingualText |
| 発表論文 | `use_publication` | テキストエリア |

**Card 5: 倫理審査 (実システム Tab 5)**

| 項目 | component key | 入力形式 |
|------|---------------|----------|
| データ利用終了日 (予定) | `use_period_end` | 日付 |
| 倫理審査の状況 | `use_review_status` | ラジオ: `completed` / `notyet` / `unnecessary` |
| 承認年月日 | `use_review_date` | 日付 (審査済みの場合のみ表示) |
| サーバ環境 | `server_status` | ラジオ: `onpre` / `both` |
| 機関外サーバ | `off_premise_server_status` | チェックボックス群: `nig` / `tombo` / `hgc` / `kog` |

## 5. 除外項目と理由

| 除外項目 | 理由 |
|----------|------|
| PI / submitter / head | 申請管理システム側で入力 (「PI は入力しない」) |
| group_id | 申請管理システム側で選択/作成 (pattern 3) |
| IDs (jdsId, jduId, etc.) | システムが発番 |
| statusHistory, createDate, submitDate | システムが管理 |
| uploadedFiles | ファイルアップロードは管理システム側 |
| deIdentification (DS) | 実データ例にも含まれておらず、管理側の情報と判断 |
| review (DS) | NBDC 側の審査情報が混在。PoC では除外 |
| publicKey (DU) | 不要と判断 |
| report / deletion / distribution (DU) | 利用後に記入する情報 |
| control (is_declare_statement, is_agree_mail_use) | 同意チェックボックスは管理システム側 |
| control (private_comment) | 管理システム側 |
| collaborator_seminar | NBDC 管理情報 |
| member_account_id | システムアカウント ID |
| useDatasets[].id | 内部 DB 参照 ID |
| server.isOffPremiseStatement / acknowledgmentStatus | 同意フラグ、管理システム側 |

## 6. 出力 JSON フォーマット

```json
{
  "language_type": 1,
  "components": [
    { "key": "submission_study_title", "value": "テスト研究題目" },
    { "key": "submission_study_title_en", "value": "Test Study Title" },
    { "key": "aim", "value": "テスト目的" },
    { "key": "aim_en", "value": "Test Purpose" },
    { "key": "data_access", "value": "submission_open" },
    { "key": "data_access", "value": "submission_type1" },
    { "key": "collaborator_name", "value": "Alice" },
    { "key": "collaborator_name", "value": "Bob" }
  ]
}
```

- 単一値フィールド: 空文字 `""` は components に含めない (skip)
- multiValue 配列:
  - 同一 key で複数行。プロパティごとにまとめる
  - インデックス整合性を保つため、個々のフィールドの空文字 `""` はスキップせず components に含める
  - ただし、全フィールドが空文字のエントリは丸ごとスキップする (全プロパティから同一インデックスを同時に除外するため整合性は保たれる)
  - `study_type` はカンマ区切り文字列をそのまま 1 値として出力する (split しない)。humandbs backend と同じ挙動
- `language_type`: `1` = ja, `2` = en

## 7. UI 設計

**ページレイアウト:**

各ページは `defaultLayoutRoute` (ヘッダー + フッター付き) を使用。

```
AppHeader: [研究一覧] [J-DS 申請] [J-DU 申請]

J-DS Page:
  LanguageTypeSelector
  Paper: 研究内容 (bilingual fields + 追加情報)
  Paper: データ情報 (配列)
  Paper: 研究分担者 (配列)
  JsonOutputSection

J-DU Page (実システムのタブ構成に対応):
  LanguageTypeSelector
  Paper: 研究分担者 (Tab 3) -- collaborators[] + members[]
  Paper: 研究内容 (Tab 4) -- datasets, summary, title, purpose, publication
  Paper: 倫理審査 (Tab 5) -- period, review status, server
  JsonOutputSection
```

**配列項目の UI:**

- 各アイテムを outlined Paper で囲む
- 右上に削除ボタン (IconButton + DeleteOutline)
- 配列の下部に「追加」ボタン (Button + AddIcon)

## 8. 技術設計

**状態管理:** `useState` (ページレベル)。バックエンド不要のため Jotai / React Query は不使用。

**逆変換:** `src/utils/jga-reverse-transform.ts` に純粋関数として実装。humandbs backend の `reverse-transform.ts` から適応。

**フォーム内部表現:** friendly (ネスト構造) 形式で管理し、出力時に EAV 形式に変換。

**ファイル構成:**

```
src/
  schemas/jga-form.ts
  utils/jga-reverse-transform.ts
  components/jga-form/
    LanguageTypeSelector.tsx
    BilingualFormField.tsx
    CollaboratorArraySection.tsx
    JsonOutputSection.tsx
    ds/
      DsResearchInfoSection.tsx
      DsDataArraySection.tsx
    du/
      DuResearchInfoSection.tsx
      DuDatasetArraySection.tsx
      DuEthicsReviewSection.tsx
      DuServerSection.tsx
      DuMemberArraySection.tsx
  pages/
    JgaDsFormPage.tsx
    JgaDuFormPage.tsx
```
