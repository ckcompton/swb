import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Img,
  Tailwind,
  pixelBasedPreset,
} from "react-email";

interface WaiverSection {
  heading: string;
  paragraphs: string[];
}

interface WaiverSignedConfirmationEmailProps {
  siteName: string;
  tagline: string;
  gymAddress: string;
  logoUrl: string;
  waiverTitle: string;
  waiverSections: WaiverSection[];
  participantName: string;
  dateOfBirthLabel: string;
  participantEmail: string;
  participantPhone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  photoConsent: boolean;
  isMinor: boolean;
  guardianName: string | null;
  signedAtLabel: string;
  waiverVersion: string;
  signatureDataUrl: string;
}

export default function WaiverSignedConfirmationEmail({
  siteName,
  tagline,
  gymAddress,
  logoUrl,
  waiverTitle,
  waiverSections,
  participantName,
  dateOfBirthLabel,
  participantEmail,
  participantPhone,
  address,
  emergencyContactName,
  emergencyContactRelationship,
  emergencyContactPhone,
  medicalConditions,
  photoConsent,
  isMinor,
  guardianName,
  signedAtLabel,
  waiverVersion,
  signatureDataUrl,
}: WaiverSignedConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Preview>Your {siteName} liability waiver is on file</Preview>
          <Container className="mx-auto max-w-xl p-5">
            <Heading className="text-2xl text-gray-800">Waiver confirmed</Heading>
            <Text className="text-base text-gray-800">Hi {participantName},</Text>
            <Text className="text-base text-gray-800">
              Thanks for signing the liability waiver for {siteName}. This email is your copy --
              keep it for your records, no account or login needed. We have it on file as of{" "}
              {signedAtLabel}.
            </Text>

            <Hr className="my-6 border border-solid border-gray-300" />

            <Container className="rounded bg-gray-900 px-5 py-6 text-center">
              <Img src={logoUrl} alt={siteName} width={220} className="mx-auto block" />
              <Text className="mb-0 mt-2 text-center text-sm italic text-gray-300">{tagline}</Text>
              <Text className="mt-1 text-center text-xs text-gray-400">{gymAddress}</Text>
            </Container>

            <Heading as="h2" className="text-center text-xl text-gray-800">
              {waiverTitle}
            </Heading>
            {waiverSections.map((section, index) => (
              <div key={section.heading}>
                <Text className="mb-1 border-b-2 border-solid border-yellow-600 pb-1 text-xs font-bold uppercase tracking-wide text-gray-800">
                  Section {index + 1} — {section.heading}
                </Text>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <Text key={paragraphIndex} className="text-sm text-gray-600">
                    {paragraph}
                  </Text>
                ))}
              </div>
            ))}

            <Hr className="my-6 border border-solid border-gray-300" />

            <Text className="text-sm text-gray-800">
              <strong>Participant:</strong> {participantName}
              <br />
              <strong>Date of birth:</strong> {dateOfBirthLabel}
              <br />
              <strong>Email:</strong> {participantEmail}
              <br />
              <strong>Phone:</strong> {participantPhone}
              <br />
              <strong>Address:</strong> {address}
              <br />
              <strong>Emergency contact:</strong> {emergencyContactName} (
              {emergencyContactRelationship}) — {emergencyContactPhone}
              <br />
              <strong>Medical disclosure:</strong> {medicalConditions}
              <br />
              <strong>Photo/media consent:</strong> {photoConsent ? "Granted" : "Declined"}
              {isMinor && guardianName && (
                <>
                  <br />
                  <strong>Parent/guardian:</strong> {guardianName}
                </>
              )}
              <br />
              <strong>Signed:</strong> {signedAtLabel}
              <br />
              <strong>Waiver version:</strong> {waiverVersion}
            </Text>

            <Text className="mb-2 text-center text-sm text-gray-600">
              {isMinor ? "Parent/guardian signature" : "Signature"}
            </Text>
            <Img
              src={signatureDataUrl}
              alt={`${isMinor ? "Guardian" : "Participant"} signature`}
              width={300}
              className="mx-auto block rounded border border-solid border-gray-300 bg-white"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

WaiverSignedConfirmationEmail.PreviewProps = {
  siteName: "Shadow Work Boxing",
  tagline: "What's Done in the Shadows Must Come to Light",
  gymAddress: "7701 Colton-Bluff Springs Rd, Austin, TX 78744 · The Treehouse Park",
  logoUrl: "https://example.com/logo-v2.png",
  waiverTitle: "Liability Waiver and Release of Claims",
  waiverSections: [
    {
      heading: "Acknowledgment of Risk",
      paragraphs: [
        "In consideration of being permitted to participate in boxing classes...",
        "I understand that participation in the Program involves inherent risks of injury...",
      ],
    },
  ],
  participantName: "Jordan Lee",
  dateOfBirthLabel: "January 1, 1995",
  participantEmail: "jordan@example.com",
  participantPhone: "555-123-4567",
  address: "123 Main St, Austin, TX 78744",
  emergencyContactName: "Alex Lee",
  emergencyContactRelationship: "Spouse",
  emergencyContactPhone: "555-987-6543",
  medicalConditions: "None",
  photoConsent: true,
  isMinor: false,
  guardianName: null,
  signedAtLabel: "August 5, 2026",
  waiverVersion: "v1",
  signatureDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
} satisfies WaiverSignedConfirmationEmailProps;

export { WaiverSignedConfirmationEmail };
