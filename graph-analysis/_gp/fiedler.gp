set terminal canvas size 400,250
set output 'fiedler.html'
set margins 7,2,4.8,1

set logscale y
set xrange [-1:0.4]
set yrange [0.001:10]

set ylabel 'T / J_{zz}' offset 2.5,0
set xlabel 'J_{+} / J_{zz}' offset 0,-0.5

plot '+' u (0):(0) not
