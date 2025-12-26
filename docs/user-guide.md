# User Guide

This guide explains how to use the Asset Management System.

- Dashboard overview
- Managing assets
- Scheduling maintenance
- Generating reports

## Privacy & Data

You can manage your privacy preferences, view your personal data, and request
account/data deletion:

- Navigate to Privacy from the left sidebar, or open Settings and click the
  "Privacy & Data" tile.
- Consent toggles:
  - Marketing emails: Receive product updates and promotions.
  - Analytics: Allow anonymous usage analytics to improve the product.
  - Data processing: Allow processing of your data to deliver services.
  - Click "Save Preferences" to apply changes.
- My Data: Review a JSON view of your profile and privacy consent. Click
  "Download JSON" to export.
- Request Deletion: Submit a deletion request for your account and associated
  personal data. An administrator will process the request per policy.

Notes:

- Some features may be limited by your organization’s policy and role
  permissions.
- Changes to consent are audited for compliance.

## Data Import

You can import categories and assets from JSON files.

- Categories: POST /imports/categories accepts a body like:
  {
    "categories": [
      { name, description?, colorCode?, icon?, active?, sortOrder? }
    ]
  }
- Assets: POST /imports/assets accepts a body like:
  {
    "assets": [
      { name, assetTag, categoryId? or categoryName?, ...other fields }
    ]
  }

From the UI, go to Assets and click "Import JSON".
Use the templates as a starting point:

- frontend/public/examples/categories-template.json
- frontend/public/examples/assets-template.json

Notes:

- Assets require either categoryId or categoryName.
- On duplicate names/tags, records are updated idempotently.
