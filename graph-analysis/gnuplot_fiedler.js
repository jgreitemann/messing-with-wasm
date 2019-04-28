var canvas, ctx;
gnuplot.grid_lines = true;
gnuplot.zoomed = false;
gnuplot.active_plot_name = "gnuplot_fiedler_canvas";

function gnuplot_fiedler_canvas() {
canvas = document.getElementById("gnuplot_fiedler_canvas");
ctx = canvas.getContext("2d");
// Gnuplot version 5.2.5
// short forms of commands provided by gnuplot_common.js
function DT  (dt)  {gnuplot.dashtype(dt);};
function DS  (x,y) {gnuplot.dashstart(x,y);};
function DL  (x,y) {gnuplot.dashstep(x,y);};
function M   (x,y) {if (gnuplot.pattern.length > 0) DS(x,y); else gnuplot.M(x,y);};
function L   (x,y) {if (gnuplot.pattern.length > 0) DL(x,y); else gnuplot.L(x,y);};
function Dot (x,y) {gnuplot.Dot(x/10.,y/10.);};
function Pt  (N,x,y,w) {gnuplot.Pt(N,x/10.,y/10.,w/10.);};
function R   (x,y,w,h) {gnuplot.R(x,y,w,h);};
function T   (x,y,fontsize,justify,string) {gnuplot.T(x,y,fontsize,justify,string);};
function TR  (x,y,angle,fontsize,justify,string) {gnuplot.TR(x,y,angle,fontsize,justify,string);};
function bp  (x,y) {gnuplot.bp(x,y);};
function cfp () {gnuplot.cfp();};
function cfsp() {gnuplot.cfsp();};

gnuplot.hypertext_list = [];
gnuplot.on_hypertext = -1;
function Hypertext(x,y,w,text) {
    newtext = {x:x, y:y, w:w, text:text};
    gnuplot.hypertext_list.push(newtext);
}
gnuplot.dashlength = 400;
ctx.lineCap = "round"; ctx.lineJoin = "round";
CanvasTextFunctions.enable(ctx);
ctx.strokeStyle = " rgb(215,215,215)";
ctx.lineWidth = 1;

ctx.lineWidth = 1;
ctx.strokeStyle = " rgb(000,000,000)";
ctx.beginPath();
M(560,2020);
L(660,2020);
M(3839,2020);
L(3739,2020);
ctx.stroke();
ctx.closePath();
ctx.fillStyle = " rgb(000,000,000)";
T(480,2070,10.0,"Right"," 0.001");
ctx.beginPath();
M(560,1876);
L(610,1876);
M(3839,1876);
L(3789,1876);
M(560,1791);
L(610,1791);
M(3839,1791);
L(3789,1791);
M(560,1731);
L(610,1731);
M(3839,1731);
L(3789,1731);
M(560,1685);
L(610,1685);
M(3839,1685);
L(3789,1685);
M(560,1647);
L(610,1647);
M(3839,1647);
L(3789,1647);
M(560,1615);
L(610,1615);
M(3839,1615);
L(3789,1615);
M(560,1587);
L(610,1587);
M(3839,1587);
L(3789,1587);
M(560,1562);
L(610,1562);
M(3839,1562);
L(3789,1562);
M(560,1540);
L(660,1540);
M(3839,1540);
L(3739,1540);
ctx.stroke();
ctx.closePath();
T(480,1590,10.0,"Right"," 0.01");
ctx.beginPath();
M(560,1396);
L(610,1396);
M(3839,1396);
L(3789,1396);
M(560,1311);
L(610,1311);
M(3839,1311);
L(3789,1311);
M(560,1251);
L(610,1251);
M(3839,1251);
L(3789,1251);
M(560,1205);
L(610,1205);
M(3839,1205);
L(3789,1205);
M(560,1167);
L(610,1167);
M(3839,1167);
L(3789,1167);
M(560,1135);
L(610,1135);
M(3839,1135);
L(3789,1135);
M(560,1107);
L(610,1107);
M(3839,1107);
L(3789,1107);
M(560,1082);
L(610,1082);
M(3839,1082);
L(3789,1082);
M(560,1060);
L(660,1060);
M(3839,1060);
L(3739,1060);
ctx.stroke();
ctx.closePath();
T(480,1110,10.0,"Right"," 0.1");
ctx.beginPath();
M(560,916);
L(610,916);
M(3839,916);
L(3789,916);
M(560,832);
L(610,832);
M(3839,832);
L(3789,832);
M(560,772);
L(610,772);
M(3839,772);
L(3789,772);
M(560,725);
L(610,725);
M(3839,725);
L(3789,725);
M(560,687);
L(610,687);
M(3839,687);
L(3789,687);
M(560,655);
L(610,655);
M(3839,655);
L(3789,655);
M(560,627);
L(610,627);
M(3839,627);
L(3789,627);
M(560,603);
L(610,603);
M(3839,603);
L(3789,603);
M(560,581);
L(660,581);
M(3839,581);
L(3739,581);
ctx.stroke();
ctx.closePath();
T(480,631,10.0,"Right"," 1");
ctx.beginPath();
M(560,436);
L(610,436);
M(3839,436);
L(3789,436);
M(560,352);
L(610,352);
M(3839,352);
L(3789,352);
M(560,292);
L(610,292);
M(3839,292);
L(3789,292);
M(560,245);
L(610,245);
M(3839,245);
L(3789,245);
M(560,207);
L(610,207);
M(3839,207);
L(3789,207);
M(560,175);
L(610,175);
M(3839,175);
L(3789,175);
M(560,147);
L(610,147);
M(3839,147);
L(3789,147);
M(560,123);
L(610,123);
M(3839,123);
L(3789,123);
M(560,101);
L(660,101);
M(3839,101);
L(3739,101);
ctx.stroke();
ctx.closePath();
T(480,151,10.0,"Right"," 10");
ctx.beginPath();
M(560,2020);
L(560,1920);
M(560,101);
L(560,201);
ctx.stroke();
ctx.closePath();
T(560,2170,10.0,"Center","-1");
ctx.beginPath();
M(1028,2020);
L(1028,1920);
M(1028,101);
L(1028,201);
ctx.stroke();
ctx.closePath();
T(1028,2170,10.0,"Center","-0.8");
ctx.beginPath();
M(1497,2020);
L(1497,1920);
M(1497,101);
L(1497,201);
ctx.stroke();
ctx.closePath();
T(1497,2170,10.0,"Center","-0.6");
ctx.beginPath();
M(1965,2020);
L(1965,1920);
M(1965,101);
L(1965,201);
ctx.stroke();
ctx.closePath();
T(1965,2170,10.0,"Center","-0.4");
ctx.beginPath();
M(2434,2020);
L(2434,1920);
M(2434,101);
L(2434,201);
ctx.stroke();
ctx.closePath();
T(2434,2170,10.0,"Center","-0.2");
ctx.beginPath();
M(2902,2020);
L(2902,1920);
M(2902,101);
L(2902,201);
ctx.stroke();
ctx.closePath();
T(2902,2170,10.0,"Center"," 0");
ctx.beginPath();
M(3371,2020);
L(3371,1920);
M(3371,101);
L(3371,201);
ctx.stroke();
ctx.closePath();
T(3371,2170,10.0,"Center"," 0.2");
ctx.beginPath();
M(3839,2020);
L(3839,1920);
M(3839,101);
L(3839,201);
ctx.stroke();
ctx.closePath();
T(3839,2170,10.0,"Center"," 0.4");
ctx.beginPath();
M(560,101);
L(560,2020);
L(3839,2020);
L(3839,101);
L(560,101);
ctx.closePath();
ctx.stroke();
ctx.beginPath();
M(100,1061);
M(101,1280);
ctx.stroke();
ctx.closePath();
TR(101,1330,270,10.0,"","T / J");
TR(130,994,270,8.0,"","zz");
ctx.beginPath();
M(2199,2320);
M(1948,2320);
ctx.stroke();
ctx.closePath();
T(1948,2370,10.0,"","J");
T(2012,2401,8.0,"","+");
T(2076,2370,10.0,""," / J");
T(2348,2401,8.0,"","zz");
if (typeof(gnuplot.hide_gp_plot_1) == "undefined"|| !gnuplot.hide_gp_plot_1) {
ctx.strokeStyle = "rgba(148,000,211,1.00)";
ctx.fillStyle = "rgba(148,000,211,1.00)";
} // End gp_plot_1 
ctx.lineWidth = 2;
ctx.strokeStyle = " rgb(000,000,000)";
DT(gnuplot.solid);
ctx.lineWidth = 1;
ctx.beginPath();
M(560,101);
L(560,2020);
L(3839,2020);
L(3839,101);
L(560,101);
ctx.closePath();
ctx.stroke();

// plot boundaries and axis scaling information for mousing 
gnuplot.plot_term_xmax = 400;
gnuplot.plot_term_ymax = 250;
gnuplot.plot_xmin = 56.0;
gnuplot.plot_xmax = 383.9;
gnuplot.plot_ybot = 202.0;
gnuplot.plot_ytop = 10.1;
gnuplot.plot_width = 327.9;
gnuplot.plot_height = 191.9;
gnuplot.plot_axis_xmin = -1;
gnuplot.plot_axis_xmax = 0.4;
gnuplot.plot_axis_ymin = 0.001;
gnuplot.plot_axis_ymax = 10;
gnuplot.plot_axis_x2min = "none"
gnuplot.plot_axis_y2min = "none"
gnuplot.plot_logaxis_x = 0;
gnuplot.plot_logaxis_y = 1;
gnuplot.plot_timeaxis_x = "";
gnuplot.plot_timeaxis_y = "";
gnuplot.plot_axis_width = gnuplot.plot_axis_xmax - gnuplot.plot_axis_xmin;
gnuplot.plot_axis_height = gnuplot.plot_axis_ymax - gnuplot.plot_axis_ymin;
}