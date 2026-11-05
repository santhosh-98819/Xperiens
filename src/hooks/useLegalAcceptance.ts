import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TERMS_VERSION, 
  COMMUNITY_GUIDELINES_VERSION, 
  PRIVACY_POLICY_VERSION 
} from '../constants/legal';
import { serverTimestamp } from 'firebase/firestore';

export const useLegalAcceptance = () => {
  const { userProfile, updateUserProfile, loading } = useAuth();

  const legalAcceptance = userProfile?.legalAcceptance;

  const hasAcceptedCurrentTerms = useMemo(() => {
    if (!legalAcceptance) return false;
    return (
      legalAcceptance.termsAccepted &&
      legalAcceptance.communityGuidelinesAccepted &&
      legalAcceptance.privacyPolicyAcknowledged &&
      legalAcceptance.termsVersion === TERMS_VERSION &&
      legalAcceptance.communityGuidelinesVersion === COMMUNITY_GUIDELINES_VERSION &&
      legalAcceptance.privacyPolicyVersion === PRIVACY_POLICY_VERSION
    );
  }, [legalAcceptance]);

  const needsAcceptance = !loading && !!userProfile && !hasAcceptedCurrentTerms;

  const acceptCurrentLegalDocuments = useCallback(async () => {
    if (!userProfile) throw new Error("No user profile found");

    await updateUserProfile({
      legalAcceptance: {
        termsAccepted: true,
        communityGuidelinesAccepted: true,
        privacyPolicyAcknowledged: true,
        termsVersion: TERMS_VERSION,
        communityGuidelinesVersion: COMMUNITY_GUIDELINES_VERSION,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        acceptedAt: new Date().toISOString(),
      }
    });
  }, [userProfile, updateUserProfile]);

  return {
    hasAcceptedCurrentTerms,
    needsAcceptance,
    acceptCurrentLegalDocuments,
    acceptanceLoading: loading,
  };
};
