---
title: "Goodbye, manual deploys"
description: "Moving RedCheck from manual deployments to a fully automated CI/CD pipeline: GitHub Actions, Docker Hub and a clean production server."
date: 2026-07-01
type: linkedin
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7478121077211172865/
project: redcheck
series:
  id: building-redcheck
  title: "Building RedCheck"
  part: 2
topics: [devops, backend]
images:
  - src: ./github-actions.webp
    alt: "A GitHub Actions run of RedCheck's deploy.yml: build-and-push (36 s), then deploy (18 s) — succeeded in 1 m 3 s."
---

Saying goodbye to manual deployments is one of the most satisfying milestones in software engineering. 🚀

Manual deployments are a bottleneck. To scale RedCheck efficiently, I needed to eliminate them entirely. I've just overhauled our deployment architecture, transitioning from a traditional manual setup to a fully automated CI/CD pipeline, and the architectural leap is massive.

Here's a quick breakdown of the new stack:

- **GitHub Actions** orchestrating the entire pipeline (testing, building, and deploying).
- **Docker Hub** acting as our registry for immutable images.
- **Clean server architecture.** Production now strictly acts as an execution environment. No source code, no build tools, and no manual .jar handling; just pure Docker containers orchestrated securely via SSH.

Automating this infrastructure ensures that the focus remains entirely on writing clean, SOLID Java and Spring Boot code, knowing that our pipeline acts as an uncompromising gatekeeper for quality and stability.

Building a productivity platform is great, but a solid automated infrastructure is what actually keeps it stable in the long run. 💻⚙️
