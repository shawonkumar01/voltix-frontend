import HeroSection from "@/components/homepage/HeroSection";
import FeaturedProducts from "@/components/homepage/FeaturedProducts";
import CategoriesStrip from "@/components/homepage/CategoriesStrip";
import FAQSection from "@/components/homepage/FAQSection";
import FeaturedBrands from "@/components/homepage/FeaturedBrands";
import Testimonials from "@/components/homepage/Testimonials";
import NewsletterSignup from "@/components/homepage/NewsletterSignup";
// import SpecialOffersBanner from "@/components/homepage/SpecialOffersBanner";
// import ProductComparisonTool from "@/components/homepage/ProductComparisonTool";

export default function HomePage() {
    return (
        <div className="bg-[#080808]">
            <HeroSection />
            {/* <SpecialOffersBanner /> */}
            <CategoriesStrip />
            <FeaturedProducts />
            <FeaturedBrands />
            {/* <ProductComparisonTool /> */}
            <Testimonials />
            <NewsletterSignup />
            <FAQSection />
        </div>
    );
}