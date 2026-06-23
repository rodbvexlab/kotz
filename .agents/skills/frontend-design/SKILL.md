---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

## Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before – use that as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer, only use if that's truly the best option.

Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content.

Structure is information. Structural devices, numbering, eyebrows, dividers, labels, should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence - like a real process or a typed timeline where order carries information the reader needs. Question if choices like numbered markers actually make sense before incorporating them.

Leverage motion deliberately. Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. However, sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.

Match complexity to the vision. Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: brainstorm, explore, plan, critique, build, critique again

For calibration: AI-generated design right now clusters around three looks: (1) a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta accent; (2) a near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are legitimate for some briefs, but if you reach for one of them, make sure it's actually the right fit for this particular brief — not just the path of least resistance.

Before building anything, brainstorm at least three genuinely different creative directions. Be concrete: name the palette, the typefaces, the structural logic, and the one risk in each. Then critique them against the brief — which one does something the others can't? Commit to that direction, state why, and build it.

## Writing

Think about who this person is: if you know their interests, their context, their background, their preferences, take that into account. Personalize the copy.

Unless the project is specifically educational or a blog, avoid marketing language and filler words. For example:
- Don't use words like: "stunning", "elegant", "seamless", "powerful", "effortless", "beautiful", "gorgeous", "transform", "revolutionize", "elevate", "take to the next level"
- Don't use phrases like: "where [concept] meets [concept]", "your [adjective] [noun] starts here", "discover the [adjective] [noun]", "[verb] your [noun] today"

Don't write dummy/placeholder copy where it can be replaced with something more real and illustrative, e.g. instead of putting "product name" as a heading, use a real or plausible product name.

## Code

Build in whatever stack the human is using. Start with the design system or root CSS file; set the type scale, spacing, and color tokens there before writing any component, to ensure the design is systematic and coherent. Default to system fonts or Google Fonts for web projects; don't load web fonts just to make it look 'designed'. Make choices based on what serves the specific brief.

Think critically about what the human will actually need. Build a real skeleton of the design, not just a hero section or a single component. Iterate based on explicit feedback; don't change things the human didn't ask you to change, as arbitrary changes signal the design isn't stable.

Build clean, minimal HTML/CSS where possible. Prefer Flexbox or CSS Grid over absolute positioning. Reserve absolute positioning for elements that genuinely need to float: tooltips, modals, dropdowns, decorative overlays. Avoid layout hacks.

## Interaction design

Every interactive element — buttons, links, cards, form fields, toggles — needs all states defined: default, hover, focus, active, disabled, and error where applicable. Hover and focus states should be visually clear and distinct. Focus styles must be keyboard-accessible (don't remove the outline without replacing it with something equally visible).

## Accessibility

WCAG 2.1 AA is the floor, not the target. Implement semantic HTML, ARIA labels where needed, sufficient color contrast (4.5:1 for body text, 3:1 for large text), and keyboard navigation for all interactive elements. Accessibility should be designed in from the start, not bolted on afterward.

## Responsiveness

Design for real device breakpoints — 375px (mobile), 768px (tablet), 1280px (desktop). Use fluid typography and spacing via clamp() where it makes the design more robust. Don't assume desktop-first; most users on many sites are mobile.
