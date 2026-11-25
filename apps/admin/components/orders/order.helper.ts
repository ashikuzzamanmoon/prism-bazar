export const getStatusColor = (status: string, type: string = "order") => {
    if (type === "order") {
        return status === "PENDING" ? "text-yellow-600" : "text-green-600";
    }
    return status === "UNPAID" ? "text-red-600" : "text-green-600";
};

export const getStatusBg = (status: string, type: string = "order") => {
    if (type === "order") {
        return status === "PENDING" ? "bg-yellow-50" : "bg-green-50";
    }
    return status === "UNPAID" ? "bg-red-50" : "bg-green-50";
};