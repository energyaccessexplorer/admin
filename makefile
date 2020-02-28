include default.mk

TEMP != mktemp

build:
	@mkdir -p ${DIST}
	@mkdir -p ${DIST}/javascripts

	@cp -R views/* ${DIST}
	@cp -R src/* ${DIST}/javascripts
	@cp -R images ${DIST}/

sync:
.ifndef env
	@echo "env is not defined. Hej då."
	@exit 1
.endif

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
	@echo '{}' \
		| jq '.origin = ${DT_ORIGIN}' \
		| jq '.logo = ${DT_LOGO}' \
		| jq '.auth_server = ${AUTH_SERVER}' \
		| jq '.auth_world = ${AUTH_WORLD}' \
		| jq '.storage_prefix = ${DT_STORAGE}' \
		| jq '.production = ${DT_PRODUCTION}' \
		| jq '.upload = ${DT_UPLOAD}' \
		| jq '.default_model = ${DT_DEFAULT_MODEL}' \
		> ${TEMP}

	@echo -n "dt_config = " | cat - ${TEMP} > ${DIST}/config.js

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

.END:
	-@rm -f ${TEMP}
