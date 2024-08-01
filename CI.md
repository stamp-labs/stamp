In order to prevent the review process from unnecessarily blocking progress, anyone with write access is allowed to merge their own pull requests. Tests and other CI jobs are of course still in place but requesting a code review and waiting for approval is an optional step. **That does not mean we do less review!** It means we put more of the responsibility into the developers own hands and “shift left” on quality, meaning **more focus on the beginning of the process instead of the end**. Pull requests become more like merge reports and review has already happened before the PR was opened.

This has a lot to do with culture and mind set and also the right tools, which is what I want to discuss here.

## Commits

While pull request can keep being our main tool for communication and documentation of change (and when you want to request review and approval of course), the commit stage should get a bit more attention.

One challenge with authoring “good commits” is to stay focused on the change you actually want to implement, especially when it is sometimes necessary to change other parts of the system first or you are just very tempted to refactor something “quickly”. Sometimes your local changes can get very messy.

If you want to refactor something, please(!) go ahead! Just don’t do it as a “side-effect”. Pause your work. Do the refactoring. Author a good commit. And share that change immediately, independently of your previous tasks. Hiding correct change in a feature branch, that is valuable to everybody else, can end quite unfortunate. The feature might get canceled by management. You might leave the team before finishing the feature and someone else starts from scratch because of all the confusion your (good and correct) changes cause in the context of the feature implementation.

One game changer for me was, when I realized I can even add individual lines to a commit. So instead of holding myself back from making the changes it needs, by dogmatically trying to keep the next commit as small as possible, I allow myself to change whatever I want freely but every now and then I pause and go through every single line, to see what changes I can bundle together as a coherent, minimal change. I revert other parts, remove some console.logs and add only the relevant changes to the staging area, write a commit messages, following whatever guidelines there are to follow, commit and push, to share it with the team.

![image](https://github.com/user-attachments/assets/9ac44707-cc03-4e48-940c-57e8d138c46a)

So even though I have tons of local changes all the time, often completely unrelated stuff, I stay confident about what I commit and line by line all my changes become the actual truth and the diff between local and remote shrinks again.

## Feature Branches

If you want to double down on Continuous Integration, then you would go with trunk-based development. No branches, no PRs, everyone just has a local copy of master and pushes changes directly. This would introduce quite a drastic change and requires a very robust set up of tools and production pipelines and changes in the ways new features get implemented. The push-back is often intense. "But what if someone pushes broken code to master?" "How will we do code reviews?" "Won't this cause chaos?"

I want to suggest a more soft version of it, that would still allow us to move faster while easing these concerns a little bit. As mentioned, everyone with write access can merge their own pull requests. These pull requests should come from a branch named after you. This will be your working copy of master and your goal is to always keep them in sync by merging at least daily, through a self-approved PR.

To ensure your copy never diverges from master, a git hook will fetch and merge it into your copy, before every commit you try to make locally. If conflicts arise, you’ll be the first to know and think “thank god” every single time.

## Feature Flags

What about really large changes? Architectural design? Drastic refactoring? Replacing entire modules?

The goal is too allow code to be tested in real environments before being deployed to production Yes, that’s possible with branching and many projects do it like that. But not as good and realisitc as with trunk-based development and feature flags.

When you test a branch, containing a new feature and you are happy it works, all tests and checks are green, even your human test team has checked all the boxes and approves everything to be released. Now what? You still need to merge it into the master branch, right? And that might have changed, right? So what did you really test? After resolving all those merge conflicts, all confidence is gone and you tell your team to give the live system a quick visit. Just to make sure.

With feature flags you always test exactly what will be rolled out to customers and doing that is a matter of updating an environment variable or a config value in a database or whatever.

## Test Driven Development

The first step is always to build as much confidence as possible that what you plan to implement or change is actually the right thing. Test driven development is simply a method to make that a more streamlined process, including verifying you’ve reached your destination.

I think there are two aspects of testing something in general. A test ensures something works. Awesome. But thinking about that test, is also a great practice to refine the test subject itself. That’s all that TDD wants to tell you.

Open a new file and pretend your software already exists. Try to use it. What would that look like? This simple act can conjure up scenarios and edge cases you might have missed otherwise and that would then come up during the review process.

If you do that in a way that is actually executable, you get the added benefit of verification and protection against regression, which is great for merging with confidence. That doesn’t necessarily mean you need to learn an established testing library. As long as it can be executed and helps to build confidence that everything works as expected, good. If it doesn’t serve that purpose (anymore), consider deleting it, instead of wasting time on maintaining it.

## Deployment

To make merging into master even less exciting and more a good habit, we will pause continuous deployment/delivery to production. Instead we tag individual commits on master with a semantic version number to trigger deployments to production. In addition to that there will be a completely separated but identical test deployment that is always in sync with master.
