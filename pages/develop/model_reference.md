# Data types

This file describes the data types supported by the model builder for defining record metadata schemas.

| Data type | Short description |
|-----------|-------------------|
| [boolean](#boolean) | Boolean values (true/false) |
| [int](#int) | 32-bit integer number |
| [long](#long) | 64-bit integer number |
| [float](#float) | Single precision floating-point number |
| [double](#double) | Double precision floating-point number |
| [keyword](#keyword) | Keyword field for exact matching |
| [fulltext](#fulltext) | Full-text searchable field |
| [fulltext+keyword](#fulltextkeyword) | Full-text field with keyword validation |
| [i18n](#i18n) | Internationalized text with language-value pairs |
| [multilingual](#multilingual) | Array of language-value pairs for multilingual content |
| [i18ndict](#i18ndict) | Simple multilingual dictionary (language code keys) |
| [date](#date) | Basic date values |
| [datetime](#datetime) | Date and time values |
| [time](#time) | Time values |
| [edtf-time](#edtf-time) | EDTF (Extended Date/Time Format) time values |
| [edtf](#edtf) | EDTF (Extended Date/Time Format) values |
| [edtf-interval](#edtf-interval) | EDTF intervals |
| [object](#object) | Structured object with defined properties |
| [nested](#nested) | Nested object for complex structures |
| [array](#array) | Array/list of items |
| [dynamic-object](#dynamic-object) | Object with dynamic properties |
| [polymorphic](#polymorphic) | Discriminated union type |
| [pid-relation](#pid-relation) | Relation to another record using a PID |
| [vocabulary](#vocabulary) | Reference to a controlled vocabulary |

## Boolean data types

### boolean

Data type for storing true/false values. Essential for research metadata like peer review status, open access availability, data availability, embargo status, and publication flags. In the UI, boolean fields are typically rendered as checkboxes. The data type includes internationalization support, automatically translating boolean values to localized "true"/"false" text for display purposes. The OpenSearch mapping stores boolean values efficiently and supports boolean queries for filtering and aggregations in research discovery interfaces.

| Property | Description |
|----------|-------------|
| source code | [boolean.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/boolean.py) |
| jsonschema type | `boolean` |
| mapping | [`boolean`](https://docs.opensearch.org/latest/field-types/supported-field-types/boolean/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Boolean` |
| ui_marshmallow_field_class | FormatBoolean |

**Example:**

```yaml
peer_reviewed:
  type: boolean

open_access:
  type: boolean
```

**Valid input json example:**

```json
{
  "peer_reviewed": true,
  "open_access": false
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `peer_reviewed:true` | Search for peer-reviewed documents |
| `open_access:false` | Search for non-open access documents |
| `peer_reviewed:true AND open_access:true` | Search for peer-reviewed open access documents |

## Numeric data types

### int

Data type for 32-bit signed integers, supporting values from -2,147,483,648 to 2,147,483,647. Perfect for citation counts, sample sizes, publication years, version numbers, dataset entry counts, and other whole number values within this range. The type includes built-in validation for range constraints and supports localized number formatting in the UI. OpenSearch stores integers efficiently and provides fast numerical queries, aggregations, and sorting for research metrics and filtering. Use `strict_validation` to ensure the input is exactly an integer and not a string representation.

| Property | Description |
|----------|-------------|
| source code | [numbers.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/numbers.py) |
| jsonschema type | `integer` |
| mapping | [`integer`](https://docs.opensearch.org/latest/field-types/supported-field-types/numeric/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Integer` |
| ui_marshmallow_field_class | FormatNumber |
| min_inclusive | Minimum allowed value (inclusive) |
| max_inclusive | Maximum allowed value (inclusive) |
| min_exclusive | Minimum allowed value (exclusive) |
| max_exclusive | Maximum allowed value (exclusive) |
| strict_validation | Make sure that the value is exactly an integer, not a string containing an integer |

**Example:**

```yaml
citation_count:
  type: int
  min_inclusive: 0

sample_size:
  type: int
  min_inclusive: 1
  max_inclusive: 1000000
```

**Valid input json example:**

```json
{
  "citation_count": 42,
  "sample_size": 1500
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `citation_count:[10 TO 100]` | Search for documents with citation_count between 10 and 100 |
| `citation_count:10` | Search for documents with citation_count exactly 10 |

### long

Data type for 64-bit signed integers, supporting values from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807. Essential for large numerical values like timestamps, file sizes in bytes, unique identifiers, or any integer that exceeds the 32-bit range. Uses the same marshmallow Integer field but maps to OpenSearch's `long` type for extended range support. Includes the same validation and formatting features as the `int` type but with a much larger value range.

| Property | Description |
|----------|-------------|
| source code | [numbers.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/numbers.py) |
| jsonschema type | `integer` |
| mapping | [`long`](https://docs.opensearch.org/latest/field-types/supported-field-types/numeric/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Integer` |
| ui_marshmallow_field_class | FormatNumber |
| min_inclusive | Minimum allowed value (inclusive) |
| max_inclusive | Maximum allowed value (inclusive) |
| min_exclusive | Minimum allowed value (exclusive) |
| max_exclusive | Maximum allowed value (exclusive) |
| strict_validation | Make sure that the value is exactly an integer, not a string containing an integer |

**Example:**

```yaml
file_size_bytes:
  type: long
  min_inclusive: 0

dataset_entries:
  type: long
  min_inclusive: 1
```

**Valid input json example:**

```json
{
  "file_size_bytes": 2147483648,
  "dataset_entries": 5000000
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `file_size_bytes:[1048576 TO 10485760]` | Search for files between 1MB and 10MB |
| `dataset_entries:>=1000000` | Search for datasets with at least 1 million entries |
| `file_size_bytes:>2147483647` | Search for files larger than 32-bit integer limit |

### float

Data type for single precision floating-point numbers (32-bit IEEE 754). Supports decimal values with approximately 7 decimal digits of precision, ranging from -3.4×10³⁸ to 3.4×10³⁸. Ideal for measurements, prices, ratings, percentages, and other decimal values where moderate precision is sufficient. The type provides localized number formatting and supports range validation. OpenSearch stores floats efficiently for numerical operations, but be aware of potential precision limitations for financial calculations or high-precision scientific data.

| Property | Description |
|----------|-------------|
| source code | [numbers.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/numbers.py) |
| jsonschema type | `number` |
| mapping | [`float`](https://docs.opensearch.org/latest/field-types/supported-field-types/numeric/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Float` |
| ui_marshmallow_field_class | FormatNumber |
| min_inclusive | Minimum allowed value (inclusive) |
| max_inclusive | Maximum allowed value (inclusive) |
| min_exclusive | Minimum allowed value (exclusive) |
| max_exclusive | Maximum allowed value (exclusive) |
| strict_validation | Make sure that the value is exactly a float, not a string containing a float |

**Example:**

```yaml
impact_factor:
  type: float
  min_inclusive: 0.0
  max_inclusive: 100.0

confidence_level:
  type: float
  min_inclusive: 0.0
  max_inclusive: 1.0
```

**Valid input json example:**

```json
{
  "impact_factor": 3.247,
  "confidence_level": 0.95
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `impact_factor:[2.0 TO 5.0]` | Search for publications with impact factor between 2.0 and 5.0 |
| `confidence_level:>=0.95` | Search for results with confidence level 95% or higher |
| `impact_factor:>10.0` | Search for high-impact publications |

### double

Data type for double precision floating-point numbers (64-bit IEEE 754). Provides approximately 15-17 decimal digits of precision with a range from -1.8×10³⁰⁸ to 1.8×10³⁰⁸. Essential for high-precision calculations, scientific measurements, geographic coordinates, financial calculations requiring precision, and any decimal values where single precision is insufficient. Uses the same marshmallow Float field but maps to OpenSearch's `double` type for extended precision and range. Recommended for most decimal number use cases due to its superior precision.

| Property | Description |
|----------|-------------|
| source code | [numbers.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/numbers.py) |
| jsonschema type | `number` |
| mapping | [`double`](https://docs.opensearch.org/latest/field-types/supported-field-types/numeric/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Float` |
| ui_marshmallow_field_class | FormatNumber |
| min_inclusive | Minimum allowed value (inclusive) |
| max_inclusive | Maximum allowed value (inclusive) |
| min_exclusive | Minimum allowed value (exclusive) |
| max_exclusive | Maximum allowed value (exclusive) |
| strict_validation | Make sure that the value is exactly a float, not a string containing a float |

**Example:**

```yaml
latitude:
  type: double
  min_inclusive: -90.0
  max_inclusive: 90.0

longitude:
  type: double
  min_inclusive: -180.0
  max_inclusive: 180.0

measurement_value:
  type: double
```

**Valid input json example:**

```json
{
  "latitude": 49.2033737261832,
  "longitude": 16.59716724451779,
  "measurement_value": 123.456789012345
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `latitude:[49.0 TO 50.0]` | Search for locations in latitude range |
| `longitude:[16.0 TO 17.0] AND latitude:[49.0 TO 50.0]` | Search for locations in specific geographic area |
| `measurement_value:>100.0` | Search for measurements above 100.0 |

## Text data types

### keyword

Data type for exact-match text fields that are not analyzed (not broken into tokens). Perfect for IDs, status values, categories, tags, and structured data where you need precise matching and efficient aggregations. OpenSearch stores keywords as-is, enabling fast exact searches, sorting, and faceting. Limited to 256 characters by default (`ignore_above: 256`). Supports pattern validation with regular expressions, enumerated value lists, and length constraints. Use this for dropdown options, and any text that should match exactly.

| Property | Description |
|----------|-------------|
| source code | [strings.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/strings.py) |
| jsonschema type | `string` |
| mapping | [`keyword`](https://docs.opensearch.org/latest/field-types/supported-field-types/keyword/) with `ignore_above: 256` |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.String` |
| ui_marshmallow_field_class | no special serialization for UI |
| min_length | Minimum string length |
| max_length | Maximum string length |
| enum | List of allowed values |
| pattern | Regular expression pattern for validation |

**Example:**

```yaml
publication_status:
  type: keyword
  enum: ["draft", "submitted", "accepted", "published", "retracted"]

resource_type:
  type: keyword
  enum: ["dataset", "publication", "software", "image", "video"]

subject_classification:
  type: keyword
  max_length: 100
```

**Valid input json example:**

```json
{
  "publication_status": "published",
  "resource_type": "dataset",
  "subject_classification": "Computer Science"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `publication_status:published` | Search for published documents |
| `resource_type:(dataset OR publication)` | Search for datasets or publications |
| `subject_classification:"Computer Science"` | Exact match for subject classification |
| `publication_status:published AND resource_type:dataset` | Search for published datasets |

### fulltext

Data type for analyzed text content that supports full-text search capabilities. OpenSearch breaks the text into tokens using analyzers, enabling sophisticated search features like stemming, synonyms, and relevance scoring. Ideal for descriptions, abstracts, comments, article content, and any text where users need to search within the content rather than match exactly. Unlike `keyword` fields, fulltext fields are optimized for search relevance but cannot be used efficiently for sorting or aggregations. No character limit by default.

| Property | Description |
|----------|-------------|
| source code | [strings.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/strings.py) |
| jsonschema type | `string` |
| mapping | [`text`](https://docs.opensearch.org/latest/field-types/supported-field-types/text/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.String` |
| ui_marshmallow_field_class | no special serialization for UI |
| min_length | Minimum string length |
| max_length | Maximum string length |
| enum | List of allowed values |
| pattern | Regular expression pattern for validation |

**Example:**

```yaml
abstract:
  type: fulltext
  min_length: 50
  max_length: 5000

research_methods:
  type: fulltext

technical_info:
  type: fulltext
```

**Valid input json example:**

```json
{
  "abstract": "This research investigates the impact of machine learning algorithms on data processing efficiency in large-scale distributed systems.",
  "research_methods": "We employed a mixed-methods approach combining quantitative analysis and qualitative interviews.",
  "technical_info": "The system was implemented using Python 3.9, TensorFlow 2.8, and deployed on Kubernetes clusters."
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `abstract:"machine learning"` | Search for documents mentioning machine learning in abstract |
| `research_methods:(quantitative OR qualitative)` | Search for documents using specific research methods |
| `technical_info:Python` | Search for documents mentioning Python in technical info |
| `abstract:algorithms AND technical_info:TensorFlow` | Search combining abstract and technical criteria |

### fulltext+keyword

Data type that combines both full-text search and exact-match capabilities in a single field. OpenSearch creates a multi-field mapping with the main field analyzed for full-text search and a `.keyword` sub-field for exact matching, sorting, and aggregations. Perfect for titles, names, and other text that needs both search functionality and precise filtering/faceting. This is the most versatile text type - use it for fields like article titles, author names, or any text where you want both search and exact-match capabilities. The keyword sub-field respects the 256-character limit.

| Property | Description |
|----------|-------------|
| source code | [strings.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/strings.py) |
| jsonschema type | `string` |
| mapping | [`text`](https://docs.opensearch.org/latest/field-types/supported-field-types/text/) with `keyword` sub-field (`ignore_above: 256`) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.String` |
| ui_marshmallow_field_class | no special serialization for UI |
| min_length | Minimum string length |
| max_length | Maximum string length |
| enum | List of allowed values |
| pattern | Regular expression pattern for validation |

**Example:**

```yaml
title:
  type: fulltext+keyword
  required: true
  min_length: 5
  max_length: 500

journal_name:
  type: fulltext+keyword
  required: true

author_name:
  type: fulltext+keyword
```

**Valid input json example:**

```json
{
  "title": "Machine Learning Applications in Bioinformatics: A Comprehensive Survey",
  "journal_name": "Journal of Computational Biology",
  "author_name": "Dr. Jane Smith"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `title:"Machine Learning"` | Full-text search in titles |
| `title.keyword:"Machine Learning Applications in Bioinformatics: A Comprehensive Survey"` | Exact title match using keyword subfield |
| `journal_name:"Journal of Computational Biology"` | Search for specific journal |
| `author_name:Smith` | Search for authors with surname Smith |
| `title:bioinformatics AND journal_name:"Computational Biology"` | Combined search across fields |

### i18n

Data type for internationalized text fields that store language-value pairs as nested objects. Each entry contains a language code and corresponding text value, stored in OpenSearch as nested documents for independent querying. Supports customizable field names for language and value properties. Ideal for structured multilingual content where you need to query specific language-text combinations. Automatically creates nested facets for language-based filtering and provides specialized UI fields for multilingual input and display.

| Property | Description |
|----------|-------------|
| source code | [multilingual.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/multilingual.py) |
| jsonschema type | `object` with language and value properties |
| mapping | [`nested`](https://docs.opensearch.org/latest/field-types/supported-field-types/nested/) with language (keyword) and value (text+keyword) fields |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | I18nStrField |
| ui_marshmallow_field_class | I18nStrUIField |
| multilingual.lang_name | Custom name for language field (defaults to "lang") |
| multilingual.value_name | Custom name for value field (defaults to "value") |

**Example:**

```yaml
title_multilingual:
  type: i18n
  multilingual:
    lang_name: "language"
    value_name: "text"

abstract_i18n:
  type: i18n

keywords_i18n:
  type: i18n
```

**Valid input json example:**

```json
{
  "title_multilingual": {
    "language": "en",
    "text": "Machine Learning in Bioinformatics"
  },
  "abstract_i18n": {
    "lang": "en",
    "value": "This paper presents a comprehensive survey of machine learning applications in bioinformatics."
  },
  "keywords_i18n": {
    "lang": "en", 
    "value": "machine learning, bioinformatics, computational biology"
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `title_multilingual.language:en` | Search for documents with English titles |
| `abstract_i18n.value:"machine learning"` | Search for machine learning in English abstracts |
| `title_multilingual.language:en AND title_multilingual.text:bioinformatics` | Search for English titles containing bioinformatics |
| `keywords_i18n.lang:en AND keywords_i18n.value:biology` | Search for English keywords containing biology |

### multilingual

Data type for arrays of language-value pairs, enabling multiple translations per field. Similar to `i18n` but stores content as an array of nested objects rather than a single nested object. Perfect for fields that may have multiple translations or regional variants. Uses the same nested mapping as `i18n` but with array semantics. Provides array-based UI components for managing multiple language entries and supports the same faceting capabilities.

| Property | Description |
|----------|-------------|
| source code | [multilingual.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/multilingual.py) |
| jsonschema type | `array` of objects with language and value properties |
| mapping | [`nested`](https://docs.opensearch.org/latest/field-types/supported-field-types/nested/) with language (keyword) and value (text+keyword) fields |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | MultilingualField |
| ui_marshmallow_field_class | MultilingualUIField |
| multilingual.lang_name | Custom name for language field (defaults to "lang") |
| multilingual.value_name | Custom name for value field (defaults to "value") |

**Example:**

```yaml
description:
  type: multilingual

additional_titles:
  type: multilingual

notes:
  type: multilingual
```

**Valid input json example:**

```json
{
  "description": [
    {
      "lang": "en",
      "value": "A comprehensive dataset for machine learning research"
    },
    {
      "lang": "cs",
      "value": "Komplexní datová sada pro výzkum strojového učení"
    }
  ],
  "additional_titles": [
    {
      "lang": "de",
      "value": "Maschinelles Lernen in der Bioinformatik"
    }
  ],
  "notes": [
    {
      "lang": "en",
      "value": "Updated methodology section"
    }
  ]
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `description.lang:en` | Search for documents with English descriptions |
| `description.value:"machine learning"` | Search for machine learning in description values |
| `description.lang:en AND description.value:dataset` | Search for English descriptions containing dataset |
| `additional_titles.lang:de AND additional_titles.value:Bioinformatik` | Search for German titles containing Bioinformatik |

### i18ndict

Data type for simple multilingual dictionaries where language codes are direct object keys mapping to text values (e.g., `{"en": "English text", "fi": "Finnish text"}`). Most straightforward multilingual format but with dynamic structure since language codes are property names. Uses OpenSearch object mapping with dynamic field creation. Ideal for simple translations where you don't need structured querying capabilities and prefer the compact key-value format.

| Property | Description |
|----------|-------------|
| source code | [multilingual.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/multilingual.py) |
| jsonschema type | `object` with `additionalProperties: string` |
| mapping | [`object`](https://docs.opensearch.org/latest/field-types/supported-field-types/object/) with `dynamic: true` |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | i18n_strings (from invenio_vocabularies) |
| ui_marshmallow_field_class | (no UI transformation - returns empty dict) |

**Example:**

```yaml
title_translations:
  type: i18ndict

abstract_translations:
  type: i18ndict

subject_headings:
  type: i18ndict
```

**Valid input json example:**

```json
{
  "title_translations": {
    "en": "Machine Learning in Bioinformatics",
    "cs": "Strojové učení v bioinformatice",
    "de": "Maschinelles Lernen in der Bioinformatik"
  },
  "abstract_translations": {
    "en": "This paper presents a comprehensive survey",
    "cs": "Tento článek představuje komplexní přehled"
  },
  "subject_headings": {
    "en": "Computer Science",
    "cs": "Informatika"
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `title_translations.en:"Machine Learning"` | Search English title translations |
| `title_translations.cs:bioinformatice` | Search Czech title translations |
| `abstract_translations.en:survey` | Search English abstract translations |
| `subject_headings.*:"Computer Science"` | Search subject headings in any language |

## Date and time data types

### date

Data type for date-only values (year-month-day) without time information. Stores dates in ISO 8601 format (YYYY-MM-DD) and supports various input formats through OpenSearch's date parsing. Perfect for publication dates, birth dates, deadlines, and any date-centric information. The UI provides localized date formatting in multiple styles (long, medium, short, full) for different display contexts. Supports date range validation and efficient date-based queries, sorting, and aggregations in OpenSearch.

| Property | Description |
|----------|-------------|
| source code | [date.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/date.py) |
| jsonschema type | `string` with `format: date` |
| mapping | [`date`](https://docs.opensearch.org/latest/field-types/supported-field-types/date/) with `format: basic_date\|\|strict_date` |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Date` |
| ui_marshmallow_field_class | `marshmallow_utils.fields.FormatDate` |
| min_date | Minimum allowed date |
| max_date | Maximum allowed date |

**Example:**

```yaml
publication_date:
  type: date
  min_date: "1900-01-01"
  max_date: "2030-12-31"

embargo_end_date:
  type: date

data_collection_start:
  type: date
```

**Valid input json example:**

```json
{
  "publication_date": "2023-03-15",
  "embargo_end_date": "2024-03-15",
  "data_collection_start": "2022-06-01"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `publication_date:[2023-01-01 TO 2023-12-31]` | Search for documents published in 2023 |
| `embargo_end_date:<=2024-12-31` | Search for embargoes ending by end of 2024 |
| `data_collection_start:>=2022-01-01` | Search for data collected from 2022 onwards |
| `publication_date:"2023-03-15"` | Search for documents published on specific date |

### datetime

Data type for complete date and time information including timezone support. Stores timestamps in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) with support for various input formats including milliseconds and timezone variations. Essential for created/modified timestamps, event scheduling, logging, and any time-sensitive data. OpenSearch automatically handles timezone conversions and provides powerful time-based queries, range filtering, and time-series aggregations. The UI offers localized datetime formatting for different presentation needs.

| Property | Description |
|----------|-------------|
| source code | [date.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/date.py) |
| jsonschema type | `string` with `format: date-time` |
| mapping | [`date`](https://docs.opensearch.org/latest/field-types/supported-field-types/date/) with multiple datetime formats |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.DateTime` |
| ui_marshmallow_field_class | `marshmallow_utils.fields.FormatDatetime` |
| min_datetime | Minimum allowed datetime |
| max_datetime | Maximum allowed datetime |

**Example:**

```yaml
record_created:
  type: datetime

last_modified:
  type: datetime

submission_timestamp:
  type: datetime
  min_datetime: "2020-01-01T00:00:00Z"
```

**Valid input json example:**

```json
{
  "record_created": "2023-03-15T10:30:00Z",
  "last_modified": "2023-03-20T14:45:30.123Z",
  "submission_timestamp": "2023-03-15T09:15:22Z"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `record_created:[2023-03-15T00:00:00Z TO 2023-03-15T23:59:59Z]` | Search for records created on specific day |
| `last_modified:>=2023-03-20T00:00:00Z` | Search for records modified from specific date |
| `submission_timestamp:[2023-03-15T09:00:00Z TO 2023-03-15T10:00:00Z]` | Search for submissions in specific hour range |
| `record_created:>=now-7d` | Search for records created in last 7 days |

### time

Data type for time-only values (hours, minutes, seconds) without date information. Stores time in ISO 8601 time format (HH:MM:SS) with support for various input formats including milliseconds. Ideal for opening hours, duration timestamps, recurring event times, and any time-of-day information. OpenSearch maps this as a date field with time-specific formatting, enabling time-based queries and aggregations. The UI provides localized time formatting and supports time range validation for business rules.

| Property | Description |
|----------|-------------|
| source code | [date.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/date.py) |
| jsonschema type | `string` with `format: time` |
| mapping | [`date`](https://docs.opensearch.org/latest/field-types/supported-field-types/date/) with time formats |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Time` |
| ui_marshmallow_field_class | `marshmallow_utils.fields.FormatTime` |
| min_time | Minimum allowed time |
| max_time | Maximum allowed time |

**Example:**

```yaml
experiment_start_time:
  type: time

data_collection_time:
  type: time

embargo_lift_time:
  type: time
  min_time: "00:00:00"
  max_time: "23:59:59"
```

**Valid input json example:**

```json
{
  "experiment_start_time": "09:30:00",
  "data_collection_time": "14:15:30.500",
  "embargo_lift_time": "00:00:01"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `experiment_start_time:[09:00:00 TO 10:00:00]` | Search for experiments starting between 9-10 AM |
| `data_collection_time:>=14:00:00` | Search for afternoon data collection |
| `embargo_lift_time:"00:00:01"` | Search for embargoes lifting at midnight |
| `experiment_start_time:<12:00:00` | Search for morning experiments |

### edtf-time

Data type for Extended Date/Time Format (EDTF) supporting flexible and imprecise date/time representations. EDTF handles uncertain dates, approximate dates, date ranges, and incomplete dates commonly found in historical, cultural, or scientific contexts. Examples include "1984?", "1984~", "1984/1985", "198X". Uses cached validation for performance and supports both standard dates and EDTF-specific notations. Essential for digital humanities, archives, museums, and any domain dealing with imprecise temporal information.

| Property | Description |
|----------|-------------|
| source code | [date.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/date.py) |
| jsonschema type | `string` with `format: date-time` |
| mapping | [`date`](https://docs.opensearch.org/latest/field-types/supported-field-types/date/) with EDTF datetime formats |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow_utils.fields.edtfdatestring.EDTFDateTimeString` |
| ui_marshmallow_field_class | `marshmallow_utils.fields.FormatEDTF` |

**Example:**

```yaml
manuscript_date:
  type: edtf-time

historical_event_date:
  type: edtf-time

archaeological_dating:
  type: edtf-time
```

**Valid input json example:**

```json
{
  "manuscript_date": "1984?",
  "historical_event_date": "1945-05~",
  "archaeological_dating": "198X"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `manuscript_date:"1984?"` | Search for manuscripts with uncertain 1984 dating |
| `historical_event_date:"1945-05~"` | Search for events approximately in May 1945 |
| `archaeological_dating:198*` | Search for archaeological finds from 1980s |
| `manuscript_date:[1980 TO 1990]` | Search for manuscripts from 1980s decade |

### edtf

Data type for Extended Date/Time Format (EDTF) focused on date values without time components. Supports uncertain dates ("1984?"), approximate dates ("1984~"), date ranges ("1984/1985"), decades ("198X"), centuries ("19XX"), and other flexible date representations. Ideal for historical records, archaeological data, manuscript dating, and any scholarly work requiring nuanced temporal expressions. The implementation optimizes for common date formats while supporting the full EDTF specification for complex cases.

| Property | Description |
|----------|-------------|
| source code | [date.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/date.py) |
| jsonschema type | `string` with `format: date` |
| mapping | [`date`](https://docs.opensearch.org/latest/field-types/supported-field-types/date/) with EDTF date formats |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.String` |
| ui_marshmallow_field_class | `marshmallow_utils.fields.FormatEDTF` |

**Example:**

```yaml
artifact_dating:
  type: edtf

cultural_period:
  type: edtf

specimen_collection_date:
  type: edtf
```

**Valid input json example:**

```json
{
  "artifact_dating": "1450~",
  "cultural_period": "15XX",
  "specimen_collection_date": "2023-06?"
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `artifact_dating:"1450~"` | Search for artifacts dated approximately 1450 |
| `cultural_period:"15XX"` | Search for 15th century cultural periods |
| `specimen_collection_date:"2023-06?"` | Search for specimens possibly collected in June 2023 |
| `cultural_period:1[45]*` | Search for 14th or 15th century periods |

### edtf-interval

Data type for EDTF interval representations, specifically designed for date ranges and temporal spans. Supports complex interval notations like "1984/1985", "1984-01/1985-12", and open-ended intervals ("1984/.."). Maps to OpenSearch's `date_range` field type, enabling efficient range queries and interval-based aggregations. Perfect for project durations, historical periods, employment terms, and any time spans that may have uncertain or flexible boundaries typical in scholarly and archival contexts.

| Property | Description |
|----------|-------------|
| source code | [date.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/date.py) |
| jsonschema type | `string` with `format: date` |
| mapping | [`date_range`](https://docs.opensearch.org/latest/field-types/supported-field-types/range/) with EDTF date formats |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.String` |
| ui_marshmallow_field_class | `marshmallow_utils.fields.FormatEDTF` |

**Example:**

```yaml
research_period:
  type: edtf-interval

data_collection_period:
  type: edtf-interval

funding_period:
  type: edtf-interval
```

**Valid input json example:**

```json
{
  "research_period": "2022/2024",
  "data_collection_period": "2022-06/2023-12",
  "funding_period": "2022/.."
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `research_period:"2022/2024"` | Search for research conducted from 2022 to 2024 |
| `data_collection_period:"2022-06/2023-12"` | Search for data collected in specific period |
| `funding_period:"2022/.."` | Search for funding starting 2022 with open end |
| `research_period:[2022 TO 2025]` | Search for research periods overlapping with range |

## Composite data types

### object

Data type for structured objects with defined properties, creating nested document structures. Each object requires a `properties` definition specifying the nested fields and their types. OpenSearch stores objects as flattened structures, making them searchable but not independently queryable (use `nested` for that). Automatically generates marshmallow schemas for validation and serialization. Perfect for addresses, contact information, metadata structures, and any logical grouping of related fields. The `dynamic: strict` mapping prevents unexpected fields from being indexed.

| Property | Description |
|----------|-------------|
| source code | [collections.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/collections.py) |
| jsonschema type | `object` |
| mapping | [`object`](https://docs.opensearch.org/latest/field-types/supported-field-types/object/) with `dynamic: strict` |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Nested` |
| ui_marshmallow_field_class | `marshmallow.fields.Nested` (with UI schema) |
| properties | Dictionary of nested field definitions |
| marshmallow_schema_class | Custom Marshmallow schema class (optional) |
| ui_marshmallow_schema_class | Custom UI Marshmallow schema class (optional) |

**Example:**

```yaml
author:
  type: object
  properties:
    name:
      type: fulltext+keyword
      required: true
    orcid:
      type: keyword
    affiliation:
      type: fulltext+keyword

funding_info:
  type: object
  properties:
    agency:
      type: fulltext+keyword
    grant_number:
      type: keyword
    amount:
      type: double
```

**Valid input json example:**

```json
{
  "author": {
    "name": "Dr. Jane Smith",
    "orcid": "0000-0002-1825-0097",
    "affiliation": "Massachusetts Institute of Technology"
  },
  "funding_info": {
    "agency": "National Science Foundation",
    "grant_number": "NSF-2023-1234",
    "amount": 250000.00
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `author.name:"Jane Smith"` | Search for documents by specific author |
| `author.orcid:"0000-0002-1825-0097"` | Search by ORCID identifier |
| `author.affiliation:"Massachusetts Institute of Technology"` | Search by author affiliation |
| `funding_info.agency:"National Science Foundation"` | Search by funding agency |
| `funding_info.amount:[100000 TO 500000]` | Search by funding amount range |

### nested

Data type for nested objects that maintain their structure independently in OpenSearch, unlike regular objects which are flattened. Each nested object is indexed as a separate document, enabling complex queries that preserve the relationship between nested fields. Essential for arrays of objects where you need to query specific combinations within individual array items (e.g., "authors where role=editor AND name=Smith"). More resource-intensive than regular objects but provides powerful querying capabilities. Supports specialized nested faceting and aggregations.

| Property | Description |
|----------|-------------|
| source code | [collections.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/collections.py) |
| jsonschema type | `object` |
| mapping | [`nested`](https://docs.opensearch.org/latest/field-types/supported-field-types/nested/) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Nested` |
| ui_marshmallow_field_class | `marshmallow.fields.Nested` (with UI schema) |
| properties | Dictionary of nested field definitions |
| marshmallow_schema_class | Custom Marshmallow schema class (optional) |
| ui_marshmallow_schema_class | Custom UI Marshmallow schema class (optional) |

**Example:**

```yaml
contributors:
  type: nested
  properties:
    name:
      type: fulltext+keyword
    role:
      type: keyword
    affiliation:
      type: fulltext+keyword

measurements:
  type: nested
  properties:
    parameter:
      type: keyword
    value:
      type: double
    unit:
      type: keyword
    uncertainty:
      type: double
```

**Valid input json example:**

```json
{
  "contributors": {
    "name": "Prof. John Doe",
    "role": "supervisor",
    "affiliation": "Harvard University"
  },
  "measurements": {
    "parameter": "temperature",
    "value": 23.5,
    "unit": "celsius",
    "uncertainty": 0.1
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `contributors:(name:"John Doe" AND role:supervisor)` | Search for specific contributor with role (preserves nested relationship) |
| `measurements:(parameter:temperature AND value:[20 TO 25])` | Search for temperature measurements in range |
| `contributors.affiliation:"Harvard University"` | Search by contributor affiliation |
| `measurements:(unit:celsius AND uncertainty:<=0.5)` | Search for precise celsius measurements |

### array

Data type for ordered collections of homogeneous items, where each item must conform to the same schema defined in the `items` property. OpenSearch doesn't store arrays as a separate mapping type; instead, it inherits the mapping from the item type and stores multiple values. Supports validation for minimum/maximum item counts and uniqueness constraints. Essential for lists like tags, authors, keywords, or any repeating elements. The UI automatically handles array item management and validation for each element.

| Property | Description |
|----------|-------------|
| source code | [collections.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/collections.py) |
| jsonschema type | `array` |
| mapping | (inherits from items type) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.List` |
| ui_marshmallow_field_class | `marshmallow.fields.List` (with item UI field) |
| items | Definition of array item type |
| min_items | Minimum number of items |
| max_items | Maximum number of items |
| unique_items | Whether items must be unique |

**Example:**

```yaml
keywords:
  type: array
  items:
    type: keyword
  min_items: 1
  max_items: 50
  unique_items: true

subject_classifications:
  type: array
  items:
    type: keyword
  unique_items: true

related_identifiers:
  type: array
  items:
    type: keyword
```

**Valid input json example:**

```json
{
  "keywords": [
    "machine learning",
    "bioinformatics",
    "computational biology",
    "data analysis"
  ],
  "subject_classifications": [
    "Computer Science",
    "Biology",
    "Statistics"
  ],
  "related_identifiers": [
    "10.1038/nature12373",
    "10.1126/science.1234567",
    "arXiv:2023.1234"
  ]
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `keywords:"machine learning"` | Search for documents with specific keyword |
| `keywords:("machine learning" AND bioinformatics)` | Search for documents with multiple keywords |
| `subject_classifications:"Computer Science"` | Search by subject classification |
| `related_identifiers:"10.1038/nature12373"` | Search by related DOI identifier |
| `keywords:machine*` | Search for keywords starting with "machine" |

### dynamic-object

Data type for objects with unpredictable or variable property names, such as multilingual content keyed by language codes (e.g., {"en": "English text", "fi": "Finnish text"}). Uses a permissive schema that accepts any properties and maps to OpenSearch with `dynamic: true`, allowing arbitrary fields to be indexed automatically. Perfect for internationalization, user-defined metadata, flexible configuration objects, and any scenario where the structure cannot be predefined. No UI transformation is applied since the structure is inherently dynamic.

| Property | Description |
|----------|-------------|
| source code | [collections.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/collections.py) |
| jsonschema type | `object` with `additionalProperties: true` |
| mapping | [`object`](https://docs.opensearch.org/latest/field-types/supported-field-types/object/) with `dynamic: true` |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Nested` (with PermissiveSchema) |
| ui_marshmallow_field_class | (no UI transformation) |

**Example:**

```yaml
custom_metadata:
  type: dynamic-object

instrument_settings:
  type: dynamic-object

user_defined_fields:
  type: dynamic-object
```

**Valid input json example:**

```json
{
  "custom_metadata": {
    "experiment_id": "EXP-2023-001",
    "protocol_version": "v2.1",
    "lab_conditions": {
      "temperature": 22.5,
      "humidity": 45
    }
  },
  "instrument_settings": {
    "microscope_magnification": "40x",
    "laser_power": 75,
    "scan_speed": "medium"
  },
  "user_defined_fields": {
    "internal_code": "BIO-ML-2023",
    "project_phase": "pilot_study"
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `custom_metadata.experiment_id:"EXP-2023-001"` | Search by experiment ID |
| `custom_metadata.protocol_version:v2*` | Search by protocol version pattern |
| `instrument_settings.microscope_magnification:"40x"` | Search by instrument setting |
| `user_defined_fields.project_phase:pilot_study` | Search by user-defined field |
| `custom_metadata.lab_conditions.temperature:[20 TO 25]` | Search by nested dynamic field value |

### polymorphic

Data type for discriminated union types where a field can represent different object types based on a discriminator field (typically "type"). Each variant in the `oneof` array specifies both a discriminator value and its corresponding schema. At runtime, the discriminator field determines which schema to use for validation and serialization. OpenSearch merges all possible properties into a single object mapping. Perfect for modeling heterogeneous entities like different types of creators (person vs organization), various content types, or flexible configuration options where the structure depends on a type field.

| Property | Description |
|----------|-------------|
| source code | [polymorphic.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/polymorphic.py) |
| jsonschema type | `oneOf` with discriminator constraints |
| mapping | [`object`](https://docs.opensearch.org/latest/field-types/supported-field-types/object/) with merged properties |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | PolymorphicField |
| ui_marshmallow_field_class | PolymorphicField |
| discriminator | Field name used to determine schema variant (defaults to "type") |
| oneof | Array of schema variants with discriminator values |

**Example:**

```yaml
creator:
  type: polymorphic
  discriminator: creator_type
  oneof:
    - discriminator: person
      type: object
      properties:
        name:
          type: fulltext+keyword
        orcid:
          type: keyword
        affiliation:
          type: fulltext+keyword
    - discriminator: organization
      type: object
      properties:
        name:
          type: fulltext+keyword
        ror_id:
          type: keyword
        country:
          type: keyword

resource:
  type: polymorphic
  discriminator: resource_type
  oneof:
    - discriminator: dataset
      type: object
      properties:
        format:
          type: keyword
        size_bytes:
          type: long
    - discriminator: publication
      type: object
      properties:
        journal:
          type: fulltext+keyword
        doi:
          type: keyword
```

**Valid input json example:**

```json
{
  "creator": {
    "creator_type": "person",
    "name": "Dr. Jane Smith",
    "orcid": "0000-0002-1825-0097",
    "affiliation": "MIT"
  },
  "resource": {
    "resource_type": "dataset",
    "format": "CSV",
    "size_bytes": 1048576
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `creator.creator_type:person` | Search for resources created by persons |
| `creator.creator_type:person AND creator.name:"Jane Smith"` | Search for resources by specific person |
| `resource.resource_type:dataset` | Search for dataset resources |
| `resource.resource_type:dataset AND resource.format:CSV` | Search for CSV datasets |
| `creator.orcid:"0000-0002-1825-0097"` | Search by creator ORCID (works for person type) |

## Vocabularies and relations

### pid-relation

Data type for creating relationships between records using Persistent Identifiers (PIDs). Stores selected fields from related records locally while maintaining a reference to the source record via its PID. The `keys` property specifies which fields to cache locally (e.g., id, title), enabling efficient searches and display without requiring joins. Supports automatic resolution, caching, and updating of related record data. Essential for modeling relationships like citations, dependencies, or any cross-record references where you need both performance and data consistency.

| Property | Description |
|----------|-------------|
| source code | [relations.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/relations.py) |
| jsonschema type | `object` (inherited from ObjectDataType) |
| mapping | `object` (inherited from ObjectDataType) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Nested` |
| ui_marshmallow_field_class | `marshmallow.fields.Nested` (with UI schema from ObjectDataType) |
| keys | List of keys to include in the relation (e.g., `["id", "metadata.title"]`) |
| record_cls | Target record class (e.g., `"my_other_model.records:record"`) |
| pid_field | PID field getter function or PID field instance |
| cache_key | Optional cache key for caching the resolved record |
| relation_field_kwargs | Additional kwargs for the relation field |

**Example:**

```yaml
cited_publication:
  type: pid-relation
  keys: ["id", "metadata.title", "metadata.doi"]
  record_cls: "publications.records:PublicationRecord"

related_dataset:
  type: pid-relation
  keys: ["id", "metadata.title", "metadata.resource_type"]
  record_cls: "datasets.records:DatasetRecord"

parent_collection:
  type: pid-relation
  keys: ["id", "metadata.title"]
  record_cls: "collections.records:CollectionRecord"
```

**Valid input json example:**

```json
{
  "cited_publication": {
    "id": "pub-12345",
    "metadata": {
      "title": "Advanced Machine Learning Techniques",
      "doi": "10.1038/nature12373"
    }
  },
  "related_dataset": {
    "id": "ds-67890", 
    "metadata": {
      "title": "Bioinformatics Training Data",
      "resource_type": "dataset"
    }
  },
  "parent_collection": {
    "id": "col-11111",
    "metadata": {
      "title": "Machine Learning Research Collection"
    }
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `cited_publication.id:"pub-12345"` | Search by cited publication ID |
| `cited_publication.metadata.title:"Machine Learning"` | Search by cited publication title |
| `cited_publication.metadata.doi:"10.1038/nature12373"` | Search by cited publication DOI |
| `related_dataset.metadata.resource_type:dataset` | Search for documents with related datasets |
| `parent_collection.metadata.title:*Research*` | Search by parent collection title pattern |

### vocabulary

Data type for references to controlled vocabularies, extending pid-relation with vocabulary-specific functionality. Automatically configures appropriate fields and schemas based on the `vocabulary-type` (languages, affiliations, funders, awards, subjects). Each vocabulary type has predefined field sets (e.g., affiliations include identifiers and name fields). Provides seamless integration with Invenio's vocabulary system, automatic PID field resolution, and specialized marshmallow schemas. Essential for maintaining data consistency and enabling faceted search across standardized terms and entities.

| Property | Description |
|----------|-------------|
| source code | [vocabularies.py](https://github.com/oarepo/oarepo-model/blob/main/src/oarepo_model/datatypes/vocabularies.py) |
| jsonschema type | `object` (inherited from PIDRelation) |
| mapping | `object` (inherited from PIDRelation) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | `marshmallow.fields.Nested` |
| ui_marshmallow_field_class | `marshmallow.fields.Nested` (with UI schema from ObjectDataType) |
| vocabulary-type | Type of vocabulary (e.g., `"languages"`, `"affiliations"`, `"funders"`, `"awards"`, `"subjects"`) |
| keys | List of keys to include (auto-populated based on vocabulary type if not specified) |
| record_cls | (inherited from pid-relation, auto-determined from vocabulary-type) |
| pid_field | (inherited from pid-relation, auto-determined from vocabulary-type) |
| cache_key | (inherited from pid-relation, defaults to vocabulary-type if not specified) |

**Example:**

```yaml
language:
  type: vocabulary
  vocabulary-type: languages

author_affiliation:
  type: vocabulary  
  vocabulary-type: affiliations

research_subject:
  type: vocabulary
  vocabulary-type: subjects

funding_agency:
  type: vocabulary
  vocabulary-type: funders

related_award:
  type: vocabulary
  vocabulary-type: awards
```

**Valid input json example:**

```json
{
  "language": {
    "id": "eng",
    "title": {
      "en": "English",
      "cs": "Angličtina"
    }
  },
  "author_affiliation": {
    "id": "mit",
    "title": {
      "en": "Massachusetts Institute of Technology"
    },
    "identifiers": {
      "ror": "042nb2s44"
    }
  },
  "research_subject": {
    "id": "computer-science",
    "title": {
      "en": "Computer Science"
    }
  },
  "funding_agency": {
    "id": "nsf",
    "title": {
      "en": "National Science Foundation"
    }
  },
  "related_award": {
    "id": "nsf-2023-1234",
    "title": {
      "en": "Machine Learning for Scientific Discovery"
    }
  }
}
```

**Sample search queries:**

| Query | Description |
|-------|-------------|
| `language.id:eng` | Search for English language documents |
| `author_affiliation.id:mit` | Search by affiliation ID |
| `author_affiliation.title.en:"Massachusetts Institute of Technology"` | Search by affiliation name |
| `author_affiliation.identifiers.ror:"042nb2s44"` | Search by ROR identifier |
| `research_subject.title.en:"Computer Science"` | Search by subject title |
| `funding_agency.id:nsf AND related_award.id:nsf*` | Search for NSF funding and awards |

<!-- Template 

## Data type category (primitive, composite, vocabularies and relations, special)

### <Data type name, inside TYPE class attribute>

<description from docstring>

| Property | Description |
|----------|-------------|
| jsonschema type | <jsonschema type> |
| mapping | [opensearch mapping type](link to opensearch documentation for the type) |

| Property in YAML schema | Description |
|------------------------|-------------|
| marshmallow_field_class | <marshmallow_field_class property or create_marshmallow_field function> |
| ui_marshmallow_field_class | <UI marshmallow field class, if different from the above - look at create_ui_marshmallow_fields> |
| other specific properties, such as validation rules | description |

Take all the values from the source code, do not add any extra ones.

-->