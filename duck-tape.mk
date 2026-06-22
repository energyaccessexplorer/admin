DIST = ./dist

DT_BASE ?= "/"

lint:
	eslint --format unix --fix ./src

build: deps
	@mkdir -p src images templates views

	@rsync -r src ${DIST}/
	@rsync -r images ${DIST}/
	@rsync -r templates ${DIST}/
	@rsync -r views/ ${DIST}

	@mkdir -p ${DIST}/lib
	@mkdir -p ${DIST}/lib/fonts
	@cp ./src/duck-tape.js ${DIST}/lib/dt.js
	@cp ./src/style.css ${DIST}/lib/dt-style.css
	@cp ./src/lib/fonts/bootstrap-icons.* ${DIST}/lib/fonts/

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
		| jq '.paver_endpoint = ${PAVER_ENDPOINT}' \
		| jq '.departer_endpoint = ${DEPARTER_ENDPOINT}' \
		| jq '.status = ${STATUS_ENDPOINT}' \
		| jq '.bucket = ${BUCKET_ENDPOINT}' \
		> tmpconfig

	@cat tmpconfig | jq

	@touch src/config-extras.js

	@printf "%s" "export const config = " | \
		cat - tmpconfig \
		src/config-extras.js \
		> ${DIST}/config.js

	@rm -f tmpconfig

sync:
	@rsync -OPvr \
		--copy-links \
		--checksum \
		--delete-after \
		${DIST}/ \
		${DT_HOST}:${DT_DEST}

synced:
	@rsync -OPr \
		--info=FLIST0 \
		--dry-run \
		--copy-links \
		--checksum \
		--delete-after \
		${DIST}/ \
		${DT_HOST}:${DT_DEST}

deploy: envpatchreverse build sync envpatch
	bmake build env=development
