import "server-only";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Waiver } from "@boxing-gym/domain";
import { DESIGN_TOKENS, WAIVER_TITLE, WAIVER_SECTIONS } from "@boxing-gym/config";

const styles = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 48, fontSize: 10, color: "#1f2937" },
  siteName: { fontSize: 20, fontWeight: 700, textAlign: "center" },
  tagline: {
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    color: "#4b5563",
  },
  address: { fontSize: 8, textAlign: "center", marginTop: 2, color: "#6b7280" },
  divider: { borderBottomWidth: 2, borderBottomColor: "#D4AF37", marginVertical: 12 },
  title: { fontSize: 14, fontWeight: 700, textAlign: "center", marginBottom: 12 },
  sectionHeading: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottomWidth: 1.5,
    borderBottomColor: "#D4AF37",
    paddingBottom: 3,
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: { marginBottom: 4, lineHeight: 1.4 },
  fieldsDivider: { borderBottomWidth: 1, borderBottomColor: "#d1d5db", marginVertical: 12 },
  fieldRow: { flexDirection: "row", marginBottom: 3 },
  fieldLabel: { width: 130, fontWeight: 700 },
  fieldValue: { flex: 1 },
  signatureLabel: { fontSize: 9, color: "#4b5563", textAlign: "center", marginBottom: 6 },
  signatureImage: { width: 220, height: 90, objectFit: "contain", alignSelf: "center" },
  auditNote: { fontSize: 7, color: "#9ca3af", textAlign: "center", marginTop: 6 },
});

interface WaiverPdfProps {
  waiver: Waiver;
  dateOfBirthLabel: string;
  signedAtLabel: string;
  signatureDataUrl: string;
}

function WaiverPdfDocument({
  waiver,
  dateOfBirthLabel,
  signedAtLabel,
  signatureDataUrl,
}: WaiverPdfProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.siteName}>{DESIGN_TOKENS.siteName}</Text>
        <Text style={styles.tagline}>{DESIGN_TOKENS.tagline}</Text>
        <Text style={styles.address}>{DESIGN_TOKENS.address}</Text>
        <View style={styles.divider} />
        <Text style={styles.title}>{WAIVER_TITLE}</Text>

        {WAIVER_SECTIONS.map((section, index) => (
          <View key={section.heading} wrap={false}>
            <Text style={styles.sectionHeading}>
              Section {index + 1} — {section.heading}
            </Text>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <Text key={paragraphIndex} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.fieldsDivider} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Participant</Text>
          <Text style={styles.fieldValue}>{waiver.participantName}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date of birth</Text>
          <Text style={styles.fieldValue}>{dateOfBirthLabel}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{waiver.participantEmail}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>{waiver.participantPhone}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Address</Text>
          <Text style={styles.fieldValue}>{waiver.address}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Emergency contact</Text>
          <Text style={styles.fieldValue}>
            {waiver.emergencyContactName} ({waiver.emergencyContactRelationship}) —{" "}
            {waiver.emergencyContactPhone}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Medical disclosure</Text>
          <Text style={styles.fieldValue}>{waiver.medicalConditions}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Photo/media consent</Text>
          <Text style={styles.fieldValue}>{waiver.photoConsent ? "Granted" : "Declined"}</Text>
        </View>
        {waiver.isMinor && waiver.guardianName && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Parent/guardian</Text>
            <Text style={styles.fieldValue}>{waiver.guardianName}</Text>
          </View>
        )}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Signed</Text>
          <Text style={styles.fieldValue}>{signedAtLabel}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Waiver version</Text>
          <Text style={styles.fieldValue}>{waiver.waiverVersion}</Text>
        </View>

        <Text style={[styles.signatureLabel, { marginTop: 16 }]}>
          {waiver.isMinor ? "Parent/guardian signature" : "Signature"}
        </Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF primitive, not an HTML img; it has no alt prop */}
        <Image src={signatureDataUrl} style={styles.signatureImage} />
        <Text style={styles.auditNote}>
          Digitally signed by {waiver.isMinor ? waiver.guardianName : waiver.participantName} on{" "}
          {signedAtLabel}
          {waiver.ipAddress ? ` from IP ${waiver.ipAddress}` : ""}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderWaiverPdf(props: WaiverPdfProps): Promise<Buffer> {
  return renderToBuffer(<WaiverPdfDocument {...props} />);
}
