import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import useTransactionStore from "@/stores/transactions.store";
import { Filter, FilterMode } from "@/types/Filters";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

type Slide = {
  id: string;
  title: string;
  filter: Filter;
};

function QuickFiltersCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const { validateAndAddFilters } = useTransactionStore();

  useEffect(() => {
    const {
      topAccountsSentToByCount,
      topAccountsReceivedFromByCount,
      topCategoriesMoneyInByCount,
      topCategoriesMoneyOutByCount,
    } = calculatedData;

    // Create slides from top categories and accounts
    const filterSlides: Slide[] = [];

    // Add top 2 accounts received from (by count)
    topAccountsReceivedFromByCount.slice(0, 2).forEach((item) => {
      filterSlides.push({
        id: `account-${item.name}`,
        title: `Money received from ${item.name}`,
        filter: {
          field: "account",
          operator: "==",
          value: item.name,
          mode: FilterMode.AND,
        },
      });
    });

    // Add top 2 accounts sent to (by count)
    topAccountsSentToByCount.slice(0, 2).forEach((item) => {
      filterSlides.push({
        id: `account-${item.name}`,
        title: `Money sent to ${item.name}`,
        filter: {
          field: "account",
          operator: "==",
          value: item.name,
          mode: FilterMode.AND,
        },
      });
    });

    // Add top 2 categories money in (by count)
    topCategoriesMoneyInByCount.slice(0, 2).forEach((item) => {
      filterSlides.push({
        id: `category-${item.name}`,
        title: `Money received from ${item.name}`,
        filter: {
          field: "category",
          operator: "==",
          value: item.name,
          mode: FilterMode.AND,
        },
      });
    });

    // Add top 2 categories money out (by count)
    topCategoriesMoneyOutByCount.slice(0, 2).forEach((item) => {
      filterSlides.push({
        id: `category-${item.name}`,
        title: `Money spent on ${item.name}`,
        filter: {
          field: "category",
          operator: "==",
          value: item.name,
          mode: FilterMode.AND,
        },
      });
    });

    const uniqueSlides = filterSlides.reduce((unique, slide) => {
      if (!unique.some((item) => item.id === slide.id)) {
        unique.push(slide);
      }
      return unique;
    }, [] as Slide[]);

    // Set the slides state
    setSlides(uniqueSlides);
  }, [calculatedData]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const handleShowMe = () => {
    if (slides[activeSlide]?.filter) {
      validateAndAddFilters(slides[activeSlide].filter);
    }
  };

  // If no slides available yet, show loading indicator
  if (slides.length === 0) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <p className="text-muted-foreground">Loading suggestions...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden relative h-40 p-0">
      <CardContent className="p-4 pt-0 flex flex-col items-center justify-center h-full">
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={prevSlide}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <h3 className="text-sm font-medium text-center mx-8 -mt-8">
          {slides[activeSlide]?.title || "No suggestions available"}
        </h3>

        <Button
          variant="outline"
          onClick={handleShowMe}
          className="mt-4 rounded-full border border-primary bg-background text-xs text-primary hover:text-primary px-2 md:px-4 h-8"
        >
          Show me
        </Button>

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={nextSlide}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center absolute bottom-8 left-0 right-0 gap-2">
          {slides.map((slide, index) => (
            <Button
              key={slide.id}
              variant="ghost"
              size="sm"
              className={cn(
                "w-1.5 h-1.5 p-0 rounded-full",
                activeSlide === index ? "bg-primary" : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickFiltersCarousel;
