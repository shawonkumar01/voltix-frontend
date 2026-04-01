import HeroSection from "@/components/homepage/HeroSection";
import FeaturedProducts from "@/components/homepage/FeaturedProducts";
import CategoriesStrip from "@/components/homepage/CategoriesStrip";

export default function HomePage() {
    return (
        <div className="bg-[#080808]">
            <HeroSection />
            <CategoriesStrip />
            <FeaturedProducts />
        </div>
    );
}