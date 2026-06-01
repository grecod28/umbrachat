"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { InputPassword } from "@/components/ui/input-password";
import { API_URL } from "@/libs/constants/api";
import { ROOM_VISIBILITY, RoomVisibility } from "@repo/shared";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function CreateChatPage() {
  const t = useTranslations("CreateChat");
  const e = useTranslations("Errors");
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  const options = [
    { label: t("public"), value: ROOM_VISIBILITY.PUBLIC },
    { label: t("private"), value: ROOM_VISIBILITY.PRIVATE },
  ];

  const createRoomSchema = z
    .object({
      name: z.string().max(120, t("nameMaxError")).optional().or(z.literal("")),
      description: z
        .string()
        .max(2048, t("descriptionMaxError"))
        .optional()
        .or(z.literal("")),
      visibility: z.enum(ROOM_VISIBILITY),
      password: z
        .string()
        .length(6, t("passwordLengthError"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (
        data.visibility === ROOM_VISIBILITY.PRIVATE &&
        (!data.password || data.password === "")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
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
    formState: { errors },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: ROOM_VISIBILITY.PUBLIC,
    },
  });

  const onSubmit = async (data: CreateRoomForm) => {
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    console.log(resData);

    if (!res.ok) {
      setError(true);
      return;
    }

    // Redirigir
    router.push(`/chat/${resData.id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-20 pb-8 px-4">
      <div className="animate-fade-in w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-muted">{t("description")}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              {t("name")}
            </label>
            <input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              className="text-center w-full px-4 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              {t("descriptionLabel")}
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder={t("descriptionPlaceholder")}
              className="text-center w-full px-4 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          <Select
            label={t("visibility")}
            options={options}
            value={watch("visibility")}
            onChange={(val) => setValue("visibility", val as RoomVisibility)}
          />

          {watch("visibility") === ROOM_VISIBILITY.PRIVATE && (
            <InputPassword
              label={t("passwordLabel")}
              placeholder={t("passwordPlaceholder")}
              register={register("password")}
              error={errors.password?.message}
            />
          )}

          {error && <span className="error">{e("unexpected")}</span>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-background-image-gradient-primary text-white font-semibold shadow-primary transition-shadow hover:brightness-110"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
