# Production environment configuration
DT_BASE = "/admin"
DT_HOST = "ubuntu@ec2-35-180-109-199.eu-west-3.compute.amazonaws.com"
DT_DEST = "/var/www/html/website/admin"
DT_API = "https://api.energyaccessexplorer.org"
AUTH_SERVER = "https://noop.nu/auth"
AUTH_WORLD = "eae"
DT_PRODUCTION = "https://www.energyaccessexplorer.org"

PAVER_ENDPOINT = "https://paver.energyaccessexplorer.org/paver"
DEPARTER_ENDPOINT = "https://paver.energyaccessexplorer.org/departer"
BUCKET_ENDPOINT = "https://wri-public-data.s3.amazonaws.com/EnergyAccess/"
# STATUS_ENDPOINT: real prod URL still unknown — inherits localhost default for now (TODO)
