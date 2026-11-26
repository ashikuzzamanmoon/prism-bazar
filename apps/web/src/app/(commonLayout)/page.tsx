import getServerData from "@/apiService/apiService";
import { API_ENDPOINTS } from "@/apiService/config";
import Link from "next/link";
import Banner from "@/components/common/MainBanner";
import LocalDeliveryBanner from "@/components/HomeComponents/LocalDeliveryBanner";
import AccessoriesProduct from "@/components/HomeComponents/AccessoriesProduct";
import BrandsShowing from "@/components/HomeComponents/BrandsShowing";
import CategoryDisplay from "@/components/HomeComponents/CategoryDisplay";
import CollectionProduct from "@/components/HomeComponents/CollectionProduct";
import PopularProductsCollection from "@/components/HomeComponents/PopularProductsCollection";
import NewProduct from "@/components/HomeComponents/NewProductsShowing";
import PreOwnedProducts from "@/components/HomeComponents/PreOwnedProducts";
import SubscriptionOffer from "@/components/HomeComponents/SubscriptionOffer";
import Testimonials from "@/components/HomeComponents/Testimonials";

const HomePage = async () => {
  const bannerData = await getServerData(`${API_ENDPOINTS.BANNER.GetAll}`);
  const brandData = await getServerData(`${API_ENDPOINTS.BRAND.GetAll}`);
  const productData = await getServerData(`${API_ENDPOINTS.PRODUCT.GetAll}`);
  const newArrivalData = await getServerData(
    `${API_ENDPOINTS.PRODUCT.GetNewArrivals}`,
  );
  const preOwnedData = await getServerData(
    `${API_ENDPOINTS.PRODUCT.GetPreOwned}`,
  );
  const accessoriesData = await getServerData(
    `${API_ENDPOINTS.PRODUCT.GetAccessories}`,
  );
  const collectionData = await getServerData(
    `${API_ENDPOINTS.Collection.getAll}`,
  );

  const collectionProductsData = await getServerData(
    `${API_ENDPOINTS.PRODUCT.CollectionProducts}`,
  );

  const contentsData = await getServerData(
    `${API_ENDPOINTS.CONTENT.GetAll}`,
  );

  return (
    <div className="mt-0 md:mt-6">
      <Banner bannerData={bannerData?.data?.data} />
      <LocalDeliveryBanner />
      <BrandsShowing brandData={brandData?.data} />
      <NewProduct productData={newArrivalData || []} />
      <PreOwnedProducts productData={preOwnedData || []} />
      {/* <AccessoriesProduct productData={accessoriesData || []} /> */}
      <div>
        {collectionProductsData?.data?.map((collection: any) => (
          <div key={collection.id} className="mb-12">
            <CollectionProduct
              productData={collection.products}
              title={collection.name}
              slug={collection.slug}
            />
          </div>
        ))}
      </div>
      <PopularProductsCollection
        productData={productData?.data || []}
        title="অর্গানিক ও শিক্ষা পণ্য সামগ্রী"
      />

      <CategoryDisplay 
        categories={collectionData?.data?.slice(0, 5) || []} 
        contents={contentsData?.data?.data || []}
      />

      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            প্রিজম বাজার সহায়িকা ও পরামর্শ
          </h2>
          <p className="text-gray-700 mt-2 max-w-3xl leading-relaxed">
            সিরাজগঞ্জ ও কাজিপুর অঞ্চলে খাঁটি অর্গানিক খাদ্যাভ্যাস এবং শিক্ষার্থীদের বিভিন্ন শ্রেণির স্টাডি গাইড ও পরামর্শ পড়ুন।
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="px-4 py-2 rounded-md bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors text-sm"
            >
              খাঁটি মধু ও ঘি কালেকশন
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 rounded-md bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors text-sm"
            >
              শিক্ষা উপকরণ ও শিট
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity text-sm"
            >
              ডেলিভারি তথ্য জানুন
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />
      <SubscriptionOffer />
    </div>
  );
};

export default HomePage;
