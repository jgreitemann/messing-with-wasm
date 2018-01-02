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
        } else if (msg.action == 'viewport-updated') {
            refresh_canvas();
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

    var selection_canvas = document.getElementById('selection');
    var selection_ctx = selection_canvas.getContext('2d');

    function getMousePos(evt) {
        var rect = selection_canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    selection_canvas.addEventListener('mousedown', function (event) {
        var pos1 = getMousePos(event);
        function handle_move(event) {
            var pos2 = getMousePos(event);
            selection_ctx.clearRect(0, 0, selection_canvas.width, selection_canvas.height);
            selection_ctx.fillStyle = "rgb(127, 127, 127)";
            selection_ctx.fillRect(pos1.x, pos1.y, pos2.x - pos1.x, pos2.y - pos1.y);
            selection_ctx.strokeStyle = "rgb(0, 0, 0)";
            selection_ctx.strokeRect(pos1.x, pos1.y, pos2.x - pos1.x, pos2.y - pos1.y);
        }
        function handle_up(event) {
            var pos2 = getMousePos(event);
            selection_canvas.removeEventListener('mousemove', handle_move, false);
            selection_canvas.removeEventListener('mouseup', handle_up, false);
            selection_ctx.clearRect(0, 0, selection_canvas.width, selection_canvas.height);
            w.postMessage({
                action: 'update-viewport',
                rel_rect: [pos1.x / selection_canvas.width,
                           pos1.y / selection_canvas.height,
                           pos2.x / selection_canvas.width,
                           pos2.y / selection_canvas.height]
            });
        }
        selection_canvas.addEventListener('mousemove', handle_move, false);
        selection_canvas.addEventListener('mouseup', handle_up, false);
    }, false);

    document.getElementById("resetButton").addEventListener("click", function () {
        w.postMessage({
            action: 'reset-viewport'
        });
    }, false);

    document.getElementById("undoZoomButton").addEventListener("click", function () {
        w.postMessage({
            action: 'undo-zoom'
        });
    }, false);

};
