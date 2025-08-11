"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecipeRecommendations from "@/components/RecipeRecommendations";
import IngredientBasedRecipes from "@/components/IngredientBasedRecipes";
import PersonalizedFeed from "@/components/PersonalizedFeed";
import RecommendationFilters from "@/components/RecommendationFilters";

export default function RecommendationsPage() {
    const [showResults, setShowResults] = useState(false);
    const [currentTheme, setCurrentTheme] = useState("light");
    const [activeTab, setActiveTab] = useState("personalized");
    const [filters, setFilters] = useState({
        dietary: [],
        cuisine: [],
        difficulty: "all",
        maxTime: 60,
        maxCalories: 800
    });

    const handleSearchFocus = () => setShowResults(true);
    const handleBlur = () => setTimeout(() => setShowResults(false), 200);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") || "light";
                    setCurrentTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        const initialTheme = document.documentElement.getAttribute("data-theme") || "light";
        setCurrentTheme(initialTheme);

        return () => observer.disconnect();
    }, []);

    const tabs = [
        { id: "personalized", label: "🎯 Personalized", icon: "✨" },
        { id: "ingredients", label: "🥘 Ingredients", icon: "🔍" },
        { id: "trending", label: "🔥 Trending", icon: "📈" },
        { id: "similar", label: "🔄 Similar", icon: "🔄" }
    ];

    return (
        <>
            <Navbar
                showResults={showResults}
                setShowResults={setShowResults}
                handleSearchFocus={handleSearchFocus}
                handleBlur={handleBlur}
            />

            <div className="min-h-screen bg-base-100 pt-20">
                <div className="container mx-auto px-4 py-8">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                            AI Recipe Recommendations
                        </h1>
                        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                            Discover your next favorite recipe with our intelligent AI-powered recommendation engine.
                            Personalized just for you based on your preferences and cooking history.
                        </p>
                    </div>

                    {/* Filter Section */}
                    <RecommendationFilters filters={filters} setFilters={setFilters} />

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-primary text-primary-content shadow-lg scale-105"
                                        : "bg-base-200 text-base-content hover:bg-base-300 hover:scale-102"
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-8">
                        {activeTab === "personalized" && (
                            <PersonalizedFeed filters={filters} />
                        )}
                        {activeTab === "ingredients" && (
                            <IngredientBasedRecipes filters={filters} />
                        )}
                        {activeTab === "trending" && (
                            <RecipeRecommendations type="trending" filters={filters} />
                        )}
                        {activeTab === "similar" && (
                            <RecipeRecommendations type="similar" filters={filters} />
                        )}
                    </div>

                    {/* AI Insights Section */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                        <h3 className="text-2xl font-bold text-center mb-4">
                            🤖 AI Insights
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-base-100 rounded-xl shadow-md">
                                <div className="text-3xl mb-2">🎯</div>
                                <h4 className="font-semibold mb-2">Personalized Matching</h4>
                                <p className="text-sm text-base-content/70">
                                    Our AI learns your preferences and suggests recipes that match your taste
                                </p>
                            </div>
                            <div className="p-4 bg-base-100 rounded-xl shadow-md">
                                <div className="text-3xl mb-2">🧠</div>
                                <h4 className="font-semibold mb-2">Smart Learning</h4>
                                <p className="text-sm text-base-content/70">
                                    Every interaction helps improve your future recommendations
                                </p>
                            </div>
                            <div className="p-4 bg-base-100 rounded-xl shadow-md">
                                <div className="text-3xl mb-2">⚡</div>
                                <h4 className="font-semibold mb-2">Real-time Updates</h4>
                                <p className="text-sm text-base-content/70">
                                    Get fresh recommendations based on seasonal ingredients and trends
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
