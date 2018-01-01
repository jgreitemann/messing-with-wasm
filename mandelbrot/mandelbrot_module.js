var Module = {
    preRun: [],
    postRun: function () {
        var n_palettes = Module.ccall('get_number_of_palettes', 'number', [], []);
        var pal_name = Module.cwrap('get_palette_name', 'string', ['number']);
        var picker = document.getElementById('palette_picker');
        while (picker.firstChild)
            picker.removeChild(picker.firstChild);
        for (var i = 0; i < n_palettes; ++i) {
            var pal = document.createElement('option');
            pal.value = i;
            pal.innerHTML = pal_name(i);
            picker.appendChild(pal);
        }

        var selected_pal = 0;


        var mandelbrot = Module.cwrap('mandelbrot', null, ['number', 'number', 'number', 'number']);

        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        var imageData = ctx.createImageData(width, height);

        var px_data = Module._malloc(width * height * 4);

        var refresh_canvas = function () {
            show_spinner();

            // perform calculation (WASM)
            mandelbrot(width, height, px_data, selected_pal);

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

        picker.disabled = false;
        picker.onchange = function () {
            selected_pal = picker.options[picker.selectedIndex].value;
            refresh_canvas();
        };
    },
    totalDependencies: 0
};
