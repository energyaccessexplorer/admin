default: lint dtbuild

lint:
	./bin/lint ./src

.include <duck-tape.mk>
