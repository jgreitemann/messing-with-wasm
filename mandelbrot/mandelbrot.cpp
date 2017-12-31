#include "colormap.hpp"

#include <algorithm>
#include <cmath>
#include <complex>
#include <iostream>
#include <sstream>
#include <utility>


#include <fstream>


template <typename Color>
uint8_t * write_px (Color const& px, uint8_t * d) {
    color::color<color::space::rgba> rgba(px);
    std::stringstream ss(std::ios_base::in | std::ios_base::out | std::ios_base::binary);
    rgba.write(ss);
    std::string str = ss.str();
    return std::copy(str.begin(), str.end(), d);
}


extern "C" {

    void mandelbrot (int width, int height, uint8_t * data) {
        size_t max_it = 1000;
        double bail_out = std::pow(2, 16);
        auto dim = std::make_pair(width, height);
        auto canvas = std::make_pair(std::make_pair(-2.5,1.), std::make_pair(-1.,1.));
        auto delta = std::make_pair((canvas.first.second - canvas.first.first)/(dim.first-1),
                                    (canvas.second.second - canvas.second.first)/(dim.second-1));
        auto func = [] (double x) { return pow(x, 0.1); };
        auto pal = color::palettes.at("inferno").rescale(1, func(max_it));
        auto black = pal(0.);

        for (size_t j = 0; j < dim.second; ++j) {
            for (size_t i = 0; i < dim.first; ++i) {
                std::complex<double> c = {canvas.first.first + i * delta.first,
                                          canvas.second.first + j * delta.second};
                std::complex<double> z = 0.;
                size_t it;
                for (it = 0; it < max_it && std::norm(z) < bail_out; ++it)
                    z = z * z + c;
                if (it < max_it) {
                    double log2_z = log(std::norm(z)) * 0.5 / log(2);
                    double nu = log(log2_z) / log(2);
                    data = write_px(pal(func(it + 1 - nu)), data);
                } else {
                    data = write_px(black, data);
                }
            }
        }

    }

}
