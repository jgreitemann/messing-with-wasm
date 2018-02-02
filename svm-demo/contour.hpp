#pragma once

#include "grid.hpp"

#include <deque>
#include <functional>
#include <vector>


namespace contour {

    using grid_type = grid<2, major_order::col>;
    using grid_iterator = typename grid_type::const_iterator;
    using point_type = typename grid_iterator::value_type;
    using scalar_fun_t = std::function<double(point_type const&)>;


    struct line_t {
        std::deque<point_type> points;
        bool closed = true;
    };

    std::vector<line_t> const contour_lines (scalar_fun_t f, grid_type const& g);
}
