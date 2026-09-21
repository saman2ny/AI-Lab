import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="screen screen-wide-pad" style={{ background: "#07131f" }}>
      <div className="screen-medium" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <div className="brand-lockup">
            <div className="brand-mark" style={{ borderRadius: "10px" }} />
            <div className="brand-name">AI Lab</div>
          </div>
          <Link to="/" className="btn btn-tertiary" style={{ width: "auto", minWidth: 110, minHeight: 38 }}>
            Back home
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <p className="eyebrow">Terms of use</p>
            <h1 className="h-screen" style={{ marginTop: 10 }}>Terms of Service</h1>
          </div>

          <p className="body-text">
            These Terms of Service govern your use of AI Lab and its related features. By creating an account or using the
            service, you agree to these terms.
          </p>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>1. Service overview</h2>
            <p className="body-text">
              AI Lab helps users upload and review lab reports, understand key values, and receive explanatory guidance.
              The app provides educational information, not a medical diagnosis, treatment plan, or emergency advice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>2. Eligibility and accounts</h2>
            <p className="body-text">
              You must be at least 18 years old or have the necessary legal authority to use the service. You are
              responsible for maintaining the confidentiality of your account and password, and for all activity that occurs
              under your account.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>3. User responsibilities</h2>
            <p className="body-text">
              You agree not to upload misleading, unlawful, abusive, or harmful content. You will not attempt to reverse
              engineer, interfere with, overload, or misuse the service.
            </p>
            <p className="body-text">
              You are responsible for the accuracy of any information you provide and for any decisions you make based on
              information received from the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>4. Medical information notice</h2>
            <p className="body-text">
              AI Lab is not a medical provider, not a substitute for professional medical advice, and not a substitute for
              in-person care. Interpretations, recommendations, and educational explanations are informational only and do
              not replace consultation with a licensed clinician or healthcare professional.
            </p>
            <p className="body-text">
              If you are experiencing a medical emergency, seek immediate medical attention. If you have questions about
              your health, consult a qualified clinician.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>5. Service availability</h2>
            <p className="body-text">
              We aim to keep the service available and secure, but we do not guarantee uninterrupted or error-free access.
              Service availability may be affected by maintenance, network conditions, provider outages, or changes in
              third-party integrations.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>6. Intellectual property</h2>
            <p className="body-text">
              The service, trademarks, design, branding, content, and software used to operate AI Lab remain the property
              of the service owner or its licensors. You may use the app only as permitted by these Terms and the
              applicable account permissions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>7. Account termination</h2>
            <p className="body-text">
              We may suspend or terminate access to the service if we reasonably believe you violated these Terms, used the
              service in a harmful way, or created a security or legal risk. You may stop using the service at any time.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>8. Limitation of liability</h2>
            <p className="body-text">
              To the maximum extent permitted by law, AI Lab is provided “as is” without warranties of any kind, whether
              express or implied. We are not liable for indirect, incidental, or consequential damages arising from your use
              of the service or reliance on information provided through it.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>9. Changes to the terms</h2>
            <p className="body-text">
              We may update these Terms from time to time. Continued use of the service after changes are posted means you
              accept the updated terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>10. Governing law</h2>
            <p className="body-text">
              These Terms are governed by the laws of the jurisdiction where the service provider operates, without regard
              to conflict of law principles. If any part of these Terms is unenforceable, the remaining parts remain in full
              force and effect.
            </p>
          </section>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <Link to="/privacy" className="btn btn-tertiary" style={{ width: "auto", minWidth: 180, minHeight: 42 }}>
              Read privacy policy
            </Link>
            <Link to="/" className="btn btn-primary" style={{ width: "auto", minWidth: 140, minHeight: 42 }}>
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
