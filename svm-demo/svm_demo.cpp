#include <svm-wrapper.hpp>

#include <stdexcept>
#include <memory>
#include <vector>
#include <string>


using problem_t = svm::problem<svm::kernel::linear>;
problem_t prob(2);
std::vector<double> model_coeffs;
std::vector<double> SV_coords;
std::string err_str;

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
