include default.mk

sync:
	# @git rev-parse --short HEAD > $(PROJECT)/.latest-commit

	@rsync -OPvr \
		-e "ssh -p $(SSH_PORT)" \
		--copy-links \
		--checksum \
		--exclude=.git \
		--exclude=dependencies.tsv \
		--exclude=src \
		--delete-after \
		$(DIST)/ \
		$(SRV_USER)@$(SRV_SERVER):$(SRV_DEST)

stop:
	-@lsof -t -i :$(PGREST_PORT) | xargs -i kill {}

start:
	postgrest postgrest.conf &

remote-stop:
ifdef env
	@echo "Remote stop..."
	@ssh -p $(SSH_PORT) $(SRV_USER)@$(SRV_SERVER) "cd $(SRV_DEST); make stop env=$(env)"
else
	@echo "remote-stop: No env defined!"
endif

remote-start:
ifdef env
	@echo "Remote start..."
	@ssh -p $(SSH_PORT) $(SRV_USER)@$(SRV_SERVER) "/bin/bash --login -c 'cd $(SRV_DEST); make start env=$(env)'"
else
	@echo "remote-start: No env defined!"
endif

deploy: sync remote-stop remote-start
