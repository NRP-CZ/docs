# Recommended documentation changes: `customize/model_backend`

Source checked: `oarepo-model` at `/Users/m/Workspaces/oarepo-libs/feat-geo/oarepo-model`
(branch `review-tests`, HEAD `ac0370a`).
Docs checked: `content/customize/model_backend/*` (the `compound_datasets/` proposal was not reviewed).

Findings marked **[verified]** were confirmed by running the code in the repo's `.venv`.
The rest come from reading the source.

---

## 1. High priority: the docs are wrong, and following them fails

> **Status:** 1.1–1.6 are fixed in the docs (`model_reference.md`, `search.mdx`). The maintainers confirmed the
> implementation is correct, so the "possible code bug" notes in 1.2 and the "or fix the code" option in 1.6 are
> dropped. 1.7 and 1.8 are fixed (`permissions.mdx` and `custom_fields.mdx` rewritten).

### 1.1 `model_reference.md`: the `pid-relation` example does not build **[verified]**

The example uses only `record_cls` and non-`id` keys:

```yaml
cited_publication:
  type: pid-relation
  keys: ["id", "metadata.title", "metadata.doi"]
  record_cls: "publications.records:PublicationRecord"
```

`PIDRelation._get_properties` (`datatypes/relations.py:112`) resolves each key against the
target model's schema. The target model is found through the `model` property. Without `model`, any key
other than `id`/`@v` raises an error when the model is built:

```
KeyError: Model name is not available, cannot determine target properties for 'metadata.title'.
Either provide model or define the props explicitly.
```

**Change:**
- Add a `model` row to the pid-relation property table: "Name of the target model (as registered). Used to look up
  the definitions of `keys` in the target's schema."
- Document that `keys` entries can be either a plain string (looked up in `model`) or a single-key mapping
  `"<dotted.path>": {<type definition>}` (an explicit definition). This form is currently documented only for
  lazy-pid-relation.
- Fix all three examples. Either add `model: publications` or use explicit definitions, e.g.
  ```yaml
  keys:
    - id
    - metadata.title: {type: fulltext+keyword}
    - metadata.doi: {type: keyword}
  ```
- Add the constraint from the class docstring: the target must be a **published** record. Draft-only targets are
  rejected with `InvalidRelationValue`.

### 1.2 `model_reference.md`: most EDTF examples fail validation **[verified]**

The validators accept only `edtf.Date` / `edtf.DateAndTime` / `edtf.Interval` (`datatypes/date.py:381,401,420,434`).
Uncertain/approximate values (`?`, `~`) and open intervals parse to other EDTF classes and are **rejected**.
I checked every example value against the configured validators:

| Doc example | Type in docs | Result |
|---|---|---|
| `1984?`, `1945-05~`, `2023-06?`, `1450~` | edtf / edtf-time | **rejected** |
| `198X`, `15XX` | edtf / edtf-time | accepted by the validator, but see the mapping note below |
| `1984/1985` described as supported by `edtf-time`/`edtf` | edtf-time / edtf | **rejected** (intervals are not Date) |
| `2022/..`, `1984-01/..`, `..1985` | edtf-interval / edtf-date-or-interval | **rejected** |
| `2022/2024`, `2022-06/2023-12`, `1984-06/1985` | interval types | accepted |

**Change:**
- Rewrite the `edtf`, `edtf-time`, `edtf-interval` and `edtf-date-or-interval` descriptions. Say that only
  plain (level-0-like) dates, `X`-unspecified digits, and closed intervals are accepted, and that qualifiers
  (`?`, `~`, `%`) and open/unknown ends are not.
- Replace the example JSON and sample-query tables with values that are actually accepted.
- In the `edtf-date-or-interval` intro, remove `"1984-01/.."` and `"..1985"` from the list of accepted notations.

**Also check with the maintainers (possible code bug rather than a docs issue):**
- `edtf` / `edtf-time` map to an OpenSearch `date` with formats `strict_date||yyyy-MM||yyyy`. `198X`/`15XX`
  pass marshmallow validation but can't be parsed by that date format. Indexing will probably fail unless
  `ignore_malformed` is set somewhere.
- `edtf-interval` maps to `date_range`, but no dumper converts the string `"2022/2024"` into `{gte, lte}`. Only
  `edtf-date-or-interval` has one (`EDTFDateRangeDumperExt`). A string value in a `date_range` field will
  probably be rejected by OpenSearch. If that's confirmed, the docs should steer users to `edtf-date-or-interval`.

### 1.3 `search.mdx`: customizations are shown in the wrong place

`search.mdx` says: "Add these customizations in your model's `model/model_config.py`" and shows
`class ModelConfig: customizations = [...]`. No such mechanism exists. Customizations are passed to
`oarepo_model.api.model(..., customizations=[...])` in the model's `model.py` (`api.py:146`).
`exports_and_imports.mdx` already shows this correctly.

**Change:** replace the first example with the `model(..., customizations=[...])` form. Fix the second example's
filename label too (`datasets/model.py` shows a bare `customizations = [...]` list).

### 1.4 `search.mdx`: the `PatchIndexSettings` analyzer example is invalid OpenSearch settings

The example puts analyzers directly under `analysis` and `tokenizer` at the top level:

```python
PatchIndexSettings({
    "analysis": {"people_analyzer": {...}, "asciifolded_people_analyzer": {...}},
    "tokenizer": {"people_tokenizer": {...}},
})
```

OpenSearch expects `analysis.analyzer.<name>` and `analysis.tokenizer.<name>`, and custom analyzers need
`"type": "custom"`. Also, `PatchIndexSettings` merges only one level deep
(`index_settings.py:22-40`: a dict value is `update()`d, not deep-merged). A second `PatchIndexSettings` that also
sets `analysis` will therefore overwrite `analysis.analyzer` completely.

**Change:**
```python
PatchIndexSettings({
    "analysis": {
        "analyzer": {
            "people_analyzer": {"type": "custom", "tokenizer": "people_tokenizer"},
            "asciifolded_people_analyzer": {
                "type": "custom", "tokenizer": "people_tokenizer", "filter": ["asciifolding"],
            },
        },
        "tokenizer": {
            "people_tokenizer": {"type": "pattern", "pattern": "\\s*[,.]\\s*"},
        },
    },
})
```
Also add a note about the shallow merge.

### 1.5 `search.mdx`: the "Adding Facet to a Field" YAML uses a key that does not exist

```yaml
publishers:
  type: vocabulary
  vocabulary-type: institutions
  facets:
    aggregation: publisherfacet
```

`facets:` is not read anywhere. The real controls (`datatypes/base.py:337-347`) are:
- facets are generated **by default** for keyword, fulltext+keyword (on `.keyword`), numbers, boolean,
  date/datetime/time/edtf/edtf-time, and vocabulary (on `.id`, with `VocabularyLabels`);
- `searchable: false` turns the facet off for a field (the name is misleading: the field stays searchable);
- `facet-def: {facet: <class path>, field: <path>, label: ..., ...}` replaces the generated facet definition;
- the field's `label` is used as the facet label.

The sentence "the datatype must implement the `get_facet()` method" is aimed at people writing datatypes, not model
authors. Move it to an "advanced" note.

**Change:** rewrite the section around `searchable` / `facet-def`, and list which types produce facets and which
don't: fulltext, i18n/multilingual sub-fields, polymorphic, pid-/lazy-/internal-relation keys, and
edtf-interval / edtf-date-or-interval.

### 1.6 `model_reference.md`: `marshmallow_validate` is ignored for `geo_shape` / `icrs_shape` **[verified]**

`GeoShapeDataType._get_marshmallow_field_args` sets `args["validate"] = validate_geo_shape`
(`datatypes/spherical.py:145`), which **replaces** any user validators. The reference lists
`marshmallow_validate` as supported for both types.

**Change:** remove that row from `geo_shape` and `icrs_shape`, or (better) fix the code to append to the list.
Then remove the sentence in "Custom validators" saying that it applies to "every data type listed in this reference".

### 1.7 `permissions.mdx`: describes the RDM 12 mechanism, which oarepo-model no longer has

oarepo-model has no `XXXXX_PERMISSIONS_PRESETS` handling. The model's policy is the `PermissionPolicy` class.
It defaults to `oarepo_runtime.services.config.EveryonePermissionPolicy`
(`presets/records_resources/services/records/permission_policy.py`) and is replaced with
`SetPermissionPolicy(policy_cls, keep_mixins=False)`.

**Change:** replace the "Pre-defined permission presets" section with `SetPermissionPolicy` usage, and warn that
the out-of-the-box default is "everyone can do everything" unless a workflow/RDM layer overrides it. Link to the
workflows docs if that's where NRP actually sets permissions. The "Custom permission policy" and "Custom permission
checkers" sections are still valid Invenio, but the example should be passed via `SetPermissionPolicy`.

### 1.8 `custom_fields.mdx`: RDM 12 content

oarepo-model now has `presets.custom_fields.custom_fields_preset`. The configuration key is
`<MODEL_UPPERCASE_NAME>_CUSTOM_FIELDS` (`presets/custom_fields/services/schema.py:43`; the uppercase name
can be overridden with `configuration={"uppercase_name": ...}`), not `DATA_CF` / `DOCUMENTS_CF` / `DATACITE_CF`.
The mapping adds `custom_fields` as a `dynamic: true` object.

**Change:** rewrite the "Configuration" section for the new key and preset. The UI parts (`*_CF_UI`, `ComplexCF`,
widgets, JinjaX overrides) live in oarepo-ui and can't be checked against oarepo-model; check them there or mark
them as legacy. The `nr-data` / `nr-documents` schema names are also RDM 12-era.

---

## 2. Medium priority: inaccurate or misleading details

### `model_reference.md`

> **Status:** all rows below are fixed in `model_reference.md`. The lazy-pid-relation and internal-relation facet
> sentences were corrected too (keys with an explicit definition do get facets).

| Section | Current text | Actual behaviour | Source |
|---|---|---|---|
| int / long | "Use `strict_validation` to ensure the input is exactly an integer" (sounds opt-in) | `strict_validation` **defaults to `true`**: `"5"` and `5.0` are rejected unless you set `strict_validation: false` **[verified]** | `numbers.py:84` |
| float / double | `strict_validation`: "Make sure that the value is exactly a float, not a string" | No effect: `"5"` is accepted either way **[verified]**. Remove the row, or document that strings are coerced | `numbers.py:84` |
| int / long / float | – | Implicit range validation against the 32-/64-bit / float32 limits is always added. Worth one sentence | `numbers.py:85-91` |
| boolean | "true/false values" | Only JSON `true`/`false` (and `1`/`0`) are accepted, and the string `"true"` is rejected **[verified]**. The UI field is emitted as a separate `<field>_i18n` key, not in place of the original | `boolean.py:51,61-62` |
| keyword | "Limited to 256 characters by default (`ignore_above: 256`)" | `ignore_above` doesn't limit the value. Longer values are stored but not indexed or aggregated. Use `max_length` for a real limit | `strings.py:29-34` |
| keyword / fulltext / fulltext+keyword | – | `required: true` without `min_length` also adds `Length(min=1)`, so empty strings are rejected | `strings.py:50-52` |
| fulltext | "cannot be used efficiently for sorting or aggregations" | More precisely: no facet is generated at all | `strings.py:93-112` |
| date / datetime / time | "The UI provides localized formatting…" | Say where: the UI schema emits `<field>_l10n_long/_medium/_short/_full` (as the edtf-date-or-interval section already does) | `date.py:88-107` |
| multilingual | "The item type is fixed" | `items` defaults to `{type: i18n}` but **can** be overridden | `multilingual.py:47-52` |
| polymorphic | – | Add: no facets are generated for polymorphic fields, relations inside variants are not discovered (no `create_relations`), the discriminator is automatically added to the mapping as `keyword` and to JSON Schema as a required `const`, and `marshmallow_field` is supported | `polymorphic.py` |
| polymorphic | "discriminator … (defaults to "type")" | Correct. But note that `oneof[].type` can be `object` with inline `properties` **or** the name of a named type (e.g. `Person`) | `polymorphic.py:103-114` |
| geo_point / icrs | – | lat/lon (ra/dec) have no range validation. Only the `{lat, lon}` / `{ra, dec}` object form is accepted, not the other OpenSearch geo_point forms (string, array, geohash) | `spherical.py:103-108,213-218` |
| geo_point / geo_shape / icrs / icrs_shape sample queries | Listed in the "Sample search queries" tables as if they were `q=` syntax | They are **URL query-string parameters** (`?geo_distance:metadata.location=[…]`), read by extra `ParamInterpreter`s and not by the query parser. Say this explicitly, e.g. `GET /api/<model>?geo_distance:metadata.location=[14.42,50.08,10km]` | `params/spherical.py:143-185` |
| geo_point / geo_shape | "A place name … is resolved via OpenStreetMap Nominatim" | Add the config keys `NOMINATIM_USER_AGENT` and `NOMINATIM_MIN_DELAY_SECONDS` (default 1 s). Also note that this calls the public Nominatim service from the server (privacy/rate limits: production should set its own user agent or instance) | `params/spherical.py:41-66` |
| vocabulary | "vocabulary-type … (e.g., languages, affiliations, funders, awards, subjects)" | Any vocabulary type works. `affiliations`, `funders`, `awards` and `subjects` get specialized schemas and keys. All others are "generic", with default key `title` (i18ndict) and a UI of `{id, title_l10n}` (`VocabularyL10Schema`). The facet is on `<field>.id` | `vocabularies.py:36,104-115,166-186,207-280` |
| vocabulary | `pid_field`/`record_cls` "inherited from pid-relation, auto-determined" | Both are **ignored**: `_relation_pid_field` is overridden. Remove the rows or say "not configurable" | `vocabularies.py:126-155` |
| i18n / multilingual | "Sub-fields are searchable but intentionally not exposed as facets" | Correct. Could add that this is done with `searchable: false` on `lang` and `value` in the built-in `i18n` definition, which is a good example of the flag | `entrypoints.py:74-84` |

### `search.mdx`

> **Status:** fixed. Also fixed while there: the callout used a `mapping:` YAML property on a field, which the
> datatypes ignore; it now uses `PatchIndexPropertyMapping`.

- The base mapping JSON shows `"version_id": {"type": "integer"}`. The code uses `long` (`record_mapping.py`).
- The "Available Search Customizations" table is missing `PatchIndexMapping(mapping)` (whole-mapping deep merge).
  `AddFacetGroup` also has a keyword-only `draft_facets` argument (omitted → drafts inherit `facets`; `[]` → no
  facets on the drafts search).
- Add a short "Geo search" subsection: the `GeoPreset` registers `geo_distance:`, `geo_bounding_box:`,
  `geo_shape:`, `icrs_distance:`, `icrs_bounding_box:` and `icrs_shape:` interpreters. Also mention
  `AddParamInterpreterCls(cls)` for adding your own search parameters. These run *before* the facets interpreter
  (`search_options.py: resolve_params_interpreters`).
- "How Facets Are Generated" / "How Mappings Are Generated" are accurate but describe internals. Consider moving
  them below the user-facing sections or folding them into a collapsible "Internals" block.

### `exports_and_imports.mdx`

> **Status:** fixed.

- `AddMetadataExport` also takes `about_serializer`, `display` (default `True`; `False` hides it in the UI), and
  `oai_metadata_prefix` / `oai_schema` / `oai_namespace` (all three are required for the format to be offered over
  OAI-PMH). Document these.
- The import section is still "TODO". It can now be written from `AddMetadataImport(code, name, mimetype,
  deserializer, description, oai_name=None)`:
  - the deserializer is a `flask_resources` `DeserializerMixin` (implements `deserialize(data)`);
  - imports are registered as `request_body_parsers` keyed by `mimetype` (`resource_config.py:67,98-120`), so a
    client selects the format by sending that `Content-Type` on create/update;
  - a default `json` import (`application/json`) is always registered by `ImportsPreset`;
  - `description` is **required** (no default) and extra kwargs are silently ignored.
- The link `[model customization guide](./model.md)` points to a non-existent `.md` file (the page is `model.mdx`).
  Use `/customize/model_backend/model`.

### `model.mdx`

> **Status:** fixed. Also added a "Reusing named types" section, which covers item 3.3.

- "Organizing with multiple YAML files" has no example. Show the real mechanism:
  `from oarepo_model.datatypes.registry import from_yaml` and
  `model(..., types=[from_yaml("metadata.yaml", __file__), from_yaml("other.yaml", __file__)], metadata_type="Metadata")`.
  Both the dict form and the list-of-`{name: ...}` form are accepted (`registry.py:142-195`).
- Links `./model_reference.md` and `../model_ui/deposit.mdx` use file extensions. Per the repo's CLAUDE.md,
  use root-relative paths without extensions (`/customize/model_backend/model_reference`,
  `/customize/model_ui/deposit`).

---

## 3. Missing documentation (features in the code with no docs)

> **Status:** all fixed. 3.1, 3.2 and 3.4 are new sections at the top of `model_reference.md`; 3.3 is
> "Reusing named types" in `model.mdx`; 3.5 is the new `customizations.mdx` page (added to `_meta.js`);
> 3.6 is the "Presets" section in `model.mdx`.

1. **Common properties valid on every type.** There's no section for these; add one near the top of
   `model_reference.md`:
   - `required`, `allow_none`, `dump_only`, `load_only` (passed straight to marshmallow, `base.py:182-189`)
   - `label`, `help`, `hint` (multilingual dicts; used in the UI model and as the facet label)
   - `input` (overrides the UI input type, default = datatype name)
   - `searchable: false` (turns off the facet), `facet-def` (custom facet)
   - `marshmallow_field` (a ready-made field *instance*) vs `marshmallow_field_class` (a class)
   - `ui_marshmallow_field_class` (a class used for UI serialization). The per-type tables list this row as if it
     were a fixed value; it's a user-overridable property with the listed class as the default. Say so once in the
     intro.
   - `ui_marshmallow_field` (object/array: a ready-made UI field instance), `skip_marshmallow` (property is
     mapping/JSON-schema only)
2. **YAML shortcuts** (`registry.py:88-107`, `get_type`):
   - a property name ending in `[]` is shorthand for an array: `keywords[]: {type: keyword}`
   - `type` can be omitted: an element with `properties` is an `object`, one with `items` is an `array`
3. **Named/reusable types** (`WrappedDataType`). `model.mdx` uses `Warranty` without explaining that any top-level
   name in the types file becomes a type, and that properties given at the usage site (label, required, …) are
   deep-merged over the named type's definition.
4. **Unknown fields are rejected.** Generated object schemas use `unknown = RAISE`, and mappings are
   `dynamic: strict`. A short note helps users understand the "Unknown field" errors.
5. **Other high-level customizations** exported from `oarepo_model.customizations` with no docs page:
   `AddServiceComponent(cls)`, `SetSyntheticMetadata(**fns)`, `AddPIDRelation(...)`, `PatchIndexMapping`,
   `AddLink(name, link)` (exported only from `customizations.high_level`), and the low-level `AddClass` /
   `PrependMixin` / `AddToList` / … listed in the oarepo-model README. A "Customizations reference" page
   (or a link to the README table) would cover this.
6. **Internal relations preset.** `internal-relation` mentions `internal_relations_preset`, but no page shows how
   to add a preset to `model(presets=[...])`. A short "Presets" section in `model.mdx` (records_resources,
   drafts, relations, internal_relations, custom_fields, ui, ui_links) would help.

---

## 4. Source-link caveat

`model_reference.md` links every type to `github.com/oarepo/oarepo-model/blob/main/...`. `spherical.py`,
`lazy_relations.py`, `internal_relations.py`, the multilingual rework and the geo params were read from the
`feat-geo` worktree. Check that they are on `main` before publishing, or those links will 404.

---

## 5. Code issues found while cross-checking (for the oarepo-model maintainers, not the docs)

- **Unusable facets on geo fields [verified]:** `geo_point` and `icrs` inherit `ObjectDataType.get_facet` and
  produce terms facets `…lat`, `…lon`, `…ra`, `…dec`. Those sub-fields don't exist in a `geo_point` mapping.
- **`geo_shape` / `icrs_shape` ignore `marshmallow_validate` [verified]** (see 1.6).
- **`strict_validation` is passed to `Float`**, which doesn't support it (see §2). It's a no-op at best.
- **`edtf` / `edtf-time` / `edtf-interval` mappings vs. accepted values** (see 1.2): possible indexing failures.
- The `LazyPIDRelation` docstring shows `type: recursive-pid-relation`; the registered name is `lazy-pid-relation`.
