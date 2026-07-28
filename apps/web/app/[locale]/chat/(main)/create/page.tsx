"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { InputPassword } from "@/components/ui/input-password";
import { API_URL } from "@/libs/constants/api";
import { playSubmitSound } from "@/libs/functions/sounds";
import { ROOM_VISIBILITY, RoomVisibility } from "@repo/shared";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoAlertCircleOutline } from "react-icons/io5";

export default function CreateChatPage() {
  const t = useTranslations("CreateChat");
  const e = useTranslations("Errors");
  const [serverError, setServerError] = useState(false);
  const router = useRouter();

  const options = [
    { label: t("public"), value: ROOM_VISIBILITY.PUBLIC },
    { label: t("private"), value: ROOM_VISIBILITY.PRIVATE },
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
    `w-full px-4 py-3 rounded-xl bg-surface border transition-colors text-center placeholder:text-text-muted focus:outline-none focus:ring-1 ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-border focus:border-primary focus:ring-primary"
    }`;

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center px-4 pt-20 pb-8">
      <div className="w-full max-w-md animate-fade-in space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-center">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium">
              {t("name")}
            </label>
            <input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              className={inputClass("name")}
              {...register("name")}
            />
            {errors.name && (
              <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium">
              {t("descriptionLabel")}
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder={t("descriptionPlaceholder")}
              className={`resize-none ${inputClass("description")}`}
              {...register("description")}
            />
            {errors.description && (
              <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <Select
            label={t("visibility")}
            options={options}
            value={visibility}
            onChange={(val) => setValue("visibility", val as RoomVisibility)}
          />

          {visibility === ROOM_VISIBILITY.PRIVATE && (
            <InputPassword
              label={t("passwordLabel")}
              placeholder={t("passwordPlaceholder")}
              register={register("password", {
                setValueAs: (v: string) => v?.toUpperCase() ?? "",
              })}
              error={errors.password?.message}
            />
          )}

          {serverError && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <IoAlertCircleOutline size={18} className="shrink-0" />
              {e("unexpected")}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
