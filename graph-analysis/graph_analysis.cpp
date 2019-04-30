#include <algorithm>
#include <cmath>
#include <functional>
#include <iterator>
#include <stdexcept>
#include <utility>
#include <vector>

#include <Eigen/Eigenvalues>
#include "colormap.hpp"

using rgb_t = color::color<color::space::rgb>;

const color::map<rgb_t> spectral_mod {
    {0.0 / 7, rgb_t{0xd5, 0x3e, 0x4f}},
    {1.0 / 7, rgb_t{0xf4, 0x6d, 0x43}},
    {3.0 / 7, rgb_t{0xfd, 0xae, 0x61}},
    {4.6 / 7, rgb_t{0xfe, 0xe0, 0x8b}},
    {4.8 / 7, rgb_t{0xe6, 0xf5, 0x98}},
    {5.0 / 7, rgb_t{0xab, 0xdd, 0xa4}},
    {5.2 / 7, rgb_t{0x66, 0xc2, 0xa5}},
    {7.0 / 7, rgb_t{0x32, 0x88, 0xbd}},
};

constexpr int w = 29, h = 17;
constexpr size_t Np = w * h;
constexpr size_t N = Np * (Np - 1) / 2;

extern int mask[Np];
extern double biases[][N];

namespace bresenham {
    template <typename Callable>
    void draw_line(double a_x, double a_y, double b_x, double b_y,
        Callable && set_pixel)
    {
        const auto swap_xy = std::abs(b_y - a_y) > std::abs(b_x - a_x);
        if (swap_xy) {
            std::swap(a_x, a_y);
            std::swap(b_x, b_y);
        }

        struct point {
            int x;
            int y;
        };

        point a{static_cast<int>(a_x), static_cast<int>(a_y)};
        point b{static_cast<int>(b_x), static_cast<int>(b_y)};

        auto mark = [swap_xy, &set_pixel](point p) {
            if (swap_xy) {
                set_pixel(p.y, p.x, 1.);
            } else {
                set_pixel(p.x, p.y, 1.);
            }
        };

        const point d {
            b.x - a.x,
            b.y - a.y
        };
        const auto dx_abs = std::abs(d.x);
        const auto step_y = d.y < 0 ? -1 : 1;
        const auto step_x = d.x < 0 ? -1 : 1;
        point pen = a;
        while (pen.x != b.x) {
            bool skip = false;
            auto error = std::abs(2 * d.y*(pen.x - a.x) - 2 * d.x*(pen.y - a.y));
            while (error > dx_abs) {
                pen.y += step_y;
                error -= 2 * dx_abs;
                mark(pen);
                skip = true;
            }
            if (!skip) {
                mark(pen);
            }
            pen.x += step_x;
        }
        mark(b);
    }
}

namespace xiaolin_wu {
    template <typename Callable>
    void draw_line(double a_x, double a_y, double b_x, double b_y,
        Callable && set_pixel)
    {
        constexpr auto fpart = [](double x) { return x - std::floor(x); };
        constexpr auto rfpart = [fpart](double x) { return 1 - fpart(x); };

        const bool steep = std::abs(b_y - a_y) > std::abs(b_x - a_x);

        if (steep) {
            std::swap(a_x, a_y);
            std::swap(b_x, b_y);
        }
        if (a_x > b_x) {
            std::swap(a_x, b_x);
            std::swap(a_y, b_y);
        }

        double dx = b_x - a_x;
        double dy = b_y - a_y;
        double gradient = dy / dx;
        if (dx == 0.0)
            gradient = 1.0;

        // handle first endpoint
        double xend = std::round(a_x);
        double yend = a_y + gradient * (xend - a_x);
        double xgap = rfpart(a_x + 0.5);
        int xpxl1 = static_cast<int>(xend);
        int ypxl1 = static_cast<int>(yend);
        if (steep) {
            set_pixel(ypxl1, xpxl1, rfpart(yend) * xgap);
            set_pixel(ypxl1 + 1, xpxl1, fpart(yend) * xgap);
        } else {
            set_pixel(xpxl1, ypxl1, rfpart(yend) * xgap);
            set_pixel(xpxl1, ypxl1 + 1, fpart(yend) * xgap);
        }
        double intery = yend + gradient;

        // handle second endpoint
        xend = std::round(b_x);
        yend = b_y + gradient * (xend - b_x);
        xgap = fpart(b_x + 0.5);
        int xpxl2 = static_cast<int>(xend);
        int ypxl2 = static_cast<int>(yend);
        if (steep) {
            set_pixel(ypxl2, xpxl2, rfpart(yend) * xgap);
            set_pixel(ypxl2 + 1, xpxl2, fpart(yend) * xgap);
        } else {
            set_pixel(xpxl2, ypxl2, rfpart(yend) * xgap);
            set_pixel(xpxl2, ypxl2 + 1, fpart(yend) * xgap);
        }

        // main loop
        if (steep) {
            for (int x = xpxl1 + 1; x < xpxl2; ++x, intery += gradient) {
                set_pixel(static_cast<int>(intery), x, rfpart(intery));
                set_pixel(static_cast<int>(intery) + 1, x, fpart(intery));
            }
        } else {
            for (int x = xpxl1 + 1; x < xpxl2; ++x, intery += gradient) {
                set_pixel(x, static_cast<int>(intery), rfpart(intery));
                set_pixel(x, static_cast<int>(intery) + 1, fpart(intery));
            }
        }
    }
}

extern "C" {

    int main() {

    }

    int* get_mask() {
        return mask;
    }

    double* get_biases(int rank) {
        return biases[rank - 1];
    }

    void get_weights(double *biases, int func, double rhoc, double radius, double *weights) {
        auto weight = [&]() -> std::function<double(double)> {
            if (func == 0) {
                return [rhoc](double rho) {
                    return std::abs(std::abs(rho) - 1.) > rhoc;
                };
            } else if (func == 2) {
                return [rhoc](double rho) {
                    return 1. - exp(-0.5 * pow((std::abs(rho) - 1.) / rhoc, 2.));
                };
            } else if (func == 1) {
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
            for (int l = 0, i = 0; l < Np - 1; ++l) {
                for (int m = l + 1; m < Np; ++m, ++i) {
                    double dist_sq = std::pow(m / w - l / w, 2)
                        + std::pow(m % w - l % w, 2);
                    dist_sq *= 0.05 * 0.05;
                    *(weights++) = (dist_sq < std::pow(radius, 2)) ? weight(biases[i]) : 0;
                }
            }
        }
    }

    void render_graph(double *weights, double *pix, int bw, int bh, bool use_mask) {
        for (size_t i = 0; i < bw * bh; ++i)
            pix[i] = 0;
        for (size_t l = 0, i = 0; l < Np - 1; ++l) {
            for (size_t m = l + 1; m < Np; ++m, ++i) {
                if (use_mask && (!mask[l] || !mask[m]))
                    continue;
                if (weights[i] > 1e-2) {
                    double a_x = 1. / (w - 1) * (l % w) * bw;
                    double b_x = 1. / (w - 1) * (m % w) * bw;
                    double a_y = 1. / (h - 1) * (h - 1 - l / w) * bh;
                    double b_y = 1. / (h - 1) * (h - 1 - m / w) * bh;
                    xiaolin_wu::draw_line(a_x, a_y, b_x, b_y,
                        [&, w=weights[i]](size_t i, size_t j, double val) {
                            if (i < bw && j < bh)
                                pix[j * bw + i] = w * val + (1. - w * val) * pix[j * bw + i];
                        });
                }
            }
        }
    }

    void compute_bias_histo(double *biases, int *histo, bool use_mask, double radius) {
        size_t N_bin = 49;
        double log_min = -2, log_max = std::log10(2000.);
        for (size_t i = 0; i < N_bin; ++i)
            histo[i] = 0;
        for (size_t l = 0, i = 0; l < Np - 1; ++l) {
            for (size_t m = l + 1; m < Np; ++m, ++i) {
                if (use_mask && (!mask[l] || !mask[m]))
                    continue;
                double dist_sq = std::pow(m / w - l / w, 2)
                    + std::pow(m % w - l % w, 2);
                dist_sq *= 0.05 * 0.05;
                if (dist_sq > std::pow(radius, 2))
                    continue;
                double log_bias = std::log10(biases[i]);
                if (log_bias < log_min)
                    continue;
                size_t j = static_cast<size_t>((log_bias - log_min) / (log_max - log_min) * N_bin);
                if (j < N_bin)
                    histo[j]++;
            }
        }
    }

    void compute_weight_histo(double *weights, int *histo, bool use_mask) {
        size_t N_bin = 50;
        for (size_t i = 0; i < N_bin; ++i)
            histo[i] = 0;
        for (size_t l = 0, i = 0; l < Np - 1; ++l) {
            for (size_t m = l + 1; m < Np; ++m, ++i) {
                if (use_mask && (!mask[l] || !mask[m]))
                    continue;
                histo[std::min(static_cast<size_t>(weights[i] * N_bin), N_bin - 1)]++;
            }
        }
    }

    size_t get_fiedler(double *weights, double *fiedler, bool use_mask) {
        using matrix_t = Eigen::MatrixXd;

        int indices[Np];
        size_t graph_dim = [&] {
            size_t i, j = 0;
            for (i = 0; i < Np; ++i)
                indices[i] = (!use_mask || mask[i]) ? static_cast<int>(j++) : (-1);
            return j;
        }();

        matrix_t L = matrix_t::Zero(graph_dim, graph_dim);
        for (size_t l = 0, k = 0; l < Np - 1; ++l) {
            for (size_t m = l + 1; m < Np; ++m, ++k) {
                double w = weights[k];

                int i = indices[l], j = indices[m];

                if (i < 0 || j < 0)
                    continue;

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

        auto fiedler_it = std::find_if(evals.begin(), evals.end(),
            [](auto const& ep) {
                return ep.second >= 1e-10;
            });
        size_t degen = fiedler_it - evals.begin();

        double sign = (evecs(graph_dim - 1, fiedler_it->first) < 0) ? 1. : -1.;
        for (size_t i = 0; i < Np; ++i) {
            fiedler[i] = indices[i] >= 0 ? (sign * evecs(indices[i], fiedler_it->first)) : 0;
        }

        return degen;
    }

    void compute_fiedler_histo(double *fiedler, double *histo, double *min_max_step) {
        double & min = min_max_step[0];
        double & max = min_max_step[1];
        double & step = min_max_step[2];
        double & oom = min_max_step[3];

        double true_min = *std::min_element(fiedler, fiedler + Np);
        double true_max = *std::max_element(fiedler, fiedler + Np);

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
        for (size_t i = 0; i < Np; ++i)
            if (fiedler[i] != 0)
                histo[static_cast<size_t>((fiedler[i] - min) / range * N_bin)]++;
    }

    void map_colors(double *fiedler, double min, double max, double *rgb) {
        auto pal = spectral_mod.rescale(min, max);
        for (size_t i = 0; i < Np; ++i) {
            auto c = pal(fiedler[i]);
            if (fiedler[i] == 0)
                c = rgb_t{0xaa, 0xaa, 0xaa};
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
