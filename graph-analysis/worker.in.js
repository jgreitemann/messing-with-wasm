var get_mask;
var get_biases;
var get_weights;
var get_fiedler;
var compute_weight_histo;
var weight_ptr;
var fiedler_ptr;
var bitmap_ptr;
var min_max_step_ptr;
var fielder_histo_ptr;
var curve_ptr;
var weight_histo_ptr;

var Module = {
    preRun: [],
    postRun: function () {
        get_mask = Module.cwrap('get_mask', 'number', []);
        get_biases = Module.cwrap('get_biases', 'number', ['number']);
        get_weights = Module.cwrap('get_weights', null, ['number', 'number', 'number', 'number']);
        get_fiedler = Module.cwrap('get_fiedler', 'number', ['number', 'number', 'number']);
        compute_fiedler_histo = Module.cwrap('compute_fiedler_histo', null, ['number', 'number', 'number']);
        map_colors = Module.cwrap('map_colors', null, ['number', 'number', 'number', 'number']);
        compute_bias_histo = Module.cwrap('compute_bias_histo', null, ['number', 'number', 'number']);
        compute_weight_histo = Module.cwrap('compute_weight_histo', null, ['number', 'number', 'number']);
        weight_ptr = Module._malloc(8 * 121278);
        fiedler_ptr = Module._malloc(8 * 493);
        bitmap_ptr = Module._malloc(8 * 3 * 493);
        min_max_step_ptr = Module._malloc(8 * 4);
        fiedler_histo_ptr = Module._malloc(4 * 70);
        curve_ptr = Module._malloc(8 * 2000);
        bias_histo_ptr = Module._malloc(4 * 49);
        weight_histo_ptr = Module._malloc(4 * 50);

        self.onmessage = function(event) {
            var msg = event.data;
            if (msg.action == 'queue_update') {
                postMessage({
                    action: 'get_rhoc'
                });
            } else if (msg.action == 'current_rhoc') {
                var bias_ptr = get_biases(msg.rank);
                get_weights(bias_ptr, msg.func, msg.rhoc, weight_ptr);
                if (!msg.calc_fiedler) {
                    weight_data = [];
                    for (var i = 0; i < 121278; ++i)
                        weight_data.push(Module.getValue(weight_ptr + 8 * i, 'double'));

                    compute_bias_histo(bias_ptr, bias_histo_ptr, msg.use_mask);
                    bias_histo_data = [];
                    for (var i = 0; i < 49; ++i)
                        bias_histo_data.push(Module.getValue(bias_histo_ptr + 4 * i, 'i32'));
                    compute_weight_histo(weight_ptr, weight_histo_ptr, msg.use_mask);
                    weight_histo_data = [];
                    for (var i = 0; i < 50; ++i)
                        weight_histo_data.push(Module.getValue(weight_histo_ptr + 4 * i, 'i32'));
                    get_weights(0, msg.func, msg.rhoc, curve_ptr);
                    curve_data = [];
                    for (var i = 0; i < 2000; ++i)
                        curve_data.push(Module.getValue(curve_ptr + 8 * i, 'double'));
                    mask_data = [];
                    var mask_ptr = get_mask();
                    for (var i = 0; i < 493; ++i)
                        mask_data.push(Module.getValue(mask_ptr + 4 * i, 'i32'));
                    postMessage({
                        action: 'redraw_histo',
                        bias_histo_data: bias_histo_data,
                        weight_histo_data: weight_histo_data,
                        curve_data: curve_data
                    });

                    postMessage({
                        action: 'redraw_graph',
                        weight_data: weight_data,
                        mask_data: mask_data
                    });
                } else {
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
            }
        };

        postMessage({ action: 'init' });
    },
    print: function (text) {
        console.log(text);
    },
    totalDependencies: 0
};
