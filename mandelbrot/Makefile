.PHONY: all serve clean

MKDIR = mkdir -p
GIT = git
CAT = cat

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc
EM_EXEX = -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "getValue", "setValue"]'
EM_EX = -s EXPORTED_FUNCTIONS='["_mandelbrot", "_main", "_get_number_of_palettes", "_get_palette_name", "_set_viewport", "_reset_viewport", "_undo_zoom"]'

INCLUDES = -I../thirdparty/svm-order-params/colormap 
CXXFLAGS = -std=c++11 -O3

HTML = index.html
JS = mandelbrot.js mandelbrot_module.js
WASM = $(JS:.js=.wasm)

all: $(HTML) $(JS)

serve: $(HTML) $(JS)
		$(EMRUN) --no_browser --port 8080 .

clean:
		$(RM) $(JS) $(WASM)

mandelbrot.js: mandelbrot.cpp ../thirdparty/svm-order-params
		$(EMCC) $(CXXFLAGS) $(INCLUDES) $< -s WASM=1 $(EM_EX) $(EM_EXEX) -o $@

mandelbrot_module.js: mandelbrot_module.js.in mandelbrot.js
		$(CAT) $^ > $@

../thirdparty:
		$(MKDIR) ../thirdparty

../thirdparty/svm-order-params: ../thirdparty
		$(GIT) clone https://gitlab.physik.uni-muenchen.de/J.Greitemann/svm-order-params.git $@
