import { useMemo } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getProductConfig,
  saveProductConfig,
  resetProductConfig,
} from "@/features/productConfig/api";
import type {
  ContentType,
  LegalLinks,
  LikesConfig,
  PhotosConfig,
  ProductConfig,
  ProductConfigWrite,
  RegistrationConfig,
  RelationsConfig,
  SuggestionsConfig,
} from "@/features/productConfig/types";
import { ConfigCard } from "./ConfigCard";
import { SelectField } from "./SelectField";
import { NumberField } from "./NumberField";
import { ContentTypeToggles } from "./ContentTypeToggles";
import { LegalLinksCard } from "./LegalLinksCard";
import { ProductConfigHeader } from "./ProductConfigHeader";

const formSchema = z.object({
  registration: z.object({
    identificationEmail: z.enum(["required", "not_required"]),
    identificationPhoneNumber: z.enum(["required", "not_required"]),
    allowSameSexRelationship: z.boolean(),
  }),
  relations: z.object({
    matchUnlimitedMessages: z.boolean(),
    defaultDistance: z.number().int().min(-1),
    activePresentationDuration: z.number().int().min(-1).refine((v) => v !== 0, {
      message: "cannotBeZero",
    }),
    maxPropositionRequestPerUser: z.number().int().min(-1).refine((v) => v !== 0, {
      message: "cannotBeZero",
    }),
  }),
  suggestions: z.object({
    periodMin: z.number().int().min(-1).refine((v) => v !== 0, {
      message: "cannotBeZero",
    }),
    periodMax: z.number().int().min(-1).refine((v) => v !== 0, {
      message: "cannotBeZero",
    }),
  }),
  likes: z.object({
    freeLikes: z.number().int().min(-1),
    unlimitedLikes: z.boolean(),
  }),
  photos: z.object({
    maxProfilePhotos: z.number().int().min(0),
    maxStoryPhotos: z.number().int().min(0),
  }),
  quizz: z.object({
    required: z.boolean(),
  }),
  defaultTypes: z.array(z.enum(["photo", "story", "event", "externallink"])),
  legalLinks: z.object({
    cgu: z.string().nullable(),
    legal: z.string().nullable(),
    subscription: z.string().nullable(),
    selfcare: z.string().nullable(),
    personalData: z.string().nullable(),
    cookies: z.string().nullable(),
    unsubscribe: z.string().nullable(),
    contact: z.string().nullable(),
    myAccount: z.string().nullable(),
    downloadCgu: z.string().nullable(),
    pricing: z.string().nullable(),
    supportEmail: z.string().nullable(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

function toFormValues(config: ProductConfig): FormValues {
  return {
    registration: config.registration,
    relations: config.relations,
    suggestions: config.suggestions,
    likes: config.likes,
    photos: config.photos,
    quizz: config.quizz,
    defaultTypes: config.defaultTypes,
    legalLinks: config.legalLinks,
  };
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export function ProductConfigForm() {
  const { t } = useTranslation("productConfig");
  const { id: tenantId } = useActiveTenant();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const canUpdate = can(PERMISSIONS.PRODUCT_CONFIG_UPDATE);
  const canDelete = can(PERMISSIONS.PRODUCT_CONFIG_DELETE);
  const readOnly = !canUpdate;

  const queryKey = useMemo(
    () => ["product-config", tenantId] as const,
    [tenantId],
  );

  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: getProductConfig,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: toFormValues(data),
    defaultValues: toFormValues(data),
  });

  const registration = useWatch({ control: form.control, name: "registration" });
  const relations = useWatch({ control: form.control, name: "relations" });
  const suggestions = useWatch({ control: form.control, name: "suggestions" });
  const photos = useWatch({ control: form.control, name: "photos" });
  const quizz = useWatch({ control: form.control, name: "quizz" });
  const contentTypes = useWatch({ control: form.control, name: "defaultTypes" });
  const likes = useWatch({ control: form.control, name: "likes" });
  const legalLinks = useWatch({ control: form.control, name: "legalLinks" });

  const saveMutation = useMutation({
    mutationFn: (values: ProductConfigWrite) => saveProductConfig(values),
    onSuccess: (next) => {
      toast.success(t("toast.saved"));
      queryClient.setQueryData(queryKey, next);
      form.reset(toFormValues(next));
    },
    onError: () => toast.error(t("toast.error")),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetProductConfig(),
    onSuccess: () => {
      toast.success(t("toast.resetSuccess"));
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error(t("toast.error")),
  });

  const identificationOptions = [
    { value: "required", label: t("options.required") },
    { value: "not_required", label: t("options.not_required") },
  ];

  function setRegistration(patch: Partial<RegistrationConfig>) {
    form.setValue(
      "registration",
      { ...form.getValues("registration"), ...patch },
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function setRelations(patch: Partial<RelationsConfig>) {
    form.setValue(
      "relations",
      { ...form.getValues("relations"), ...patch },
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function setSuggestions(patch: Partial<SuggestionsConfig>) {
    form.setValue(
      "suggestions",
      { ...form.getValues("suggestions"), ...patch },
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function setPhotos(patch: Partial<PhotosConfig>) {
    form.setValue(
      "photos",
      { ...form.getValues("photos"), ...patch },
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function setLikes(patch: Partial<LikesConfig>) {
    const current = form.getValues("likes");
    const next = { ...current, ...patch };
    if (next.unlimitedLikes) {
      next.freeLikes = -1;
    }
    form.setValue("likes", next, { shouldDirty: true, shouldValidate: true });
  }

  function setLegalLinks(next: LegalLinks) {
    form.setValue("legalLinks", next, { shouldDirty: true });
  }

  function setContentTypes(next: ContentType[]) {
    form.setValue("defaultTypes", next, { shouldDirty: true });
  }

  const onSave = form.handleSubmit((values) => saveMutation.mutate(values));

  const errors = form.formState.errors;

  return (
    <div className="space-y-6">
      <ProductConfigHeader
        isDirty={form.formState.isDirty}
        isSaving={saveMutation.isPending}
        isResetting={resetMutation.isPending}
        onDiscard={() => form.reset(toFormValues(data))}
        onSave={onSave}
        onResetToDefault={() => resetMutation.mutate()}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ConfigCard
            title={t("cards.registration.title")}
            subtitle={t("cards.registration.subtitle")}
          >
            <SelectField
              id="reg-email"
              label={t("fields.identificationEmail")}
              value={registration.identificationEmail}
              options={identificationOptions}
              onChange={(v) =>
                setRegistration({ identificationEmail: v as RegistrationConfig["identificationEmail"] })
              }
              disabled={readOnly}
            />
            <SelectField
              id="reg-phone"
              label={t("fields.identificationPhoneNumber")}
              value={registration.identificationPhoneNumber}
              options={identificationOptions}
              onChange={(v) =>
                setRegistration({ identificationPhoneNumber: v as RegistrationConfig["identificationPhoneNumber"] })
              }
              disabled={readOnly}
            />
            <ToggleRow
              id="reg-same-sex"
              label={t("fields.allowSameSexRelationship")}
              checked={registration.allowSameSexRelationship}
              onChange={(v) => setRegistration({ allowSameSexRelationship: v })}
              disabled={readOnly}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.relations.title")}
            subtitle={t("cards.relations.subtitle")}
          >
            <NumberField
              label={t("fields.defaultDistance")}
              value={relations.defaultDistance}
              min={-1}
              onChange={(v) => setRelations({ defaultDistance: v })}
              disabled={readOnly}
            />
            <NumberField
              label={t("fields.activePresentationDuration")}
              value={relations.activePresentationDuration}
              min={-1}
              suffix={t("suffixes.hours")}
              onChange={(v) => setRelations({ activePresentationDuration: v })}
              error={errors.relations?.activePresentationDuration?.message}
              disabled={readOnly}
            />
            <ToggleRow
              id="rel-unlimited-messages"
              label={t("fields.matchUnlimitedMessages")}
              checked={relations.matchUnlimitedMessages}
              onChange={(v) => setRelations({ matchUnlimitedMessages: v })}
              disabled={readOnly}
            />
            <NumberField
              label={t("fields.maxPropositionRequestPerUser")}
              value={relations.maxPropositionRequestPerUser}
              min={-1}
              onChange={(v) => setRelations({ maxPropositionRequestPerUser: v })}
              error={errors.relations?.maxPropositionRequestPerUser?.message}
              disabled={readOnly}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.suggestions.title")}
            subtitle={t("cards.suggestions.subtitle")}
          >
            <NumberField
              label={t("fields.suggestionPeriodMin")}
              value={suggestions.periodMin}
              min={-1}
              suffix={t("suffixes.hours")}
              onChange={(v) => setSuggestions({ periodMin: v })}
              error={errors.suggestions?.periodMin?.message}
              disabled={readOnly}
            />
            <NumberField
              label={t("fields.suggestionPeriodMax")}
              value={suggestions.periodMax}
              min={-1}
              suffix={t("suffixes.hours")}
              onChange={(v) => setSuggestions({ periodMax: v })}
              error={errors.suggestions?.periodMax?.message}
              disabled={readOnly}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.likes.title")}
            subtitle={t("cards.likes.subtitle")}
          >
            <ToggleRow
              id="likes-unlimited"
              label={t("fields.unlimitedLikes")}
              checked={likes.unlimitedLikes}
              onChange={(v) => setLikes({ unlimitedLikes: v })}
              disabled={readOnly}
            />
            <NumberField
              label={t("fields.freeLikes")}
              value={likes.freeLikes}
              min={-1}
              onChange={(v) => setLikes({ freeLikes: v })}
              disabled={readOnly || likes.unlimitedLikes}
            />
          </ConfigCard>
        </div>

        <div className="space-y-6">
          <ConfigCard
            title={t("cards.photos.title")}
            subtitle={t("cards.photos.subtitle")}
          >
            <NumberField
              label={t("fields.maxProfilePhotos")}
              value={photos.maxProfilePhotos}
              suffix={t("suffixes.photos")}
              onChange={(v) => setPhotos({ maxProfilePhotos: v })}
              disabled={readOnly}
            />
            <NumberField
              label={t("fields.maxStoryPhotos")}
              value={photos.maxStoryPhotos}
              suffix={t("suffixes.photos")}
              onChange={(v) => setPhotos({ maxStoryPhotos: v })}
              disabled={readOnly}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.quizz.title")}
            subtitle={t("cards.quizz.subtitle")}
          >
            <ToggleRow
              id="quizz-required"
              label={t("fields.quizzRequired")}
              checked={quizz.required}
              onChange={(v) =>
                form.setValue("quizz", { required: v }, { shouldDirty: true })
              }
              disabled={readOnly}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.contentTypes.title")}
            subtitle={t("cards.contentTypes.subtitle")}
          >
            <ContentTypeToggles
              value={contentTypes}
              onChange={setContentTypes}
              disabled={readOnly}
            />
          </ConfigCard>

          <LegalLinksCard
            value={legalLinks}
            onChange={setLegalLinks}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
