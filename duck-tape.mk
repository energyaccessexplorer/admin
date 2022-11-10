DIST = ./dist

.ifndef DT_BASE
DT_BASE = "/"
.endif

.ifndef DT_HOST
.error "DT_HOST is not defined. Hej då."
.endif

.ifndef DT_DEST
.error "DT_DEST is not defined. Hej då."
.endif

dtbuild:
	@mkdir -p src images templates views

	@rsync -r src ${DIST}/
	@rsync -r images ${DIST}/
	@rsync -r templates ${DIST}/
	@rsync -r views/ ${DIST}

	@echo '{}' \
		| jq '.api = ${DT_API}' \
		| jq '.logo = ${DT_LOGO}' \
		| jq '.auth_server = ${AUTH_SERVER}' \
		| jq '.auth_world = ${AUTH_WORLD}' \
		| jq '.production = ${DT_PRODUCTION}' \
		| jq '.upload = ${DT_UPLOAD}' \
		| jq '.src = ${DT_SRC}' \
		| jq '.base = ${DT_BASE}' \
		| jq '.project = ${DT_PROJECT}' \
		> tmpconfig

	@cat tmpconfig | jq

	@touch src/config-extras.js

	@echo -n "export const config = " | \
		cat - tmpconfig \
		src/config-extras.js \
		> ${DIST}/config.js

	@rm -f tmpconfig

dtsync:
	@rsync -OPvr \
		--copy-links \
		--checksum \
		--delete-after \
		${DIST}/ \
		${DT_HOST}:${DT_DEST}

dtsynced:
	@rsync -OPr \
		--info=FLIST0 \
		--dry-run \
		--copy-links \
		--checksum \
		--delete-after \
		${DIST}/ \
		${DT_HOST}:${DT_DEST}

dtdeploy: dtbuild dtsync
	bmake dtbuild env=development
