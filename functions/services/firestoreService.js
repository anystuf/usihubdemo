// TODO: Add Firestore Admin SDK helpers here.
// Keep approval workflows explicit: AI proposals should not directly mutate approved startup records.

async function createAiProposalPlaceholder(proposal) {
  return {
    id: "placeholder",
    approvalStatus: "pending",
    proposal
  };
}

module.exports = { createAiProposalPlaceholder };
