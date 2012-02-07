MAKE_JS = ./make_lmd_config.js

all: development production

development:
	node $(MAKE_JS) -v development
	lmd ./tmp/lmd.development.json ./out/lmd.development.js
	rm tmp/*

production:
	node $(MAKE_JS) -v production
	lmd ./tmp/lmd.production.json ./out/lmd.production.js
	rm tmp/*

help:
	@echo "USAGE:\n\tmake\n\tmake development\n\tmake production"