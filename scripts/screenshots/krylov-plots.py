"""Re-render krylov-solvers' plots in EN/ES × light/dark for pacomolina.dev.

Run from a clone of github.com/Pacolias/krylov-solvers (needs numpy, scipy,
matplotlib):
    python3 /path/to/pacomolina-dev/scripts/screenshots/krylov-plots.py <out_dir>
then convert each PNG:
    magick <file>.png -resize 1280x -strip -quality 80 \
      public/images/projects/<file>.webp
Same solvers, matrices and parameters as the repo's scripts/ — only the
labels (translated) and colours (per theme) change. Results are recomputed,
so iteration counts/timings can differ slightly from the repo's own plots
(timings are machine-dependent).
"""
import os
import sys
import time

import matplotlib
import numpy as np
import scipy.io as sio
import scipy.sparse.linalg as spla

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

sys.path.insert(0, os.getcwd())
sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from src import bicg, bicgstab, cg, cgs, gmres  # noqa: E402
from efficiency import reconstruct_times  # noqa: E402

OUT = sys.argv[1]


def problem(name):
    A = sio.mmread(f"data/{name}.mtx").tocsr()
    return A, A @ np.ones(A.shape[0])


def rel(h):
    return np.array(h) / h[0]


# ------------------------------------------------------------------ compute
data = {}
for name in ("sherman1", "pores_2"):
    A, b = problem(name)
    data[f"asym-{name}"] = {
        m: rel(s(A, b, max_iter=2000)[1])
        for m, s in [("GMRES", gmres), ("BiCG", bicg), ("CGS", cgs), ("BiCGSTAB", bicgstab)]
    }

A, b = problem("pores_2")
eff = {}
for m, s, is_gmres in [("GMRES", gmres, True), ("BiCGSTAB", bicgstab, False)]:
    t0 = time.perf_counter()
    _, h = s(A, b, max_iter=2000)
    eff[m] = (reconstruct_times(h, time.perf_counter() - t0, is_gmres=is_gmres), rel(h))
data["efficiency-pores_2"] = eff

for name in ("nos6", "bcsstk14"):
    A, b = problem(name)
    d = A.diagonal()
    M = spla.LinearOperator(A.shape, matvec=lambda v, d=d: v / d)
    data[f"spd-{name}"] = {"CG": rel(cg(A, b)[1]), "PCG": rel(cg(A, b, M=M)[1])}

# ------------------------------------------------------------------ text
TEXT = {
    "en": dict(
        tol="Tolerance ($10^{-6}$)", iters="Iterations", secs="Execution time (seconds)",
        res="Relative residual $||r^n||_2 / ||r^0||_2$",
        asym="Convergence history — asymmetric matrix: {}",
        spd="Convergence history — SPD matrix: {}",
        eff="Computational efficiency — matrix: {}",
        it="Iter", pcg="PCG Jacobi",
    ),
    "es": dict(
        tol="Tolerancia ($10^{-6}$)", iters="Número de iteraciones", secs="Tiempo de ejecución (segundos)",
        res="Residuo relativo $||r^n||_2 / ||r^0||_2$",
        asym="Historial de convergencia — matriz asimétrica: {}",
        spd="Historial de convergencia — matriz SPD: {}",
        eff="Eficiencia computacional — matriz: {}",
        it="Iter", pcg="PCG Jacobi",
    ),
}

# ------------------------------------------------------------------ themes
# Light keeps the original plots' palette; dark sits on the site's card colour
# (stone-900) with every line lifted for contrast (black GMRES → stone-100).
THEME = {
    "light": dict(bg="#ffffff", fg="#1c1917", grid="#a8a29e", tol="#78716c", spd_tol="#dc2626",
                  GMRES="#000000", BiCG="#2563eb", CGS="#16a34a", BiCGSTAB="#dc2626",
                  CG="#1f77b4", PCG="#ff7f0e"),
    "dark": dict(bg="#1c1917", fg="#e7e5e4", grid="#57534e", tol="#a8a29e", spd_tol="#f87171",
                 GMRES="#f5f5f4", BiCG="#60a5fa", CGS="#4ade80", BiCGSTAB="#f87171",
                 CG="#60a5fa", PCG="#fb923c"),
}
STYLE = {"GMRES": (2.5, 1.0), "BiCG": (1.5, 0.85), "CGS": (1.5, 0.75), "BiCGSTAB": (2.0, 1.0)}


def styled(th):
    fig, ax = plt.subplots(figsize=(10, 6), facecolor=th["bg"])
    ax.set_facecolor(th["bg"])
    ax.grid(True, which="both", ls="--", alpha=0.5, color=th["grid"])
    ax.tick_params(colors=th["fg"], which="both")
    for spine in ax.spines.values():
        spine.set_color(th["grid"])
    return fig, ax


def finish(fig, ax, th, title, xlabel, ylabel, path):
    ax.set_title(title, color=th["fg"])
    ax.set_xlabel(xlabel, color=th["fg"])
    ax.set_ylabel(ylabel, color=th["fg"])
    leg = ax.legend(facecolor=th["bg"], edgecolor=th["grid"])
    for t in leg.get_texts():
        t.set_color(th["fg"])
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor=th["bg"])
    plt.close(fig)


for lang, tx in TEXT.items():
    for theme, th in THEME.items():
        for name in ("sherman1", "pores_2"):
            fig, ax = styled(th)
            for m, h in data[f"asym-{name}"].items():
                lw, alpha = STYLE[m]
                ax.semilogy(h, label=m, linewidth=lw, alpha=alpha, color=th[m])
            ax.axhline(y=1e-6, color=th["tol"], linestyle=":", label=tx["tol"])
            ax.set_ylim(bottom=1e-8)
            finish(fig, ax, th, tx["asym"].format(name), tx["iters"], tx["res"],
                   f"{OUT}/krylov-asym-{name}-{theme}-{lang}.png")

        fig, ax = styled(th)
        for m, (t, h) in data["efficiency-pores_2"].items():
            lw, alpha = STYLE[m]
            ax.semilogy(t, h, label=m, linewidth=lw, alpha=alpha, color=th[m])
        ax.axhline(y=1e-6, color=th["tol"], linestyle=":", label=tx["tol"])
        ax.set_ylim(bottom=1e-8)
        finish(fig, ax, th, tx["eff"].format("pores_2"), tx["secs"], tx["res"],
               f"{OUT}/krylov-efficiency-pores_2-{theme}-{lang}.png")

        for name in ("nos6", "bcsstk14"):
            h = data[f"spd-{name}"]
            fig, ax = styled(th)
            ax.semilogy(h["CG"], label=f"CG ({tx['it']}: {len(h['CG']) - 1})", linewidth=2, color=th["CG"])
            ax.semilogy(h["PCG"], label=f"{tx['pcg']} ({tx['it']}: {len(h['PCG']) - 1})",
                        linewidth=2, linestyle="--", color=th["PCG"])
            ax.axhline(y=1e-6, color=th["spd_tol"], linestyle=":", label=tx["tol"])
            finish(fig, ax, th, tx["spd"].format(name), tx["iters"], tx["res"],
                   f"{OUT}/krylov-spd-{name}-{theme}-{lang}.png")

print({k: {m: len(v if not isinstance(v, tuple) else v[1]) - 1 for m, v in d.items()} for k, d in data.items()})
