var Module = {
    preRun: [],
    postRun: function () {
        var get_biases = Module.cwrap('get_biases', 'number', ['number']);
        var get_weights = Module.cwrap('get_weights', null, ['number', 'number', 'number', 'number', 'number']);
        var get_fiedler = Module.cwrap('get_fiedler', 'number', ['number', 'number', 'number']);
        var compute_fiedler_histo = Module.cwrap('compute_fiedler_histo', null, ['number', 'number', 'number']);
        var map_colors = Module.cwrap('map_colors', null, ['number', 'number', 'number', 'number']);
        var weight_ptr = Module._malloc(8 * 121278);
        var fiedler_ptr = Module._malloc(8 * 493);
        var bitmap_ptr = Module._malloc(8 * 3 * 493);
        var min_max_step_ptr = Module._malloc(8 * 4);
        var fiedler_histo_ptr = Module._malloc(8 * 70);

        self.onmessage = function(event) {
            var msg = event.data;
            if (msg.action == 'queue_update') {
                postMessage({
                    action: 'get_rhoc'
                });
            } else if (msg.action == 'current_rhoc') {
                var bias_ptr = get_biases(msg.rank);
                get_weights(bias_ptr, msg.func, msg.rhoc, msg.radius, weight_ptr);
                var degen = get_fiedler(weight_ptr, fiedler_ptr, msg.use_mask);
                compute_fiedler_histo(fiedler_ptr, fiedler_histo_ptr, min_max_step_ptr);
                var min = Module.getValue(min_max_step_ptr, 'double');
                var max = Module.getValue(min_max_step_ptr + 8, 'double');
                var step = Module.getValue(min_max_step_ptr + 16, 'double');
                var oom = Module.getValue(min_max_step_ptr + 24, 'double');
                map_colors(fiedler_ptr, min, max, bitmap_ptr);
                fiedler_bitmap = [];
                for (var i = 0; i < 3 * 493; ++i)
                    fiedler_bitmap.push(Module.getValue(bitmap_ptr + 8 * i, 'double'));
                fiedler_histo = [];
                for (var i = 0; i < 70; ++i)
                    fiedler_histo.push(Module.getValue(fiedler_histo_ptr + 8 * i, 'double'));
                postMessage({
                    action: 'redraw_fiedler',
                    fiedler_bitmap: fiedler_bitmap,
                    fiedler_histo: fiedler_histo,
                    min: min,
                    max: max,
                    step: step,
                    oom: oom
                });
            }
        };

        postMessage({ action: 'init' });
    },
    print: function (text) {
        console.log(text);
    },
    totalDependencies: 0
};
