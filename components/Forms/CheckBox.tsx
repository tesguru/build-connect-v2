import Checkbox from "expo-checkbox";
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Terms of Service Sections ────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    title: "1. Definitions",
    body: `"BuildConnect" means BuildConnect Inc., its subsidiaries, affiliates, directors, officers, and employees. "Platform" means the BuildConnect website, mobile applications, and related technology. "User" means any person or entity that accesses or uses the Platform. "Client" means a user who posts or commissions construction or property development work. "Builder" or "Contractor" means a user offering construction, engineering, architecture, or related services. "Project" means a construction or development engagement between a Client and a Contractor. "Milestone Payment" means staged payments tied to specific deliverables or project phases. "Escrow Service" means the secure holding of project funds by BuildConnect or its designated financial partner until milestone conditions are satisfied.`,
  },
  {
    title: "2. Platform Purpose",
    body: `BuildConnect provides a technology platform that facilitates connections between Clients and Contractors for construction-related services. BuildConnect does not perform construction work and does not act as the contractor, architect, engineer, or project manager for any project unless explicitly stated in a separate agreement. BuildConnect's role is limited to providing a digital marketplace, facilitating communication between parties, enabling milestone-based payments, and providing optional verification and project monitoring tools. All construction contracts are entered into directly between Clients and Contractors.`,
  },
  {
    title: "3. User Eligibility",
    body: `To use the Platform, you must be at least 18 years old, have the legal capacity to enter binding contracts, provide accurate registration information, and comply with applicable laws and regulations. Businesses registering must have authority to bind their organization. BuildConnect reserves the right to suspend or terminate accounts that provide false or misleading information.`,
  },
  {
    title: "4. Account Registration",
    body: `Users must create an account to access certain Platform features. Users agree to maintain accurate profile information, keep login credentials confidential, and be responsible for activities conducted through their account. BuildConnect is not responsible for unauthorized access caused by failure to secure login credentials.`,
  },
  {
    title: "5. Contractor Verification",
    body: `BuildConnect may conduct verification processes including identity verification, business registration checks, license verification, portfolio review, and background checks where legally permitted. Verification does not constitute a guarantee of performance or quality. Clients remain responsible for conducting their own due diligence.`,
  },
  {
    title: "6. Project Agreements",
    body: `When a Client engages a Contractor through the Platform, a Project Agreement is formed directly between the Client and Contractor. The parties define scope, cost, schedule, and milestones. BuildConnect is not a party to the construction contract. BuildConnect may provide standard contract templates for convenience.`,
  },
  {
    title: "7. Escrow and Milestone Payments",
    body: `BuildConnect may offer secure milestone-based payment services. The Client deposits project funds into escrow. The Contractor completes the agreed milestone. The Client approves the milestone and funds are released to the Contractor. If a milestone is disputed, funds may remain in escrow until resolution and mediation services may be offered by BuildConnect. BuildConnect may charge transaction or escrow service fees.`,
  },
  {
    title: "8. Platform Fees",
    body: `BuildConnect may charge fees including contractor service fees, client service fees, escrow transaction fees, premium listing fees, and project management support fees. All applicable fees will be disclosed prior to transactions. Fees are non-refundable except where required by law.`,
  },
  {
    title: "9. User Responsibilities",
    body: `Users agree to provide accurate project descriptions, communicate respectfully, comply with local construction regulations, maintain required licenses and permits, and follow safety and professional standards. Contractors are solely responsible for project execution, workforce management, regulatory compliance, insurance coverage, and site safety.`,
  },
  {
    title: "10. Prohibited Activities",
    body: `Users may not misrepresent identity or credentials, post fraudulent projects, bypass the Platform to avoid fees, engage in harassment or abusive conduct, upload malicious software, or violate applicable laws or regulations. BuildConnect reserves the right to remove content or suspend accounts involved in prohibited activities.`,
  },
  {
    title: "11. Project Monitoring and Quality Control",
    body: `BuildConnect may provide optional tools including project progress dashboards, photo/video updates, inspection reports, and remote monitoring tools. These tools are informational only and do not replace professional supervision or engineering oversight.`,
  },
  {
    title: "12. Dispute Resolution",
    body: `In the event of disputes between Clients and Contractors, parties should attempt direct resolution first. BuildConnect may offer non-binding mediation. If unresolved, disputes may proceed to arbitration or courts of competent jurisdiction. BuildConnect is not liable for disputes arising from project performance.`,
  },
  {
    title: "13. Intellectual Property",
    body: `All Platform content including logos, software, design, text, and platform architecture is owned by BuildConnect or its licensors. Users may not copy, reproduce, or distribute Platform content without permission.`,
  },
  {
    title: "14. Limitation of Liability",
    body: `To the maximum extent permitted by law, BuildConnect shall not be liable for construction defects, project delays, contractor misconduct, financial losses from project disputes, property damage, or personal injury arising from project activities. BuildConnect's total liability shall not exceed the amount of fees paid to BuildConnect for the relevant transaction.`,
  },
  {
    title: "15. Indemnification",
    body: `Users agree to indemnify and hold harmless BuildConnect from claims arising from project disputes, regulatory violations, construction defects, or misuse of the Platform.`,
  },
  {
    title: "16. Privacy",
    body: `Use of the Platform is subject to the BuildConnect Privacy Policy, which describes how personal information is collected, used, and protected.`,
  },
  {
    title: "17. Termination",
    body: `BuildConnect may suspend or terminate accounts for violation of these Terms, fraudulent conduct, illegal activities, or repeated disputes or complaints. Users may terminate their accounts at any time.`,
  },
  {
    title: "18. Modifications to Terms",
    body: `BuildConnect may update these Terms periodically. Users will be notified of material changes. Continued use of the Platform after updates constitutes acceptance of revised Terms.`,
  },
  {
    title: "19. Governing Law",
    body: `These Terms shall be governed by the laws of Ontario, Canada. Any disputes shall be resolved in courts located within that jurisdiction.`,
  },
  {
    title: "20. Contact Information",
    body: `For questions regarding these Terms, contact BuildConnect at:\nEmail: support@buildconnect.com\nAddress: Milton, Ontario, Canada`,
  },
];

// ─── Privacy Policy Sections ──────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `When you create an account or use the Platform, we may collect your full name, email address, phone number, address or project location, government-issued identification (for verification), company name, professional licenses or certifications, profile photo, and payment details. Contractors may also provide business registration information, tax identification numbers, insurance documentation, and portfolio history.`,
  },
  {
    title: "2. Project and Transaction Information",
    body: `When using BuildConnect for projects, we may collect project descriptions, construction drawings or documents, milestone schedules, contracts or agreements, payment transactions, escrow release approvals, and communications between clients and contractors.`,
  },
  {
    title: "3. Device and Usage Information",
    body: `When you access the Platform, we automatically collect certain technical information including your IP address, device type, browser type, operating system, platform usage activity, log files and timestamps, and referring websites. This information helps us improve security and user experience.`,
  },
  {
    title: "4. Cookies and Tracking Technologies",
    body: `BuildConnect uses cookies and similar technologies to remember user preferences, improve platform performance, analyze usage trends, and enhance security. Users may adjust cookie preferences through their browser or device settings, though disabling certain cookies may affect platform functionality.`,
  },
  {
    title: "5. How We Use Your Information",
    body: `BuildConnect uses collected information to create and manage user accounts, facilitate connections between clients and contractors, enable milestone-based payments, support escrow transactions, confirm identities, verify contractor credentials, prevent fraud, analyze user behavior, develop new features, send account notifications, provide customer support, comply with applicable laws, enforce platform policies, and prevent fraudulent or illegal activities.`,
  },
  {
    title: "6. How We Share Information",
    body: `BuildConnect does not sell personal information to third parties. Information may be shared between project participants to facilitate collaboration including names, contact information, project documentation, and milestone approvals. We may share information with trusted third-party providers who assist with payment processing, escrow services, cloud hosting, identity verification, customer support, and analytics. These providers are required to protect user information and use it only for authorized purposes.`,
  },
  {
    title: "7. Legal Requirements",
    body: `BuildConnect may disclose information when required by law, including court orders, regulatory investigations, and legal compliance obligations.`,
  },
  {
    title: "8. Business Transfers",
    body: `If BuildConnect undergoes a merger, acquisition, or restructuring, user information may be transferred as part of the business assets. Users will be notified if such a transfer materially affects their privacy rights.`,
  },
  {
    title: "9. Data Security",
    body: `BuildConnect implements appropriate safeguards to protect user information, including encryption of sensitive data, secure servers and hosting infrastructure, access controls, and monitoring for suspicious activity. Despite these measures, no internet transmission or electronic storage method is completely secure.`,
  },
  {
    title: "10. Data Retention",
    body: `We retain personal information only for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. Project records and financial transactions may be retained for regulatory and auditing purposes.`,
  },
  {
    title: "11. User Rights",
    body: `Depending on your jurisdiction, you may have the right to access personal information we hold about you, request correction of inaccurate information, request deletion of your data subject to legal retention requirements, receive a copy of your data in a structured format, and withdraw consent to certain data processing activities. To exercise these rights, contact us at the email listed below.`,
  },
  {
    title: "12. International Data Transfers",
    body: `Because BuildConnect may serve users globally, including diaspora clients and contractors, information may be transferred to servers located in different countries. We take appropriate measures to ensure data protection consistent with applicable privacy laws.`,
  },
  {
    title: "13. Children's Privacy",
    body: `The BuildConnect Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we learn that information from a minor has been collected, it will be deleted promptly.`,
  },
  {
    title: "14. Third-Party Links",
    body: `The Platform may contain links to third-party websites or services. BuildConnect is not responsible for the privacy practices of external sites. Users should review the privacy policies of any third-party services they access.`,
  },
  {
    title: "15. Changes to This Policy",
    body: `BuildConnect may update this Privacy Policy periodically. When updates occur, the Effective Date will be revised and significant changes will be communicated to users. Continued use of the Platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "16. Contact Us",
    body: `If you have questions or concerns regarding this Privacy Policy, contact:\nEmail: support@buildconnect.com\nAddress: Milton, Ontario, Canada`,
  },
];

// ─── Reusable Legal Modal (same as GetStarted) ────────────────────────────────
const LegalModal = ({
  visible,
  onClose,
  title,
  effectiveDate,
  sections,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  effectiveDate: string;
  sections: { title: string; body: string }[];
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/60">
      <SafeAreaView className="bg-white rounded-t-3xl max-h-[85%]">

        {/* Drag Handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-gray-300" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
          <Text className="text-lg font-worksansBold text-gray-900">{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-gray-600 text-base font-semibold">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView className="px-5 mt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-xs text-gray-400 mb-5">Effective Date: {effectiveDate}</Text>

          {sections.map((section, index) => (
            <View key={index} className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                {section.title}
              </Text>
              <Text className="text-sm text-gray-600 leading-6">
                {section.body}
              </Text>
            </View>
          ))}

          {/* Footer */}
          <View className="mt-2 mb-10 p-4 bg-gray-50 rounded-2xl">
            <Text className="text-xs text-gray-500 text-center leading-5">
              Questions? Contact us at{" "}
              <Text className="text-gray-800 font-semibold">support@buildconnect.com</Text>
            </Text>
          </View>
        </ScrollView>

      </SafeAreaView>
    </View>
  </Modal>
);

// ─── TermsAgreement Component ─────────────────────────────────────────────────
type TermsAgreementProps = {
  isChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  checkedColor?: string;
  uncheckedColor?: string;
  className?: string;
  textClassName?: string;
  linkClassName?: string;
};

const TermsAgreement: React.FC<TermsAgreementProps> = ({
  isChecked = false,
  onCheckedChange,
  checkedColor = "#ff6b6b",
  uncheckedColor = "#d1d5db",
  className = "",
  textClassName = "",
  linkClassName = "",
}) => {
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  return (
    <>
      <View className={`flex-row items-start p-2 ${className}`}>
        <Checkbox
          value={isChecked}
          onValueChange={onCheckedChange}
          color={isChecked ? checkedColor : uncheckedColor}
        />

        <Text
          className={`flex-1 ml-3 font-inter text-sm text-gray-700 leading-5 ${textClassName}`}
        >
          By creating an account, you agree to our{" "}
          <Text
            className={`text-blue-600 ${linkClassName}`}
            onPress={() => setTermsVisible(true)}
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            className={`text-blue-600 ${linkClassName}`}
            onPress={() => setPrivacyVisible(true)}
          >
            Privacy Policy of BuildConnect
          </Text>
        </Text>
      </View>

      {/* Terms of Service Modal */}
      <LegalModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        title="Terms of Service"
        effectiveDate="May 1, 2026"
        sections={TERMS_SECTIONS}
      />

      {/* Privacy Policy Modal */}
      <LegalModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
        title="Privacy Policy"
        effectiveDate="May 1, 2026"
        sections={PRIVACY_SECTIONS}
      />
    </>
  );
};

export default TermsAgreement;