import UserAvatar from "@/components/UserAvatar";
import {redirect} from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function WelcomePage()
{
    const user = await getSessionUser();

    if (!user)
    {
        redirect("/");
    }

    const fields =
    [
        {label: "name", value: user.name},
        {label: "email", value: user.email},
        {label: "slack id", value: user.slack_id},
        {label: "verification status", value: user.verification_status},
        {label: "YSWS eligibility", value: String(user.ysws_eligible)},
        {label: "user id", value: user.sub},
    ];

    return (
    // <main className="min-h-screen bg-[#a3b18a] flex flex-col items-center justify-center px-10 py-16 text-center">
      <div className="info-box text-left">
        {/* <UserAvatar/> */}
        <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
          Welcome, {user.name ?? "there"}!
        </h1>
        

        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <p key={field.label} className="text-lg text-strong">
              <span className="font-bold">{field.label}:</span> {field.value ?? "—"}
            </p>
          ))}
        </div>
      </div>
    // </main>
  );
}