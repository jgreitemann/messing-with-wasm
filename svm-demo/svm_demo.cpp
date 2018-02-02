#include <svm-wrapper.hpp>
#include <grid.hpp>
#include "contour.hpp"

#include <cmath>
#include <string>
#include <vector>



double test_func (contour::point_type const& xs, double shift = 0.) {
    double x = xs[0];
    double y = xs[1];
    return (4. * exp(-10.*(pow(x-.6,2.)+pow(y-.5,2.)))
            + 2. * exp(-15.*(pow(x-.2,2.)+5.*pow(y-.7,2.)))
            - exp(-20.*(pow(x-.4,2.)+pow(y-.7,2.)))
            - 2. + shift);
}


using problem_t = svm::problem<svm::kernel::linear>;
problem_t prob(2);
std::vector<double> model_coeffs;
std::vector<double> SV_coords;
std::string err_str;

extern "C" {

    int main () {
        auto lines = contour::contour_lines(
            [] (contour::point_type const& xs) { return test_func(xs, 0.); },
            {{26, {0., 1.}}, {51, {0., 1.}}});
        for (auto const& line : lines) {
            for (auto const& pt : line.points)
                std::cout << pt[0] << ' ' << pt[1] << '\n';
            if (line.closed)
                std::cout << line.points.front()[0] << ' ' << line.points.front()[1] << '\n';
            std::cout << '\n';
        }
    }

    void add_point (double x, double y, double label) {
        prob.add_sample({x, y}, label);
    }

    void clear_points () {
        prob = problem_t(2);
        SV_coords.clear();
    }

    double * get_model (double nu) {
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

}
