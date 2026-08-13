// Bump WAIVER_VERSION (limits.ts) whenever this text changes materially --
// existing signed waivers are not invalidated automatically. This is
// placeholder legal copy; have an attorney review before relying on it.
export const WAIVER_TITLE = "Liability Release, Waiver, and Assumption of Risk";

export interface WaiverSection {
  heading: string;
  paragraphs: string[];
}

export const WAIVER_SECTIONS: WaiverSection[] = [
  {
    heading: "Acknowledgment of Risk",
    paragraphs: [
      `I understand that boxing, strength training, and related physical conditioning activities ("Activities") at Shadow Work Boxing LLC involve inherent risks, including but not limited to: physical contact, strikes, falls, muscle strains, sprains, fractures, concussions, cardiovascular events, and in rare cases, serious injury or death. I understand these risks cannot be eliminated regardless of care taken to avoid injury.`,
    ],
  },
  {
    heading: "Release of Liability",
    paragraphs: [
      `Effective immediately upon execution, I, the participant, for and in consideration of the opportunity to participate in fitness and boxing-related activities provided by Shadow Work Boxing LLC, do hereby release and forever discharge Shadow Work Boxing LLC and all associated persons from any and all claims, demands, actions, causes of action, liabilities, damages, or suits of any kind or nature whatsoever, to both personal and property, and also any and all injuries which I now have or may hereafter have, arising out of or in connection with services provided by Shadow Work Boxing LLC. This includes, but is not limited to: boxing, sparring, personal and group training, use of gym equipment and facilities, youth and adult fitness programs, camps, clinics, classes, and any physical activity on gym premises or off-site events hosted by Shadow Work Boxing LLC.`,
      `I UNDERSTAND THAT THIS RELEASE INCLUDES CLAIMS BASED ON THE NEGLIGENCE OF SHADOW WORK BOXING LLC, ITS OWNERS, COACHES, EMPLOYEES, AND AGENTS, AND NOT JUST CLAIMS FOR WHICH NO ONE IS AT FAULT.`,
      `This release does not apply to injury caused by gross negligence, willful misconduct, or intentional acts.`,
      `I voluntarily assume all risks associated with these activities, whether known or unknown, and fully release Shadow Work Boxing LLC from any liability arising out of my participation, except as excluded above.`,
    ],
  },
  {
    heading: "Voluntary Participation",
    paragraphs: [
      `I confirm I have no known medical condition that would prevent safe participation, or I have disclosed any such condition to gym staff prior to participating. I am solely responsible for my own health and physical condition during and after Activities.`,
    ],
  },
  {
    heading: "Health & Medical Disclosure",
    paragraphs: [
      `I certify that the medical conditions, injuries, allergies, or medications I have disclosed below are a complete and accurate list of what gym staff should be aware of. I agree to notify Shadow Work Boxing LLC promptly of any change to this information.`,
    ],
  },
  {
    heading: "Gym Rules & Code of Conduct",
    paragraphs: [
      `I agree to comply with all gym rules, policies, and instructions from coaches and staff, including: following all safety protocols and instructions at all times; using proper protective equipment during sparring and contact activities; reporting all injuries, accidents, or unsafe conditions immediately to staff; refraining from aggressive or reckless behavior; maintaining respectful conduct toward all members, coaches, and staff; and not training under the influence of alcohol, drugs, or impairing substances.`,
      `Violation of these rules may result in immediate termination of membership without refund.`,
    ],
  },
  {
    heading: "Medical Treatment Consent",
    paragraphs: [
      `I authorize Shadow Work Boxing LLC staff to arrange or administer emergency first aid or medical treatment on my behalf if I am unable to consent at the time, and I agree to be financially responsible for any costs of such treatment.`,
    ],
  },
  {
    heading: "Photo & Media Release",
    paragraphs: [
      `I grant Shadow Work Boxing LLC permission to photograph and/or video record me (or my minor child, if applicable) during Activities, and to use such photos, videos, and recordings in print, digital, and social media materials -- including but not limited to Instagram, the gym website, flyers, and promotional content -- without compensation to me, unless I decline below.`,
      `I understand I may revoke this consent at any time by notifying Shadow Work Boxing LLC in writing, though this will not affect any use of media that occurred prior to revocation.`,
    ],
  },
  {
    heading: "Governing Law & Binding Effect",
    paragraphs: [
      `This Release shall be binding upon the participant and the participant's heirs, executors, administrators, personal representatives, successors, and assigns. This Release is governed by the laws of the State of Texas. This Release may not be altered, modified, or amended except in a signed writing agreed to by both parties.`,
    ],
  },
  {
    heading: "Certification Acknowledgment",
    paragraphs: [
      `By signing below, I (the participant, or the parent/legal guardian on behalf of a minor participant) certify that: I have carefully read and fully understand this release; I am freely, knowingly, and voluntarily entering into this release; and I am at least 18 years of age, or I am the parent or legal guardian consenting on behalf of a participant under 18.`,
    ],
  },
];

// Flattened paragraph list -- kept for callers (emails, admin detail view)
// that render plain paragraphs without section headings.
export const WAIVER_PARAGRAPHS = WAIVER_SECTIONS.flatMap((section) => section.paragraphs);
