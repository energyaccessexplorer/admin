OS != uname
TIME != date +'%Y-%m-%d--%T'

.ifndef env
env = development
.endif

DEFAULTMK != ./bin/upfind -name default.mk
include ${DEFAULTMK}

ENVMK != ./bin/upfind -name ${env}.mk
include ${ENVMK}

envpatchreverse:
	@touch development.diff ${env}.diff
	@patch --strip=1 --reverse <development.diff
	@patch --strip=1 <${env}.diff

envpatch:
	@touch development.diff ${env}.diff
	@patch --strip=1 --reverse <${env}.diff
	@patch --strip=1 <development.diff
