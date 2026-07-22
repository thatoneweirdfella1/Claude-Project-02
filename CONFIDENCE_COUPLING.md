# How Translation Confidence Feeds Routing

## The rule

Translation confidence changes routing in one direction only: up. Low confidence about what was asked is a reason to use a stronger model, never a cheaper one. The coupling is a one way ratchet.

1. Confidence eighty and above: the translation is trusted. Routing runs purely on the question's own complexity.

2. Confidence sixty to seventy nine: effective complexity is escalated one step before model selection, and the decision carries a visible note saying so. The question was probably understood, but "probably" is exactly when a stronger model's ability to handle a slightly misread question is worth the tokens.

3. Confidence below sixty: by the Translation Engine's contract this question should never reach the router at all, because the translation layer asks a clarifying question instead of proceeding. If one arrives anyway, the router treats it as a contract violation: it floors effective complexity at four, which forces at least the Balanced tier, and flags the violation in the notes. It does not silently pretend the input was fine.

## Why this direction

The spec states the cost asymmetry outright: answering with the wrong model matters more than saving money on a wrong answer. If the engine misread the question, a cheap fast answer to the wrong question is the worst possible outcome, because it is wrong, confidently delivered, and cheap enough that nobody looks twice. Escalation buys a model more capable of noticing ambiguity and hedging usefully. Saving tokens on a question you might have misread is spending less to fail.

Two things confidence never does: it never downgrades a route, and it never overrides the user. A manual model pick wins over the coupling, same as it wins over everything else.
