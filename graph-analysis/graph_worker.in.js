var Module = {
    preRun: [],
    postRun: function () {
        var get_mask = Module.cwrap('get_mask', 'number', []);
        var get_biases = Module.cwrap('get_biases', 'number', ['number']);
        var get_weights = Module.cwrap('get_weights', null, ['number', 'number', 'number', 'number', 'number']);
        var render_graph = Module.cwrap('render_graph', null, ['number', 'number', 'number', 'number', 'number']);
        var weight_ptr = Module._malloc(8 * 121278);
        var pix_ptr;

        var imageData;

        self.onmessage = function(event) {
            var msg = event.data;
            if (msg.action == 'queue_update') {
                postMessage({
                    action: 'get_rhoc'
                });
            } else if (msg.action == 'receive_dimensions') {
                imageData = new ImageData(msg.width, msg.height);
                pix_ptr = Module._malloc(8 * imageData.width * imageData.height);
            } else if (msg.action == 'current_rhoc') {
                var bias_ptr = get_biases(msg.rank);
                get_weights(bias_ptr, msg.func, msg.rhoc, msg.radius, weight_ptr);
                render_graph(weight_ptr, pix_ptr,
                    imageData.width, imageData.height, msg.use_mask);

                for (var i = 0; i < imageData.width * imageData.height; ++i) {
                    var p = Module.getValue(pix_ptr + 8 * i, 'double');
                    imageData.data[4 * i] = 0;
                    imageData.data[4 * i + 1] = 107;
                    imageData.data[4 * i + 2] = 204;
                    imageData.data[4 * i + 3] = 255 * p;
                }

                mask_data = [];
                var mask_ptr = get_mask();
                for (var i = 0; i < 493; ++i)
                    mask_data.push(Module.getValue(mask_ptr + 4 * i, 'i32'));

                postMessage({
                    action: 'redraw_graph',
                    imageData: imageData,
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
