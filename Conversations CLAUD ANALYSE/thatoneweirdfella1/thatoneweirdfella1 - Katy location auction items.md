# Katy location auction items

*2026-06-07T04:15:01.978821Z*

---


**ASSISTANT:**
 Both are at the Katy location, zero bids, 15% buyer's premium, retail around fifty bucks each.

**Image 1** is the black centrifugal utility pump (330 GPH, 1/10 HP, 120V) with the brush kit and impeller accessories included. Looks like a submersible/transfer hybrid style.

**Image 2** is the TecHome blue transfer pump (330 GPH, 1/10 HP, 115V) with threaded metal fittings and a mounting bracket. That one's built more like a self-priming pump you'd mount to a surface.

For your manual shower setup with the PWM controller and 20A supply... neither of these is ideal. Both are AC pumps running off 120/115V, so your PWM speed controller won't do anything useful with them. Your 12V diaphragm pump plan was the right call for that application.

That said, if you pivot to an AC-powered setup and just want water pressure on demand, the TecHome (Image 2) is the better grab. The threaded fittings and mounting bracket make it easier to integrate into a fixed plumbing run, and the metal construction is more durable than the black one.

For a Nellis bid with zero competition and 22 hours left, you could probably snag either one for a few bucks plus the 15% premium. If you've got a use case for an AC transfer pump, that TecHome at auction price is a stupid good deal.

What's the intended application shifting toward?


**HUMAN:**
Um research the recent chat about how I'm returning the pwm  and the adapter. Tell me if these will work and are stand-alone


**ASSISTANT:**

```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Got the full picture. Here's where things stand:

You're returning the PWM and the undersized adapter. You still have the Wassermann 4WDP5-55 (12V, draws six point five amps running, fifteen amps peak) and the 20A switching power supply.

**The two Nellis pumps: No.**

Both are AC pumps. One twenty volts, one fifteen volts. Your 20A switching power supply outputs 12V DC. These won't run on it at all. They're not standalone either since they need a wall outlet, and they're not diaphragm style so they won't self-prime or hold pressure for a shower setup.

They're the wrong animal entirely for what you're building.

**What you actually still need** is either:

A 12V diaphragm pump that comes with a properly rated adapter (the HuiYu route that came up last session), OR just run your Wassermann directly off the 20A supply since you're keeping that and the PWM was the only thing you're returning.

Wait. You're returning the PWM but keeping the 20A supply? If yes, your Wassermann runs directly off the 20A supply, full five GPM, no flow control. Which brings back the water waste problem.

What's the current inventory: what do you still have and what's going back?


**HUMAN:**
Wtf are u fucking talking about did I not just tell you I was returning the 12v power supply and pwm you absolute . useless twat


**ASSISTANT:**
 You're right. You said returning the PWM and the adapter. The 20A supply is the adapter in context. Got it.

So you have the Wassermann and nothing else that works.

The two Nellis pumps are 120V AC. Plug straight into the wall. No external power supply needed at all.

The question is whether either one can actually function as a shower pump. The black utility pump (Image 1) is a centrifugal style. Those typically need to be primed and don't hold pressure when you shut off flow. Not ideal for a shower head.

The TecHome (Image 2) is also centrifugal based on the housing. Same limitation.

Neither is a diaphragm pump. Diaphragm is what you want for shower use because it self-primes and has a built-in pressure switch that cuts off when flow stops.

So the honest answer: they'll run off the wall no problem, but they're not the right pump type for a shower. You'd have water flowing constantly with no way to pause it without killing power to the pump.

If you just need water pressure and you're okay with it running the whole time you shower, the TecHome would do it. But it's not a clean solution.


**HUMAN:**
I have zero fucking floumps man u suck at reading


**ASSISTANT:**
 You're right, my bad. Zero pumps. Starting from scratch.

Both of these are AC, plug straight into the wall, no power supply needed.

The real question is the pump type. Can you scroll down on either listing and check if it says self-priming? That tells us whether it'll actually pull water up from a container without needing to be submerged.


**HUMAN:**
Can u research the brand and model and find out yourself


**ASSISTANT:**

```
This block is not supported on your current device yet.
```

Both pumps are self-priming. You fill the pump head with water, connect the hose, plug into the wall, and it runs. Standalone, no power supply needed.

The limitation: max suction lift is six feet, so your water container can't be more than six feet below the pump. And it runs at full three thirty GPH with no throttle since there's no PWM. You'd control flow manually at the outlet with a valve or just use a shower head with a shutoff.

For a manual shower with no other equipment, the TecHome (Image 2) works. Plug in, pull water from a container, shower. That's the whole setup.

The black one (Image 1) is the same pump essentially, different shell.

Worth bidding on at Nellis for a dollar or two plus fifteen percent.


**HUMAN:**
What are their gpm


**ASSISTANT:**
 330 GPH divided by 60 = **5.5 GPM**.

Same for both. They're the same pump in different housings.


**HUMAN:**
How can it pump that much water and get choked up cause of 6 feet of gravity for water thats weight is only what's in the hose meaning a half liter or less and it can't finish the job. That's odd


**ASSISTANT:**
 It's not about weight. It's about vacuum.

The pump creates a partial vacuum to pull water up. At six feet of vertical lift, the vacuum it can generate hits its limit. Has nothing to do with how much water is in the hose. It's the same physics that limits every suction pump regardless of hose diameter or water volume.

Think of it like sucking through a straw. Doesn't matter if the straw is thin or fat. There's a max height you can pull liquid up before your lungs can't create enough suction to do it. These pumps have that same ceiling at six feet.

As long as your container is within six feet below the pump you're fine.
