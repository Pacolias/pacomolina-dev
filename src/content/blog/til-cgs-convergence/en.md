---
title: "CGS's bumpy convergence"
description: "Conjugate Gradient Squared can reach the tolerance while its residual jumps wildly on the way."
date: 2026-03-14
type: til
project: krylov-solvers
topics: [maths]
---

CGS (Conjugate Gradient Squared) can reach the tolerance and still look like chaos on the way: on the sherman1 matrix its residual jumps by orders of magnitude from one iteration to the next, while BiCGSTAB — its stabilised cousin — glides down smoothly.
