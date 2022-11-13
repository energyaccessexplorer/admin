
envpatch:
	@touch development.diff ${env}.diff
	@patch --strip=1 --reverse <${env}.diff
	@patch --strip=1 <development.diff

envpatchreverse:
	@touch development.diff ${env}.diff
	@patch --strip=1 --reverse <development.diff
	@patch --strip=1 <${env}.diff

default: lint dtbuild

lint:
	./bin/lint ./src

deps:
	DEST=./dist/lib ./bin/deps

.include "duck-tape.mk"
