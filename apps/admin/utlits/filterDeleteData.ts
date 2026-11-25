export const filterDeleteData = (response: any) => {
  if (Array.isArray(response?.data?.data)) {
    return {
      ...response,
      data: {
        ...response.data,
        data: response.data.data.filter(
          (item: any) => !(item?.isDelete === true || item?.isDeleted === true),
        ),
      },
    };
  }

  if (Array.isArray(response?.data)) {
    return {
      ...response,
      data: response.data.filter(
        (item: any) => !(item?.isDelete === true || item?.isDeleted === true),
      ),
    };
  }

  return response;
};
