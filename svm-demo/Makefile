.PHONY: all serve clean

MKDIR = mkdir -p
GIT = git
CAT = cat

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc
EM_OPT = -s DISABLE_EXCEPTION_CATCHING=0
EM_EXEX = -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "getValue", "setValue"]'
EM_EX = -s EXPORTED_FUNCTIONS='["_main", "_add_point", "_clear_points", "_get_model", "_get_SV_coord", "_get_err_string", "_get_n_lines_zero", "_get_n_line_points_zero", "_get_line_points_zero", "_get_line_closed_zero", "_get_n_lines_plus", "_get_n_line_points_plus", "_get_line_points_plus", "_get_line_closed_plus", "_get_n_lines_minus", "_get_n_line_points_minus", "_get_line_points_minus", "_get_line_closed_minus"]'

INCLUDES = -I../svm -I../svm/libsvm -I../colormap
CXXFLAGS = -std=c++1z -O3

HTML = index.html
JS = svm_demo.js
WASM = $(JS:.js=.wasm)
LIBSVM_CPP = ../svm/libsvm/svm.cpp

all: $(HTML) $(JS)

serve: $(HTML) $(JS)
		$(EMRUN) --no_browser --port 8080 ..

clean:
		$(RM) $(JS) $(WASM)

svm_demo.js: svm_demo.cpp contour.cpp $(LIBSVM_CPP)
		$(EMCC) $(CXXFLAGS) $(INCLUDES) $^ -s WASM=1 $(EM_OPT) $(EM_EX) $(EM_EXEX) -o $@
