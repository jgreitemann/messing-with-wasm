.PHONY: all serve clean

MKDIR = mkdir -p
GIT = git
CAT = cat

EMRUN = source ~/opensource/emsdk/emsdk_env.sh && emrun
EMCC = source ~/opensource/emsdk/emsdk_env.sh && emcc
EM_OPT = -s DISABLE_EXCEPTION_CATCHING=0
EM_EXEX = -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "getValue", "setValue"]'
EM_EX = -s EXPORTED_FUNCTIONS='["_main", "_get_biases", "_get_weights", "_compute_bias_histo", "_compute_weight_histo", "_get_fiedler", "_compute_fiedler_histo", "_map_colors"]'

INCLUDES = -I/usr/include/eigen3 -I../colormap
CXXFLAGS = -std=c++1z -O3

HTML = index.html
JS = graph_analysis.js worker.js
GPJS = gnuplot_histo.js gnuplot_graph.js gnuplot_fiedler.js gnuplot_fiedler_histo.js
WASM = $(JS:.js=.wasm)

ALL = $(HTML) $(JS) $(GPJS)

all: $(ALL)

serve: $(ALL)
	$(EMRUN) --no_browser --port 8080 ..

clean:
	$(RM) $(JS) $(GPJS) $(WASM)

_data/rho_%.c: _data/rho_%.txt
	echo '{' > $@
	sed -r 's/^([^\t]+)\t.*$$/\1,/g' $< >> $@
	echo '},' >> $@

biases.cpp: _data/rho_rank1.c _data/rho_rank2.c _data/rho_rank3.c _data/rho_rank4.c
	echo 'double biases[][121278] = {' > $@
	cat $^ >> $@
	echo '};' >> $@

graph_analysis.js: graph_analysis.cpp biases.cpp
	$(EMCC) $(CXXFLAGS) $(INCLUDES) $^ -s WASM=1 $(EM_OPT) $(EM_EX) $(EM_EXEX) -o $@

worker.js: worker.in.js graph_analysis.js
	$(CAT) $^ > $@

_gp/%.html: _gp/%.gp _data/*
	cd _gp && gnuplot $*.gp

gnuplot_%.js: _gp/%.html
	sed -e '12,$$!d' -e '/<\/script>/,$$d' -e 's/gnuplot_canvas/$(basename $@)_canvas/g' $< > $@
