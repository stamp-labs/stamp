# Continuous Integration Guide

(PREVIEW: FULL OF CRAP STILL!)

In order to prevent the review process from unnecessarily blocking progress, anyone with write access is allowed to merge their own pull requests. Tests and other CI jobs are of course still in place and will be improved, so they will allow to merge changes fully automatically. Requesting a code review and waiting for approval is an optional step. **That does not mean we do less review!** It means we put more of the responsibility into the developers own hands and “shift left” on quality, meaning **more focus on the beginning of the process instead of the end**. Pull requests will often be more like reports and (human) review has already happened.

This has a lot to do with culture and mindset and also the right tools, which is what I want to discuss here.

# Commits

While pull request can keep being our main tool for communication and documentation of change (and when you want to request review and approval of course), the commit stage should get a bit more attention.

One challenge with authoring “good commits” is to stay focused on the change you actually want to implement, especially when it is sometimes necessary to change other parts of the system first or you are just very tempted to refactor something “quickly”. Sometimes your local changes can get very messy.

If you want to refactor something, please(!) go ahead! Just don’t do it as a “side-effect”. Pause your work. Do the refactoring. Author a good commit. And share that change immediately, independently of your previous task. Hiding correct change in a feature branch, that is valuable to everybody else, can end quite unfortunate. The feature might get canceled by management. You might leave the team before finishing the feature and someone else starts from scratch because of all the confusion your (good and correct) changes cause in the context of the feature implementation.

One game changer for me was, when I realized I can even add individual lines to a commit. So instead of holding myself back from making the changes it needs, by trying to somehow keep the next commit as small as possible, I allow myself to change whatever I want freely but every now and then I pause and go through every single line, to see what changes I can bundle together as a coherent, minimal change. I revert other parts, remove some console.logs and add only the relevant changes to the staging area, write a commit messages, following whatever guidelines there are to follow, commit and push, to share it with the team or simply to get it out of my mind and consider it done

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/4e409b2c-70fb-44c7-99e6-d81efb6a19d6/746b828f-d17d-4389-9bed-af4696b50573/Untitled.png)

So even though I have tons of local changes all the time, often completely unrelated stuff, I stay confident about what I commit and line by line all my changes become the actual truth and the diff between local and remote shrinks again.

# Feature Branches

If you want to double down on Continuous Integration, then you would go with trunk-based development. No branches, no PRs, everyone just has a local copy of master and pushes changes directly. This would introduce quite a drastic change and requires a very robust setup of tools and production pipelines and changes in the ways new features get implemented. The push-back is often intense. "But what if someone pushes broken code to master?" "How will we do code reviews?" "Won't this cause chaos?"

I want to suggest a more soft version of it, that would still allow us to move faster while easing these concerns a little bit. As mentioned, everyone with write access can merge their own pull requests into master, which allows us to merge more often and your feature branches will get out of sync quicker. The main purpose of trunk-based development, is to avoid isolation and accumulating conflicts but that can also be achieve with a simple pre-commit hook.

To ensure your branches never diverge from master, a git hook will fetch and merge it into your current branch, before every commit you try to make locally. If conflicts arise, you’ll be the first to know and think “Thank god!” every single time.

This makes sure our pull requests will never have conflicts with master. But it still doesn’t solve the isolation and potential conflicts between two feature branches that have not yet been merged back into master. Even though they are both fully compatible with master, they still can conflict with each other. That’s why allowing (not enforcing!) to self-approve your own PRs and merging them quickly is important, to reduce this risk. Ideally PRs simply get merged when tests pass but that requires a more complete coverage of critical features.

# Feature Flags

What about really large changes? Architectural design? Drastic refactoring? Replacing entire modules? Some things just can’t be committed in steps, right? Well, yes and no.

The goal is too allow code to be tested in real environments before being deployed to production Yes, that’s possible with branching and many projects do it like that. But when you test a branch, containing a new feature and you are happy it works, all tests and checks are green, even your human test team has checked all the boxes and approves everything to be released. Now what? You still need to merge it into the master branch? And that might have changed, right? So what did you really test?

Your tests should run against something that is as close as possible to the real production environment. With feature flags you always test exactly what will be rolled out to customers and doing that is a matter of updating an environment variable or a config value in a database or whatever. Generally speaking: By moving deployment more into your codebase, you don’t give up control, you increase it.

https://github.com/Unleash/unleash

There are sophisticated solutions out there but I would say this is first of all a switch in mindset and overall approach to organizing feature development in a software project. Implementation details are secondary.

# Test Driven Development

Don’t worry. This will also be a very soft approach. I’m trying to take from TDD, what I believe is valuable advice, without following it dogmatically.

The first step is often to build as much confidence as possible, that what you plan to implement or change is actually the right thing. I see TDD as a tool to help with that.

There are two aspects of testing something in general. A test ensures something works, but thinking about that test is also a great practice to refine the test subject itself. Open a new file and pretend your software already exists. Try to use it. How would you test it, if you had to? What would that look like? This simple act can conjure up scenarios and edge cases you might have missed otherwise and that would then come up during the review process.

If you do this exercise in a way that is actually executable, you get the added benefit of protection against regression, which is great for merging with confidence. If you follow a clear structure and conventions and use terms that have been defined and understood by everyone, including management, and you focus more on behaviors than implementation details, it becomes a valuable tool for everyone involved. If you make it a habit, you get high test coverage “for free” which again increases confidence and reduces review burden.

But all that doesn’t necessarily mean you need to learn an established testing library. As long as it can be executed and helps to build confidence that everything works as expected, good. If it doesn’t serve that purpose (anymore), consider deleting it, instead of wasting time on maintaining it. Because I actually think, even though being confident doesn’t mean nothing will ever go wrong, it just allows you mentally to move faster and not get blocked by your own doubt. And IF something goes wrong, you at least know you did a lot of things to prevent it and you don’t need to question yourself so much. Shit happens. Even with TDD. Just a little bit less, hopefully. Also, whenever something still goes wrong, despite all the carefulness, you’ll probably actually learn something very valuable about how to make your tests even more robust from now on.

# Deployment

Finally, to make merging into master even less exciting and more a good habit, we will pause continuous deployment/delivery to production. Instead we manually tag and push individual commits on master with a semantic version number to trigger deployments. In addition to that there will be a completely separated but identical test deployment that is always in sync with master.

My own interpretation of Continuous Delivery or what I take from it, is the mindset to try your best to keep your codebase always in a fully functional, deployable state, but without deploying every commit to production.

# Kanban

Now the last question that remains: How do we manage our capacity? Kanban has its roots in actual real-world production and is mostly about streamlining processes, identifying bottlenecks and improving efficiency or resource use.

How do we assign our resources (in this case developer’s time and focus) to tasks that we agreed on? In an open source project, with external contributors and async work hours and all that flexibility that’s no trivial problem to solve.

## Product

High level, non-technical goals, defined from stakeholder/product owner perspective, including clearly defined acceptance criteria. I’m already stretching the Kanban method here a bit but this column is just there to make sure, everyone involved keeps (literally) an eye on what actual real-world problems we want to solve.

Items in this column can evolve but they don't move. They should be referenced in the actual units of work.

## Shaping

This term is taken from the “Shape up” method, where focus lies on “shaping” the implementation, from these high level product perspectives and finding the sweet spot between our “appetite” for spending time and resources on something and the product’s goals. “Framing” would be another good term.

[Shaping in a Nutshell](https://www.youtube.com/watch?v=h_8M23wVjXk)

It also plays well with TDD if you start to draft tests early and it replaces a big chunk of what previously was a retroactive review process.

Items in this column are issues that follow a template, to make sure we stay focused on goals and plan the implementation properly. This template includes a checklist that should be checked of before moving to implementation.

Identified sub-tasks are created as issues too but are not visible in the Kanban board, while merged pull requests resolving those issues are (in “To be Shipped”).

## Implementation

If any tests have been drafted, it’s probably the first step to implement them now. But there aren’t always tests to work on, so you jump right into the code. This is now the moment where all the prior planning needs to prove valuable and still you will discover the so called “unknown unknowns”. All “known unknowns” have hopefully already been documented.

## To be Shipped

This column simply contains all merged changes since the last deployment. The column is automatically cleared via a workflow. It is NOT meant to be reviewed. It is a FYI column. You can take a look at it before triggering the deployment workflow but you should not feel obligated to look at the code one more time.

## Capacity

The essence of a Kanban board is to channel and reflect utilization of resources, so the number of items that are allowed in a column, is based on the available resources. If there are only two developers, it doesn’t make sense to have 20 items in a column. Usually there’s one “row” per “processing unit” (developer). It’s not just lists of tasks, changing their state from open to closed.

# Plan more and review with more confidence!

## Arguments Against Feature Branching and Pull Requests

(Redundant AI generated shit!)

1. **Isolation and Accumulating Conflicts**: Feature branches create isolation, leading to accumulating conflicts over time. This makes integration more difficult and time-consuming.
2. **Delayed Integration**: Features developed in isolation may not integrate well with other changes, leading to surprises and additional work when merging back to the main branch.
3. **False Sense of Security**: Pull requests and code reviews can create a false sense of security, potentially leading to less careful development practices.
4. **Bottlenecks in Development Flow**: Waiting for code reviews and approvals can create bottlenecks, slowing down the development process.
5. **Reduced Responsibility**: Relying on others to catch issues through code reviews may reduce developers' sense of responsibility for their own code quality.
6. **Inefficient Use of Time**: Code reviews often happen after significant work has been done, making it less efficient to address fundamental issues.
7. **Lack of Focus in Reviews**: Uncoordinated and random code reviews without clear focus can lead to superficial feedback and missed critical issues.
8. **Delayed Feedback**: Feature branches delay feedback on how code integrates with the main codebase and other ongoing changes.
9. **Hiding Valuable Changes**: Useful refactoring or improvements might be hidden in feature branches, depriving the team of immediate benefits.
10. **Risk of Feature Cancellation**: If a feature is canceled, valuable changes within the branch might be lost or overlooked.
11. **Difficulty in Testing**: Testing feature branches in isolation doesn't guarantee they'll work when integrated into the main codebase.
12. **Reduced Collaboration**: Feature branches can lead to reduced collaboration as developers work in silos.
13. **Increased Cognitive Load**: Managing multiple branches and their states adds complexity to the development process.
14. **Decreased Visibility**: Long-lived feature branches decrease visibility into ongoing work for the rest of the team.
15. **Potential for "Big Bang" Integrations**: Large feature branches can lead to challenging and risky "big bang" integrations.
16. **Reduced Frequency of Integration**: Feature branching can lead to less frequent integration, going against continuous integration principles.
17. **Difficulty in Keeping Branches Up-to-Date**: Constantly rebasing or merging from the main branch into feature branches can be time-consuming and error-prone.
18. **Increased Merge Conflicts**: The longer a branch lives, the higher the likelihood of merge conflicts when integrating back to the main branch.
19. **Delayed Deployment**: Feature branches can delay deployment of completed work, as the entire feature needs to be finished before merging.
20. **Less Emphasis on Incremental Development**: Feature branches may encourage larger, less incremental changes, which are riskier and harder to review effectively.

In conclusion, while feature branching and pull requests have their place, they can introduce significant challenges to the development process. A more continuous integration approach, with emphasis on smaller, more frequent commits to the main branch and a shift towards "left" quality practices, may lead to more efficient and effective development workflows.
