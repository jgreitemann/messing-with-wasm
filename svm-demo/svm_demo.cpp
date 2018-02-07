#include <svm-wrapper.hpp>
#include <grid.hpp>
#include "contour.hpp"

#include <cmath>
#include <string>
#include <vector>


using problem_t = svm::problem<svm::kernel::linear>;
problem_t prob(2);
std::vector<double> model_coeffs;
std::vector<double> SV_coords;
std::string err_str;

using contour_line_data_type = std::vector<std::vector<double>>;
using contour_closed_type = std::vector<bool>;
using contour_result_type = std::pair<contour_line_data_type,
                                      contour_closed_type>;
contour_line_data_type line_points_zero, line_points_plus, line_points_minus;
contour_closed_type line_closed_zero, line_closed_plus, line_closed_minus;

contour_result_type calc_contour_lines (contour::scalar_fun_t func) {
    contour_result_type result;
    auto & [line_points, line_closed] = result;
    contour::grid_type g {{71, {-3.5, 3.5}}, {41, {-2, 2}}};
    line_points.clear();
    line_closed.clear();
    auto lines = contour::contour_lines(func, g);
    for (auto const& line : lines) {
        std::vector<double> lp;
        line_points.reserve(2 * line.points.size());
        for (auto const& pt : line.points) {
            lp.push_back(pt[0]);
            lp.push_back(pt[1]);
        }
        line_points.push_back(lp);
        line_closed.push_back(line.closed);
    }
    return result;
}

template <typename Kernel>
int get_model (double nu) {
    svm::problem<Kernel> prob_local(2);
    for (size_t i = 0; i < prob.size(); ++i) {
        auto sample = prob[i];
        prob_local.add_sample(sample.first, sample.second);
    }
    err_str = "";
    try {
        SV_coords.clear();
        svm::model<Kernel> model(std::move(prob_local), svm::parameters<Kernel>(nu));
        for (auto p : model)
            for (double c : p.second)
                SV_coords.push_back(c);
        std::tie(line_points_zero, line_closed_zero)
            = calc_contour_lines([&model] (contour::point_type const& pt) {
                    return model(pt).second;
                });
        std::tie(line_points_plus, line_closed_plus)
            = calc_contour_lines([&model] (contour::point_type const& pt) {
                    return model(pt).second + 1;
                });
        std::tie(line_points_minus, line_closed_minus)
            = calc_contour_lines([&model] (contour::point_type const& pt) {
                    return model(pt).second - 1;
                });
        return 0;
    } catch (std::runtime_error const& err) {
        err_str = err.what();
        return -1;
    }
}

template <>
int get_model<svm::kernel::linear> (double nu) {
    using Kernel = svm::kernel::linear;
    svm::problem<Kernel> prob_local(2);
    for (size_t i = 0; i < prob.size(); ++i) {
        auto sample = prob[i];
        prob_local.add_sample(sample.first, sample.second);
    }
    err_str = "";
    try {
        SV_coords.clear();
        svm::model<Kernel> model(std::move(prob_local), svm::parameters<Kernel>(nu));
        for (auto p : model)
            for (double c : p.second)
                SV_coords.push_back(c);
        svm::linear_introspector<Kernel> introspector(model);
        model_coeffs = {
            introspector.coefficient(0),
            introspector.coefficient(1),
            model.rho()
        };
        return 1;
    } catch (std::runtime_error const& err) {
        err_str = err.what();
        return -1;
    }
}

extern "C" {

    int main () {
    }

    void add_point (double x, double y, double label) {
        prob.add_sample({x, y}, label);
    }

    void clear_points () {
        prob = problem_t(2);
        SV_coords.clear();
    }

    int get_model_linear (double nu) {
        return get_model<svm::kernel::linear>(nu);
    }

    int get_model_quadratic (double nu) {
        return get_model<svm::kernel::polynomial<2>>(nu);
    }

    int get_model_rbf (double nu) {
        return get_model<svm::kernel::rbf>(nu);
    }

    int get_model_sigmoid (double nu) {
        return get_model<svm::kernel::sigmoid>(nu);
    }

    double const * get_SV_coord (size_t i) {
        if ((2*i+1) >= SV_coords.size())
            return NULL;
        return &SV_coords[2*i];
    }

    char const * get_err_string () {
        return err_str.c_str();
    }

    size_t get_n_lines_zero () {
        return line_points_zero.size();
    }

    size_t get_n_line_points_zero (size_t i) {
        return line_points_zero[i].size() / 2;
    }

    double * get_line_points_zero (size_t i) {
        return line_points_zero[i].data();
    }

    bool get_line_closed_zero (size_t i) {
        return line_closed_zero[i];
    }

    size_t get_n_lines_plus () {
        return line_points_plus.size();
    }

    size_t get_n_line_points_plus (size_t i) {
        return line_points_plus[i].size() / 2;
    }

    double * get_line_points_plus (size_t i) {
        return line_points_plus[i].data();
    }

    bool get_line_closed_plus (size_t i) {
        return line_closed_plus[i];
    }

    size_t get_n_lines_minus () {
        return line_points_minus.size();
    }

    size_t get_n_line_points_minus (size_t i) {
        return line_points_minus[i].size() / 2;
    }

    double * get_line_points_minus (size_t i) {
        return line_points_minus[i].data();
    }

    bool get_line_closed_minus (size_t i) {
        return line_closed_minus[i];
    }

    double * get_model_coeffs () {
        return model_coeffs.data();
    }

}
