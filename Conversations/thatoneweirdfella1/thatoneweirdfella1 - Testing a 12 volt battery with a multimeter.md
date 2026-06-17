# Testing a 12 volt battery with a multimeter

*2026-05-06T06:01:22.181655Z*

---


**HUMAN:**
What do I set my multimeter to to test a 12 volt battery?


**ASSISTANT:**
 Set your multimeter to **DC voltage** (marked as DCV or V with a straight line/dashes), and select a range above 12V — typically **20V** works perfectly.

Then touch red probe to positive terminal, black to negative. A healthy 12V battery reads **12.6V or higher** at rest. Below 12.0V means it's significantly discharged, and below 11.8V usually means it's damaged or dead.


**HUMAN:**
11.18


**ASSISTANT:**
 That battery is in bad shape. At 11.18V it's deeply discharged and likely sulfated — meaning the lead plates have crystallized from sitting low for too long.

Try charging it fully first, then retest. If it won't hold above 12.4V after a full charge, the battery is done and needs replacing.


**HUMAN:**
I've no clue how to charge it


**ASSISTANT:**
 What kind of battery is it? (Car battery, deep cycle, motorcycle, etc.)

That'll tell me the fastest way to walk you through it.


**ASSISTANT:**
 That's an **EverStart Platinum AGM Power Sport** battery (motorcycle/ATV/powersport). The AGM part is important — it changes how you charge it.

**What you need:** A charger with an **AGM mode**. A standard car battery charger can damage an AGM if it pushes too much voltage. A basic trickle charger rated for AGM works fine and is cheap (around $20-30 at Walmart or AutoZone).

**How to charge it:**

1. Leave it out of the vehicle (or disconnect the negative terminal first if it's still in)
2. Connect red clamp to positive terminal, black to negative
3. Set charger to AGM mode if it has one, and the lowest amp setting (2A is ideal for a small powersport battery like this)
4. Let it charge fully — could take several hours given how low it is
5. Once done, retest with your multimeter

**Honest assessment:** At 11.18V this battery may already be too far gone to recover, especially if it's been sitting low for a while. AGM batteries are more sensitive to deep discharge than standard lead-acid. Charge it and retest — if it still won't hold above 12.4V after a full charge, it's done.

What's this battery for — motorcycle, ATV, something else?


**HUMAN:**
Beats me. I was gonna use it for a pump to see if the pump works


**ASSISTANT:**
 That makes it simple. You just need enough juice to test the pump, not a fully healthy battery.

**Quickest options:**

If you have a car nearby, you can jumper cable directly from the car battery to the pump terminals — don't even need the small battery involved.

If you need to use this battery, even at 11.18V it may still have enough to spin a pump briefly for a test. Just connect it and try — worst case it doesn't have enough power and the pump runs slow or not at all, but you won't damage anything.

**What kind of pump is it?** If it's a small 12V pump (sump, transfer, water pump) it'll tell you right away whether the battery has enough left to run it.


**HUMAN:**
No car


**ASSISTANT:**
 Just try connecting the pump directly to the battery as-is. At 11.18V it might have just enough to tell you if the pump works.

Red wire to positive terminal, black to negative. If the pump spins up, you have your answer. If it doesn't, you won't know if it's the battery or the pump that's the problem.

Do you have a charger at all, or any way to charge it?


**HUMAN:**
There is no black wire. Both wires connect from what the cj to unity says


**ASSISTANT:**
 Can you take a photo of the pump and the wires? That'll tell me exactly what you're working with and how to connect it.


**ASSISTANT:**
 That's a Wassermann 12V pressure water pump. Good news — it says "runs dry without damage" so you can test it without water hooked up.

I can see it has a **red wire and a grey/bare wire** coming off it. On these pumps, red is positive and the other is negative — polarity matters or it runs backwards.

**To test it:**

1. Connect the **red wire to the positive terminal** on the battery
2. Connect the **grey/bare wire to the negative terminal**
3. It should spin up immediately if it works

That pump pulls 6.5 amps normally. Your weak battery might still have enough to spin it for a few seconds — enough to tell you if it works.

The pump looks pretty beat up from the photos though. What's the plan for it?


**HUMAN:**
You aren't listening. Co tinuity test says the wires are both connected


**ASSISTANT:**
 Got it, sorry. So both wires are connected to each other — meaning there's no open circuit, the wires are intact.

Can you show me where the wires terminate? Like what's at the other end of each wire — are they going into a connector, a switch, something else?


**HUMAN:**
Bare wire


**ASSISTANT:**
 So both wires are bare at the ends with no connector — just stripped wire.

Then it's simple. Touch one bare wire to the positive battery terminal and the other to the negative. If the pump runs, it works. If it doesn't, either the battery is too dead or the pump is bad.

Don't worry about which wire goes where for a quick test — if it runs backwards you'll know (it'll sound wrong or push water the wrong way) and you just swap them.


**HUMAN:**
The dead battery is enough?


**ASSISTANT:**
 Honestly, maybe not. At 11.18V and a pump that pulls up to 15 amps at startup, it might not have enough to turn it over.

Do you have any of these nearby:

- A phone charger brick (the big ones with USB-C)
- A car battery charger
- A neighbor with a car you could borrow for 5 minutes

The easiest fix would be jump starting from any running vehicle — you don't even need to move the car, just run a set of jumper cables over.


**HUMAN:**
Usb c


**ASSISTANT:**
 A USB-C phone charger won't work — even a big one only puts out 5-20 volts at maybe 3-5 amps through a tiny connector. The pump needs 12V and up to 15 amps. It would just do nothing.

Realistically your options are:

1. Find a neighbor with a car for 5 minutes
2. Buy a cheap AGM battery charger (Walmart, ~$20-25)
3. Buy a new battery if this one is truly dead

Is there any chance the battery has been sitting uncharged for a long time? If so it's probably not recoverable anyway and you'd need a new one regardless.
