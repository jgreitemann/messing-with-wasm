set terminal canvas size 300,200
set output 'fiedler_histo.html'

set margins 5.5,2,3,1

set xrange [-0.06:0.08]
set yrange [0:110]
set ylabel 'abs. frequency' offset 2,0

load 'palettes/spectral_mod.pal'

unset xtics

set colorbox horizontal user origin graph 0,graph 0 size graph 1, screen -0.05 back
set cbrange [-0.06:0.08]
unset cbtics

plot '+' w image not
