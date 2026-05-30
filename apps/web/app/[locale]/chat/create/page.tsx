"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

export default function CreateChatPage() {
  const t = useTranslations("CreateChat");

  const createRoomSchema = z.object({
    name: z.string().max(120, t("nameMaxError")).optional(),
    description: z.string().max(2048, t("descriptionMaxError")).optional(),
    visibility: z.enum(["public", "private"]),
  });

  type CreateRoomForm = z.infer<typeof createRoomSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: { visibility: "public" },
  });

  const onSubmit = (data: CreateRoomForm) => {
    console.log(data);
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center px-4">
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

          <div className="space-y-2">
            <label htmlFor="visibility" className="block text-sm font-medium">
              {t("visibility")}
            </label>
            <select
              id="visibility"
              className="text-center w-full px-4 py-3 rounded-xl bg-surface border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
              {...register("visibility")}
            >
              <option value="public">{t("public")}</option>
              <option value="private">{t("private")}</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-background-image-gradient-primary text-white font-semibold shadow-[var(--shadow-primary)] hover:shadow-[var(--shadow-primary)] transition-shadow"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
