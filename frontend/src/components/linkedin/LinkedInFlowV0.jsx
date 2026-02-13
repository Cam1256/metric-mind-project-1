import { useState, useEffect } from "react";
import LinkedInConsentMock from "./LinkedInConsentMock";
import LinkedInPostComposer from "./LinkedInPostComposer";
import LinkedInPublishSuccess from "./LinkedInPublishSuccess";
import LinkedInPostViewMock from "./LinkedInPostViewMock";
import LinkedInPostActivity from "./LinkedInPostActivity";
import LinkedInPageAnalytics from "./LinkedInPageAnalytics";

const LinkedInFlowV0 = ({ entity }) => {
  const [step, setStep] = useState("consent");

  // 🔁 Reset flow when analyzed entity changes
  useEffect(() => {
    setStep("consent");
  }, [entity]);

  return (
    <>
      {step === "consent" && (
        <LinkedInConsentMock onApprove={() => setStep("compose")} />
      )}

      {step === "compose" && (
        <LinkedInPostComposer onPublish={() => setStep("published")} />
      )}

      {step === "published" && (
        <>
          <LinkedInPublishSuccess />
          <LinkedInPostViewMock />
          <LinkedInPostActivity />
          <LinkedInPageAnalytics />
        </>
      )}
    </>
  );
};

export default LinkedInFlowV0;
