import { redirect } from "next/navigation";

const SuperAdminMainLayout = ({ children }: { children: React.ReactNode }) => {
  redirect("/admin");
};

export default SuperAdminMainLayout;
