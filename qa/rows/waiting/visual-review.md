# Waiting row visual QA, proportions repair v3

Selected source: decoded/waiting.png. Exact prompt: prompts/waiting-proportions-v3.md.

Strongest anatomy references are exact native-idle-anchor.png and native-work-anchor.png (4x nearest upscales); current.png provides cross-state context and canonical-base.png supplies palette/clothing only. Rejected earlier source was not attached.

Six complete, separate poses retain original narrow face and smaller head, slender maid body, longer visible socks/shins, blue long hair/fin ears and connected blue-white tail. Two open upward palms by apron visibly ask for input. Subtle attentive head tilt, one blink, hand variation and tail motion distinguish six phases, with closely matching first/final pose. All shoes stay planted. No props, detached effects, clipping or source overlap.

All six native extracted frames inspected. proportion-comparison.png shows original idle, original laptop-work, waiting frame0, waiting frame4 at 192x208 each, in that order. Compared with preserved native idle/work, this candidate has compatible total height, narrow face/head size, dress hem and visible shin length; it corrects earlier overly large face and squat body. Bundled auto extraction uses components and inspect_frames.py --require-components reports ok:true, no errors/warnings. Minor green edge fringe remains for parent single despill pass. Final acceptance remains subject to independent whole-atlas review.
