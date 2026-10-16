# InvenioRDM records

## Invenio RDM record structure 

In InvenioRDM, a record is a publishable unit with its own metadata and, optionally, associated files. The metadata are stored as a JSON document following the RDM record schema.

A generic structure of RDM record reads as:

```json
{
  "id": "82kn8-3nk04",

  "metadata": {...},
  "files": {...},
  "pids": {...},
  "links": {...},

  "parent": {...},
  "versions": {...},
  "access": {...},


  "created": "2026-08-08T06:06:58.934643+00:00",
  "updated": "2026-08-08T06:06:59.075462+00:00",
  "revision_id": 4,
  "is_published": true,
  "is_draft": false,
  "stats": {...}
}
```

This JSON is the API representation of **one record version**. For a reader who is new to InvenioRDM, the top-level fields can be understood as follows:

**Core record content**
- `id` - the identifier of this specific record version.
- `metadata` - the descriptive metadata of the resource, such as title, creators, publication date, and resource type.
- `files` - information about files attached to this record version.
- `pids` - persistent identifiers attached to this version, such as a DOI.
- `links` - API and UI links related to this record, such as self links, version links, file links, or actions. Clients should look up the needed link here instead of constructing URLs from the record identifier.

**Versioning context**
- `parent` - information about the **parent record**. Parent record is a database record that groups all versions of the same resource. The parent record is created automatically when the first draft of a record is created. More details on it below.
- `versions` - state about this version relative to its RDM parent, such as whether this is the latest version and what its version index is.

**Access settings**
- `access` - access and visibility settings for the record and, where relevant, its files.

**Administrative information**
- `created`, `updated` - timestamps for when this version was created and last updated.
- `revision_id` - the internal revision number of this record version. This tracks changes to the same version; it is not the same thing as the version index. For example, saving a draft several times before publishing increases `revision_id` on each save, while the version index (`versions.index`, see below) stays the same until a new version is actually created.

**Publication state**
- `is_published`, `is_draft` - flags telling you whether this JSON represents a published record or a draft.

**Usage statistics**
- `stats` - usage statistics or other counters shown for the record, if enabled.

In short: `metadata` describes the resource, `files` contains the attached content, `pids` contains stable identifiers, and `parent` plus `versions` place this record inside its version history.

### Core record content

#### Metadata

The `metadata` object contains the descriptive metadata of the resource. In plain InvenioRDM, this usually includes fields such as title, creators, publication date, and resource type. In CESNET Invenio, however, the repository may use a custom metadata schema, so it is safest to think of `metadata` primarily as a JSON object carrying the repository's descriptive metadata, not necessarily the default RDM field set.

If the repository mints or registers DOIs, some metadata still needs to be present somewhere in the record so that DOI registration can be completed, but in a customized installation those values do not have to live in the standard RDM locations.

For the standard InvenioRDM metadata model, see the official documentation: [InvenioRDM metadata reference](https://inveniordm.docs.cern.ch/reference/metadata/).

#### Files

The `files` object describes the digital files attached to this specific record version. At minimum, it says whether files are enabled for the record. If files are present, it may also contain UI-oriented information such as the default preview file and display order, and per-file information such as filename, MIME type, size, and upload status.

A record may also be metadata-only, in which case files are disabled or absent. In the public REST API, detailed file entries are often accessed through the dedicated `/files` endpoint rather than embedded directly in the main record JSON.

Example of a file section:


```json
{
  "files": {
    "enabled": true,
    "count": 1,
    "total_bytes": 36871,
    "entries": {
      "transect_2026-08-08_station-17.csv": {
        "key": "transect_2026-08-08_station-17.csv",
        "mimetype": "text/csv",
        "size": 36871,
        "checksum": "md5:5571e93aad9b22d36f048449d5dc9178",
        "access": {
          "hidden": false
        },
        "links": {
          "self": "https://repo.example/api/records/82kn8-3nk04/files/transect_2026-08-08_station-17.csv",
          "content": "https://repo.example/api/records/82kn8-3nk04/files/transect_2026-08-08_station-17.csv/content"
        }
      }
    }
  }
}
```

Note: in the public REST API, the record JSON and the file-list JSON are often retrieved separately: `GET /api/records/{id}` returns the record, while `GET /api/records/{id}/files` returns the detailed file entries.

#### PIDs

The `pids` object stores system-managed persistent identifiers for this specific record version. Typical examples are a DOI and an OAI identifier. Each PID type appears under its own key, such as `doi` or `oai`, and normally contains the identifier value plus information about the provider that manages it.

This top-level `pids` object belongs to the current record version. Identifiers that belong to the dataset across all versions are stored separately under `parent.pids`.

Example of a `pids` section:

```json
{
  "pids": {
    "doi": {
      "identifier": "10.81088/82kn8-3nk04",
      "provider": "datacite",
      "client": "datacite"
    },
    "oai": {
      "identifier": "oai:repo.example:82kn8-3nk04",
      "provider": "oai"
    }
  }
}
```

#### Links

The `links` object contains the URLs that clients should use to navigate to related API resources and UI pages for this record. Typical entries include links to the record itself, its landing page, its files, its versions, its draft, access-management endpoints, or record actions.

A practical point is that clients should **not invent these URLs** from the record identifier. Instead, they should read the `links` object and follow the appropriate key such as `self`, `files`, `versions`, or `draft`. This follows normal REST-style API usage and avoids hard-coding URL patterns that may differ between deployments.

Example of a `links` section:

```json
{
  "links": {
    "self": "https://repo.example/api/records/82kn8-3nk04",
    "self_html": "https://repo.example/records/82kn8-3nk04",
    "files": "https://repo.example/api/records/82kn8-3nk04/files",
    "versions": "https://repo.example/api/records/82kn8-3nk04/versions",
    "draft": "https://repo.example/api/records/82kn8-3nk04/draft"
  }
}
```

### Versioning

InvenioRDM distinguishes between **a resource across time** and **one concrete published version** of that resource.

All versions of the same resource share the same RDM parent. In practice this means that one published record version has its own metadata, files, and version-level identifiers, while shared administrative information about the dataset across versions is kept separately. The later sections on communities, publication, review, and PID handling build on this distinction.

> **Important:** If you need to replace, update, or change any file in a published record, you **must create a new version**. You cannot overwrite or modify the files of an already published record directly. The workflow is:
> 1. Create a new version from the published record.
> 2. Upload the replacement files to the new draft version.
> 3. Publish the new version.

#### Parent

The `parent` object represents the record **across all its versions**. Every version of the same resource points to the same `parent.id`.

This is the place for information that belongs to the dataset as a whole rather than to one specific published version. In standard InvenioRDM, that includes at least parent-level access/ownership information, and in practice it may also be the place where community relations, review requests, or parent-level persistent identifiers are attached.

An important point is that the parent record does not contain any user-defined metadata - it is only used for administrative purposes to group all versions of the same dataset together.

Example of a `parent` section:

```json
{
  "parent": {
    "id": "vpk04-jtc95",
    "access": {
      "owned_by": {
        "user": "3"
      }
    },
    "pids": {
      "doi": {
        "identifier": "10.81088/vpk04-jtc95",
        "provider": "datacite",
        "client": "datacite"
      }
    }
  }
}
```

Think of it this way: the **record object itself** (the JSON structure outlined above) represents **one specific snapshot**, while `parent` links all those snapshots together into a single, evolving dataset.

#### Versions

The `versions` object gives this version's state relative to its RDM parent, i.e. relative to the other versions of the same resource. It tells you where this version sits inside its version history.

The most important fields are:
- `index` - the numeric version index assigned among the versions sharing this RDM parent. This is a different counter from `revision_id` above: `index` counts versions under the same RDM parent, while `revision_id` counts revisions within one version.
- `is_latest` - whether this is currently the latest published version.
- `is_latest_draft` - whether this record belongs to the latest draft-side state known for this RDM parent.

Example of a `versions` section:

```json
{
  "versions": {
    "is_latest": true,
    "is_latest_draft": true,
    "index": 1
  }
}
```

In practice, clients often use `is_latest` to distinguish the newest published version from older ones, while `index` provides a stable version number inside the family.

#### Communities

A record can belong to one or more communities. When a record is part of multiple communities, InvenioRDM supports the concept of a **default (or primary) community**.

**Default community**

The default community is the "main" community associated with a record. It is stored on the RDM parent object as `parent.communities.default`. This community is used in situations where the system needs to pick one community as the representative context for the record, such as:

- **Branding**: When a record landing page is accessed through a global search or via its DOI (rather than through a specific community's browse page), the default community's branding (logo, colors, name) is shown.
- **Review workflows**: The review request is often associated with the default community. Custom review policies may also check the default community to decide whether a review is required.

A record only has a default community when it belongs to **multiple communities**. If a record belongs to just one community, that community is effectively the default by necessity, but the `default` field may not be explicitly set.

**Other (non-default) communities**

A record can be a member of additional communities beyond the default one. These are stored in the parent record's communities list but are not marked as `default`. They serve the same functional purpose as the default community in terms of:

- Allowing members of that community to discover and access the record (subject to the record's access settings).
- Enabling curators of that community to manage the record's inclusion (accept/decline requests, remove the record).

**API representation**

In the API, community membership appears under `parent.communities`. The structure uses:

- `ids`: A list of community UUIDs the record belongs to.
- `default`: The UUID of the default community (a string, not an object). This points to one of the IDs in the `ids` list.
- `entries`: A list of full community objects with metadata like title, slug, access settings, etc.

Example from a real record:

```json
{
  "parent": {
    "id": "vpk04-jtc95",
    "communities": {
      "ids": ["46225355-51d9-4dab-a53b-308852190b49"],
      "default": "46225355-51d9-4dab-a53b-308852190b49",
      "entries": [
        {
          "id": "46225355-51d9-4dab-a53b-308852190b49",
          "slug": "cesnet",
          "metadata": { "title": "CESNET" },
          "access": {
            "visibility": "public",
            "review_policy": "closed"
          }
        }
      ]
    }
  }
}
```

In this example:
- The record belongs to one community (CESNET).
- That community is also marked as the `default` (since it's the only one).
- When a record belongs to multiple communities, `default` would point to the UUID of the primary one, while `entries` would list all of them.
