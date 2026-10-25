"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { InputPassword } from "@/components/ui/input-password";
import { API_URL } from "@/libs/constants/api";
import { playSubmitSound } from "@/libs/functions/sounds";
import { ROOM_VISIBILITY, RoomVisibility } from "@repo/shared";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  IoAlertCircleOutline,
  IoArrowBack,
  IoArrowForward,
  IoDocumentOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { PageHeading } from "@/components/layout/page-heading";

export default function CreateChatPage() {
  const t = useTranslations("CreateChat");
  const e = useTranslations("Errors");
  const [serverError, setServerError] = useState(false);
  const router = useRouter();

  const options = [
    {
      label: t("public"),
      value: ROOM_VISIBILITY.PUBLIC,
      hint: t("publicHint"),
      icon: IoGlobeOutline,
    },
    {
      label: t("private"),
      value: ROOM_VISIBILITY.PRIVATE,
      hint: t("privateHint"),
      icon: IoLockClosedOutline,
    },
  ];

  const createRoomSchema = z
    .object({
      name: z
        .string()
        .max(120, t("nameMaxError"))
        .optional()
        .or(z.literal("")),
      description: z
        .string()
        .max(2048, t("descriptionMaxError"))
        .optional()
        .or(z.literal("")),
      visibility: z.enum([ROOM_VISIBILITY.PUBLIC, ROOM_VISIBILITY.PRIVATE]),
      password: z
        .string()
        .length(6, t("passwordLengthError"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (
        data.visibility === ROOM_VISIBILITY.PRIVATE &&
        (!data.password || data.password.length !== 6)
      ) {
        ctx.addIssue({
          code: "custom",
          message: t("passwordRequired"),
          path: ["password"],
        });
      }
    });

  type CreateRoomForm = z.infer<typeof createRoomSchema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: ROOM_VISIBILITY.PUBLIC,
      password: "",
    },
  });

  const visibility = watch("visibility");

  const onSubmit = async (data: CreateRoomForm) => {
    playSubmitSound();
    setServerError(false);

    const payload = {
      ...data,
      password: data.password || undefined,
      name: data.name || undefined,
      description: data.description || undefined,
    };

    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setServerError(true);
      return;
    }

    const resData = await res.json();
    router.push(`/chat/${resData.id}`);
  };

  const inputClass = (field: keyof CreateRoomForm) =>
    `field ${errors[field] ? "field-error" : ""}`;

  const aside = [
    {
      icon: IoShieldCheckmarkOutline,
      text: t("asidePrivacy"),
    },
    {
      icon: IoTimeOutline,
      text: t("asideEphemeral"),
    },
    {
      icon: IoDocumentOutline,
      text: t("asideFiles"),
    },
  ];

  return (
    <main className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-7 md:px-8 md:py-10">
        <Link
          href="/chat/default"
          className="inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-text-muted uppercase transition-colors hover:text-accent"
        >
          <IoArrowBack size={15} />
          {t("back")}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
          <section className="min-w-0">
            <PageHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
              description={t("description")}
            />

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="panel mt-7 space-y-6 p-5 md:p-7"
            >
              <div className="space-y-2">
                <label htmlFor="name" className="field-label">
                  {t("name")}
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  className={inputClass("name")}
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs text-danger">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="field-label">
                  {t("descriptionLabel")}
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder={t("descriptionPlaceholder")}
                  className={`${inputClass("description")} resize-none`}
                  aria-invalid={Boolean(errors.description)}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs text-danger">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <fieldset className="space-y-2">
                <legend className="field-label">{t("visibility")}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {options.map(({ label, value, hint, icon: Icon }) => {
                    const active = visibility === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setValue("visibility", value as RoomVisibility, {
                            shouldValidate: true,
                          })
                        }
                        aria-pressed={active}
                        className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                          active
                            ? "border-accent/40 bg-accent/10"
                            : "border-border bg-surface/50 hover:border-border-strong"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            active
                              ? "border-accent/30 bg-accent/10 text-accent"
                              : "border-border bg-surface-2 text-text-muted"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`block text-sm font-medium ${
                              active ? "text-text" : "text-text-soft"
                            }`}
                          >
                            {label}
                          </span>
                          <span className="mt-0.5 block text-[0.68rem] leading-relaxed text-text-muted">
                            {hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {visibility === ROOM_VISIBILITY.PRIVATE && (
                <div className="animate-fade-in">
                  <InputPassword
                    label={t("passwordLabel")}
                    placeholder={t("passwordPlaceholder")}
                    maxLength={6}
                    register={register("password", {
                      setValueAs: (value: string) =>
                        value?.toUpperCase() ?? "",
                    })}
                    error={errors.password?.message}
                  />
                </div>
              )}

              {serverError && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                  <IoAlertCircleOutline size={18} className="shrink-0" />
                  {e("unexpected")}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {t("submit")}
                <IoArrowForward size={17} />
              </button>
            </form>
          </section>

          <aside className="space-y-3">
            <div className="panel p-5">
              <p className="mono-label text-accent">{t("asideTitle")}</p>
              <ul className="mt-5 space-y-5">
                {aside.map(({ icon: Icon, text }, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-accent">
                      <Icon size={15} />
                    </span>
                    <p className="pt-1 text-[0.78rem] leading-relaxed text-text-muted">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-quiet px-5 py-4">
              <p className="status-line">
                <span className="status-dot" />
                {t("ephemeralLabel")}
              </p>
              <p className="mt-2 font-mono text-[0.58rem] tracking-[0.14em] text-text-faint uppercase">
                {t("noTraceLabel")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
