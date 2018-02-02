#include "contour.hpp"

#include <algorithm>
#include <array>
#include <map>
#include <stdexcept>
#include <tuple>


namespace contour {
    namespace {

        struct corner_t {
            corner_t (short i) : i(i) {}
            operator size_t () const { return i; }
            corner_t & operator++ () { i = (i + 1) % 4; return *this; }
            corner_t operator++ (int) { corner_t old(*this); ++(*this); return old; }
            corner_t & operator-- () { i = (i + 3) % 4; return *this; }
            corner_t operator-- (int) { corner_t old(*this); --(*this); return old; }
        private:
            short i;
        };
        namespace corner {
            const corner_t north_west(0);
            const corner_t south_west(1);
            const corner_t south_east(2);
            const corner_t north_east(3);
        }

        struct direction_t {
            direction_t (short i) : i(i) {}
            operator size_t () const { return i; }
            direction_t & operator++ () { i = (i + 1) % 4; return *this; }
            direction_t operator++ (int) { direction_t old(*this); ++(*this); return old; }
            direction_t & operator-- () { i = (i + 3) % 4; return *this; }
            direction_t operator-- (int) { direction_t old(*this); --(*this); return old; }
            corner_t forward_corner () const { return corner_t(i); }
            corner_t backward_corner () const { return --corner_t(i); }
        private:
            short i;
        };
        direction_t operator! (direction_t d) {
            ++d;
            ++d;
            return d;
        }
        namespace direction {
            const direction_t north(0);
            const direction_t west(1);
            const direction_t south(2);
            const direction_t east(3);
        }

        enum struct orientation {
            CW = -1,
            none = 0,
            CCW = 1
        };

        struct plaquette {
            plaquette (scalar_fun_t f, std::array<point_type,4> const& corner_loci) {
                using value_t = decltype(f(point_type()));
                line_count_ = 0;
                std::array<value_t,4> vals;
                std::transform(corner_loci.begin(), corner_loci.end(), vals.begin(), f);
                auto dir = direction::east;
                auto const end = dir;
                do {
                    ++dir;
                    neighbors[dir] = nullptr;
                    auto fw_c = dir.forward_corner();
                    auto bw_c = dir.backward_corner();
                    if (vals[fw_c] < 0) {
                        if (vals[bw_c] < 0) {
                            orientations[dir] = orientation::none;
                        } else {
                            orientations[dir] = orientation::CW;
                            points[dir] = mix_points(corner_loci[fw_c], corner_loci[bw_c], vals[fw_c] / (vals[fw_c] - vals[bw_c]));
                            ++line_count_;
                        }
                    } else {
                        if (vals[bw_c] < 0) {
                            orientations[dir] = orientation::CCW;
                            points[dir] = mix_points(corner_loci[fw_c], corner_loci[bw_c], vals[fw_c] / (vals[fw_c] - vals[bw_c]));
                            ++line_count_;
                        } else {
                            orientations[dir] = orientation::none;
                        }
                    }
                } while (dir != end);
                line_count_ /= 2;
            }

            void introduce_neighbor (direction_t dir, plaquette * who) {
                neighbors[dir] = who;
            }

            size_t line_count () const {
                return line_count_;
            }
            size_t check_off () {
                return --line_count_;
            }
            bool is_trivial () const {
                return line_count_ == 0;
            }
            std::tuple<plaquette *, point_type, direction_t> const next (orientation o, direction_t start = direction::north) const {
                direction_t dir = start;
                do {
                    if (o == orientation::CCW)
                        --dir;
                    else
                        ++dir;
                    if (orientations[dir] == o) return { neighbors[dir], points[dir], dir };
                } while (dir != start);
                throw std::runtime_error("ill-formed plaquette");
            }

        private:
            point_type mix_points (point_type const& a, point_type const& b, double mix = 0.5) {
                point_type res(a);
                auto it_b = std::begin(b);
                for (auto & x : res) {
                    x = (1.-mix) * x + mix * *it_b;
                    ++it_b;
                }
                return res;
            }
            std::array<orientation,4> orientations;
            std::array<point_type,4> points;
            std::array<plaquette *,4> neighbors;
            size_t line_count_;
        };

    }

    std::vector<line_t> const contour_lines (scalar_fun_t f, grid_type const& g) {
        std::vector<line_t> lines;
        std::map<grid_iterator, plaquette> plaques;

        /* construct plaquettes */ {
            std::array<grid_iterator, 4> its {g.begin(), g.begin(), g.begin(), g.begin() };
            its[1].move_forward<0>();
            its[2].move_forward<0>();
            its[2].move_forward<1>();
            its[3].move_forward<1>();
            while (its[2] != g.end()) {
                if (std::any_of(its.begin(), its.end(), std::mem_fn(&grid_iterator::in_bulk))) {
                    plaques.insert({its[0], plaquette(f, {*(its[0]), *(its[1]),
                                        *(its[2]), *(its[3])})});
                }
                for (auto & it : its)
                    ++it;
            }
        }

        /* connect neighbors */ {
            for (auto & [it, pl] : plaques) {
                grid_iterator others[] = {
                    grid_iterator(it).move_backward<0>(),
                    grid_iterator(it).move_backward<1>(),
                    grid_iterator(it).move_forward<0>(),
                    grid_iterator(it).move_forward<1>(),
                };
                direction_t dir = direction::east;
                const direction_t end = dir;
                do {
                    ++dir;
                    auto other = plaques.find(others[dir]);
                    if (other != plaques.end())
                        pl.introduce_neighbor(dir, &other->second);
                } while (dir != end);

            }
        }

        for (auto & [it, plaq] : plaques) {
            if (!plaq.is_trivial()) {
                lines.emplace_back();
                auto & line_start = plaq;
                direction_t dir_start = direction::north;
                line_start.check_off();
                auto [pl, pt, dir] = line_start.next(orientation::CCW, dir_start);
                lines.back().points.push_back(pt);
                while (pl != nullptr && !pl->is_trivial()) {
                    pl->check_off();
                    std::tie(pl, pt, dir) = pl->next(orientation::CCW, !dir);
                    lines.back().points.push_back(pt);
                }
                if (pl == nullptr) {
                    lines.back().closed = false;
                    ++dir_start;
                    std::tie(pl, pt, dir) = line_start.next(orientation::CW, dir_start);
                    lines.back().points.push_front(pt);
                    while (pl != nullptr && !pl->is_trivial()) {
                        pl->check_off();
                        std::tie(pl, pt, dir) = pl->next(orientation::CW, !dir);
                        lines.back().points.push_front(pt);
                    }
                }
            }
        }
        return lines;
    }

}
