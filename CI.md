# Continuous Integration Guide

In order to prevent the review process from unnecessarily blocking progress, anyone with write access is allowed to merge their own pull requests. Tests and other CI jobs are of course still in place and will be improved, so they will allow to merge changes fully automatically with more confidence. Requesting a code review and waiting for approval is an optional step. **That does not mean we do less review!** It means we put more of the responsibility into the developers own hands and “shift left” on quality, meaning **more focus on the beginning of the process instead of the end**. Pull requests will often be more like reports and (human) review has already happened. This is an optimistic approach and optimistic doesn’t mean naive. People using oSnap are well aware of that. It’s the algorithm that ensures correctness to the highest degree possible, not a single pair of eyes.

When I’m trying to go really hardcore on continuous integration, it’s difficult to implement that in a team that works with a much slower and often just broken process. It’s difficult to explain the benefits of continuous integration, if you start with trunk-based development and throw everyone in the cold water, committing broken code and creating a mess in their local history and branches.

To move fast without breaking anything, there simply are some prerequisites and accompanying techniques and it’s much easier to implement them without even talking about continuous integration, let alone trunk-based development.

These techniques can be applied gradually by any project and help improve quality of change management in a codebase. It has a lot to do with culture and mindset, which I also want to discuss here.

# Commits

While pull request can keep being our main tool for communication and documentation of change (and when you want to request review and approval of course), the commit stage should get a bit more attention.

One challenge with authoring “good commits” is to stay focused on the change you actually want to implement, especially when it is sometimes necessary to change other parts of the system first or you are just very tempted to refactor something “quickly”. Sometimes your local changes can get very messy.

If you want to refactor something, please(!) go ahead! Just don’t do it as a “side-effect”. Pause your work. Do the refactoring. Author a good commit. And share that change immediately, independently of your previous task. Hiding correct change in a feature branch, that is valuable to everybody else, can end quite unfortunate. The feature might get canceled by management. You might leave the team before finishing the feature and someone else starts from scratch because of all the confusion your (good and correct) changes cause in the context of the feature implementation.

One game changer for me was, when I realized I can even add individual lines to a commit. So instead of holding myself back from making the changes it needs, by trying to somehow keep the next commit as small as possible, I allow myself to change whatever I want freely but every now and then I pause and go through every single line, to see what changes I can bundle together as a coherent, minimal change. I revert other parts, remove some console.logs and add only the relevant changes to the staging area, write a commit messages, following whatever guidelines there are to follow, commit and push, to share it with the team or simply to get it out of my mind and consider it done

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/4e409b2c-70fb-44c7-99e6-d81efb6a19d6/746b828f-d17d-4389-9bed-af4696b50573/Untitled.png)

So even though I have tons of local changes all the time, often completely unrelated stuff, I stay confident about what I commit and line by line all my changes become the actual truth and the diff between local and remote shrinks again.

In a team scenario the problem occurs when this remote branch isn’t everyone’s branch a.k.a. feature branching. Then this approach is simply not possible because after making a correct, working and helpful change, you still have to wait for approval by a reviewer to allow the team to get in sync with you. If this reviewer has too many additional responsibilities, this can slow down a project dramatically. It is crucial to understand, that dogmatic use of PRs in combination with non-automated approval **enforces larger change sets, that are harder to review!** It forces necessary refactoring and code maintenance tasks to be hidden in feature development or omitted entirely.

Code review is absolutely important. But there simply are some common mistakes that lead to worse not better code quality (and delivery) and endless bouncing back and forth, trying to answer questions that should have been answered long before or trying to resolve conflicts, that could have been addressed a lot earlier in the process or avoided entirely. And no, it is not always faster to resolve a conflict than to prevent it. Sometimes you are just stuck with a huge pile of incompatibility, making the fact even more obvious, that the integration should have happened way earlier.

# Feature Branches

As mentioned, everyone with write access can merge their own pull requests into master, which allows us to merge more often but other feature branches will get out of sync more frequently. That’s intentional. Other branches must know as soon as possible when they are causing a conflict with another one. Merging more frequently into master helps to address these conflicts earlier but it requires you to update your own feature branches more often as well. Luckily we can automate that with git hooks.

To ensure your branches never diverge from master too much, it will get fetched and brutally merged into the current branch you are on, after every push you make. Other local changes will be stashed and reapplied after master has been merged. If conflicts arise, you’ll be the first to know.

This makes sure our pull requests will never have conflicts with master. But it still doesn’t solve the isolation and potential conflicts between two feature branches that have not yet been merged. Even though they are both fully compatible with master, they still can conflict with each other. That’s why allowing (not enforcing!) to self-approve your own PRs and merging them quickly is important, to reduce this risk. Ideally PRs simply get merged when tests pass but that requires a more complete coverage of critical features.

# Feature Flags

What about really large changes? Architectural design? Drastic refactoring? Replacing entire modules? Some things just can’t be committed and deployed in small steps, right? Well, yes and no.

The goal is too allow code to be tested in real environments before being deployed to production That’s possible with branching and many projects do it like that. But when you test a branch, containing a new feature (like when submitting a PR and a test workflow runs on it) and you are happy it works, all tests and checks are green, even your human test team has checked all the boxes with the help of a test deployment and approves everything to be released. Now what? You still need to merge it into the master branch. And that might have changed, right? Maybe by that same process, two days earlier and three weeks after work on this feature had started. So what did you really test?

Your tests should run against something that is as close as possible to production.

Feature flags give you a way to roll out software to the actual production environment, without immediately activating it. This way a roll back in case something goes wrong is often just the act of deactivating it again. Your test deployment can be identical to production, despite some config options or the request headers you send to it. Features can be enabled for your favorite customers only or you can do slow and careful canary releases more easily. You get tools to test in production more carefully. Generally speaking: By moving deployment more into your codebase, you don’t give up control, you increase it.

https://github.com/Unleash/unleash

There are sophisticated solutions out there but I would say this is first of all a switch in mindset and overall approach to organizing feature development in a software project. Implementation details are secondary. But if implemented appropriately, it’s also a big win for developer confidence and the overall development workflow.

# Test Driven Development

Don’t worry. This will also be a very soft approach. I’m trying to take from TDD, what I believe is valuable advice, without following it dogmatically.

The first step is often to build as much confidence as possible, that what you plan to implement or change is actually the right thing. I see TDD as a tool to help with that.

There are two aspects of testing something in general. A test ensures something works, but thinking about that test is also a great practice to refine the test subject itself. Open a new file and pretend your software already exists. Try to use it. How would you make sure it works? What would that look like? This simple act can conjure up scenarios and edge cases you might have missed otherwise and that would then come up during implementation or even worse… the review process.

If you do this exercise in a way that is executable, you get the added benefit of protection later on, against unintentionally changing the behavior of your software, which is great for merging with confidence. And behavior is what you care about. That’s why the practice of *Behavior Driven Design* is closely related to TDD and was largely motivated by the misinterpretation of that term.

If you follow a clear structure and conventions and use terms that have been defined and understood by everyone, including management, and you focus more on behaviors than implementation details, it becomes a valuable tool for everyone involved.

If you do follow TDD dogmatically, you will get 100% test coverage, at all times “for free”. Whatever that means, but it stops becoming “extra work”, when it stats to become an essential part of how you plan to build your software. BUT there are situations you can’t “plan” with a test. You need to prototype. It’s just not a contradiction. It’s complementary and sometimes one is more helpful than the other. Like I said, just open a new file and start to think a little bit more from the other end of the process.

It doesn’t mean you need to master an established testing library. As long as what ever you do, helps you and everyone else in becoming more confident about making changes that work and are well aligned with the goals of the project, for me that counts!

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

# Plan more and reviews with more confidence!

## Arguments Against Feature Branching and Pull Requests

- **Integration and Merge Challenges**: Feature branches often lead to complex integration issues, including accumulating conflicts and difficult merges due to their prolonged isolation from the main codebase. Delays in merging can result in unforeseen integration problems and additional work. **Instead:** Merge often! Integrate continuously.
- **Development Bottlenecks**: The process of waiting for code reviews and approvals can slow down development. This introduces potential delays and inefficiencies. Especially if feedback is not timely or thorough enough, it leads to endless back and forth communication, blocking real progress. **Instead:** Plan ahead! Use templates and checklists to guide thought processes and ensure relevant questions have been addressed upfront.
- **Quality Assurance Concerns**: Reliance on pull requests and code reviews for quality assurance can create a false sense of security. This may lead developers to neglect their own code quality, assuming that reviews will catch issues. Also pull requests often run tests on the feature branch, which is completely irrelevant in many scenarios. Imagine dependencies have been updated in master but not in the feature branch. **Instead:** Empower developers, create guidelines and build strong pipelines. “Shift left” on quality. Test production, not feature branches.
- **Reduced Collaboration and Visibility**: Feature branches can cause developers to work in isolation, reducing collaboration and visibility into ongoing work. This unnecessarily hides valuable changes and improvements, not only from the team but from the product. When team members leave or features get canceled, this value is often lost. **Instead:** Share independent work separately and get it merged quickly.
- **Increased Cognitive Load**: Managing multiple feature branches while being prevented from sharing smaller changes promptly, adds cognitive load and often ends in many things started but nothing getting done. **Instead:** Avoid context switching. Ensure resources are allocated conservatively and developers can work uninterrupted until completion.

In conclusion, while feature branching and pull requests have their place, they can introduce significant challenges to the development process for smaller teams of trusted core developers. A more continuous integration approach, with emphasis on smaller, more frequent commits to the main branch, e.g. by fostering confidence in developers, to merge their own work, and a shift towards "left" quality practices, may lead to more efficient and effective development workflows, without losing anything on the security and robustness front. You might even see improvements there too.
