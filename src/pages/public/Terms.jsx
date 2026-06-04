import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Hubitcareer, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this platform. These terms apply to all users including students, expert tutors and administrators.`
  },
  {
    title: '2. Eligibility',
    content: `You must be at least 13 years of age to use Hubitcareer. By registering, you confirm that you meet this requirement. Users under 18 should have parental or guardian consent before using the platform.`
  },
  {
    title: '3. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update it as necessary. Hubitcareer reserves the right to suspend or terminate accounts that violate these terms.`
  },
  {
    title: '4. Intellectual Property',
    content: `All content on Hubitcareer including tutorials, quiz questions, images and branding is the intellectual property of Ernesis Digital Tech. You may not copy, reproduce, distribute or create derivative works without prior written permission.`
  },
  {
    title: '5. Learning & Quizzes',
    content: `Quiz results are generated automatically based on your answers. Hubitcareer does not guarantee specific outcomes. All quiz attempts are recorded and associated with your account. You must complete all tutorial pages before accessing the quiz.`
  },
  {
    title: '6. Rewards System',
    content: `Rewards are issued at the discretion of Hubitcareer administrators. A minimum score of 10% is required to request a reward. Hubitcareer reserves the right to modify, suspend or discontinue the rewards system at any time.`
  },
  {
    title: '7. Certificates',
    content: `Certificates are issued only to users who score between 80% and 100% on a quiz and whose certificate request has been approved by an administrator. Certificates are for personal use and proof of learning only.`
  },
  {
    title: '8. Expert Tutor Applications',
    content: `Applying to become an expert tutor requires passing an expert-level skill exam with a minimum score of 75%. Approval is at the sole discretion of Hubitcareer administrators. Approved experts may have their content featured on the platform.`
  },
  {
    title: '9. Prohibited Conduct',
    content: `You agree not to use Hubitcareer for any unlawful purpose, to harass other users, to attempt to gain unauthorised access to any part of the platform, to submit false information, or to interfere with the platform's operation.`
  },
  {
    title: '10. Fees',
    content: `Hubitcareer is currently free to use for all learners. We reserve the right to introduce premium features in the future. Any such changes will be communicated to users in advance.`
  },
  {
    title: '11. Limitation of Liability',
    content: `Hubitcareer and Ernesis Digital Tech shall not be liable for any indirect, incidental or consequential damages arising from your use of the platform. The platform is provided on an "as is" basis without warranties of any kind.`
  },
  {
    title: '12. Governing Law',
    content: `These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the jurisdiction of the courts of Cross River State, Nigeria.`
  },
  {
    title: '13. Changes to Terms',
    content: `Hubitcareer reserves the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify users of significant changes where possible.`
  },
  {
    title: '14. Contact',
    content: `For questions about these Terms and Conditions, please contact us at ernesisdigitaltech@gmail.com or through the Contact page on our website.`
  },
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#2979FF]/10 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-[#2979FF]" />
          </div>
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <p className="text-white/40 text-sm">
            Ernesis Digital Tech — Trading as Hubitcareer
          </p>
          <span className="text-white/20">·</span>
          <p className="text-white/40 text-sm">Calabar, Nigeria</p>
        </div>

        <div className="bg-[#2979FF]/5 border border-[#2979FF]/20 rounded-xl px-5 py-4 mb-10">
          <p className="text-white/60 text-sm leading-relaxed">
            Please read these Terms and Conditions carefully before using the
            Hubitcareer platform operated by Ernesis Digital Tech. These terms
            constitute a legally binding agreement between you and Ernesis Digital Tech
            under Nigerian law (CAC registered).
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
              to="/privacy"
              className="text-[#2979FF] text-sm hover:underline"
            >
              View Privacy Policy →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}