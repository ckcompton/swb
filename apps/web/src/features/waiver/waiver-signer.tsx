"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { waiverSignInputSchema, type WaiverSignInput } from "@boxing-gym/domain";
import { WAIVER_TITLE, WAIVER_SECTIONS, WAIVER_VERSION } from "@boxing-gym/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignaturePad } from "@/features/waiver/signature-pad";
import { signWaiverAction } from "@/features/waiver/actions";

export function WaiverSigner() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WaiverSignInput>({
    resolver: standardSchemaResolver(waiverSignInputSchema),
    defaultValues: {
      participantName: "",
      dateOfBirth: "",
      participantEmail: "",
      participantPhone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      medicalConditions: "None",
      photoConsent: false,
      isMinor: false,
      guardianName: undefined,
      signatureDataUrl: "",
      agreedToTerms: undefined,
      waiverVersion: WAIVER_VERSION,
    },
  });

  const isMinor = useWatch({ control, name: "isMinor" });

  const onSubmit = (data: WaiverSignInput) => {
    setFormError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("participantName", data.participantName);
      formData.set("dateOfBirth", data.dateOfBirth);
      formData.set("participantEmail", data.participantEmail);
      formData.set("participantPhone", data.participantPhone);
      formData.set("address", data.address);
      formData.set("emergencyContactName", data.emergencyContactName);
      formData.set("emergencyContactRelationship", data.emergencyContactRelationship);
      formData.set("emergencyContactPhone", data.emergencyContactPhone);
      formData.set("medicalConditions", data.medicalConditions ?? "None");
      formData.set("photoConsent", String(data.photoConsent));
      formData.set("isMinor", String(data.isMinor));
      if (data.guardianName) formData.set("guardianName", data.guardianName);
      formData.set("signatureDataUrl", data.signatureDataUrl);
      formData.set("agreedToTerms", String(data.agreedToTerms));
      formData.set("waiverVersion", data.waiverVersion);

      const result = await signWaiverAction(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setFormError(result.error ?? "Something went wrong.");
      }
    });
  };

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl uppercase tracking-tight">
            Waiver signed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Thanks — your waiver has been submitted. Check your email for a confirmation copy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl uppercase tracking-tight">
          {WAIVER_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 space-y-4 overflow-y-auto rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          {WAIVER_SECTIONS.map((section, index) => (
            <div key={section.heading}>
              <p className="mb-1 font-semibold text-foreground">
                Section {index + 1} — {section.heading}
              </p>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="mb-2 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="participantName">Participant full name</Label>
            <Input id="participantName" autoComplete="name" {...register("participantName")} />
            {errors.participantName && (
              <p className="text-sm text-destructive" role="alert">
                {errors.participantName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" type="date" autoComplete="bday" {...register("dateOfBirth")} />
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive" role="alert">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="participantEmail">Email</Label>
            <Input
              id="participantEmail"
              type="email"
              autoComplete="email"
              {...register("participantEmail")}
            />
            {errors.participantEmail && (
              <p className="text-sm text-destructive" role="alert">
                {errors.participantEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="participantPhone">Phone number</Label>
            <Input
              id="participantPhone"
              type="tel"
              autoComplete="tel"
              {...register("participantPhone")}
            />
            {errors.participantPhone && (
              <p className="text-sm text-destructive" role="alert">
                {errors.participantPhone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" autoComplete="street-address" {...register("address")} />
            {errors.address && (
              <p className="text-sm text-destructive" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Emergency contact name</Label>
            <Input
              id="emergencyContactName"
              autoComplete="name"
              {...register("emergencyContactName")}
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-destructive" role="alert">
                {errors.emergencyContactName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
            <Input
              id="emergencyContactRelationship"
              {...register("emergencyContactRelationship")}
            />
            {errors.emergencyContactRelationship && (
              <p className="text-sm text-destructive" role="alert">
                {errors.emergencyContactRelationship.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Emergency contact phone number</Label>
            <Input id="emergencyContactPhone" type="tel" {...register("emergencyContactPhone")} />
            {errors.emergencyContactPhone && (
              <p className="text-sm text-destructive" role="alert">
                {errors.emergencyContactPhone.message}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="medicalConditions">
              Medical conditions, injuries, allergies, or medications
            </Label>
            <Textarea
              id="medicalConditions"
              placeholder='Write "None" if not applicable'
              {...register("medicalConditions")}
            />
            {errors.medicalConditions && (
              <p className="text-sm text-destructive" role="alert">
                {errors.medicalConditions.message}
              </p>
            )}
          </div>

          <Controller
            control={control}
            name="photoConsent"
            render={({ field }) => (
              <div className="group/field flex items-start gap-2">
                <Checkbox
                  id="photoConsent"
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <Label htmlFor="photoConsent" className="font-normal">
                  I grant permission for Shadow Work Boxing to photograph and/or video record me (or
                  my minor child, if applicable) during Activities and use it in print, digital, and
                  social media materials. Leave unchecked to decline — you may still train.
                </Label>
              </div>
            )}
          />

          <Separator />

          <Controller
            control={control}
            name="isMinor"
            render={({ field }) => (
              <div className="group/field flex items-center gap-2">
                <Checkbox
                  id="isMinor"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <Label htmlFor="isMinor" className="font-normal">
                  The participant is under 18 years old
                </Label>
              </div>
            )}
          />

          {isMinor && (
            <div className="space-y-2">
              <Label htmlFor="guardianName">Parent/guardian full name</Label>
              <Input id="guardianName" autoComplete="name" {...register("guardianName")} />
              {errors.guardianName && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.guardianName.message}
                </p>
              )}
            </div>
          )}

          <Controller
            control={control}
            name="signatureDataUrl"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{isMinor ? "Parent/guardian signature" : "Signature"}</Label>
                <SignaturePad
                  onChange={(dataUrl) => field.onChange(dataUrl ?? "")}
                  invalid={Boolean(errors.signatureDataUrl)}
                />
                {errors.signatureDataUrl && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.signatureDataUrl.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field }) => (
              <div className="group/field flex items-start gap-2">
                <Checkbox
                  id="agreedToTerms"
                  className="mt-0.5"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <Label htmlFor="agreedToTerms" className="font-normal">
                  I have read and agree to the terms of this liability waiver
                  {isMinor ? " on behalf of the minor participant named above" : ""}.
                </Label>
              </div>
            )}
          />
          {errors.agreedToTerms && (
            <p className="text-sm text-destructive" role="alert">
              {errors.agreedToTerms.message}
            </p>
          )}

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Submitting…" : "Sign waiver"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
