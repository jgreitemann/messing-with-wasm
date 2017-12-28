.PHONY: all serve clean

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc
EM_EXEX = -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "getValue", "setValue"]'
EM_EX = -s EXPORTED_FUNCTIONS='["_add_42"]'

HTML = index.html
JS = mem.js
WASM = $(JS:.js=.wasm)

all: $(HTML) $(JS)

serve: $(HTML) $(JS)
		$(EMRUN) --no_browser --port 8080 .

clean:
		$(RM) $(JS) $(WASM)

%.js: %.c
		$(EMCC) $< -s WASM=1 $(EM_EX) $(EM_EXEX) -o $@
