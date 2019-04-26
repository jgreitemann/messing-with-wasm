#include <algorithm>
#include <cmath>
#include <functional>
#include <iterator>
#include <stdexcept>
#include <utility>
#include <vector>

#include <Eigen/Eigenvalues>
#include "colormap.hpp"

namespace {
    using rgb = color::color<color::space::rgb>;
}

const color::map<rgb> spectral_mod {
    {0.0 / 7, rgb{0xd5, 0x3e, 0x4f}},
    {1.0 / 7, rgb{0xf4, 0x6d, 0x43}},
    {3.0 / 7, rgb{0xfd, 0xae, 0x61}},
    {4.6 / 7, rgb{0xfe, 0xe0, 0x8b}},
    {4.8 / 7, rgb{0xe6, 0xf5, 0x98}},
    {5.0 / 7, rgb{0xab, 0xdd, 0xa4}},
    {5.2 / 7, rgb{0x66, 0xc2, 0xa5}},
    {7.0 / 7, rgb{0x32, 0x88, 0xbd}},
};

constexpr size_t N = 121278;
constexpr size_t graph_dim = 493;

extern double biases[][N];

extern "C" {

    int main() {

    }

    double* get_biases(int rank) {
        return biases[rank - 1];
    }

    void get_weights(double *biases, int func, double rhoc, double *weights) {
        auto weight = [&]() -> std::function<double(double)> {
            if (func == 2) {
                return [rhoc](double rho) {
                    return std::abs(std::abs(rho) - 1.) > rhoc;
                };
            } else if (func == 1) {
                return [rhoc](double rho) {
                    return 1. - exp(-0.5 * pow((std::abs(rho) - 1.) / rhoc, 2.));
                };
            } else if (func == 0) {
                return [&, gamma_sq = rhoc * rhoc](double rho) {
                    return 1. - gamma_sq / (pow(std::abs(rho) - 1., 2.) + gamma_sq);
                };
            } else {
                throw std::runtime_error("unknown weight function");
            }
        }();

        if (biases == nullptr) {
            size_t N = 1000;
            double x_min = 0.01, x_max = 2000.;
            double d = std::log10(x_max / x_min) / (N - 1);
            for (size_t i = 0; i < N; ++i) {
                double x = x_min * std::pow(10., i * d);
                *(weights++) = x;
                *(weights++) = weight(x);
            }
        } else {
            for (size_t i = 0; i < N; ++i) {
                *(weights++) = weight(biases[i]);
            }
        }

    }

    void compute_bias_histo(double *biases, int *histo) {
        size_t N_bin = 50;
        double log_min = -2, log_max = 3;
        for (size_t i = 0; i < N_bin; ++i)
            histo[i] = 0;
        for (size_t i = 0; i < N; ++i) {
            double log_bias = std::log10(biases[i]);
            if (log_bias < log_min)
                continue;
            size_t j = static_cast<size_t>((log_bias - log_min) / (log_max - log_min) * N_bin);
            if (j < N_bin)
                histo[j]++;
        }
    }

    void compute_weight_histo(double *weights, int *histo) {
        size_t N_bin = 50;
        for (size_t i = 0; i < N_bin; ++i)
            histo[i] = 0;
        for (size_t i = 0; i < N; ++i)
            histo[std::min(static_cast<size_t>(weights[i] * N_bin), N_bin - 1)]++;
    }

    size_t get_fiedler(double *weights, double *fiedler) {
        using matrix_t = Eigen::MatrixXd;
        matrix_t L = matrix_t::Zero(graph_dim, graph_dim);
        for (size_t i = 0, k = 0; i < graph_dim - 1; ++i) {
            for (size_t j = i + 1; j < graph_dim; ++j, ++k) {
                double w = weights[k];

                // os << std::abs(transition.rho()) << '\t' << w << '\n';

                // if (index_map.find(labels.first) == index_map.end()
                //     || index_map.find(labels.second) == index_map.end())
                // {
                //     continue;
                // }

                // if (dist(phase_points[labels.first], phase_points[labels.second]) > radius)
                //     continue;

                // size_t i = index_map[labels.first], j = index_map[labels.second];

                L(i,j) = -w;
                L(j,i) = -w;
                L(i,i) += w;
                L(j,j) += w;

            }
        }

        auto eigen = Eigen::SelfAdjointEigenSolver<matrix_t>(L);
        auto const& evecs = eigen.eigenvectors();

        std::vector<std::pair<size_t, double>> evals;
        evals.reserve(graph_dim);
        for (size_t i = 0; i < graph_dim; ++i)
            evals.emplace_back(i, eigen.eigenvalues()(i));
        std::sort(evals.begin(), evals.end(),
                  [](auto const& lhs, auto const& rhs) { return lhs.second < rhs.second; });

        double masked_value;
        bool use_masked_value = false;
        auto fiedler_it = std::find_if(evals.begin(), evals.end(),
            [](auto const& ep) {
                return ep.second >= 1e-10;
            });
        size_t degen = fiedler_it - evals.begin();

        double sign = (evecs(graph_dim - 1, fiedler_it->first) < 0) ? 1. : -1.;
        for (size_t i = 0; i < graph_dim; ++i) {
            fiedler[i] = sign * evecs(i, fiedler_it->first);
        }

        return degen;

        // for (size_t i = 0; i < graph_dim; ++i) {
        //     if (evals[i].second < 1e-10) {
        //         ++degen;
        //     }
        //     label_t l;
        //     phase_point p;
        //     for (auto const& label_point_pair : phase_points) {
        //         std::tie(l, p) = label_point_pair;
        //         auto idx_it = index_map.find(l);
        //         if (idx_it == index_map.end()) {
        //             if (use_masked_value) {
        //                 std::copy(p.begin(), p.end(),
        //                     std::ostream_iterator<double>{os, "\t"});
        //                 os << masked_value << '\n';
        //             } else {
        //                 continue;
        //             }
        //         } else {
        //             std::copy(p.begin(), p.end(),
        //                 std::ostream_iterator<double>{os, "\t"});
        //             os << evecs(idx_it->second, evals[i].first) << '\n';
        //         }
        //     }
        //     os << "\n\n";
        // }
    }

    void compute_fiedler_histo(double *fiedler, double *histo, double *min_max_step) {
        double & min = min_max_step[0];
        double & max = min_max_step[1];
        double & step = min_max_step[2];
        double & oom = min_max_step[3];

        double true_min = *std::min_element(fiedler, fiedler + graph_dim);
        double true_max = *std::max_element(fiedler, fiedler + graph_dim);

        step = (true_max - true_min) / 6;
        oom = 1;
        while (step * oom < 1) {
            oom *= 10;
        }
        int istep = std::round(step * oom);
        step = istep / oom;
        if (istep == 10) {
            istep = 1;
            oom /= 10;
        }

        int imin = std::floor(true_min * oom);
        int imax = std::ceil(true_max * oom);
        min = imin / oom;
        max = imax / oom;
        while ((imax - imin) % istep != 0) {
            if (std::abs(true_min - min) > std::abs(true_max - max)) {
                imax++;
                max = imax / oom;
            } else {
                imin--;
                min = imin / oom;
            }
        }

        double range = max - min;
        const size_t N_bin = 70;
        for (size_t i = 0; i < N_bin; ++i)
            histo[i] = 0;
        for (size_t i = 0; i < graph_dim; ++i)
            histo[static_cast<size_t>((fiedler[i] - min) / range * N_bin)]++;
    }

    void map_colors(double *fiedler, double min, double max, double *rgb) {
        auto pal = spectral_mod.rescale(min, max);
        for (size_t i = 0; i < graph_dim; ++i) {
            auto c = pal(fiedler[i]);
            std::stringstream ss;
            ss << c;
            ss >> rgb[3 * i];
            ss >> rgb[3 * i + 1];
            ss >> rgb[3 * i + 2];
            rgb[3 * i] /= c.depth();
            rgb[3 * i + 1] /= c.depth();
            rgb[3 * i + 2] /= c.depth();
        }
    }
}
