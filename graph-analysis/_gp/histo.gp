set terminal canvas size 300,300
set output 'histo.html'
set margins 5,5,3.5,0.3

set logscale x

set multiplot layout 2,1
unset label 2

set xlabel 'bias'
set ylabel 'abs. freq.' offset 0.5,0
set y2label 'edge weight' offset -3.5,0
set xtics mirror offset 1,0
set ytics nomirror offset 0.6,0
set y2tics nomirror offset -1.2,0
set format x '10^{%T}'
set format y '10^{%T}'

set xrange [0.01:2000]
set yrange [1:200000]
set y2range [0:1]

set logscale y
plot '+' u (0):(0) not

set xrange [0:1]
unset y2tics
unset y2label
unset logscale x

set xtics offset 0,0
set format x
set ytics mirror
set xlabel 'edge weight'

plot '+' u (0):(0) not

