import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'OppForge Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0D0A07] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <Link href="/" className="text-xs font-mono text-[#ff5500] hover:underline">&larr; Back to OppForge</Link>
          <h1 className="text-3xl font-bold text-white mt-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 font-mono mt-2">Last updated: March 12, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">When you use OppForge, we may collect the following information:</p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li><strong>Account Information:</strong> Name, email address, and profile details you provide during registration or onboarding.</li>
            <li><strong>Social Accounts:</strong> If you connect via Google, X (Twitter), or a wallet, we receive your public profile information and unique identifier from that service.</li>
            <li><strong>Wallet Addresses:</strong> Public blockchain addresses you connect to the platform. We never request or store private keys.</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, opportunities tracked, and interaction patterns to improve the platform experience.</li>
            <li><strong>Feedback:</strong> Any information you voluntarily submit through feedback forms.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li>To provide, personalize, and improve the OppForge platform and AI-driven opportunity recommendations.</li>
            <li>To process subscription payments and verify on-chain transactions.</li>
            <li>To send notifications about opportunities matching your profile (if enabled).</li>
            <li>To communicate with you about your account, updates, or support requests.</li>
            <li>To detect and prevent fraud, abuse, or security threats.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">3. Data Sharing</h2>
          <p className="text-sm leading-relaxed">We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            <li><strong>Service Providers:</strong> Infrastructure providers (hosting, database, email) that process data on our behalf under strict confidentiality.</li>
            <li><strong>Blockchain Networks:</strong> Transaction data is inherently public on-chain. We do not control data published to public blockchains.</li>
            <li><strong>Legal Requirements:</strong> If required by law, regulation, or legal process.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">4. Data Security</h2>
          <p className="text-sm leading-relaxed">We implement industry-standard security measures including encrypted connections (TLS), secure authentication (JWT), and access controls. However, no system is 100% secure, and we cannot guarantee absolute security of your data.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">5. Your Rights</h2>
          <p className="text-sm leading-relaxed">You may request to access, update, or delete your personal data at any time by contacting us. You can update most information directly through your account settings.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">6. Cookies & Analytics</h2>
          <p className="text-sm leading-relaxed">We use essential cookies to maintain your session and preferences. We may use analytics to understand platform usage. No third-party advertising trackers are used.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">7. Third-Party Services</h2>
          <p className="text-sm leading-relaxed">OppForge integrates with third-party services (Google OAuth, X/Twitter OAuth, blockchain RPCs). These services have their own privacy policies, and we encourage you to review them.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">8. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the platform constitutes acceptance of the updated policy.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">9. Contact</h2>
          <p className="text-sm leading-relaxed">For questions about this Privacy Policy or your data, reach out to us at <a href="mailto:hello@oppforge.xyz" className="text-[#ff5500] hover:underline">hello@oppforge.xyz</a>.</p>
        </section>

        <div className="border-t border-white/10 pt-6 text-xs text-gray-600 font-mono">
          &copy; {new Date().getFullYear()} OppForge. All rights reserved.
        </div>
      </div>
    </div>
  );
}
