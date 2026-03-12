import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'OppForge Terms of Service — rules and guidelines for using the platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0D0A07] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <Link href="/" className="text-xs font-mono text-[#ff5500] hover:underline">&larr; Back to OppForge</Link>
          <h1 className="text-3xl font-bold text-white mt-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 font-mono mt-2">Last updated: March 12, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">By accessing or using OppForge (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">2. Description of Service</h2>
          <p className="text-sm leading-relaxed">OppForge is an AI-powered platform that discovers, scores, and curates Web3 opportunities including grants, hackathons, airdrops, and bounties. The platform provides tools for tracking, applying to, and managing these opportunities.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">3. Accounts</h2>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials and wallet keys.</li>
            <li>You must not share your account or allow unauthorized access.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">4. Subscriptions & Payments</h2>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li>OppForge offers free and paid tiers (Scout, Hunter, Founder).</li>
            <li>Payments are processed on-chain via smart contracts on supported networks.</li>
            <li>Blockchain transactions are irreversible. Ensure you are sending the correct amount to the correct address.</li>
            <li>Founder tier provides lifetime access. Hunter tier is subscription-based.</li>
            <li>We are not responsible for failed transactions due to network congestion, insufficient gas, or user error.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">5. Acceptable Use</h2>
          <p className="text-sm leading-relaxed">You agree not to:</p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li>Use the Platform for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to gain unauthorized access to the Platform, other accounts, or systems.</li>
            <li>Scrape, copy, or redistribute Platform content without permission.</li>
            <li>Interfere with or disrupt the Platform&apos;s infrastructure or services.</li>
            <li>Submit false or misleading information.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">6. Intellectual Property</h2>
          <p className="text-sm leading-relaxed">All content, branding, code, and AI models on OppForge are the property of OppForge or its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">7. Disclaimers</h2>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li>OppForge is provided &quot;as is&quot; without warranties of any kind, express or implied.</li>
            <li>Opportunity data is aggregated from third-party sources. We do not guarantee accuracy, availability, or outcomes of any listed opportunity.</li>
            <li>AI-generated scores and recommendations are informational only and should not be taken as financial or professional advice.</li>
            <li>We are not responsible for any losses arising from participation in listed opportunities.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">8. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed">To the maximum extent permitted by law, OppForge and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">9. Modifications</h2>
          <p className="text-sm leading-relaxed">We reserve the right to modify these Terms at any time. Changes will be posted on this page. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">10. Contact</h2>
          <p className="text-sm leading-relaxed">For questions about these Terms, contact us at <a href="mailto:hello@oppforge.xyz" className="text-[#ff5500] hover:underline">hello@oppforge.xyz</a>.</p>
        </section>

        <div className="border-t border-white/10 pt-6 text-xs text-gray-600 font-mono">
          &copy; {new Date().getFullYear()} OppForge. All rights reserved.
        </div>
      </div>
    </div>
  );
}
