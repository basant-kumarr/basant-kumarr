# Swarm Drone Coordination: a multi-drone system for disaster response

**A Bachelor's engineering team project exploring how two drones could be coordinated through one control approach to support emergency response.**

BEng Electronics & Telecommunication Engineering, Savitribai Phule Pune University · 2018 – 2020 · Arduino · GPS · gyroscope · RF modules

[← Back to profile](../../README.md) · [Portfolio](https://basant-kumar-portfoli.netlify.app/)

<p align="center">
  <img src="images/concept-render.webp" width="100%" alt="Concept render of two wooden-frame quadcopter drones on a workbench, with wiring, battery packs and tools. Not a photograph of the actual prototype.">
  <br><sub>Concept render of the two wooden-frame drones. Not a photograph of the prototype.</sub>
</p>

---

## The problem

Disaster zones can be hard to reach: difficult terrain, cut-off locations and the need to get essential supplies where they are needed quickly. Flying several drones normally means one pilot per drone.

## Objective

Explore a multi-drone coordination concept for disaster response, such as supply delivery and search-and-rescue support, built around a single, centralised remote-control approach.

## My contribution

I was a member of the final-year engineering team that developed the project. The surviving project record describes the team's work as a whole and does not separate individual responsibilities, so none are claimed here.

## Timeline

<p align="center">
  <img src="images/timeline.webp" width="100%" alt="Timeline. 2016: BEng begins at Savitribai Phule Pune University. 2018: qualifier in the qualifying round of the DST and Texas Instruments India Innovation Challenge Design Contest 2018, anchored by NSRCEL, IIM Bangalore. 2019 to 2020: final-year team project with a two-drone prototype on wooden frames. 2020: BEng completed.">
</p>

| When | Milestone |
|---|---|
| **2018** | Qualifier in the **qualifying round** of the DST & Texas Instruments India Innovation Challenge Design Contest 2018, anchored by NSRCEL, IIM Bangalore |
| **2019 – 2020** | Development continued as the **Bachelor's final-year team project**, with a two-drone prototype on simple wooden frames |

The 2018 recognition was at qualifying-round level. It is not a finalist or winner placing.

## How it works

<p align="center">
  <img src="images/system-design.webp" width="100%" alt="System design diagram. A centralised control unit with Arduino-based control hardware communicates over RF modules with two wooden-frame drones. Each drone has Arduino-based control, an RF module, motors and a battery pack, GPS, a gyroscope and battery monitoring. Return to origin on signal loss or low battery is marked as a design objective whose implementation and testing are not documented.">
</p>

| Component | Role in the system |
|---|---|
| Centralised control | One remote-control approach to manage several drones through a common interface, on Arduino-based control hardware |
| RF modules | Radio link between the control side and the drones |
| GPS | Location information for navigation and location-aware operation |
| Gyroscope | Orientation sensing for stable movement and control |
| Battery monitoring | Watching battery state so that a drone is not lost mid-task |
| Fail-safe *(design objective)* | Return to origin on communication loss or low battery was proposed. Its implementation and testing are not documented. |

**Engineering challenges the design addressed:** coordinating several aircraft through one control approach, navigation and orientation, battery and operating conditions, and safe behaviour on failure.

## Specification

| Item | Detail |
|---|---|
| Project type | Student engineering prototype; Bachelor's final-year team project |
| Drones | Two |
| Frame | Simple wooden frame |
| Control | Centralised remote-control concept; Arduino-based control hardware |
| Communication | RF modules |
| Navigation and orientation | GPS and gyroscope |
| Power | Battery packs with battery monitoring |
| Application | Disaster response: supply delivery, search-and-rescue support |

Range, payload, flight time and positioning accuracy are not listed because no project record confirms them.

## Evidence

<table>
<tr>
<td width="50%" valign="top"><img src="images/iic-2018-qualifying-certificate.jpg" width="100%" alt="Qualifying-round certificate from the DST and Texas Instruments India Innovation Challenge Design Contest 2018."></td>
<td width="50%" valign="top"><img src="images/iic-2018-certificate-photo.jpg" width="100%" alt="Original photograph of the India Innovation Challenge 2018 qualifying-round certificate, shown on a screen."></td>
</tr>
</table>
<sub>Qualifying-round certificate, India Innovation Challenge Design Contest 2018 (left), and the original photograph of it (right).</sub>

## Results and limitations

- A student prototype built for investigation and competition. It was not deployed in a real disaster.
- No flight logs, telemetry or test results survive in the project record, so none are reported.
- No photographs of the physical prototype are available; the image at the top is a concept render.

## What I took from it

The project taught me how hardware, navigation, monitoring and control have to work together to solve a practical problem. That systems view still shapes how I approach analytics and product work.

---

[← Back to profile](../../README.md) · [Portfolio](https://basant-kumar-portfoli.netlify.app/) · [LinkedIn](https://www.linkedin.com/in/basantsingh-/)
