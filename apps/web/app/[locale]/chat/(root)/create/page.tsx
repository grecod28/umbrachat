"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { InputPassword } from "@/components/ui/input-password";
import { API_URL } from "@/libs/constants/api";
import { ROOM_VISIBIITY } from "@repo/shared";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function CreateChatPage() {
  const t = useTranslations("CreateChat");
  const e = useTranslations("Errors");
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  const options = [
    { label: t("public"), value: ROOM_VISIBIITY.PUBLIC },
    { label: t("private"), value: ROOM_VISIBIITY.PRIVATE },
  ];

  const createRoomSchema = z
    .object({
      name: z.string().max(120, t("nameMaxError")).optional().or(z.literal("")),
      description: z
        .string()
        .max(2048, t("descriptionMaxError"))
        .optional()
        .or(z.literal("")),
      visibility: z.enum(ROOM_VISIBIITY),
      password: z
        .string()
        .max(255, t("passwordMaxError"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (
        data.visibility === ROOM_VISIBIITY.PRIVATE &&
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
      visibility: ROOM_VISIBIITY.PUBLIC,
    },
  });

  const onSubmit = async (data: CreateRoomForm) => {
    console.log(data);
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();

    if (!res.ok) {
      setError(true);
      return;
    }

    // Modificar historial de chats
    const previous = JSON.parse(localStorage.getItem("rooms") || "[]");

    const updated = [
      resData.id,
      ...previous.filter((id: string) => id !== resData.id),
    ];

    localStorage.setItem("rooms", JSON.stringify(updated));

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
            onChange={(val) => setValue("visibility", val as ROOM_VISIBIITY)}
          />

          {watch("visibility") === ROOM_VISIBIITY.PRIVATE && (
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
