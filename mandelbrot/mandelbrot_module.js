var Module = {
    preRun: [],
    postRun: function () {
        var mandelbrot = Module.cwrap('mandelbrot', null, ['number', 'number', 'number']);

        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        var imageData = ctx.createImageData(width, height);

        var px_data = Module._malloc(width * height * 4);

        var refresh_canvas = function () {
            show_spinner();

            // perform calculation (WASM)
            mandelbrot(width, height, px_data);

            var data = imageData.data;

            for (var i = 0; i < data.length; i++) {
                var x = Module.getValue(px_data + i, 'i8');
                // convert from signed to unsigned
                if (x < 0) x += 256;
                data[i] = x;
            }

            ctx.putImageData(imageData, 0, 0);

            hide_spinner();
        };

        refresh_canvas();
    },
    totalDependencies: 0
};
