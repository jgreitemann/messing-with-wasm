var rhoc = 50;

var grid_dx, grid_dy;
var boundingRect;
var points = [];

function redraw_fiedler(fiedler_bitmap) {
    var canvas = document.getElementById('gnuplot_fiedler_canvas');
    var ctx = canvas.getContext('2d');

    var i = 0;
    points.forEach(function(p) {
        var r = fiedler_bitmap[i];
        var g = fiedler_bitmap[i + 1];
        var b = fiedler_bitmap[i + 2];
        ctx.fillStyle = `rgb(${r * 100}%, ${g * 100}%, ${b * 100}%)`;
        ctx.fillRect(Math.round(p.x - grid_dx / 2), Math.round(p.y - grid_dy / 2),
            Math.round(grid_dx), Math.round(grid_dy));
        i += 3;
    });

    ctx.clearRect(0, 0, boundingRect.origin.x, canvas.height);
    ctx.clearRect(boundingRect.origin.x + boundingRect.size.width, 0,
        canvas.width - boundingRect.origin.x - boundingRect.size.width,
        canvas.height);
    ctx.clearRect(0, 0, canvas.width, boundingRect.origin.y);
    ctx.clearRect(0, boundingRect.origin.y + boundingRect.size.height,
        canvas.width,
        canvas.height - boundingRect.origin.y - boundingRect.size.height);

    gnuplot_fiedler_canvas();
    gnuplot.TR(204.5 * 10, 243 * 10, 0, 8, "Center", "-");
}

function redraw_graph(weight_data, mask_data) {
    var canvas = document.getElementById('gnuplot_graph_canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gnuplot_graph_canvas();
    gnuplot.TR(204.5 * 10, 243 * 10, 0, 8, "Center", "-");

    ctx.fillStyle = 'rgb(0%, 42%, 80%)';

    for (var i = 0; i < points.length; ++i) {
        if (!mask_data || mask_data[i]) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    var sum = weight_data.reduce((a, b) => a + b, 0);
    if (sum > 2e4) {
        ctx.fillRect(boundingRect.origin.x, boundingRect.origin.y,
            boundingRect.size.width, boundingRect.size.height);
        return;
    }

    var k = 0;
    for (var i = 0; i < points.length; ++i) {
        for(var j = i + 1; j < points.length; ++j, ++k) {
            if (mask_data && (!mask_data[i] || !mask_data[j]))
                continue;
            var w = weight_data[k];
            if (w > 1e-2) {
                ctx.strokeStyle = `rgba(0%, 42%, 80%, ${100*w}%)`;
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }
        }
    }
}

function redraw_histo(bias_histo_data, weight_histo_data, curve_data) {
    var canvas = document.getElementById('gnuplot_histo_canvas');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gnuplot_histo_canvas();

    var N_bin = 50;
    var binwidth = gnuplot.plot_width / N_bin;
    var ybot = 115.;
    var phgt = 111.9;

    ctx.strokeStyle = '#4f8fd8';
    ctx.fillStyle = '#a7c7ec';

    for (var i = 0; i < N_bin; ++i) {
        var hist = bias_histo_data[i];
        if (hist == 0)
            continue;
        var binheight = Math.log(hist) / Math.log(2e5) * phgt;
        ctx.fillRect(gnuplot.plot_xmin + i * binwidth, ybot, binwidth, -binheight);
        ctx.strokeRect(gnuplot.plot_xmin + i * binwidth, ybot, binwidth, -binheight);
    }

    ctx.strokeStyle = '#d84f4f';
    ctx.fillStyle = '#eca7a7';

    for (var i = 0; i < N_bin; ++i) {
        var hist = weight_histo_data[i];
        if (hist == 0)
            continue;
        var binheight = Math.log(hist / gnuplot.plot_axis_ymin)
            / Math.log(gnuplot.plot_axis_ymax / gnuplot.plot_axis_ymin)
            * gnuplot.plot_height;
        ctx.fillRect(
            gnuplot.plot_xmin + i * binwidth,
            gnuplot.plot_ybot - binheight,
            binwidth,
            binheight)
        ctx.strokeRect(
            gnuplot.plot_xmin + i * binwidth,
            gnuplot.plot_ybot - binheight,
            binwidth,
            binheight)
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(gnuplot.plot_xmin, ybot, gnuplot.plot_width, -phgt);
    ctx.strokeRect(gnuplot.plot_xmin, gnuplot.plot_ytop,
        gnuplot.plot_width, gnuplot.plot_height);

    ctx.strokeStyle = '#d84f4f';
    ctx.beginPath();
    for (var i = 0; i < 1000; ++i) {
        var x = curve_data[2 * i];
        var y = curve_data[2 * i + 1];
        var l = gnuplot.plot_xmin + Math.log(x / 0.01) / Math.log(2000. / 0.01) * gnuplot.plot_width;
        if (i == 0) {
            ctx.moveTo(l, ybot - y * phgt);
        } else {
            ctx.lineTo(l, ybot - y * phgt);
        }
    }
    ctx.lineWidth = 2;
    ctx.stroke();
}

function redraw_fiedler_histo(min, max, step, oom, histo) {
    var canvas = document.getElementById('gnuplot_fiedler_histo_canvas');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gnuplot_fiedler_histo_canvas();

    ctx.strokeStyle = '#4f8fd8';
    ctx.fillStyle = '#a7c7ec';

    var histo_max = 110.;
    var binwidth = gnuplot.plot_width / 70;

    for (var i = 0; i < 70; ++i) {
        var binheight = histo[i] / histo_max * gnuplot.plot_height;
        ctx.fillRect(gnuplot.plot_xmin + i * binwidth, gnuplot.plot_ybot,
            binwidth, -binheight);
        ctx.strokeRect(gnuplot.plot_xmin + i * binwidth, gnuplot.plot_ybot,
            binwidth, -binheight);
    }

    ctx.clearRect(0, gnuplot.plot_ytop, canvas.width, -gnuplot.plot_ytop);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(gnuplot.plot_xmin, gnuplot.plot_ytop,
        gnuplot.plot_width, gnuplot.plot_height);
    ctx.lineWidth = 1;

    // tics
    var cb_height = 0.05 * canvas.height;
    for (var x = min + step; x < max; x += step) {
        var r = (x - min) / (max - min);
        ctx.beginPath();
        ctx.moveTo(gnuplot.plot_xmin + r * gnuplot.plot_width, gnuplot.plot_ybot);
        ctx.lineTo(gnuplot.plot_xmin + r * gnuplot.plot_width, gnuplot.plot_ybot + 0.3 * cb_height);
        ctx.moveTo(gnuplot.plot_xmin + r * gnuplot.plot_width, gnuplot.plot_ybot + 0.7 * cb_height);
        ctx.lineTo(gnuplot.plot_xmin + r * gnuplot.plot_width, gnuplot.plot_ybot + cb_height);
        ctx.stroke();
    }

    for (var x = min; x <= max + 1e-10; x += step) {
        var r = (x - min) / (max - min);
        gnuplot.TR((gnuplot.plot_xmin + r * gnuplot.plot_width) * 10,
            (gnuplot.plot_ybot + cb_height + 13) * 10, 0, 8., "Center",
            (Math.round(x * oom) / oom).toString());
    }
}

window.onload = function () {
    var misc_worker = new Worker('worker.js');
    var fiedler_worker = new Worker('worker.js');
    var misc_pending = 0;
    var fiedler_pending = 0;
    var misc_ready = false;
    var fiedler_ready = false;

    var mask_check = document.getElementById('mask-check');
    var rank_select = document.getElementById('rank-select');

    function update() {
        if (misc_pending < 2) {
            misc_pending++;
            misc_worker.postMessage({
                action: 'queue_update'
            });
        }
        if (fiedler_pending < 2) {
            fiedler_pending++;
            fiedler_worker.postMessage({
                action: 'queue_update'
            });
        }
    }
    mask_check.onchange = update;
    rank_select.onchange = update;

    misc_worker.onmessage = function(event) {
        var msg = event.data;
        if (msg.action == 'redraw_graph') {
            redraw_graph(msg.weight_data, mask_check.checked ? msg.mask_data : null);
        } else if (msg.action == 'redraw_histo') {
            redraw_histo(msg.bias_histo_data, msg.weight_histo_data, msg.curve_data);
            misc_pending--;
        } else if (msg.action == 'init') {
            misc_ready = true;
            if (misc_ready && fiedler_ready)
                update();
        } else if (msg.action == 'get_rhoc') {
            misc_worker.postMessage({
                action: 'current_rhoc',
                calc_fiedler: false,
                use_mask: mask_check.checked,
                rank: parseInt(rank_select.options[rank_select.selectedIndex].value),
                rhoc: rhoc
            });
        }
    };

    fiedler_worker.onmessage = function(event) {
        var msg = event.data;
        if (msg.action == 'redraw_fiedler') {
            redraw_fiedler(msg.fiedler_bitmap);
            redraw_fiedler_histo(msg.min, msg.max, msg.step, msg.oom, msg.fiedler_histo);
            fiedler_pending--;
        } else if (msg.action == 'init') {
            fiedler_ready = true;
            if (misc_ready && fiedler_ready)
                update();
        } else if (msg.action == 'get_rhoc') {
            fiedler_worker.postMessage({
                action: 'current_rhoc',
                calc_fiedler: true,
                use_mask: mask_check.checked,
                rank: parseInt(rank_select.options[rank_select.selectedIndex].value),
                rhoc: rhoc
            });
        }
    };


    var rhoc_text = document.getElementById('rhoc-text');
    var rhoc_slider = document.getElementById('rhoc-slider');

    function update_slider() {
        rhoc_slider.value = Math.log10(rhoc);
    }

    rhoc_text.onclick = function(event) {
        rhoc_text.select();
    }
    rhoc_text.onchange = function(event) {
        rhoc = parseFloat(rhoc_text.value);
        if (rhoc != NaN) {
            rhoc_text.value = rhoc;
            update_slider();
            update();
        } else {
            alert('Invalid number');
        }
        rhoc_text.select();
    };

    rhoc_slider.oninput = function(event) {
        rhoc = Math.pow(10, rhoc_slider.value);
        rhoc_text.value = rhoc;
        update();
    };

    rhoc = parseFloat(rhoc_text.value);
    update_slider();

    gnuplot_fiedler_canvas();

    boundingRect = {
        origin: {
            x: gnuplot.plot_xmin,
            y: gnuplot.plot_ytop
        },
        size: {
            width: gnuplot.plot_width,
            height: gnuplot.plot_height
        }
    };

    gnuplot_graph_canvas();

    grid_dx = gnuplot.plot_width / 28;
    grid_dy = -gnuplot.plot_height / 16;
    for (var j = 0; j < 17; ++j) {
        for (var i = 0; i < 29; ++i) {
            points.push({
                x: gnuplot.plot_xmin + i * grid_dx,
                y: gnuplot.plot_ybot + j * grid_dy
            });
        }
    }

    gnuplot_histo_canvas();
    gnuplot_fiedler_histo_canvas();
};
