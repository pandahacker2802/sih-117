import { NextResponse } from "next/server";

// Define TypeScript interfaces for requests and responses
export interface GenerateRequest {
  topic: string;
  tone: string;
}

export interface HookVariation {
  id: string;
  hook: string;
  body: string;
  cta: string;
  likes: string;
  comments: string;
}

const mockHooks: Record<string, HookVariation[]> = {
  aggressive: [
    {
      id: "agg-1",
      hook: "I quit my $250k corporate job because of a single email.",
      body: "Corporate loyalty is a corporate scam. Companies will lay you off in a heartbeat to protect their margins, yet expect you to sacrifice your evenings and weekends. I spent 8 years climbing the ladder only to realize I was building someone else's dream.",
      cta: "Stop trading your health for a payslip. Start building your own leverage today.",
      likes: "1,420",
      comments: "142",
    },
    {
      id: "agg-2",
      hook: "Stop burning money on expensive marketing agencies.",
      body: "If your budget is under $10,000/month, you don't need an agency. You need a simple, high-converting offer and a founder who knows how to talk to prospects. Agencies will charge you a $3k retainer just to run basic templates they copied from a Google Doc.",
      cta: "Do the unscalable work first. Agree or disagree?",
      likes: "895",
      comments: "98",
    },
    {
      id: "agg-3",
      hook: "Most business leaders are completely blind to the next 6 months.",
      body: "We are entering the most aggressive consolidation wave since 2008. The businesses that rely on cheap debt, inflated valuations, and bloated payrolls will be wiped clean. Efficiency isn't a goal anymore—it is the only way to survive.",
      cta: "Cut the fat before the market cuts it for you.",
      likes: "2,110",
      comments: "254",
    },
  ],
  "thought-leading": [
    {
      id: "tl-1",
      hook: "The most successful founders don't build products. They build distribution.",
      body: "A mediocre product with world-class distribution wins every single time. A world-class product with no distribution is just a hobby. When building your startup, spend 20% of your energy on engineering and 80% on building an audience that cares.",
      cta: "Build your channel first, then build your product.",
      likes: "3,210",
      comments: "189",
    },
    {
      id: "tl-2",
      hook: "AI isn't going to replace developers. Developers using AI will replace those who don't.",
      body: "The bottleneck in software engineering is no longer writing the code; it is translating business requirements into logic. AI tools act as force multipliers. A developer who knows how to orchestrate agentic flows will easily do the work of a 5-person engineering team.",
      cta: "Are you teaching your team how to leverage AI, or are you hoping the wave passes?",
      likes: "4,520",
      comments: "420",
    },
    {
      id: "tl-3",
      hook: "90% of organization scaling issues are not technical. They are cultural.",
      body: "When you grow from 10 to 50 employees, things break. Not because your database is slow, but because communication lines grow exponentially. The solution isn't adding more meetings; it's documentation, extreme ownership, and defining clear, simple outcomes.",
      cta: "Write down your processes before they become problems.",
      likes: "1,150",
      comments: "76",
    },
  ],
  storytelling: [
    {
      id: "story-1",
      hook: "Two years ago, I sat in a coffee shop with exactly $47 in my bank account.",
      body: "Yesterday, we officially crossed $1,000,000 in Annual Recurring Revenue (ARR). I didn't raise VC money. I didn't have a team of 50. I just had a laptop, an internet connection, and the stubbornness to post here every single day for 730 days straight.",
      cta: "Consistency isn't flashy, but it is the only compounding asset that matters.",
      likes: "6,890",
      comments: "512",
    },
    {
      id: "story-2",
      hook: "My co-founder and I almost called it quits last Tuesday.",
      body: "We had a screaming match in our meeting room about our product roadmap. We were both exhausted, stressed, and convinced the other was wrong. But instead of walking away, we sat down, ordered a pizza, and wrote down our core shared mission on a whiteboard.",
      cta: "Align on the mission, and the roadmap conflicts will solve themselves.",
      likes: "2,350",
      comments: "194",
    },
    {
      id: "story-3",
      hook: "We pitched 42 venture capital funds. We got 42 straight rejections.",
      body: "But investor number 43 gave us the check. Not because they liked our slides, but because they liked how we responded to criticism during the interview. Every rejection is just a data point showing you what needs to be refined before the final yes.",
      cta: "No is never permanent. It is just a request for more evidence.",
      likes: "3,110",
      comments: "220",
    },
  ],
  analytical: [
    {
      id: "anal-1",
      hook: "We analyzed 12,400 viral LinkedIn posts. Here is what we found:",
      body: "1. The hook must be under 80 characters.\n2. Visual spacing matters more than perfect grammar.\n3. The CTR increases by 34% when you include a clear visual or step-by-step framework.\n4. Call to actions that ask open-ended questions generate 3x more comments.",
      cta: "Save this template to use for your next post.",
      likes: "5,430",
      comments: "389",
    },
    {
      id: "anal-2",
      hook: "How we dropped our product churn rate from 4.2% to 1.1% in 30 days.",
      body: "We did three simple things:\n1. Triggered an automated personalized Loom video on user signup.\n2. Built an in-app check-off checklist for onboarding.\n3. Moved our customer support directly into a Slack channel with the founders.",
      cta: "High-touch onboarding always beats high-spend advertising.",
      likes: "1,750",
      comments: "112",
    },
    {
      id: "anal-3",
      hook: "Let's run the math: Hiring a Senior Dev vs. a full AI agentic setup.",
      body: "Senior Developer: $150k base + $30k benefits + onboarding lag.\nAI workspace & custom agents: $5k API costs + $1k templates + instant deployment.\nWhile AI cannot replace human creativity, it can handle 80% of routine CRUD features, API piping, and testing suites, freeing up founders to build product logic.",
      cta: "The hybrid model is the future of lean startups.",
      likes: "2,050",
      comments: "310",
    },
  ],
  provocative: [
    {
      id: "prov-1",
      hook: "Stop telling your employees to work hard.",
      body: "If your team has to work 60-hour weeks to hit milestones, it isn't a sign of commitment—it is a sign of incompetent management. Bloated scopes, shifting priorities, and lack of clear objectives are what kill productivity, not lack of work ethic.",
      cta: "Good leadership builds systems that let people go home on time.",
      likes: "9,820",
      comments: "840",
    },
    {
      id: "prov-2",
      hook: "Most LinkedIn 'creators' are completely broke.",
      body: "They brag about reaching 10 million impressions, but their bank accounts show zero. Impression metrics are easy to game with generic motivational content. Conversion metrics (signups, consultation calls, newsletter subscribers) are what pay the bills.",
      cta: "Optimize for bank accounts, not browser tabs.",
      likes: "4,120",
      comments: "472",
    },
    {
      id: "prov-3",
      hook: "You don't need a new marketing strategy. You need a better product.",
      body: "No amount of high-budget copy, influencer shoutouts, or SEO hacking can fix a product that users abandon after 5 minutes. If your retention rate is garbage, marketing is just accelerating your failure by telling more people your product is bad.",
      cta: "Fix your leaks before you open the faucet.",
      likes: "3,740",
      comments: "315",
    },
  ],
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, tone } = body;

    if (!topic || !tone) {
      return NextResponse.json(
        { error: "Topic and tone are required parameters." },
        { status: 400 }
      );
    }

    // Standard client delay to simulate real AI API response time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Resolve variations based on selected tone
    const normalizedTone = tone.toLowerCase();
    const variations = mockHooks[normalizedTone] || mockHooks["thought-leading"];

    // Customise the hooks dynamically to match the user's topic
    const customizedVariations = variations.map((item) => {
      // Modify hooks to merge topic context subtly
      let displayHook = item.hook;
      const displayBody = item.body;
      
      // Inject user's topic keywords dynamically into the mock hooks
      const cleanTopic = topic.trim().replace(/\.$/, "");
      
      if (item.id.includes("1")) {
        displayHook = `${item.hook} Especially when it comes to ${cleanTopic.toLowerCase()}.`;
      } else if (item.id.includes("2")) {
        displayHook = `${item.hook} (Here is how it applies to ${cleanTopic.toLowerCase()})`;
      } else {
        displayHook = `${item.hook} Let's talk about ${cleanTopic.toLowerCase()}.`;
      }

      return {
        ...item,
        hook: displayHook,
        body: displayBody,
      };
    });

    return NextResponse.json({ success: true, variations: customizedVariations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
