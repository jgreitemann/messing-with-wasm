window.onload = function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var imageData = ctx.createImageData(width, height);

    var selected_pal = 0;

    var w = new Worker('mandelbrot_module.js');
    w.onmessage = function (event) {
        msg = event.data;
        console.log(msg.action);
        if (msg.action == 'picker-fill') {
            var picker = document.getElementById('palette_picker');
            while (picker.firstChild)
                picker.removeChild(picker.firstChild);
            for (var j = 0; j < msg.pickerEntries.length; ++j) {
                var pal = document.createElement('option');
                pal.value = j;
                pal.innerHTML = msg.pickerEntries[j];
                picker.appendChild(pal);
            }

            w.postMessage({
                action: 'prep-pxdata',
                length: imageData.data.length
            });

            refresh_canvas();

            picker.disabled = false;
            picker.onchange = function () {
                selected_pal = picker.options[picker.selectedIndex].value;
                refresh_canvas();
            };
        } else if (msg.action == 'render-canvas') {
            imageData = msg.imageData;
            ctx.putImageData(imageData, 0, 0);
            hide_spinner();
        }
    };

    function refresh_canvas () {
        show_spinner();
        w.postMessage({
            action: 'refresh-pxdata',
            imageData: imageData,
            width: width,
            height: height,
            selected_pal: selected_pal
        });
    }

};
