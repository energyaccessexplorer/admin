# Default configuration values
DT_BASE = "/admin"
DT_PRODUCTION = false
DT_LOGO = "/admin/lib/images/eae-logo.svg"
DT_UPLOAD = "s3"
DT_SRC = "development"
DT_PROJECT = "eae"

# Service endpoints — empty means "use this host" (config-extras.js falls back to
# location.origin), so worktrees keep talking to their own origin. production.mk
# sets the real cross-host endpoints.
PAVER_ENDPOINT = ""
DEPARTER_ENDPOINT = ""
STATUS_ENDPOINT = "http://eae.localhost/status"

# Uploads go to Supabase Storage: the object is written under UPLOAD_PREFIX in
# UPLOAD_BUCKET, and duck-tape.js builds its public URL from the two.
UPLOAD_BUCKET = "wri-public-data"
UPLOAD_PREFIX = "EnergyAccess/uploads"
