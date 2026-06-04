import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const sections = [
  {
    title: '1. Introduction',
    content: `Ernesis Digital Tech ("we", "our", "us"), trading as Hubitcareer, is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store and protect your information when you use the Hubitcareer platform, in compliance with the Nigeria Data Protection Act (NDPA) 2023.`
  },
  {
    title: '2. Data We Collect',
    content: `We collect the following information when you register: full name, email address, phone number and password (encrypted). We also collect quiz attempt records, skill progress data, reward and certificate requests, and expert application details including CV files.`
  },
  {
    title: '3. How We Use Your Data',
    content: `Your data is used to: provide and improve the Hubitcareer service, track your learning progress, process reward and certificate requests, manage expert tutor applications, send account-related communications and ensure platform security.`
  },
  {
    title: '4. Data Storage',
    content: `Your account data is stored securely in Google Firebase (Firestore Database and Firebase Authentication), which is hosted on Google Cloud infrastructure. Profile images and site assets are stored on Cloudinary. Certificate PDFs and CV files are stored in Firebase Storage.`
  },
  {
    title: '5. Data Sharing',
    content: `We do not sell your personal data to third parties. Your data may be shared with: Google Firebase (data storage and authentication), Cloudinary (image storage and optimisation), and as required by Nigerian law or court order.`
  },
  {
    title: '6. Cookies',
    content: `Hubitcareer uses essential cookies and browser storage to maintain your login session and preferences. We do not use tracking or advertising cookies. You can clear cookies at any time through your browser settings.`
  },
  {
    title: '7. Your Rights (NDPA 2023)',
    content: `Under the Nigeria Data Protection Act 2023, you have the right to: access your personal data, correct inaccurate data, request deletion of your account and data, object to processing of your data, and lodge a complaint with the Nigeria Data Protection Commission (NDPC).`
  },
  {
    title: '8. Data Retention',
    content: `We retain your account data for as long as your account is active. If you delete your account, your personal data will be removed within 30 days, except where retention is required by law or for legitimate business purposes.`
  },
  {
    title: '9. Children\'s Privacy',
    content: `Hubitcareer is not directed at children under 13. We do not knowingly collect personal data from children under 13. If we discover such data has been collected without parental consent, we will delete it promptly.`
  },
  {
    title: '10. Security',
    content: `We implement industry-standard security measures including encrypted passwords, Firebase security rules, authenticated file access and HTTPS encryption. However, no system is completely secure and we cannot guarantee absolute security.`
  },
  {
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on the platform. Continued use after changes constitutes acceptance of the updated policy.`
  },
  {
    title: '12. Contact Us',
    content: `For any privacy-related questions, data requests or complaints, please contact our Data Protection Officer at ernesisdigitaltech@gmail.com. We aim to respond to all requests within 14 days.`
  },
]

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#2979FF]/10 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-[#2979FF]" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <p className="text-white/40 text-sm">
            Ernesis Digital Tech — Trading as Hubitcareer
          </p>
          <span className="text-white/20">·</span>
          <p className="text-white/40 text-sm">NDPA 2023 Compliant</p>
        </div>

        <div className="bg-[#2979FF]/5 border border-[#2979FF]/20 rounded-xl px-5 py-4 mb-10">
          <p className="text-white/60 text-sm leading-relaxed">
            This Privacy Policy describes how Ernesis Digital Tech collects, uses
            and protects your personal information in accordance with the Nigeria
            Data Protection Act (NDPA) 2023. By using Hubitcareer, you consent
            to the practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map(({ title, content }) => (
            <div key={title} className="space-y-2">
              <h2 className="text-white font-semibold text-base">{title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-white/10 space-y-2">
          <p className="text-white/30 text-xs">
            Last updated: {new Date().toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          <p className="text-white/30 text-xs">
            Ernesis Digital Tech · Calabar, Cross River State, Nigeria
          </p>
          <p className="text-white/30 text-xs">
            ernesisdigitaltech@gmail.com
          </p>
          <div className="pt-2">
            <Link
              to="/terms"
              className="text-[#2979FF] text-sm hover:underline"
            >
              View Terms & Conditions →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}