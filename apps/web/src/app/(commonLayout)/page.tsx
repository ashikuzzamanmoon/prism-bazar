import getServerData from "@/apiService/apiService";
import { API_ENDPOINTS } from "@/apiService/config";
import Link from "next/link";
import Banner from "@/components/common/MainBanner";
import LocalDeliveryBanner from "@/components/HomeComponents/LocalDeliveryBanner";
import BrandsShowing from "@/components/HomeComponents/BrandsShowing";
import CategoryGrid from "@/components/HomeComponents/CategoryGrid";
import CollectionProduct from "@/components/HomeComponents/CollectionProduct";
import PopularProductsCollection from "@/components/HomeComponents/PopularProductsCollection";
import NewProduct from "@/components/HomeComponents/NewProductsShowing";
import OrganicProductsShowcase from "@/components/HomeComponents/OrganicProductsShowcase";
import EducationProductsShowcase from "@/components/HomeComponents/EducationProductsShowcase";
import SubscriptionOffer from "@/components/HomeComponents/SubscriptionOffer";
import Testimonials from "@/components/HomeComponents/Testimonials";
import { IProduct } from "@/types/productTypes";

const HomePage = async () => {
  const [
    bannerData,
    brandData,
    productData,
    newArrivalData,
    categoryData,
    collectionProductsData,
  ] = await Promise.all([
    getServerData(`${API_ENDPOINTS.BANNER.GetAll}`),
    getServerData(`${API_ENDPOINTS.BRAND.GetAll}`),
    getServerData(`${API_ENDPOINTS.PRODUCT.GetAll}`),
    getServerData(`${API_ENDPOINTS.PRODUCT.GetNewArrivals}`),
    getServerData(`${API_ENDPOINTS.CATEGORY.GetAll}`),
    getServerData(`${API_ENDPOINTS.PRODUCT.CollectionProducts}`),
  ]);

  const allProducts: IProduct[] = productData?.data || [];

  // Curated Organic products (either typed as ORGANIC_FOOD or with fresh/packaged conditions)
  const organicProducts = allProducts.filter(
    (p) =>
      p.type === "ORGANIC_FOOD" ||
      p.condition === "FRESH" ||
      p.condition === "PACKAGED" ||
      p.condition === "HANDMADE",
  );

  // Curated Education & Digital products
  const educationProducts = allProducts.filter(
    (p) =>
      p.type === "EDUCATION_MATERIAL" ||
      p.condition === "DIGITAL" ||
      p.condition === "PRINTED",
  );

  return (
    <div className="mt-0 md:mt-4 space-y-2 md:space-y-4">
      <Banner bannerData={bannerData?.data?.data} />
      <LocalDeliveryBanner />
      <CategoryGrid categories={categoryData?.data || []} />
      <BrandsShowing brandData={brandData?.data} />

      {/* Curated Organic Foods Showcase */}
      <OrganicProductsShowcase
        productData={organicProducts.length > 0 ? organicProducts : allProducts}
      />

      {/* Curated Education & Digital Materials Showcase */}
      <EducationProductsShowcase
        productData={
          educationProducts.length > 0 ? educationProducts : allProducts
        }
      />

      {/* New Arrivals */}
      <NewProduct productData={newArrivalData || []} />

      {/* Collection Showcases */}
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

      {/* All Popular Products */}
      <PopularProductsCollection
        productData={allProducts}
        title="সকল অর্গানিক ও শিক্ষা পণ্য সামগ্রী"
      />

      {/* Informational Guidance Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            প্রিজম বাজার সহায়িকা ও পরামর্শ
          </h2>
          <p className="text-gray-700 mt-2 max-w-3xl leading-relaxed text-sm sm:text-base">
            সিরাজগঞ্জ ও কাজিপুর অঞ্চলে খাঁটি অর্গানিক খাদ্যাভ্যাস এবং শিক্ষার্থীদের বিভিন্ন শ্রেণির নির্ভরযোগ্য স্টাডি গাইড ও পরামর্শ পড়ুন।
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products?category=pure-honey-and-ghee"
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-colors text-sm shadow-sm"
            >
              খাঁটি মধু ও ঘি কালেকশন
            </Link>
            <Link
              href="/products?category=digital-sheets-pdf"
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-colors text-sm shadow-sm"
            >
              ডিজিটাল শিট (পিডিএফ)
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-medium transition-colors text-sm shadow-sm"
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
