import { Link } from "react-router-dom";

export function PrivacyPolicy() {
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
            <p className="eyebrow">Privacy policy</p>
            <h1 className="h-screen" style={{ marginTop: 10 }}>Privacy Policy</h1>
          </div>

          <p className="body-text">
            This Privacy Policy explains how AI Lab (“we”, “our”, or “us”) handles information when you use our
            service. We respect your privacy and handle health-related information with extra care.
          </p>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>1. Information we collect</h2>
            <p className="body-text">
              We may collect the information you provide directly, including your email address, password or Google
              sign-in profile, OTP verification details, and any lab report data you upload for analysis.
            </p>
            <p className="body-text">
              We also collect usage information such as timestamps, account activity, authentication events, session
              metadata, and the content needed to provide the AI explanation experience and support features.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>2. How we use your information</h2>
            <p className="body-text">
              We use your data to create and maintain your account, verify your identity, provide the lab-report
              analysis, allow follow-up chat, maintain access sessions, and help prevent misuse or abuse.
            </p>
            <p className="body-text">
              We may use your email address to send verification codes and essential account notifications. We do not
              sell personal data.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>3. Health and uploaded data</h2>
            <p className="body-text">
              Lab results and report details are processed to provide explanations and guidance. The extracted report is
              kept only in the active session memory needed to serve the current analysis and is not treated as a long-term
              archive unless you choose to save it in the app. This service is for informational support and not a medical
              diagnosis.
            </p>
            <p className="body-text">
              We do not use your uploaded health data to train public AI models or sell it to third parties.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>4. Service providers and third parties</h2>
            <p className="body-text">
              We may use third-party services to operate the app, including authentication providers, email delivery, and
              cloud hosting. These providers process data only as needed to provide the service and are bound by their own
              privacy obligations.
            </p>
            <p className="body-text">
              We may also use third-party services for features such as Google sign-in and email verification, or for map
              and location-related recommendations when enabled.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>5. Cookies and session storage</h2>
            <p className="body-text">
              We use secure session cookies and short-lived tokens to keep you signed in and to maintain your in-progress
              analysis session. These are necessary for the app to work correctly.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>6. Data retention</h2>
            <p className="body-text">
              We retain account and security data only as long as necessary for the service, legal compliance, and account
              support. We may delete expired session data and reset in-memory analysis content when sessions end, time out,
              or when you sign out.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>7. Your rights</h2>
            <p className="body-text">
              Depending on your location, you may have rights to access, correct, delete, or restrict processing of your
              personal data. If you want to exercise those rights or close your account, contact us through the support
              channel or email listed in the app and we will respond in a reasonable time.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>8. Security</h2>
            <p className="body-text">
              We use reasonable administrative, technical, and organizational safeguards to protect personal data. No
              system is perfectly secure, and we cannot guarantee the absolute security of information transmitted over the
              Internet.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>9. Changes to this policy</h2>
            <p className="body-text">
              We may update this Privacy Policy from time to time. Material changes will be posted in the app or sent to
              the email address associated with your account when required.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>10. Contact</h2>
            <p className="body-text">
              If you have questions about this Privacy Policy or your data, contact the app administrator through the
              support email listed in the app or the account profile information used for service notifications.
            </p>
          </section>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <Link to="/terms" className="btn btn-tertiary" style={{ width: "auto", minWidth: 180, minHeight: 42 }}>
              Read terms
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
