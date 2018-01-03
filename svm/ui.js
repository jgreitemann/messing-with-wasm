var Module = {
    preRun: [],
    postRun: function () {
    },
    totalDependencies: 0
};

var nice = [];
var naughty = [];

window.onload = function () {
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

        redraw();
    }, false);

};
