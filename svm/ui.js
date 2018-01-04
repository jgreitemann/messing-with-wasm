var add_point;
var get_model;

var Module = {
    preRun: [],
    postRun: function () {
        add_point = Module.cwrap('add_point', null, ['number', 'number', 'number']);
        get_model = Module.cwrap('get_model', 'number', ['number']);
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
    var nu = parseFloat(nu_text.value);

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    function getMousePos(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var r = 5;

        if (nice.length > 0 && naughty.length > 0) {
            var ptr = get_model(nu);
            var a = Module.getValue(ptr, 'double');
            var b = Module.getValue(ptr+8, 'double');
            var rho = Module.getValue(ptr+16, 'double');

            console.log('a = ' + a + ', b = ' + b + ', rho = ' + rho);

            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1;
            ctx.fillStyle = '#dddddd';
            ctx.beginPath();
            ctx.moveTo(0, (rho - 1) / b);
            ctx.lineTo(canvas.width, (rho - 1 - a * canvas.width) / b);
            ctx.lineTo(canvas.width, (rho + 1 - a * canvas.width) / b);
            ctx.lineTo(0, (rho + 1) / b);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, rho / b);
            ctx.lineTo(canvas.width, (rho - a * canvas.width) / b);
            ctx.stroke();
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
        redraw();
    };

};
