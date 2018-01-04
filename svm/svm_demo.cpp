#include <svm-wrapper.hpp>

#include <stdexcept>
#include <memory>
#include <vector>
#include <string>


using problem_t = svm::problem<svm::kernel::linear>;
problem_t prob(2);
std::vector<double> model_coeffs;
std::string err_str;

extern "C" {

    int main () {
    }

    void add_point (double x, double y, double label) {
        prob.add_sample({x, y}, label);
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
            svm::model<Kernel> model(std::move(prob_local), svm::parameters<Kernel>(nu));
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

    char const * get_err_string () {
        return err_str.c_str();
    }

}
