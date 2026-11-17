OS != uname
TIME != date +'%Y-%m-%d--%T'

env ?= development

DEFAULTMK != ./bin/upfind -name default.mk
include ${DEFAULTMK}

ENVMK != ./bin/upfind -name ${env}.mk
include ${ENVMK}

# Supabase Auth (login). Both are publishable and rewritten to the local
# gateway by the dev-server in local builds. They live here rather than in
# default.mk because CI regenerates default.mk without them.
SUPABASE_URL ?= "https://fjuzeptiewrqfxunivnu.supabase.co"
SUPABASE_ANON_KEY ?= "sb_publishable_fyBFmd4Q_XsbecX6_9-h_w_1_EQz0lF"

envpatchreverse:
	@echo "TESTING PATCHES development => ${env}"
	@echo "--------"
	patch --dry-run --strip=1 --reverse <development.diff
	@echo "--------"
	patch --dry-run --strip=1 <${env}.diff

	@echo ""
	@echo "PATCHING development => ${env}"
	@touch development.diff ${env}.diff
	@echo "--------"
	@patch --strip=1 --reverse <development.diff
	@echo "--------"
	@patch --strip=1 <${env}.diff

envpatch:
	@echo ""
	@echo "TESTING PATCHES ${env} => development"
	@echo "--------"
	patch --dry-run --strip=1 --reverse <${env}.diff
	@echo "--------"
	patch --dry-run --strip=1 <development.diff

	@echo ""
	@echo "PATCHING ${env} => development"
	@touch development.diff ${env}.diff
	@echo "--------"
	@patch --strip=1 --reverse <${env}.diff
	@echo "--------"
	@patch --strip=1 <development.diff
