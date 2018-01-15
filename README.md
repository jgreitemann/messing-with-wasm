An exploration of WebAssembly
=============================

[Project listing](https://jgreitemann.github.io/messing-with-wasm/)
-----------------

### [Hello, world](https://jgreitemann.github.io/messing-with-wasm/hello-world)
Show a JavaScript alert box with a &quot;Hello, world!&quot;
message from stdout of a WASM module.

### [Linear Memory](https://jgreitemann.github.io/messing-with-wasm/linear-memory)
Transfer an integer from JavaScript input to the WASM module,
add 42 to it and receive the result back in JavaScript.

### [Mandelbrot Set](https://jgreitemann.github.io/messing-with-wasm/mandelbrot)
Calculate the Mandelbrot set from within a C/C++ program,
compiled into a WASM module, and plot it in a HTML5 Canvas.
Different colormaps (from ColorBrewer) can be applied,
zooming is supported.

### [Support Vector Machine](https://jgreitemann.github.io/messing-with-wasm/svm-demo)
Toy around with support vector machines (SVM). Click in a
HTML5 canvas to add 2D data points from two classes (left
and right click, respectively). The SVM will &quot;learn&quot;
a model (line with margin) to separate these data as best as
possible. This demo uses a 
[C++ wrapper library](https://github.com/jgreitemann/svm) 
which is based on the 
[libsvm](https://github.com/cjlin1/libsvm)
C library. WebAssembly is used to bring these technologies
to the Web.
