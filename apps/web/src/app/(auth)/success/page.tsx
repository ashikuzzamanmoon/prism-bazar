import getServerData from "@/apiService/apiService";
import { API_ENDPOINTS } from "@/apiService/config";
import OrderSuccess from "@/components/Order/OrderSuccess";

const SuccessPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ trxId?: string }>;
}) => {
    const { trxId } = await searchParams;
    const invoiceData = await getServerData(API_ENDPOINTS.ORDER.GET_INVOICE + `/${trxId}`);
    return <div>
        <OrderSuccess invoiceData={invoiceData} />
    </div>;
};

export default SuccessPage;
