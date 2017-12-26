.PHONY: all serve clean

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc

HTML = index.html
JS = hello.js
WASM = $(JS:.js=.wasm)

all: $(HTML) $(JS)

serve: $(HTML) $(JS)
		$(EMRUN) --no_browser --port 8080 .

clean:
		$(RM) $(JS) $(WASM)

%.js: %.c
		$(EMCC) $< -s WASM=1 -o $@
