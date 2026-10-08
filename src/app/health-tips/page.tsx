import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HealthTips } from "@/components/HealthTips";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Health Tips — FindDoctor",
  description: "Prevention and home-care tips for common illnesses like cough, cold, fever, dengue and more.",
};

export default function HealthTipsPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <AnnouncementBar />
      <Navbar />
      <HealthTips />
    </div>
  );
}
