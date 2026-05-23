# Zustand State Management

Use when you need lightweight global state management in a Lovable React project without the boilerplate of Redux.

## Overview

Zustand is a minimal state management library. You define a store as a hook, access state anywhere in your component tree, and update it without providers or reducers.

## Steps

1. Install zustand
2. Create a store with `create`
3. Define state and actions in the store
4. Use the store hook in any component
5. Subscribe to only the slices you need

## Code Examples

### Create a Store

```typescript
import { create } from "zustand";

interface UserStore {
  user: { name: string; email: string } | null;
  setUser: (user: UserStore["user"]) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### Use in a Component

```tsx
function Profile() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      <p>{user.name}</p>
      <button onClick={clearUser}>Log out</button>
    </div>
  );
}
```

### Persist to localStorage

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme: string) => set({ theme }),
    }),
    { name: "settings-storage" }
  )
);
```

## Notes

- Select only the state slice you need to avoid unnecessary re-renders
- Use `persist` middleware to survive page refreshes
- No Provider wrapper needed — works anywhere in the tree
