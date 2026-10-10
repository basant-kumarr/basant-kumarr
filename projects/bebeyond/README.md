# BeBeyond: AI fitness and nutrition platform

**A training, nutrition and coaching app built on one rule: every recommendation must be able to explain exactly why it was made.**

Personal product · in active development · private repository · React Native (Expo) · FastAPI · PostgreSQL · Three.js

[← Back to profile](../../README.md) · [Portfolio](https://basant-kumar-portfoli.netlify.app/)

<p align="center">
  <img src="images/concept-render.webp" width="100%" alt="Concept render of the BeBeyond app on a phone next to a 3D anatomical figure, with panels for the AI coach, workout plan, muscle load and progress analytics. Screen values in the render are illustrative.">
  <br><sub>Concept render. Screen values are illustrative, not real app data.</sub>
</p>

---

## The problem

Fitness apps either give generic plans or hand out confident-sounding numbers with no visible basis. Someone deciding whether to train hard today needs advice that reflects what they have actually done, says how certain it is, and admits when data is missing.

## Objective

Build one system for training, nutrition and coaching where:

- every number comes from a deterministic, testable engine;
- every recommendation carries the evidence behind it and a confidence tier;
- a language model can help explain a decision but can never change it.

## My contribution

I designed and built BeBeyond end to end as a personal product: the exercise ontology, the intelligence engines, the FastAPI backend, the data model and the React Native app.

## How it works

<p align="center">
  <img src="images/architecture.webp" width="100%" alt="Architecture diagram. The React Native and Expo mobile app talks to a FastAPI backend over HTTP and JSON. The backend contains a deterministic intelligence core (exercise ontology, muscle load and readiness, recommendation engine, nutrition engine), an AI provider abstraction with a deterministic default, and a platform layer for authentication and rate limiting. Data lives in PostgreSQL with 17 tables. Camera form analysis runs on a simulated pose source; wearable adapters are scaffolded with no live data.">
</p>

**The AI boundary.** The deterministic engine owns every number and every decision: readiness, accumulated load, nutrition targets, what to train next, confidence, and whether an action needs confirmation. A language model, if one is configured, may only write the prose that explains a decision.

- With no provider configured, the coach uses its deterministic fallback, and responses say so (`is_live_provider=False`).
- If a provider fails, the deterministic response is returned unchanged.
- The mobile app never calls a model provider directly. All generation happens on the server, which keeps API keys off the device.

### From a workout to a recommendation

<p align="center">
  <img src="images/recommendation-workflow.webp" width="100%" alt="Workflow diagram in five steps: training history, muscle load, readiness, recommendation, and a Why view. Confidence tiers are measured, calculated, estimated and unavailable. Each recommendation has fields for recommendation, reason, evidence, confidence, expected benefit, risk or constraint, and available action.">
</p>

1. **Training history.** Logged sets and exercises, plus the user profile.
2. **Muscle load.** The exercise ontology maps qualifying sets to muscle groups, and the recovery state of each group is estimated.
3. **Readiness.** Load, recency and nutrition inputs combine into a readiness signal with a confidence score.
4. **Recommendation.** A structured output with the recommendation, its reason, the evidence, confidence, expected benefit, risk or constraint, and the available action.
5. **Explanation.** The "Why?" view renders the reason from the real evidence values, never a generic sentence.

Every signal carries a confidence tier: `measured`, `calculated`, `estimated` or `unavailable`. A missing input is reported as unavailable rather than guessed, because a plausible-looking readiness figure is worse than a blank one.

## What is built, and what is not

<p align="center">
  <img src="images/implementation-status.webp" width="100%" alt="Implementation status in three columns. Built and working: exercise ontology, muscle load and readiness, recommendation engine, nutrition engine, AI coach with deterministic default, 3D anatomical visualisation, authentication and 17 tables. Built on simulated input: camera form analysis. Scaffolded with no live data: Apple Health and Health Connect adapters.">
</p>

| Status | Features |
|---|---|
| **Built and working** | Exercise ontology · muscle load and readiness with confidence tiers · recommendation engine · nutrition engine · AI coach (deterministic by default) · 3D anatomical view · authentication with session revocation, rate limiting, 17 tables with versioned migrations |
| **Built, running on simulated input** | Camera form analysis: rep detection, joint angles, range of motion, tempo and form rules are implemented and tested, but run against a simulated pose source. An `analysisSource` field separates `native_on_device` from `simulated_mock`, so simulated output cannot be shown as real analysis. |
| **Scaffolded, no live data** | Apple Health and Health Connect adapters. Signals that depend on them report as unavailable. |

## Technology

| Layer | Technology | What it contributes |
|---|---|---|
| Mobile | React Native, Expo, Expo Router, TypeScript | Cross-platform app and navigation |
| Mobile | Zustand | Client state |
| Mobile | Three.js, React Three Fiber, expo-gl | 3D anatomical visualisation |
| Backend | Python, FastAPI, Pydantic | API and the deterministic intelligence engines |
| Data | PostgreSQL, SQLAlchemy, Alembic | 17 tables with versioned migrations |
| Quality | pytest, mobile test suite | 35 backend and 71 mobile test files covering the engines, the AI provider boundary, authentication and exercise data |

## Results and limitations

- **In active development.** It is a personal product, not a production-ready release.
- Camera form analysis has no on-device pose provider in this build. Real-time pose needs a frame-processor camera stack that conflicts with a dependency the app already uses.
- Wearable integrations are scaffolding only.
- Live language-model explanations are off unless a provider is configured.
- There are no app screenshots here yet. The image at the top is a concept render, and the diagrams are drawn from the codebase.

## Code

The repository is private while the product is in development, so this page is the public write-up.

---

[← Back to profile](../../README.md) · [Portfolio](https://basant-kumar-portfoli.netlify.app/) · [LinkedIn](https://www.linkedin.com/in/basantsingh-/)
