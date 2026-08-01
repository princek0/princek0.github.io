---
title: "Reflections on an AI Security Hackathon we ran"
description: "Crossposted and written by Josh Muthu & Prince Kumar For the last 3 months, we’ve both been interning at Entrepreneurs First (EF), a company that helps ta..."
publishedAt: "2025-09-16T09:02Z"
draft: false
legacyBearUrl: "https://thisisprince.bearblog.dev/reflections-on-an-ai-security-hackathon-we-ran/"
---

_[Crossposted and written by Josh Muthu & Prince Kumar](https://joshuamuthu.substack.com/p/hacking-away-at-pdoom)_

For the last 3 months, we’ve both been interning at Entrepreneurs First (EF), a company that helps talented people build startups from scratch. In our penultimate week, we ran an AI Security Hackathon alongside BlueDot Impact, with sponsorship from Workshop Labs and Geodesic Research. It was a big success!

This post: 1. recounts the story behind our hackathon; 2. reflects on our learnings, which may prove useful to others; and 3. presents our view that for-profit ventures can be vital vectors for AI safety – and are currently underutilised by the AI safety community.

## 1\. Story

Towards the end of our internship at EF, Prince’s mentor, James Richards, advised, “do something ambitious in your last 2 weeks”.

Now, we believe AI safety is important. We also believe the world needs more potentially high-upside projects in the safety space, and that venture-scalable businesses can be a particularly powerful vector for such projects. Further, we think there is a subset of technical safety-pilled people who are unusually well-suited to founding such businesses. We’ll discuss all that in more detail later, but suffice to say, we decided to be ✨agentic✨ and organise something ambitious to find and cultivate AI safety talent, in line with our beliefs.

We’d already run a demo night for AI researchers a few weeks before, which had a strong safety focus. Prince suggested running an AI safety hackathon (we later dubbed it AI “security”, rather than “safety”, to broaden the event’s appeal). We ended up running both the demo night and the hackathon pretty autonomously, asking for forgiveness rather than permission from the wider EF team (much to our manager’s chagrin – apologies again, Max)!

We were pretty pushed for time – only 2 weeks between deciding to run the hackathon to its execution. We contacted a bunch of orgs in the safety space to a) give us advice, b) spread the word, and c) sponsor the event. EF may have tolerated us organising the event without their explicit permission (at least from the outset), but they sure as hell weren’t going to lavish a bunch of money on us. Word spread that two rogue interns were running a hackathon by themselves, and pretty soon Josh was in contact with Josh Landes from BlueDot Impact. BlueDot agreed to co-host the event and provide the bulk of the funding. We also secured generous sponsorship from Workshop Labs and Geodesic Research.

As mentioned, our aim was to find safety-pilled people who might become great founders, and get them thinking about creating a venture-scalable AI security firm. More broadly, we wanted the hackathon to contribute towards AI safety, and to find people who might make great additions to existing AI safety startups/orgs (including our sponsors).

Anyway, we advertised the hackathon to safety-pilled people through AI safety Slacks, group chats, Discord servers, etc. We also cold-messaged people on LinkedIn who might have fitted the bill (e.g. who worked at an AI lab or safety org). Our outreach was successful – we got over 160 registrations!

We scheduled calls with the most promising applicants to filter for good potential founders, according to EF’s model of founder talent (note, the linked article is a bit out of date but is still broadly accurate).

We decided early on to keep the talent bar very high, and have no more than ~30 people in the room. Indeed, for a couple of slightly nerve-wracking days before the hackathon, we were nervous we’d set the bar too high – but a burst of cold outreach on LinkedIn soon put things right.

Matt Clifford, EF’s co-founder, very kindly agreed to give up his Saturday morning to give an opening talk. His many claims to fame include running the def/acc cohort (which created companies building defensive technologies), chairing ARIA (the UK’s DARPA), and advising the UK Prime Minister(s) on AI.

A dozen teams hacked away for over 12 hours, subject to 2 criteria: 1. they had to build something that contributed to AI safety/security, and 2. it had to be commercially viable and venture-scalable. Thanks to our generous sponsorship, we had £2000 in prize money, which went to 3 prizewinning teams:

- 1st place: Crux – refactoring C and C++ into Rust to reduce code vulnerabilities (Xavi Costafreda-Fu and Salim Boujaddi – £750 each)

- 2nd place: Socrates – Automated red-teaming agent that generates scenarios and dialogues to uncover dangerous behaviours (Callum McDougall and Anna Soligo – £250 each)

- 3rd place: SecureMCP – MCP-compatible tool against prompt injection and leakage of personal info (Zac Saber, Irakli Shalibashvili, Peter Wallich, and Daniel Tan – £50 each)

Overall, the hackathon far exceeded both of our expectations! We, and the sponsors, were really happy with the outcomes, which included:

- Geodesic and Workshop forming an informal “research agreement”
- Two people applied to EF immediately after the event, hoping to build venture-scalable AI security startups
- One of the hackathon winners is going to start a work trial at Workshop Labs
- A bunch of talented safety-pilled people who are now on EF’s radar as potential founders
- At least one person is continuing to work on SecureMCP (the project that came 2nd)

In fact, the event went so well that BlueDot, Workshop, and Geodesic all are excited to run another hackathon – which we’ll be doing on the 22nd of November (stay tuned)!

Finally, we do want to acknowledge a few other people who were incredibly helpful in making the event successful. Archana Vaidheeswaran from Apart Research gave some really helpful ops advice. Our colleague Maria Luque Anguita helped us out a lot, both before and during the hack. Prince’s mentor James Richards did the same, and was a really useful sounding board (and, as mentioned, inspired the event)!

## 2\. Learnings

Our hackathon’s format was inspired by the European Builders League hackathons, run by EF’s Paris team – Prince was one of ~18 attendees at one in Copenhagen. As mentioned, we likewise optimised for quality over quantity regarding participant numbers. Our arguments for this are:

- Explicitly advertising an event as a curated room of handpicked talent attracts the best people (in hindsight, we should have been more explicit in advertising this)!
- Judges can more accurately assess the quality of projects, because there are fewer.
- Participants have a better experience, because they’ll meet everyone else there and feel like they’re in a high-signal environment.
- It’s cheaper and easier to organise!

Anecdotally, we’ve noticed there tend to be diminishing returns to hackathons that extend much beyond 12 hours. Consequently, our hackathon was 12 hours, which was long enough for attendees to make meaningful progress without overoptimising for demos or ancillary features. Also, the compressed timeframe separates the most talented builders from the rest.

As judges, we were only interested in the core functionality of the projects, rather than jazzy frontends, demos, presentations, etc. We therefore told teams to focus on demonstrating only their live code – though, in hindsight, we should have been more explicit on this point!

We put a lot of thought into setting the tone for the event. It’s particularly vital to do this for highly thesis-driven events, like this hackathon – we were specifically looking for projects that were 1. positive for AI safety and 2. venture scalable. We wanted to avoid attendees focusing on only one of those points. Consequently, Josh gave an excellent opening talk (if he says so himself) that set the tone and expectations for the event, which was reinforced by talks from Matt Clifford and Josh Landes from BlueDot. We also checked in with each team during the hackathon to ensure they were working on projects that aligned with our criteria.

Other practical things that event/hackathon organisers should bear in mind:

- When choosing a date, check for clashing events which might affect high-quality attendees' availability
- If you can afford to be picky in your sponsors, choose ones that have good on-thesis brand recognition and who are well-connected in the space (for advertising and outreach purposes!)
- Announce the event in a rough goldilocks zone of ~1 month ahead of time – not too far beforehand that people forget about it
- Have a low bar for signing up (we just asked for LinkedIn and a personal website/GitHub) so busy people aren't dissuaded from doing so, but then screen everyone to see if they meet the bar
- Ask applicants to refer a friend to a hackathon – great people normally know other great people!
- Ahead of time, create suggested groupings of 2-4 attendees which might form the nuclei of good teams
- Check dietary requirements for ordering food
- Leave some cash (~£200 for our hackathon) as a buffer, just in case
- Create a group chat on WhatsApp or similar to ensure you can easily contact attendees throughout the day
- Only do talks at the start or end of a hackathon – it's impossible to get a bunch of builders to stop building in the middle of the day to attend a talk
- Explicitly lay out the judging criteria at the start of the hack, so attendees know what to build
- A couple of hours after teams have formed, teams should do a check-in with judges/advisors to ensure they're on the right track
- Every hour or so after that, advisors should do more informal check-ins with the teams and answer any questions they have
- The judges should collectively have competencies in the criteria you're looking for (in our case, VC commerciality and technical AI safety)
- Have a dedicated space for judges where teams come over to one-by-one and present
- Strictly regiment the amount of time allotted to judge each team, allowing a decent chunk of time for the judges to ask questions

## 3\. Startups as vectors for AI safety

We believe that startups can be a powerful vector for advancing AI safety/security – a vector that the AI safety community has thus far underutilised and underrated.

Why? Impact = magnitude \* direction. Most people in AI safety optimise for a positive direction. This is great! It may be personally comforting to work on something clearly directionally positive, like independent alignment research. But if you really care about having an impact, you cannot neglect magnitude.

Which brings us to startups. Startups are an incredibly powerful, if not the most powerful, mechanism for achieving high-magnitude outcomes. They are able to rapidly attract and leverage huge pools of capital and talent – pools which have, until recently, been relatively untapped by the AI safety community (see also this EA Forum post). VC wealth and dynamics mean startups’ growth isn’t capped by donor generosity, and they are able to scale much more quickly than non-profits. This is crucial, because we need more AI safety organisations – existing orgs can’t scale fast enough to absorb all the talented people that want to work in this field.

We also believe many people working on technical AI safety would make great founders. Many safety people are highly ambitious – they want to have a large positive impact on the world (both direction and magnitude)! These people also discovered and started working in an unusual niche – technical AI safety is pretty esoteric – which selects for intellectual curiosity, intelligence, technicality, etc. Such traits are highly desirable in a founder (at least in EF’s model of founders – h/t to James, again, for fleshing this out with us).

Ok, so startups are high-magnitude, and many safety folks are well-suited to founding. But how do we ensure they have a positive direction, i.e. actually contribute to AI safety? How do founders ensure that, for example, they only hire mission-aligned people when scaling, or that the profit motive isn’t misaligned with contributing to AI safety?

Well, it is tough. But we know you guys are ok with tough, because if you weren’t, you wouldn’t be thinking about AI alignment, which is a pretty tough problem\[citation needed\]. However, it should give you confidence that there are already a bunch of startups that are explicitly focused on AI safety, such as Goodfire, Conjecture, Lakera, Andon Labs, and of course, our very own hackathon sponsors, Workshop Labs. It should also give you confidence that there are several organisations that are looking to fund for-profit AI safety startups, such as Seldon Lab, UK AISI’s The Alignment Project, Catalyze Impact, and Fifty Years’ 5050 AI programme. And anecdotally, more and more people in this space are waking up to the potential of for-profit ventures to contribute to AI safety.

Ultimately, there’s not going to be a unique strategy that will “solve” AI risk. Humanity needs to embrace a Swiss cheese model of defence against these risks. For-profit safety startups will represent another, much needed, slice of Swiss cheese.
