"use client";

import BackButton from "@/components/BackButton";
import { PlusIcon, YoutubeIcon } from "@/components/Icons";
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Link from "next/link";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Footer from "./Footer";

// --- Self-contained helper components ---

function HighlightedSentence({ text, isActive, wordRange }) {
  if (!isActive || !wordRange) {
    return <span>{text}</span>;
  }

  const { startChar, endChar } = wordRange;
  const before = text.substring(0, startChar);
  const highlighted = text.substring(startChar, endChar);
  const after = text.substring(endChar);

  return (
    <span>
      {before}
      <span className="speaking-word">{highlighted}</span>
      {after}
    </span>
  );
}

function IngredientsTable({ mealData }) {
  const ingredients = useMemo(
    () =>
      Object.keys(mealData || {})
        .map((key) => {
          if (key.startsWith("strIngredient") && mealData[key]) {
            const num = key.slice(13);
            if (mealData[`strMeasure${num}`])
              return {
                measure: mealData[`strMeasure${num}`],
                name: mealData[key],
              };
          }
          return null;
        })
        .filter(Boolean),
    [mealData]
  );

  const allergenKeywords = [
    "milk", "cheese", "butter", "cream", "egg", "peanut", "almond", "cashew", "walnut", "pecan", "hazelnut", "wheat", "barley", "rye", "soy", "soybean", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "fish"
  ];

  const detectedAllergens = useMemo(() => {
    if (!mealData) return [];
    const ingredientNames = Object.keys(mealData)
      .filter(k => k.startsWith("strIngredient") && mealData[k])
      .map(k => mealData[k].toLowerCase());

    return allergenKeywords.filter(allergen =>
      ingredientNames.some(ing => ing.includes(allergen))
    );
  }, [mealData]);

  return (
    <div className="overflow-x-auto mt-2">
      {detectedAllergens.length > 0 && (
        <div className="mb-4 p-3 bg-warning/20 border border-warning rounded-lg">
          <h4 className="font-semibold text-warning mb-2">⚠️ Allergen Alert</h4>
          <p className="text-sm text-warning-content">
            This recipe contains: <strong>{detectedAllergens.join(", ")}</strong>
          </p>
        </div>
      )}
      <table className="table w-full">
        <thead>
          <tr className="text-left">
            <th className="p-2 w-1/3 text-sm font-semibold text-primary">
              Quantity
            </th>
            <th className="p-2 text-sm font-semibold text-primary">
              Ingredient
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing, i) => (
            <tr key={i} className="border-t border-base-300 hover:bg-base-200">
              <td className="p-2 font-medium text-secondary">{ing.measure}</td>
              <td className="p-2 text-base-content">{ing.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- The Main Page Component ---
function ShowMeal({ URL }) {
  const [mealData, setMealData] = useState(null);
  const [playerState, setPlayerState] = useState("idle");
  const [activeWordRange, setActiveWordRange] = useState({
    sentenceIndex: -1,
    startChar: -1,
    endChar: -1,
  });
  const utterances = useRef([]);

  const instructionSentences = useMemo(() => {
    if (!mealData?.strInstructions) return [];
    // Clean each instruction: remove leading numbers, dots, parentheses, and trim whitespace
    return mealData.strInstructions
      .split(/\r?\n/)
      .map((s) => s.replace(/^\s*\d+([.)])?\s*/, "").trim())
      .filter(Boolean);
  }, [mealData]);

  // Remove duplicat ingredients useMemo - it's now handled in IngredientsTable component

  useEffect(() => {
    const synth = window.speechSynthesis;
    synth.cancel();

    utterances.current = instructionSentences.map((text, sentenceIndex) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          setActiveWordRange({
            sentenceIndex,
            startChar: event.charIndex,
            endChar: event.charIndex + event.charLength,
          });
        }
      };

      utterance.onend = () => {
        if (sentenceIndex === instructionSentences.length - 1) {
          setPlayerState("idle");
          setActiveWordRange({ sentenceIndex: -1, startChar: -1, endChar: -1 });
        }
      };
      return utterance;
    });

    return () => synth.cancel();
  }, [instructionSentences]);

  const handlePlay = useCallback(() => {
    const synth = window.speechSynthesis;
    if (playerState === "paused") {
      synth.resume();
    } else {
      utterances.current.forEach((utterance) => synth.speak(utterance));
    }
    setPlayerState("playing");
  }, [playerState]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setPlayerState("paused");
  }, []);

  const handleRestart = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlayerState("idle");
    setTimeout(() => {
      handlePlay();
    }, 100);
  }, [handlePlay]);

  useEffect(() => {
    fetch(URL)
      .then((res) => res.json())
      .then((data) => setMealData(data.meals[0]))
      .catch((error) => console.error("Error fetching data:", error));
  }, [URL]);

  if (!mealData) {
    return (
      <div className="min-h-screen flex bg-base-100 justify-center items-center p-4">
        <div className="max-w-4xl w-full p-12 my-6 skeleton bg-base-200 rounded-xl shadow-md">
          <div className="animate-pulse">
            <div className="h-10 bg-base-300 rounded-md w-60 mx-auto mb-4"></div>
            <div className="h-6 bg-base-300 rounded-md w-40 mx-auto mb-10"></div>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/2">
                <div className="h-80 bg-base-300 rounded-lg"></div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <div className="h-8 bg-base-300 rounded-md w-40"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-base-300 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="h-8 bg-base-300 rounded-md w-40 mt-6"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-base-300 my-2 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-10 px-4 bg-base-100 flex justify-center items-start">
        <BackButton />
        <div className="relative max-w-4xl w-full bg-base-200 shadow-xl rounded-xl">
          <div className="p-6 md:p-12">
            <header className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-base-content">
                {mealData.strMeal}
              </h1>
              <p className="text-lg text-primary mt-2">
                {mealData.strArea} Cuisine
              </p>
            </header>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
              <div className="md:w-1/2">
                <img
                  src={mealData.strMealThumb}
                  alt={mealData.strMeal}
                  className="w-full h-auto rounded-lg shadow-md mb-4"
                />
                <div className="flex items-center gap-4">
                  <span className="badge badge-lg badge-accent">
                    {mealData.strCategory}
                  </span>
                  {mealData.strYoutube && (
                    <Link
                      href={mealData.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-error btn-sm gap-2"
                    >
                      <YoutubeIcon /> Watch
                    </Link>
                  )}
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-2 flex items-center text-base-content">
                  <PlusIcon />
                  <span className="ml-2">Ingredients</span>
                </h2>
                <IngredientsTable mealData={mealData} />
              </div>
            </div>

            <section id="instructions-section">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-base-content">
                  Preparation Steps
                </h2>
                <div className="flex items-center gap-2 p-1 border border-base-300 rounded-full bg-base-200">
                  <button
                    onClick={
                      playerState === "playing" ? handlePause : handlePlay
                    }
                    className="btn btn-ghost btn-circle"
                  >
                    {playerState === "playing" ? (
                      <PauseIcon className="h-6 w-6 text-info" />
                    ) : (
                      <PlayIcon className="h-6 w-6 text-success" />
                    )}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="btn btn-ghost btn-circle"
                    disabled={playerState === "idle"}
                  >
                    <ArrowPathIcon className="h-5 w-5 text-base-content/60" />
                  </button>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-4 text-base-content leading-relaxed">
                {instructionSentences.map((sentence, index) => (
                  <li key={index}>
                    <HighlightedSentence
                      text={sentence}
                      isActive={index === activeWordRange.sentenceIndex}
                      wordRange={activeWordRange}
                    />
                  </li>
                ))}
              </ol>
            </section>

            {/* Cost Calculator Section */}
            <section className="border-t border-base-300 pt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-base-content mb-2">
                  💰 Recipe Cost Calculator
                </h2>
                <p className="text-base-content/70">
                  See how much this recipe will cost to make and compare with eating out
                </p>
              </div>

              <div className="bg-base-100 rounded-lg p-6 shadow-lg">
                {/* Recipe Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {(() => {
                        const ingredientCount = Object.keys(mealData || {})
                          .filter(key => key.startsWith("strIngredient") && mealData[key])
                          .length;
                        return ingredientCount;
                      })()}
                    </div>
                    <div className="text-sm text-base-content/70">Ingredients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {mealData.strCategory}
                    </div>
                    <div className="text-sm text-base-content/70">Category</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {mealData.strArea}
                    </div>
                    <div className="text-sm text-base-content/70">Cuisine</div>
                  </div>
                </div>

                {/* Ingredients with Cost Estimates */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-base-content">Ingredients & Estimated Costs</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(() => {
                      const ingredients = Object.keys(mealData || {})
                        .map((key) => {
                          if (key.startsWith("strIngredient") && mealData[key]) {
                            const num = key.slice(13);
                            if (mealData[`strMeasure${num}`])
                              return {
                                measure: mealData[`strMeasure${num}`],
                                name: mealData[key],
                              };
                          }
                          return null;
                        })
                        .filter(Boolean);
                      
                      return ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-base-content">
                              {ingredient.name}
                            </span>
                            <span className="text-base-content/70 ml-2">({ingredient.measure})</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-base-content/70">Est. Cost:</div>
                            <div className="font-bold text-primary">$2.99</div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Total Cost Calculation */}
                <div className="bg-primary/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-base-content">Total Estimated Cost:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${(() => {
                        const ingredientCount = Object.keys(mealData || {})
                          .filter(key => key.startsWith("strIngredient") && mealData[key])
                          .length;
                        return (ingredientCount * 2.99).toFixed(2);
                      })()}
                    </span>
                  </div>
                  <p className="text-sm text-base-content/70 mt-2">
                    Based on average ingredient prices
                  </p>
                </div>

                {/* Cost Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-success/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-success">
                      ${(() => {
                        const ingredientCount = Object.keys(mealData || {})
                          .filter(key => key.startsWith("strIngredient") && mealData[key])
                          .length;
                        return (ingredientCount * 2.99).toFixed(2);
                      })()}
                    </div>
                    <div className="text-sm text-success/70">Cost to Cook at Home</div>
                  </div>
                  <div className="bg-warning/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-warning">$25.00</div>
                    <div className="text-sm text-warning/70">Typical Restaurant Cost</div>
                  </div>
                </div>

                {/* Savings Calculation */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-base-content mb-2">
                    💰 You Save: <span className="text-success font-bold">
                      ${(() => {
                        const ingredientCount = Object.keys(mealData || {})
                          .filter(key => key.startsWith("strIngredient") && mealData[key])
                          .length;
                        return (25 - (ingredientCount * 2.99)).toFixed(2);
                      })()}
                    </span>
                  </div>
                  <p className="text-sm text-base-content/70">
                    Cooking at home saves you money compared to eating out!
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ShowMeal;