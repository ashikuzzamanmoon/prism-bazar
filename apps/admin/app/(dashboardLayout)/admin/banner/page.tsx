import BannerTable from "@/components/Banner/BannerTable";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const BannerManagement = () => {
  return (
    // <div className=" bg-white dark:bg-gray-800 dark:text-white p-6">
    //   <div className=" mb-3">
    //     <Link href={"/admin/banner/create"}>
    //       <button className=" flex justify-center items-center px-4 py-1.5 bg-primary text-white cursor-pointer rounded-md hover:bg-primary/90 transition-colors">
    //         <Plus />
    //         Create New Banner
    //       </button>
    //     </Link>
    //   </div>
    //   <div>
    //     <BannerTable />
    //   </div>
    // </div>
    <BannerTable />
  );
};

export default BannerManagement;
