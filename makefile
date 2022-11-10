default: lint dtbuild

lint:
	./bin/lint ./src

deps:
	DEST=./dist/lib ./bin/deps

.include "duck-tape.mk"
