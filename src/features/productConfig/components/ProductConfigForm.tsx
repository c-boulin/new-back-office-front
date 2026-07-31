import { useMemo } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProductsStore } from "@/stores/productsStore";
import { getProductConfig, saveProductConfig } from "@/features/productConfig/api";
import type {
  DefaultContentTypes,
  LegalLinks,
  LikesConfig,
  PhotosConfig,
  ProductConfig,
  QuizzConfig,
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

export type ProductConfigFormProps = {
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
};

const REQUIRED_OPTIONAL = [
  { value: "required", label: "" },
  { value: "optional", label: "" },
] as const;

const YES_NO = [
  { value: "yes", label: "" },
  { value: "no", label: "" },
] as const;

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function boolToSelect(v: boolean): string {
  return v ? "yes" : "no";
}

function selectToBool(v: string): boolean {
  return v === "yes";
}

export function ProductConfigForm({
  selectedProductId,
  onSelectProduct,
}: ProductConfigFormProps) {
  const { t } = useTranslation("productConfig");
  const products = useProductsStore((s) => s.products);
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["product-config", selectedProductId] as const,
    [selectedProductId],
  );

  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => getProductConfig(selectedProductId),
  });

  const form = useForm<ProductConfig>({
    values: data,
    defaultValues: data,
  });

  const registration = useWatch({ control: form.control, name: "registration" });
  const relations = useWatch({ control: form.control, name: "relations" });
  const suggestions = useWatch({ control: form.control, name: "suggestions" });
  const photos = useWatch({ control: form.control, name: "photos" });
  const quizz = useWatch({ control: form.control, name: "quizz" });
  const contentTypes = useWatch({ control: form.control, name: "defaultContentTypes" });
  const likes = useWatch({ control: form.control, name: "likes" });
  const legalLinks = useWatch({ control: form.control, name: "legalLinks" });

  const saveMutation = useMutation({
    mutationFn: (values: ProductConfig) =>
      saveProductConfig(selectedProductId, values),
    onSuccess: (next) => {
      toast.success(t("toast.saved"));
      queryClient.setQueryData(queryKey, next);
      form.reset(next);
    },
    onError: () => toast.error(t("toast.error")),
  });

  const selectedProduct = products.find((p) => String(p.id) === selectedProductId) ?? null;

  const requiredOptionalOptions = REQUIRED_OPTIONAL.map((o) => ({
    ...o,
    label: t(`options.${o.value}`),
  }));
  const yesNoOptions = YES_NO.map((o) => ({
    ...o,
    label: t(`options.${o.value}`),
  }));

  function setRegistration(patch: Partial<RegistrationConfig>) {
    form.setValue(
      "registration",
      { ...form.getValues("registration"), ...patch },
      { shouldDirty: true },
    );
  }

  function setRelations(patch: Partial<RelationsConfig>) {
    form.setValue(
      "relations",
      { ...form.getValues("relations"), ...patch },
      { shouldDirty: true },
    );
  }

  function setSuggestions(patch: Partial<SuggestionsConfig>) {
    form.setValue(
      "suggestions",
      { ...form.getValues("suggestions"), ...patch },
      { shouldDirty: true },
    );
  }

  function setPhotos(patch: Partial<PhotosConfig>) {
    form.setValue(
      "photos",
      { ...form.getValues("photos"), ...patch },
      { shouldDirty: true },
    );
  }

  function setQuizz(patch: Partial<QuizzConfig>) {
    form.setValue(
      "quizz",
      { ...form.getValues("quizz"), ...patch },
      { shouldDirty: true },
    );
  }

  function setContentTypes(patch: Partial<DefaultContentTypes>) {
    form.setValue(
      "defaultContentTypes",
      { ...form.getValues("defaultContentTypes"), ...patch },
      { shouldDirty: true },
    );
  }

  function setLikes(patch: Partial<LikesConfig>) {
    form.setValue(
      "likes",
      { ...form.getValues("likes"), ...patch },
      { shouldDirty: true },
    );
  }

  function setLegalLinks(patch: Partial<LegalLinks>) {
    form.setValue(
      "legalLinks",
      { ...form.getValues("legalLinks"), ...patch },
      { shouldDirty: true },
    );
  }

  const onSave = form.handleSubmit((values) => saveMutation.mutate(values));

  return (
    <div className="space-y-6">
      <ProductConfigHeader
        products={products}
        selectedProductId={selectedProductId}
        onSelectProduct={onSelectProduct}
        selectedProduct={selectedProduct}
        isDirty={form.formState.isDirty}
        isSaving={saveMutation.isPending}
        onReset={() => form.reset(data)}
        onSave={onSave}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ConfigCard
            title={t("cards.registration.title")}
            subtitle={t("cards.registration.subtitle")}
          >
            <SelectField
              id="reg-email"
              label={t("fields.email")}
              value={registration.email}
              options={requiredOptionalOptions}
              onChange={(v) => setRegistration({ email: v as RegistrationConfig["email"] })}
            />
            <SelectField
              id="reg-phone"
              label={t("fields.phone")}
              value={registration.phone}
              options={requiredOptionalOptions}
              onChange={(v) => setRegistration({ phone: v as RegistrationConfig["phone"] })}
            />
            <SelectField
              id="reg-same-sex"
              label={t("fields.sameSex")}
              value={boolToSelect(registration.sameSex)}
              options={yesNoOptions}
              onChange={(v) => setRegistration({ sameSex: selectToBool(v) })}
            />
            <NumberField
              label={t("fields.minAge")}
              value={registration.minAge}
              onChange={(v) => setRegistration({ minAge: v })}
            />
            <ToggleRow
              id="reg-photo-required"
              label={t("fields.photoRequired")}
              checked={registration.photoRequired}
              onChange={(v) => setRegistration({ photoRequired: v })}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.relations.title")}
            subtitle={t("cards.relations.subtitle")}
          >
            <NumberField
              label={t("fields.maxDistanceKm")}
              value={relations.maxDistanceKm}
              suffix={t("suffixes.km")}
              onChange={(v) => setRelations({ maxDistanceKm: v })}
            />
            <NumberField
              label={t("fields.inactivityPeriodDays")}
              value={relations.inactivityPeriodDays}
              suffix={t("suffixes.days")}
              onChange={(v) => setRelations({ inactivityPeriodDays: v })}
            />
            <ToggleRow
              id="rel-unlimited-messages"
              label={t("fields.unlimitedMessages")}
              checked={relations.unlimitedMessages}
              onChange={(v) => setRelations({ unlimitedMessages: v })}
            />
            <NumberField
              label={t("fields.maxPropositions")}
              value={relations.maxPropositions}
              onChange={(v) => setRelations({ maxPropositions: v })}
            />
            <NumberField
              label={t("fields.propositionPeriodHours")}
              value={relations.propositionPeriodHours}
              suffix={t("suffixes.hours")}
              onChange={(v) => setRelations({ propositionPeriodHours: v })}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.suggestions.title")}
            subtitle={t("cards.suggestions.subtitle")}
          >
            <NumberField
              label={t("fields.maxPropositions")}
              value={suggestions.maxPropositions}
              onChange={(v) => setSuggestions({ maxPropositions: v })}
            />
            <NumberField
              label={t("fields.periodHours")}
              value={suggestions.periodHours}
              suffix={t("suffixes.hours")}
              onChange={(v) => setSuggestions({ periodHours: v })}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.likes.title")}
            subtitle={t("cards.likes.subtitle")}
          >
            <NumberField
              label={t("fields.freeLikesPerDay")}
              value={likes.freeLikesPerDay}
              suffix={t("suffixes.likes")}
              onChange={(v) => setLikes({ freeLikesPerDay: v })}
            />
            <ToggleRow
              id="likes-unlimited"
              label={t("fields.unlimitedLikes")}
              checked={likes.unlimitedLikes}
              onChange={(v) => setLikes({ unlimitedLikes: v })}
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
            />
            <NumberField
              label={t("fields.maxStoryPhotos")}
              value={photos.maxStoryPhotos}
              suffix={t("suffixes.photos")}
              onChange={(v) => setPhotos({ maxStoryPhotos: v })}
            />
            <ToggleRow
              id="photos-video"
              label={t("fields.videoEnabled")}
              checked={photos.videoEnabled}
              onChange={(v) => setPhotos({ videoEnabled: v })}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.quizz.title")}
            subtitle={t("cards.quizz.subtitle")}
          >
            <ToggleRow
              id="quizz-enabled"
              label={t("fields.quizzEnabled")}
              checked={quizz.enabled}
              onChange={(v) => setQuizz({ enabled: v })}
            />
            <NumberField
              label={t("fields.minQuestions")}
              value={quizz.minQuestions}
              suffix={t("suffixes.questions")}
              onChange={(v) => setQuizz({ minQuestions: v })}
            />
          </ConfigCard>

          <ConfigCard
            title={t("cards.contentTypes.title")}
            subtitle={t("cards.contentTypes.subtitle")}
          >
            <ContentTypeToggles
              value={contentTypes}
              onChange={setContentTypes}
            />
          </ConfigCard>

          <LegalLinksCard value={legalLinks} onChange={setLegalLinks} />
        </div>
      </div>

    </div>
  );
}
