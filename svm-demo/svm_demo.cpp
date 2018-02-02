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

std::vector<std::vector<double>> line_points_zero, line_points_plus, line_points_minus;
std::vector<bool> line_closed_zero, line_closed_plus, line_closed_minus;

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

    double * get_model (double nu) {
        using Kernel = svm::kernel::polynomial<2>;
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

            contour::grid_type g {{99, {0, 981}}, {57, {0, 561}}};
            {
                line_points_zero.clear();
                line_closed_zero.clear();
                auto lines = contour::contour_lines(
                    [&model] (contour::point_type const& pt) {
                        return model(pt).second;
                    }, g);
                for (auto const& line : lines) {
                    std::vector<double> line_points;
                    line_points.reserve(2 * line.points.size());
                    for (auto const& pt : line.points) {
                        line_points.push_back(pt[0]);
                        line_points.push_back(pt[1]);
                    }
                    line_points_zero.push_back(line_points);
                    line_closed_zero.push_back(line.closed);
                }
            }
            {
                line_points_plus.clear();
                line_closed_plus.clear();
                auto lines = contour::contour_lines(
                    [&model] (contour::point_type const& pt) {
                        return model(pt).second + 1;
                    }, g);
                for (auto const& line : lines) {
                    std::vector<double> line_points;
                    line_points.reserve(2 * line.points.size());
                    for (auto const& pt : line.points) {
                        line_points.push_back(pt[0]);
                        line_points.push_back(pt[1]);
                    }
                    line_points_plus.push_back(line_points);
                    line_closed_plus.push_back(line.closed);
                }
            }
            {
                line_points_minus.clear();
                line_closed_minus.clear();
                auto lines = contour::contour_lines(
                    [&model] (contour::point_type const& pt) {
                        return model(pt).second - 1;
                    }, g);
                for (auto const& line : lines) {
                    std::vector<double> line_points;
                    line_points.reserve(2 * line.points.size());
                    for (auto const& pt : line.points) {
                        line_points.push_back(pt[0]);
                        line_points.push_back(pt[1]);
                    }
                    line_points_minus.push_back(line_points);
                    line_closed_minus.push_back(line.closed);
                }
            }

            return model_coeffs.data();
        } catch (std::runtime_error const& err) {
            err_str = err.what();
            return nullptr;
        }
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

}
