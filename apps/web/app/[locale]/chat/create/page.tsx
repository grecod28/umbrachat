"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z
    .string()
    .max(120, "El nombre no puede superar 120 caracteres")
    .optional(),
  description: z
    .string()
    .max(2048, "La descripción no puede superar 2048 caracteres")
    .optional(),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

export default function CreateChatPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
  });

  const onSubmit = (data: CreateRoomForm) => {
    console.log(data);
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Crear una sala
          </h1>
          <p className="text-text-muted">
            Configura los detalles de tu nueva sala de chat.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              placeholder="Mi sala de chat"
              className="text-center w-full px-4 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Una sala para conversar sobre..."
              className="text-center w-full px-4 py-3 rounded-xl bg-surface border border-border placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-background-image-gradient-primary text-white font-semibold shadow-[var(--shadow-primary)] hover:shadow-[var(--shadow-primary)] transition-shadow"
          >
            Crear sala
          </button>
        </form>
      </div>
    </main>
  );
}
