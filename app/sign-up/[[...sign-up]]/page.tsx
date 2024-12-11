import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex justify-center py-24 bg-zinc-950 h-screen">
      <SignUp 
      appearance={{
        baseTheme: [dark],
      }}/>
    </div>
  );
}