var add_point;
var clear_points;
var get_model;
var get_SV_coord;

var Module = {
    preRun: [],
    postRun: function () {
        add_point = Module.cwrap('add_point', null, ['number', 'number', 'number']);
        clear_points = Module.cwrap('clear_points', null, []);
        get_model = Module.cwrap('get_model', 'number', ['number']);
        get_SV_coord = Module.cwrap('get_SV_coord', 'number', ['number']);

        get_n_lines_zero = Module.cwrap('get_n_lines_zero', 'number', []);
        get_n_line_points_zero = Module.cwrap('get_n_line_points_zero', 'number', ['number']);
        get_line_points_zero = Module.cwrap('get_line_points_zero', 'number', ['number']);
        get_line_closed_zero = Module.cwrap('get_line_closed_zero', 'number', ['number']);

        get_n_lines_plus = Module.cwrap('get_n_lines_plus', 'number', []);
        get_n_line_points_plus = Module.cwrap('get_n_line_points_plus', 'number', ['number']);
        get_line_points_plus = Module.cwrap('get_line_points_plus', 'number', ['number']);
        get_line_closed_plus = Module.cwrap('get_line_closed_plus', 'number', ['number']);

        get_n_lines_minus = Module.cwrap('get_n_lines_minus', 'number', []);
        get_n_line_points_minus = Module.cwrap('get_n_line_points_minus', 'number', ['number']);
        get_line_points_minus = Module.cwrap('get_line_points_minus', 'number', ['number']);
        get_line_closed_minus = Module.cwrap('get_line_closed_minus', 'number', ['number']);
    },
    print: function (text) {
        console.log(text);
    },
    totalDependencies: 0
};

var nice = [];
var naughty = [];

window.onload = function () {
    var nu_text = document.getElementById('nu-text');
    var nu_slider = document.getElementById('nu-slider');
    var nu = parseFloat(nu_text.value);
    var SVcheckbox = document.getElementById('SVcheckbox');

    var warning = document.getElementById('two-class-warning');
    var exception_box = document.getElementById('exception');
    var exception_text = document.getElementById('exception-text');

    function show_exception (text) {
        exception_text.innerHTML = text;
        exception_box.style = 'display: visible;';
    }
    function hide_exception () {
        exception_text.innerHTML = '';
        exception_box.style = 'display: none;';
    }
    hide_exception();

    function update_slider () {
        nu_slider.value = nu * 100;
    }
    update_slider();

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    function getMousePos(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function edge_index(x, y) {
        var eps = 0.1;
        if (Math.abs(x) < eps)
            return 3;
        if (Math.abs(y) < eps)
            return 0;
        if (Math.abs(x - canvas.width) < eps)
            return 1;
        if (Math.abs(y - canvas.height) < eps)
            return 2;
    }

    function traverse_boundary(ax, ay, bx, by, dir) {
        var start_edge = edge_index(ax, ay);
        var target_edge = edge_index(bx, by);
        var current_edge = start_edge;
        var x = ax, y = ay;
        while (current_edge != target_edge) {
            if (dir == 'ccw') {
                switch (current_edge) {
                case 0:
                    x = 0;
                    break;
                case 1:
                    y = 0;
                    break;
                case 2:
                    x = canvas.width;
                    break;
                case 3:
                    y = canvas.height;
                    break;
                }
                ctx.lineTo(x, y);
                current_edge = (current_edge + 3) % 4;
            } else {
                switch (current_edge) {
                case 0:
                    x = canvas.width;
                    break;
                case 1:
                    y = canvas.height;
                    break;
                case 2:
                    x = 0;
                    break;
                case 3:
                    y = 0;
                    break;
                }
                ctx.lineTo(x, y);
                current_edge = (current_edge + 1) % 4;
            }
        }
        ctx.lineTo(bx, by);
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var r = 5;

        if (nice.length > 0 && naughty.length > 0) {
            warning.style = "display: none;";
            var ptr = get_model(nu);
            if (ptr != 0) {
                hide_exception();
                var a = Module.getValue(ptr, 'double');
                var b = Module.getValue(ptr+8, 'double');
                var rho = Module.getValue(ptr+16, 'double');

                console.log('a = ' + a + ', b = ' + b + ', rho = ' + rho);

                ctx.strokeStyle = '#999999';
                ctx.lineWidth = 1;
                ctx.fillStyle = '#dddddd';
                if (false) {
                    ctx.beginPath();
                    ctx.moveTo(0, (rho - 1) / b);
                    ctx.lineTo(canvas.width, (rho - 1 - a * canvas.width) / b);
                    ctx.lineTo(canvas.width, (rho + 1 - a * canvas.width) / b);
                    ctx.lineTo(0, (rho + 1) / b);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    {
                        var n_lines = get_n_lines_minus();
                        for (var i = 0; i < n_lines; ++i) {
                            var n_pt = get_n_line_points_minus(i);
                            var ptr = get_line_points_minus(i);
                            ctx.moveTo(Module.getValue(ptr, 'double'),
                                       Module.getValue(ptr + 8, 'double'));
                            for (var j = 1; j < n_pt; ++j) {
                                ctx.lineTo(Module.getValue(ptr + 16*j, 'double'),
                                           Module.getValue(ptr + 16*j + 8, 'double'));
                            }
                            if (get_line_closed_minus(i)) {
                                ctx.lineTo(Module.getValue(ptr, 'double'),
                                           Module.getValue(ptr + 8, 'double'));
                            } else {
                                traverse_boundary(Module.getValue(ptr + 16*(n_pt-1), 'double'),
                                                  Module.getValue(ptr + 16*(n_pt-1) + 8, 'double'),
                                                  Module.getValue(ptr, 'double'),
                                                  Module.getValue(ptr + 8, 'double'),
                                                  'ccw');
                            }
                        }
                    }
                    {
                        var n_lines = get_n_lines_plus();
                        for (var i = 0; i < n_lines; ++i) {
                            var n_pt = get_n_line_points_plus(i);
                            var ptr = get_line_points_plus(i);
                            ctx.moveTo(Module.getValue(ptr + 16*(n_pt-1), 'double'),
                                       Module.getValue(ptr + 16*(n_pt-1) + 8, 'double'));
                            for (var j = n_pt - 2; j >= 0; --j) {
                                ctx.lineTo(Module.getValue(ptr + 16*j, 'double'),
                                           Module.getValue(ptr + 16*j + 8, 'double'));
                            }
                            if (get_line_closed_plus(i)) {
                                ctx.lineTo(Module.getValue(ptr + 16*(n_pt-1), 'double'),
                                           Module.getValue(ptr + 16*(n_pt-1) + 8, 'double'));
                            } else {
                                traverse_boundary(Module.getValue(ptr, 'double'),
                                                  Module.getValue(ptr + 8, 'double'),
                                                  Module.getValue(ptr + 16*(n_pt-1), 'double'),
                                                  Module.getValue(ptr + 16*(n_pt-1) + 8, 'double'),
                                                  'cw');
                            }
                        }
                    }
                    ctx.fill('evenodd');
                    ctx.stroke();
                }

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                if (false) {
                    ctx.beginPath();
                    ctx.moveTo(0, rho / b);
                    ctx.lineTo(canvas.width, (rho - a * canvas.width) / b);
                    ctx.stroke();
                } else {
                    var n_lines = get_n_lines_zero();
                    for (var i = 0; i < n_lines; ++i) {
                        var n_pt = get_n_line_points_zero(i);
                        var ptr = get_line_points_zero(i);
                        ctx.beginPath();
                        ctx.moveTo(Module.getValue(ptr, 'double'),
                                   Module.getValue(ptr + 8, 'double'));
                        for (var j = 1; j < n_pt; ++j) {
                            ctx.lineTo(Module.getValue(ptr + 16*j, 'double'),
                                       Module.getValue(ptr + 16*j + 8, 'double'));
                        }
                        if (get_line_closed_zero(i)) {
                            ctx.closePath();
                        }
                        ctx.stroke();
                    }
                }
            } else {
                except_str = Module.ccall('get_err_string', 'string', [], []);
                show_exception(except_str);
            }
        } else {
            warning.style = "display: visible;";
        }

        ctx.fillStyle = 'green';
        nice.forEach(function (pt) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, r, 0, 2*Math.PI, false);
            ctx.fill();
        });
        ctx.fillStyle = 'red';
        naughty.forEach(function (pt) {
            ctx.fillRect(pt.x - r, pt.y - r, 2*r, 2*r);
        });

        if (SVcheckbox.checked) {
            ctx.strokeStyle = 'blue';
            var SV_ptr;
            for (var i = 0; SV_ptr = get_SV_coord(i); ++i) {
                var SV_x = Module.getValue(SV_ptr, 'double');
                var SV_y = Module.getValue(SV_ptr+8, 'double');
                ctx.beginPath();
                ctx.arc(SV_x, SV_y, 1.5*r, 0, 2*Math.PI, false);
                ctx.stroke();
            }
        }
    }

    canvas.oncontextmenu = function () { return false; };
    canvas.addEventListener('mousedown', function (event) {
        var pos = getMousePos(event);

        console.log(pos.x + ', ' + pos.y + ': ' + event.button);

        if (event.button == 0) {
            nice.push(pos);
        } else {
            naughty.push(pos);
        }

        add_point(pos.x, pos.y, 1 ? event.button == 0 : -1);

        redraw();
    }, false);

    nu_text.onchange = function (event) {
        nu = parseFloat(nu_text.value);
        update_slider();
        redraw();
    };

    nu_slider.oninput = function (event) {
        nu = 0.01 * nu_slider.value;
        nu_text.value = nu;
        redraw();
    };

    SVcheckbox.onclick = function (event) {
        redraw();
    };

    document.getElementById('clear-button').onclick = function (event) {
        nice = [];
        naughty = [];
        clear_points();
        redraw();
    };
};
