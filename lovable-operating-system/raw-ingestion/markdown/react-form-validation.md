# React Form Validation

Use when you need to add client-side form validation to a React component in a Lovable project.

## Overview

This skill covers building validated forms using React Hook Form with Zod schema validation. It handles error display, required fields, and async submission.

## Steps

1. Install react-hook-form and zod
2. Define a Zod schema for your form
3. Use `useForm` with the zodResolver
4. Register inputs and display errors
5. Handle submission with `handleSubmit`

## Code Examples

### Schema Definition

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;
```

### Form Component

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="border rounded px-3 py-2 w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="border rounded px-3 py-2 w-full"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Notes

- `zodResolver` bridges Zod schemas into react-hook-form
- `isSubmitting` automatically disables the button during async submission
- Display errors below each field for best UX
