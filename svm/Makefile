.PHONY: all serve clean

MKDIR = mkdir -p
GIT = git
CAT = cat

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc
EM_OPT = -s DISABLE_EXCEPTION_CATCHING=0
EM_EXEX = -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "getValue", "setValue"]'
EM_EX = -s EXPORTED_FUNCTIONS='["_main", "_add_point", "_clear_points", "_get_model", "_get_err_string"]'

INCLUDES = -I../thirdparty/svm-order-params/svm -I../thirdparty/svm-order-params/svm/libsvm
CXXFLAGS = -std=c++14 -O3

HTML = index.html
JS = svm_demo.js
WASM = $(JS:.js=.wasm)
SVM_CPP = ../thirdparty/svm-order-params/svm/data_view.cpp ../thirdparty/svm-order-params/svm/libsvm/svm.cpp

all: $(HTML) $(JS)

serve: $(HTML) $(JS)
		$(EMRUN) --no_browser --port 8080 ..

clean:
		$(RM) $(JS) $(WASM)

svm_demo.js: svm_demo.cpp $(SVM_CPP)
		$(EMCC) $(CXXFLAGS) $(INCLUDES) $^ -s WASM=1 $(EM_OPT) $(EM_EX) $(EM_EXEX) -o $@

../thirdparty:
		$(MKDIR) ../thirdparty

$(SVM_CPP): ../thirdparty
		$(GIT) clone https://gitlab.physik.uni-muenchen.de/J.Greitemann/svm-order-params.git ../thirdparty/svm-order-params
