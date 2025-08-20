export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="prose prose-gray max-w-none">
        <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

        <p className="text-muted-foreground mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            1. Acceptance of Terms
          </h2>
          <p className="mb-4">
            Welcome to Bota Review. These Terms of Service ("Terms") govern your
            use of our website, mobile applications, and services (collectively,
            the "Service"). By accessing or using our Service, you agree to be
            bound by these Terms and all applicable laws and regulations.
          </p>
          <p className="mb-4">
            If you do not agree with any of these terms, you are prohibited from
            using or accessing this Service. The materials contained in this
            Service are protected by applicable copyright and trademark law.
          </p>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify users of any material changes by posting the new Terms on
            this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            2. Description of Service
          </h2>
          <p className="mb-4">
            Bota Review is a platform that allows users to discover, review, and
            share information about restaurants, businesses, and other places.
            Our Service includes:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>Place listings and information</li>
            <li>User-generated reviews and ratings</li>
            <li>Photo sharing and management</li>
            <li>Search and discovery features</li>
            <li>User profiles and preferences</li>
            <li>Communication tools between users and businesses</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            3. User Accounts and Registration
          </h2>

          <h3 className="mb-3 text-xl font-medium">3.1 Account Creation</h3>
          <p className="mb-4">
            To access certain features of our Service, you must create an
            account. You agree to provide accurate, current, and complete
            information during registration and to update such information to
            keep it accurate, current, and complete.
          </p>

          <h3 className="mb-3 text-xl font-medium">3.2 Account Security</h3>
          <p className="mb-4">
            You are responsible for safeguarding your account credentials and
            for all activities that occur under your account. You agree to
            notify us immediately of any unauthorized use of your account or any
            other breach of security.
          </p>

          <h3 className="mb-3 text-xl font-medium">3.3 Account Termination</h3>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account at any
            time for violations of these Terms or for any other reason at our
            sole discretion. You may also terminate your account at any time by
            contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            4. User Conduct and Content
          </h2>

          <h3 className="mb-3 text-xl font-medium">4.1 Acceptable Use</h3>
          <p className="mb-4">
            You agree to use our Service only for lawful purposes and in
            accordance with these Terms. You agree not to:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>
              Upload or transmit harmful, offensive, or inappropriate content
            </li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated systems to access the Service</li>
            <li>Impersonate another person or entity</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">
            4.2 User-Generated Content
          </h3>
          <p className="mb-4">
            You retain ownership of content you submit to our Service, but you
            grant us a worldwide, non-exclusive, royalty-free license to use,
            reproduce, modify, and distribute your content in connection with
            our Service.
          </p>
          <p className="mb-4">You represent and warrant that:</p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              You own or have the necessary rights to the content you submit
            </li>
            <li>Your content does not violate any third-party rights</li>
            <li>Your content is accurate and truthful</li>
            <li>Your content complies with our community guidelines</li>
          </ul>

          <h3 className="mb-3 text-xl font-medium">4.3 Content Moderation</h3>
          <p className="mb-4">
            We reserve the right to review, edit, or remove any content that
            violates these Terms or our community guidelines. We may also
            suspend or terminate accounts of users who repeatedly violate these
            policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            5. Intellectual Property Rights
          </h2>

          <h3 className="mb-3 text-xl font-medium">5.1 Our Rights</h3>
          <p className="mb-4">
            The Service and its original content, features, and functionality
            are owned by Bota Review and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property laws.
          </p>

          <h3 className="mb-3 text-xl font-medium">5.2 Your Rights</h3>
          <p className="mb-4">
            You retain ownership of content you create and submit to our
            Service. However, by submitting content, you grant us a license to
            use, display, and distribute your content as described in these
            Terms.
          </p>

          <h3 className="mb-3 text-xl font-medium">5.3 Third-Party Content</h3>
          <p className="mb-4">
            Our Service may contain content from third parties. We do not
            endorse or assume responsibility for any third-party content, and we
            are not liable for any damages arising from such content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            6. Privacy and Data Protection
          </h2>
          <p className="mb-4">
            Your privacy is important to us. Our collection and use of personal
            information is governed by our Privacy Policy, which is incorporated
            into these Terms by reference. By using our Service, you consent to
            our collection and use of information as described in our Privacy
            Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            7. Disclaimers and Limitations of Liability
          </h2>

          <h3 className="mb-3 text-xl font-medium">7.1 Service Availability</h3>
          <p className="mb-4">
            We strive to provide a reliable and secure Service, but we cannot
            guarantee that the Service will be uninterrupted, secure, or
            error-free. We may modify, suspend, or discontinue the Service at
            any time without notice.
          </p>

          <h3 className="mb-3 text-xl font-medium">7.2 Content Accuracy</h3>
          <p className="mb-4">
            While we strive to provide accurate and up-to-date information, we
            cannot guarantee the accuracy, completeness, or reliability of any
            content on our Service. User-generated content represents the
            opinions of individual users and not necessarily our views.
          </p>

          <h3 className="mb-3 text-xl font-medium">
            7.3 Limitation of Liability
          </h3>
          <p className="mb-4">
            To the maximum extent permitted by law, Bota Review shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, including but not limited to loss of profits,
            data, or use, arising out of or relating to your use of the Service.
          </p>

          <h3 className="mb-3 text-xl font-medium">7.4 Indemnification</h3>
          <p className="mb-4">
            You agree to indemnify and hold harmless Bota Review and its
            officers, directors, employees, and agents from any claims, damages,
            or expenses arising out of your use of the Service or violation of
            these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            8. Third-Party Services and Links
          </h2>
          <p className="mb-4">
            Our Service may contain links to third-party websites or services.
            We are not responsible for the content, privacy policies, or
            practices of any third-party websites or services. You access such
            third-party content at your own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">9. Payment Terms</h2>

          <h3 className="mb-3 text-xl font-medium">9.1 Fees and Billing</h3>
          <p className="mb-4">
            Some features of our Service may require payment. All fees are
            non-refundable unless otherwise stated. We reserve the right to
            change our pricing at any time with reasonable notice.
          </p>

          <h3 className="mb-3 text-xl font-medium">9.2 Payment Processing</h3>
          <p className="mb-4">
            Payments are processed by third-party payment processors. You agree
            to comply with their terms of service and privacy policies. We are
            not responsible for any issues arising from payment processing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">10. Termination</h2>

          <h3 className="mb-3 text-xl font-medium">10.1 Termination by You</h3>
          <p className="mb-4">
            You may terminate your account and stop using our Service at any
            time by contacting us or deleting your account through the Service.
          </p>

          <h3 className="mb-3 text-xl font-medium">10.2 Termination by Us</h3>
          <p className="mb-4">
            We may terminate or suspend your access to the Service immediately,
            without prior notice, for any reason, including breach of these
            Terms.
          </p>

          <h3 className="mb-3 text-xl font-medium">
            10.3 Effect of Termination
          </h3>
          <p className="mb-4">
            Upon termination, your right to use the Service will cease
            immediately. We may delete your account and any associated data,
            though some information may be retained as required by law or for
            legitimate business purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            11. Governing Law and Dispute Resolution
          </h2>

          <h3 className="mb-3 text-xl font-medium">11.1 Governing Law</h3>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with
            the laws of [Your Jurisdiction], without regard to its conflict of
            law provisions.
          </p>

          <h3 className="mb-3 text-xl font-medium">11.2 Dispute Resolution</h3>
          <p className="mb-4">
            Any disputes arising out of or relating to these Terms or the
            Service shall be resolved through binding arbitration in accordance
            with the rules of [Arbitration Organization]. The arbitration shall
            be conducted in [City, State/Country].
          </p>

          <h3 className="mb-3 text-xl font-medium">11.3 Class Action Waiver</h3>
          <p className="mb-4">
            You agree that any arbitration or legal action shall be conducted on
            an individual basis and not as a class action or consolidated
            action.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">12. Miscellaneous</h2>

          <h3 className="mb-3 text-xl font-medium">12.1 Severability</h3>
          <p className="mb-4">
            If any provision of these Terms is found to be unenforceable or
            invalid, that provision will be limited or eliminated to the minimum
            extent necessary so that these Terms will otherwise remain in full
            force and effect.
          </p>

          <h3 className="mb-3 text-xl font-medium">12.2 Entire Agreement</h3>
          <p className="mb-4">
            These Terms constitute the entire agreement between you and Bota
            Review regarding the use of the Service and supersede all prior
            agreements and understandings.
          </p>

          <h3 className="mb-3 text-xl font-medium">12.3 Waiver</h3>
          <p className="mb-4">
            The failure of Bota Review to enforce any right or provision of
            these Terms will not be deemed a waiver of such right or provision.
          </p>

          <h3 className="mb-3 text-xl font-medium">12.4 Assignment</h3>
          <p className="mb-4">
            You may not assign or transfer these Terms or your account without
            our written consent. We may assign these Terms without restriction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            13. Contact Information
          </h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please
            contact us:
          </p>
          <div className="bg-muted rounded-lg p-4">
            <p className="mb-2">
              <strong>Email:</strong> legal@botareview.com
            </p>
            <p className="mb-2">
              <strong>Address:</strong> [Your Business Address]
            </p>
            <p className="mb-2">
              <strong>Phone:</strong> [Your Phone Number]
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">14. Business Users</h2>
          <p className="mb-4">
            If you are a business owner or representative using our Service to
            manage your business listing, additional terms may apply. Please
            contact us for business-specific terms and conditions.
          </p>
        </section>

        <div className="mt-8 border-t pt-6">
          <p className="text-muted-foreground text-sm">
            These Terms of Service are effective as of the date listed above and
            apply to all users of our Service.
          </p>
        </div>
      </div>
    </div>
  );
}
