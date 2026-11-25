
import getServerData from "@/apiService/apiService";
import { API_ENDPOINTS } from "@/apiService/config";
import Footer from "@/components/Footer/Footer";
import NewFooter from "@/components/Footer/NewFooter";
import Header from "@/components/Header/Header";
import AddToCartDrawer from "@/components/common/AddToCartDrawer";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const CommonLayout = async ({ children }: { children: React.ReactNode }) => {
    const collectionData = await getServerData(`${API_ENDPOINTS.Collection.getAll}`);
    return (
        <SidebarProvider>
            <div className="flex flex-col flex-1 w-full min-w-0">
                <Header collectionData={collectionData?.data} />
                <AddToCartDrawer />
                {children}
               
                <NewFooter/>
                 {/* <Footer /> */}
            </div>
        </SidebarProvider>
    );
};

export default CommonLayout;
