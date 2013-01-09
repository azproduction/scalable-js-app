MAKE_JS = ./make_lmd_config.js

all: development production

development:
	node $(MAKE_JS) -v development
	lmd build development

production:
	node $(MAKE_JS) -v production
	lmd build production

help:
	@echo "USAGE:\n\tmake\n\tmake development\n\tmake production"