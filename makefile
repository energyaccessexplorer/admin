include default.mk

define PGREST_CONF
\n
db-uri = "postgres://postgres@localhost:5432/${DB_NAME}"\n
db-schema = "public" \n
db-anon-role = "guest" \n
server-host = "127.0.0.1" \n
server-port = ${PGREST_PORT} \n
server-proxy-uri = ${PGREST_PROXY} \n
jwt-secret = ${PGREST_SECRET}
endef

PGREST_CONF_FILE = $(shell mktemp -t postgrest-eaadmin.XXXXXX)

define DT_CONF
dt_config = {
  "origin": ${DT_ORIGIN},
  "auth_server": ${AUTH_SERVER},
  "storage_prefix": ${DT_STORAGE},
  "production": ${DT_PRODUCTION},
  "upload": ${DT_UPLOAD},
  "courier": ${DT_COURIER},
  "model_root": "/",
  "default_model": "countries"
};
endef

export PGREST_CONF
export PGREST_CONF_FILE
export DT_CONF

build:
	@mkdir -p ${DIST}
	@mkdir -p ${DIST}/javascripts

	@cp views/* ${DIST}
	@cp -R src/* ${DIST}/javascripts

sync:
ifneq (${env}, production)
	@echo "env is not defined. Hej då."
	@exit 1
endif

	@rsync -OPvr \
		-e "ssh -p ${SSH_PORT}" \
		--copy-links \
		--checksum \
		--delete-after \
		--exclude=.git \
		--exclude=dependencies.tsv \
		${DIST}/ \
		${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

watch:
	@ WATCH_CMD="make build" ${WATCH} ./src

start:
	@echo "PostgREST config:"
	@echo $${PGREST_CONF} | tee $${PGREST_CONF_FILE}
	@echo ""

ifeq (${env}, production)
	@scp -P ${SSH_PORT} $${PGREST_CONF_FILE} ${SRV_USER}@${SRV_SERVER}:/tmp/
	@ssh -p ${SSH_PORT} ${SRV_USER}@${SRV_SERVER} "/bin/bash --login -c 'postgrest $${PGREST_CONF_FILE} &> /dev/null &'"
else
	@postgrest $${PGREST_CONF_FILE} &> /dev/null &
endif

stop:
ifeq (${env}, production)
	@echo "Remote stop..."
	@ssh -p ${SSH_PORT} ${SRV_USER}@${SRV_SERVER} "lsof -t -i :${PGREST_PORT} | xargs -I {} kill {}"
else
	-@lsof -t -i :${PGREST_PORT} | xargs -I {} kill {}
endif

reconfig:
	@echo $$DT_CONF > ${DIST}/config.js

synced:
	@rsync -OPr \
		-e "ssh -p ${SSH_PORT}" \
		--info=FLIST0 \
		--dry-run \
		--copy-links \
		--checksum \
		--delete-after \
		--exclude=.git \
		--exclude=dependencies.tsv \
		${DIST}/ \
		${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

deploy: build reconfig sync stop start
	make reconfig env=development
