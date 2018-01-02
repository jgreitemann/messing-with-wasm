#include "colormap.hpp"

#include <algorithm>
#include <cmath>
#include <complex>
#include <iostream>
#include <sstream>
#include <utility>
#include <vector>
#include <stack>


#include <fstream>


template <typename Color>
uint8_t * write_px (Color const& px, uint8_t * d) {
    color::color<color::space::rgba> rgba(px);
    std::stringstream ss(std::ios_base::in | std::ios_base::out | std::ios_base::binary);
    rgba.write(ss);
    std::string str = ss.str();
    return std::copy(str.begin(), str.end(), d);
}

std::vector<std::string> palette_names;

auto default_viewport = std::make_pair(std::make_pair(-2.5,1.), std::make_pair(-1.,1.));
auto viewport = default_viewport;
std::stack<decltype(viewport)> undo_stack;

extern "C" {

    int main () {
        // prep palette names
        for (auto pair : color::palettes) {
            std::string const& name = pair.first;
            palette_names.push_back(name);
        }
    }

    int get_number_of_palettes () {
        return palette_names.size();
    }

    char const * get_palette_name (int idx) {
        return palette_names[idx].c_str();
    }

    void set_viewport (double x0, double y0, double x1, double y1) {
        undo_stack.push(viewport);
        viewport = std::make_pair(
            std::make_pair(viewport.first.first + std::min(x0, x1) * (viewport.first.second - viewport.first.first),
                           viewport.first.first + std::max(x0, x1) * (viewport.first.second - viewport.first.first)),
            std::make_pair(viewport.second.first + std::min(y0, y1) * (viewport.second.second - viewport.second.first),
                           viewport.second.first + std::max(y0, y1) * (viewport.second.second - viewport.second.first))
            );
    }

    void reset_viewport () {
        undo_stack.push(viewport);
        viewport = default_viewport;
    }

    void undo_zoom () {
        if (!undo_stack.empty()) {
            viewport = undo_stack.top();
            undo_stack.pop();
        }
    }

    void mandelbrot (int width, int height, uint8_t * data, int pal_idx) {
        size_t max_it = 1000;
        double bail_out = std::pow(2, 16);
        auto dim = std::make_pair(width, height);
        auto delta = std::make_pair((viewport.first.second - viewport.first.first)/(dim.first-1),
                                    (viewport.second.second - viewport.second.first)/(dim.second-1));
        auto func = [] (double x) { return pow(x, 0.1); };
        auto pal = color::palettes.at(palette_names[pal_idx]).rescale(1, func(max_it));
        auto black = pal(0.);

        for (size_t j = 0; j < dim.second; ++j) {
            for (size_t i = 0; i < dim.first; ++i) {
                std::complex<double> c = {viewport.first.first + i * delta.first,
                                          viewport.second.first + j * delta.second};
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
