.PHONY: all serve clean

MKDIR = mkdir -p
GIT = git

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc
EM_EXEX = -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "getValue", "setValue"]'
EM_EX = -s EXPORTED_FUNCTIONS='["_mandelbrot"]'

INCLUDES = -I../thirdparty/svm-order-params/colormap 
CXXFLAGS = -std=c++11 -O3

HTML = index.html
JS = mandelbrot.js
WASM = $(JS:.js=.wasm)

all: $(HTML) $(JS)

serve: $(HTML) $(JS)
		$(EMRUN) --no_browser --port 8080 .

clean:
		$(RM) $(JS) $(WASM)

%.js: %.cpp ../thirdparty/svm-order-params
		$(EMCC) $(CXXFLAGS) $(INCLUDES) $< -s WASM=1 $(EM_EX) $(EM_EXEX) -o $@

../thirdparty:
		$(MKDIR) ../thirdparty

../thirdparty/svm-order-params: ../thirdparty
		$(GIT) clone https://gitlab.physik.uni-muenchen.de/J.Greitemann/svm-order-params.git $@