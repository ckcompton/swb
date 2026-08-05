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

interface WaiverSignedConfirmationEmailProps {
  siteName: string;
  waiverTitle: string;
  waiverParagraphs: string[];
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  isMinor: boolean;
  guardianName: string | null;
  signedAtLabel: string;
  waiverVersion: string;
  signatureDataUrl: string;
}

export default function WaiverSignedConfirmationEmail({
  siteName,
  waiverTitle,
  waiverParagraphs,
  participantName,
  participantEmail,
  participantPhone,
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

            <Heading as="h2" className="text-xl text-gray-800">
              {waiverTitle}
            </Heading>
            {waiverParagraphs.map((paragraph, index) => (
              <Text key={index} className="text-sm text-gray-600">
                {paragraph}
              </Text>
            ))}

            <Hr className="my-6 border border-solid border-gray-300" />

            <Text className="text-sm text-gray-800">
              <strong>Participant:</strong> {participantName}
              <br />
              <strong>Email:</strong> {participantEmail}
              {participantPhone && (
                <>
                  <br />
                  <strong>Phone:</strong> {participantPhone}
                </>
              )}
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

            <Text className="mb-2 text-sm text-gray-600">
              {isMinor ? "Parent/guardian signature" : "Signature"}
            </Text>
            <Img
              src={signatureDataUrl}
              alt={`${isMinor ? "Guardian" : "Participant"} signature`}
              width={300}
              className="rounded border border-solid border-gray-300 bg-white"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

WaiverSignedConfirmationEmail.PreviewProps = {
  siteName: "Shadow Work Boxing",
  waiverTitle: "Liability Waiver and Release of Claims",
  waiverParagraphs: [
    "In consideration of being permitted to participate in boxing classes...",
    "I understand that participation in the Program involves inherent risks of injury...",
  ],
  participantName: "Jordan Lee",
  participantEmail: "jordan@example.com",
  participantPhone: "555-123-4567",
  isMinor: false,
  guardianName: null,
  signedAtLabel: "August 5, 2026",
  waiverVersion: "v1",
  signatureDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
} satisfies WaiverSignedConfirmationEmailProps;

export { WaiverSignedConfirmationEmail };
