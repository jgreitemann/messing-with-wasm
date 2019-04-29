var Module = {
    preRun: [],
    postRun: function () {
        var get_mask = Module.cwrap('get_mask', 'number', []);
        var get_biases = Module.cwrap('get_biases', 'number', ['number']);
        var get_weights = Module.cwrap('get_weights', null, ['number', 'number', 'number', 'number', 'number']);
        var compute_bias_histo = Module.cwrap('compute_bias_histo', null, ['number', 'number', 'number', 'number']);
        var compute_weight_histo = Module.cwrap('compute_weight_histo', null, ['number', 'number', 'number']);
        var weight_ptr = Module._malloc(8 * 121278);
        var curve_ptr = Module._malloc(8 * 2000);
        var bias_histo_ptr = Module._malloc(4 * 49);
        var weight_histo_ptr = Module._malloc(4 * 50);

        self.onmessage = function(event) {
            var msg = event.data;
            if (msg.action == 'queue_update') {
                postMessage({
                    action: 'get_rhoc'
                });
            } else if (msg.action == 'current_rhoc') {
                var bias_ptr = get_biases(msg.rank);
                get_weights(bias_ptr, msg.func, msg.rhoc, msg.radius, weight_ptr);
                weight_data = [];
                for (var i = 0; i < 121278; ++i)
                    weight_data.push(Module.getValue(weight_ptr + 8 * i, 'double'));

                compute_bias_histo(bias_ptr, bias_histo_ptr, msg.use_mask, msg.radius);
                bias_histo_data = [];
                for (var i = 0; i < 49; ++i)
                    bias_histo_data.push(Module.getValue(bias_histo_ptr + 4 * i, 'i32'));
                compute_weight_histo(weight_ptr, weight_histo_ptr, msg.use_mask);
                weight_histo_data = [];
                for (var i = 0; i < 50; ++i)
                    weight_histo_data.push(Module.getValue(weight_histo_ptr + 4 * i, 'i32'));
                get_weights(0, msg.func, msg.rhoc, 0, curve_ptr);
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
            }
        };

        postMessage({ action: 'init' });
    },
    print: function (text) {
        console.log(text);
    },
    totalDependencies: 0
};
