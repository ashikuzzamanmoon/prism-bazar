import getServerData from "@/apiService/apiService";
import { API_ENDPOINTS } from "@/apiService/config";
import OrderFail from "@/components/Order/OrderFail";

const CancelPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ trxId?: string }>;
}) => {
    const { trxId } = await searchParams;
    const invoiceData = await getServerData(API_ENDPOINTS.ORDER.GET_INVOICE + `/${trxId}`);
    return <div>
        <OrderFail invoiceData={invoiceData} />
    </div>;
};

export default CancelPage;
