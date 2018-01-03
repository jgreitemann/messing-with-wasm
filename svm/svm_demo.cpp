#include <svm-wrapper.hpp>

#include <memory>
#include <vector>


using problem_t = svm::problem<svm::kernel::linear>;
problem_t prob(2);
std::vector<double> model_coeffs;

extern "C" {

    int main () {
    }

    void add_point (double x, double y, double label) {
        prob.add_sample({x, y}, label);
    }

    double * get_model () {
        using Kernel = svm::kernel::linear;
        svm::problem<Kernel> prob_local(2);
        for (size_t i = 0; i < prob.size(); ++i) {
            auto sample = prob[i];
            prob_local.add_sample(sample.first, sample.second);
        }
        svm::model<Kernel> model(std::move(prob_local), svm::parameters<Kernel>());
        svm::linear_introspector<Kernel> introspector(model);
        model_coeffs = {
            introspector.coefficient(0),
            introspector.coefficient(1),
            model.rho()
        };
        return model_coeffs.data();
    }

}
