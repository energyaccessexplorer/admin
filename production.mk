# Production environment configuration
DT_BASE = "/admin"
DT_HOST = "ubuntu@ec2-35-180-109-199.eu-west-3.compute.amazonaws.com"
DT_DEST = "/var/www/html/website/admin"
DT_API = "https://api.energyaccessexplorer.org"
DT_PRODUCTION = "https://www.energyaccessexplorer.org"

PAVER_ENDPOINT = "https://paver.energyaccessexplorer.org/paver"
DEPARTER_ENDPOINT = "https://paver.energyaccessexplorer.org/departer"
# STATUS_ENDPOINT: real prod URL still unknown — inherits localhost default for now (TODO)
