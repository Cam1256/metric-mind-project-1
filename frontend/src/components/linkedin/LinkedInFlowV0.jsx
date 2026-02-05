import { useState } from "react";
import LinkedInConsentMock from "./LinkedInConsentMock";
import LinkedInPostComposer from "./LinkedInPostComposer";
import LinkedInPublishSuccess from "./LinkedInPublishSuccess";
import LinkedInPostViewMock from "./LinkedInPostViewMock";
import LinkedInPostActivity from "./LinkedInPostActivity";
import LinkedInPageAnalytics from "./LinkedInPageAnalytics";

const LinkedInFlowV0 = () => {
  const [step, setStep] = useState("consent");

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
