# Finding payment history and outlet plug location

*2026-06-06T02:26:47.856248Z*

---


**HUMAN:**
Find chat history for when I paid for this. Tell me where the plug that plugs into the wall outlet goes.


**ASSISTANT:**

```
This block is not supported on your current device yet.
```

That's your open frame 12V 20A switching power supply. Here's where the wall plug goes:

The terminal strip on the front face of that unit has the labels stamped right into the metal above it. Left side is your AC input. You'll see **L (AC)** and **N** terminals. Those are Line and Neutral.

Your 3-prong cord:
- Black wire (hot/line) goes to **L**
- White wire (neutral) goes to **N**
- Green wire (ground) goes to the **ground symbol** terminal (the circle with the line through it, right next to N)

Right side of that same strip is your DC output: **COM COM COM** (negative/ground) and **+V +V +V** (positive 12V). That's where your PWM controller pulls power from.

The **+V ADJ** terminal on the far right is for fine-tuning the output voltage with a screwdriver. Leave it alone unless your meter shows you're noticeably off from 12V.


**HUMAN:**
I also have this. So I ask again where's the plug plug into. G n and h


**ASSISTANT:**
 The wall plug does NOT go into the PWM controller. The controller is DC only.

Here's the full chain:

**Wall outlet → Power supply → PWM controller → Pump**

So:

**Power supply** gets the 3-prong wall cord. L, N, and ground on that terminal strip like we covered.

**PWM controller** gets 12V DC from the power supply output. +V from the power supply goes to **+Power** on the controller. COM from the power supply goes to **-Power** on the controller.

**Pump** wires go to **+Motor** and **-Motor** on the controller.

That's it. Three segments of wire. Nothing plugs into the PWM directly from the wall — ever. It would fry it instantly.


**ASSISTANT:**
 Good. You've already got it partially wired. I can see three wires going into the terminal strip.

Looking at image 2, the labels show **L** then **N** then the ground symbol. Left side of the strip.

Here's what you need to confirm:

**Black wire** → **L** (first terminal, leftmost)
**White wire** → **N** (second terminal)
**Green wire** → **ground symbol** (third terminal)

From the image it looks like you're close but I can't fully confirm the black wire is in L vs somewhere else. The black wire needs to be the furthest left.

Once those three are locked down and tight, the plug end of that yellow extension cord goes into the wall. That's it for the AC side.

Then you run two wires from the **+V** and **COM** terminals on the right side of that same strip over to the PWM controller's **+Power** and **-Power**.

How tight are those terminal screws right now?


**HUMAN:**
They are asu saj. Now j need to connect the pawn.


**ASSISTANT:**
 Look at the right side of that terminal strip. You'll see **+V +V +V** and **COM COM COM**.

Pick any one **+V** terminal and any one **COM** terminal. Run two wires from those over to the PWM controller.

**+V** → **+Power** on the PWM
**COM** → **-Power** on the PWM

Strip about half an inch of wire on each end. Loosen the screw, push the bare wire in, tighten it down.

What wire do you have available to use? Just checking gauge before you connect.


**HUMAN:**
That confused he shit out of me


**ASSISTANT:**
 Okay. Simple.

Two wires. That's all.

Wire 1: from **+V** on the power supply to **+Power** on the PWM.

Wire 2: from **COM** on the power supply to **-Power** on the PWM.

That's the only step right now. Ignore everything else on both devices.

What wire do you have to work with?


**HUMAN:**
So 1 actual wire right? Like 2 wires grouped in insulation meaning a regular wire w 2 or 3 wires in it


**ASSISTANT:**
 Yes. One regular wire with two conductors inside. Like a lamp cord or speaker wire. Two wires inside one jacket.

That runs from the power supply to the PWM controller. One end splits and goes into +V and COM. Other end splits and goes into +Power and -Power.

What do you have laying around? Extension cord scraps, speaker wire, anything like that?


**HUMAN:**
White wire goes into which. The neutral goes into ckm?


**ASSISTANT:**
 No. Stop. That yellow extension cord stays on the AC side only.

For the power supply to PWM connection you need a completely separate wire. A short one. Like a foot or two long.

Do not pull wires off the extension cord for this. That's 120 volt AC wire. The PWM side is 12 volt DC. Different wires entirely.

What else do you have laying around? Speaker wire, old phone charger cord, anything with two wires in it?


**HUMAN:**
Oh I thought the own uses the power from the other device


**ASSISTANT:**
 It does. But through its own separate wire.

Think of it like this:

The power supply has output terminals sitting there with 12V ready to go. You run a new short wire FROM those terminals TO the PWM. That wire carries the 12V power over.

The yellow extension cord only brings wall power IN to the power supply. It stops there.

So you need a short piece of wire with two conductors. Doesn't have to be fancy. Speaker wire, lamp cord, anything two-conductor around twelve inches long.

Got anything like that?


**HUMAN:**
Look I never said I was using the yellow wire. The yellow wire is already where it's supposed to be. I need you to fucking tell me where the load goes for the fucking pwm


**ASSISTANT:**
 Got it. My bad.

**COM** on the power supply → **-Power** on the PWM

**+V** on the power supply → **+Power** on the PWM

Two wires. Those four terminals. That's it.


**HUMAN:**
Does it matter if the pwm is connected to the 3rd com and the first v+?


**ASSISTANT:**
 No. Doesn't matter at all.

Any COM and any +V. They're all the same. Connect wherever it's convenient.


**HUMAN:**
Okay so so.e5hi g is t right. The pump isn't making a single bit of noise signifying it's on.matter of fact the  pwm stopped working then suddenly began again. I had the wires on the black and red wire but just noticed there's battery connections on the  pump separate from the wires. What are those for


**ASSISTANT:**
 Stop for a second.

What color wires did you put into Motor+ and Motor- on the PWM?

And when you say the pump has battery connections separate from the wires coming out of it — can you take a picture of that? Need to see what you're looking at before you connect anything else.


**HUMAN:**
Blacks on motor plus whites on motor neg


**ASSISTANT:**
 Swap them.

Black is positive. It goes to **Motor+**. White is negative, goes to **Motor-**.

Wait — you said black IS on Motor+. That's correct then.

So the pump wiring is right. Back to the other question — take a picture of those battery connections on the pump. Need to see what that is before anything else.


**ASSISTANT:**
 That's the pressure switch. Not battery connections.

It's a built-in automatic shutoff. When water pressure drops (like when you open the shower valve) it kicks the pump on. When pressure builds back up it shuts it off.

Those two spade terminals on it are where your power actually needs to go. That switch sits between your power source and the motor.

So the pump wires coming out — are those connected to that pressure switch internally, or are they completely separate from it?


**ASSISTANT:**
 That's your problem right there.

The pressure switch is rated **30A 12V, 40-80 PSI**. It's the automatic on/off for the pump. And those two spade terminals on it are currently empty.

Your black and white wires from the PWM need to connect to those two spade terminals on the pressure switch. Not directly to the motor.

The switch completes the circuit. Without it connected the pump gets no power.

Do you have spade connectors? Or you can just strip the wire and wrap it around the terminals and tighten if you have nothing else right now.


**HUMAN:**
Are u sure.


**ASSISTANT:**
 Honestly no. Not 100%.

Some pumps wire the pressure switch internally and the black and white wires already run through it. Some don't.

Can you trace where the black and white wires coming out of the pump actually connect to inside? Do they go to that pressure switch or do they bypass it completely?


**HUMAN:**
Yeah cause I recall before j k ew it was 12 v I had it plugged in and heard the motor and it was connected to the eires


**ASSISTANT:**
 Then the wires are correct. The pressure switch is already internal.

So the pump was working before. That means your wiring to Motor+ and Motor- is fine.

Problem is somewhere else. Check these in order:

1. Is the PWM switch in the ON position (not the middle/stop position)
2. Is the knob turned up above zero
3. Is the power supply actually on — any LED lit on it

What do you see?
