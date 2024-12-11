import { SignIn } from "@clerk/nextjs";
import { dark, neobrutalism } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex justify-center py-24 bg-zinc-950 h-screen">
      <SignIn
        appearance={{
          baseTheme: [dark],
        }}
      />
    </div>
  );
}
