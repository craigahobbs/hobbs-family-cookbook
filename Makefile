ifeq '$(wildcard .makefile)' ''
    $(info Downloading base makefile...)
    $(shell curl -s -o .makefile 'https://raw.githubusercontent.com/craigahobbs/chisel/master/static/Makefile')
endif
ifeq '$(wildcard package.json)' ''
    $(info Downloading package.json...)
    $(shell curl -s -o package.json 'https://raw.githubusercontent.com/craigahobbs/chisel/master/static/package.json')
endif
ifeq '$(wildcard .eslintrc.js)' ''
    $(info Downloading .eslintrc.js...)
    $(shell curl -s -o .eslintrc.js 'https://raw.githubusercontent.com/craigahobbs/chisel/master/static/.eslintrc.js')
endif
include .makefile

NYC_ARGS := --exclude src/chisel.js

JSDOC_ARGS := -c jsdoc.json

PYTHON_IMAGE := python:3.8

build/env.build:
	docker pull -q $(PYTHON_IMAGE)
	docker run --rm -u `id -g`:`id -g` -v `pwd`:`pwd` -w `pwd` $(PYTHON_IMAGE) python3 -m venv build/env
	docker run --rm -u `id -g`:`id -g` -v `pwd`:`pwd` -w `pwd` $(PYTHON_IMAGE) build/env/bin/pip install -U pip setuptools wheel chisel
	touch $@

define COMPILE_CHSL
src/$(strip $(1)).json: src/$(strip $(1)).chsl | build/env.build
	docker run --rm -u `id -g`:`id -g` -v `pwd`:`pwd` -w `pwd` $$(PYTHON_IMAGE) build/env/bin/python3 -m chisel compile $$< > $$@

src/$(strip $(1)).js: src/$(strip $(1)).json
	echo '/* eslint-disable quotes */' > $$@
	echo 'export const $(strip $(1)) =' >> $$@
	cat $$< >> $$@
	echo ';' >> $$@

CHISEL_TARGETS := $$(CHISEL_TARGETS) src/$(strip $(1)).js
endef

$(eval $(call COMPILE_CHSL, cookbookTypes))
$(eval $(call COMPILE_CHSL, markdownTypes))

_test: $(CHISEL_TARGETS)

_lint: $(CHISEL_TARGETS)

_doc: $(CHISEL_TARGETS)

help:
	@echo '            [gh-pages]'

clean:
	rm -f .makefile package.json .eslintrc.js

superclean:
	docker rmi -f $(PYTHON_IMAGE)

.PHONY: gh-pages
gh-pages: _clean commit
	if [ ! -d ../$(notdir $(CURDIR)).gh-pages ]; then git clone -b gh-pages `git config --get remote.origin.url` ../$(notdir $(CURDIR)).gh-pages; fi
	cd ../$(notdir $(CURDIR)).gh-pages && git pull
	rsync -rv --delete --exclude=.git/ src/ ../$(notdir $(CURDIR)).gh-pages
	touch ../$(notdir $(CURDIR)).gh-pages/.nojekyll
