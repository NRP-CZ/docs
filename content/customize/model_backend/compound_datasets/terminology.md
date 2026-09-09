
## Terminology

Alphabetical list of terms

| Term | Meaning |
| --- | --- |
| Community | A group that a record can belong to via `parent.communities`. Membership lets community members discover and access the record (subject to its access settings) and lets community curators manage the record's publication/inclusion. |
| Compound Dataset | A single logical research object that is physically split into multiple linked records - one CompoundRecord plus its PartRecords - which share one publication lifecycle and must be published and updated together. |
| Compound-dataset composition | The set of PartRecords, and more precisely PartRecord versions, that belong to a given CompoundRecord version. |
| CompoundRecord | The concrete main record/version that governs the publication lifecycle and composition of its PartRecords in the compound dataset. The term is also used for the compound dataset as a whole when the context is clear. |
| CompoundRecord RDM parent | The RDM parent of the record that acts as the CompoundRecord; in other words, the all-versions layer of that CompoundRecord. |
| Default community | The community designated as the primary/representative one for a record that belongs to multiple communities, stored as `parent.communities.default`. It is used, for example, to choose the branding shown on the record's landing page and to determine which review policy applies. Not explicitly set when a record belongs to only one community. |
| External PID | An externally meaningful persistent identifier such as a DOI, ARK, or Handle/ePIC-style identifier. |
| Internal PID | The repository-internal persistent identifier. In InvenioRDM, `id` identifies one specific record version and `parent.id` identifies the corresponding RDM parent. |
| Model | A metadata schema together with its configuration, including configuration of supported persistent identifier types. |
| part_of | The API field on a PartRecord that links it to the CompoundRecord version(s) it belongs to. It is an array of URLs rather than a single value, since the same PartRecord version can be part of more than one CompoundRecord version. |
| PartRecord | The concrete part-side record/version participating in a compound structure. |
| PartRecord RDM parent | The RDM parent of the record that acts as a PartRecord; in other words, the all-versions layer of that PartRecord. |
| PartRecord-publication status | Status information carried by the CompoundRecord, especially while it is in `publishing`, to show whether PartRecord publication is pending, in progress, completed, or failed. A `failed` status corresponds to the affected PartRecord being in the `publication_error` state. |
| PartRecordMembership | The database table recording the relationship between a PartRecord and a CompoundRecord, including its status (`I` for included, `PE` for pending exclusion, `PI` for pending inclusion). |
| Preset | A reusable bundle of model components (e.g. `compound_part_preset`, `compound_record_preset`) that, when included in a model's configuration, gives that model the behavior needed to act as a PartRecord or CompoundRecord. |
| Publication error | A workflow state entered when background publication of a PartRecord fails. The affected PartRecord moves to `publication_error`, and the CompoundRecord moves to `publication_error` as well. There is no automatic retry; an administrator must use a CLI tool to move the affected PartRecord(s) and the CompoundRecord back to `revision_requested` before publication can be retried. |
| Publishing | A workflow state used during compound publication. For a CompoundRecord, it means curator approval has happened and background PartRecord publication is still pending or running. For a PartRecord, it means CompoundRecord-triggered publication has been requested and the background workflow still needs to publish that PartRecord. |
| Publishing (process) | Converting draft version of a record into a published version. "Publish" does not mean open freely - it means that the record is finalized. It's access rights then say if it is open or restricted on metadata or files. |
| RDM parent | The all-versions layer of a single InvenioRDM record. In InvenioRDM, that layer is implemented as an `RDMParent` class and serialized under `parent`. |
| RDM-parent DOI | The DOI carried by the RDM parent across versions. In InvenioRDM serialization, this is implemented as `parent.pids.doi`. |
| Record | A normal InvenioRDM record: a publishable unit with its own metadata and, optionally, files. |
| Record version | One exact citable version of a record, with fixed files and version-specific relationships; limited non-versioning metadata corrections may still be possible if the repository allows them. |
| Revision ID | The internal counter tracking changes made to a single record version, serialized as `revision_id`. Distinct from Version index: repeatedly saving a draft increases `revision_id` each time, while the version index stays the same until a new version is actually created. |
| Version DOI | The DOI for one exact record version. |
| Version index | The numeric position of a record version among the versions sharing the same RDM parent, serialized as `versions.index`. Distinct from Revision ID, which tracks changes within one version rather than position across versions. |
| Version-specific association | An association in which a specific CompoundRecord version is linked with specific PartRecord versions, not just with PartRecords in general across all versions. |
