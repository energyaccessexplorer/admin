include default.mk

define DT_CONF
dt_config = {
  "origin": ${DT_ORIGIN},
  "logo": ${DT_LOGO},
  "auth_server": ${AUTH_SERVER},
  "auth_world": ${AUTH_WORLD},
  "storage_prefix": ${DT_STORAGE},
  "production": ${DT_PRODUCTION},
  "upload": ${DT_UPLOAD},
  "default_model": ${DT_DEFAULT_MODEL}
};
endef

export DT_CONF

build:
	@mkdir -p ${DIST}
	@mkdir -p ${DIST}/javascripts

	@cp -R views/* ${DIST}
	@cp -R src/* ${DIST}/javascripts
	@cp -R images ${DIST}/

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
		--exclude=makefile \
		--exclude=.git \
		--exclude=dependencies.tsv \
		${DIST}/ \
		${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

watch:
	@ WATCH_CMD="make build" watch-code ./src ./views

reconfig:
	@echo $$DT_CONF > ${DIST}/config.js
	@touch src/config-extras.js
	@cat   src/config-extras.js >> ${DIST}/config.js

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
