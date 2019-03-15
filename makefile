include default.mk

define DT_CONF
dt_config = {
  "origin": ${DT_ORIGIN},
  "auth_server": ${AUTH_SERVER},
  "storage_prefix": ${DT_STORAGE},
  "production": ${DT_PRODUCTION},
  "upload": ${DT_UPLOAD},
  "courier": ${DT_COURIER},
  "model_root": ${DT_MODEL_ROOT},
  "default_model": ${DT_DEFAULT_MODEL}
};
endef

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
		-e "ssh -p ${SRV_SSH_PORT}" \
		--copy-links \
		--checksum \
		--delete-after \
		--exclude=.git \
		--exclude=dependencies.tsv \
		${DIST}/ \
		${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

watch:
	@ WATCH_CMD="make build" ${WATCH} ./src ./views

reconfig:
	@echo $$DT_CONF > ${DIST}/config.js

signin:
	@psql -d ${DB_NAME} \
		--pset="pager=off" \
		--pset="tuples_only=on" \
		--command="select 'localStorage.setItem(\"token\", \"' || sign(row_to_json(r), '${PGREST_SECRET}') || '\");' from (select 'ea_admin' as role, extract(epoch from now())::integer + 600*60 as exp) as r"

synced:
	@rsync -OPr \
		-e "ssh -p ${SRV_SSH_PORT}" \
		--info=FLIST0 \
		--dry-run \
		--copy-links \
		--checksum \
		--delete-after \
		--exclude=.git \
		--exclude=dependencies.tsv \
		${DIST}/ \
		${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

deploy: build reconfig sync
	make reconfig env=development
