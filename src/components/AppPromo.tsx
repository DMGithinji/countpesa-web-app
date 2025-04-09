import { Button } from "@/components/ui/button";
import promoImage from "../assets/giftbox.png";

function AppPromo() {
  const onDownload = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.countpesa&utm_source=website&utm_medium=hero&utm_campaign=web_app_promo",
      "_blank"
    );
  };

  return (
    <div className="bg-background rounded-sm px-6 pb-4 pt-2 flex flex-col items-center text-center mt-8 mx-6 shadow-sm">
      <div className="relative">
        <img src={promoImage} alt="CountPesa Logo" className="w-24 h-24" />
      </div>
      <h2 className="text-sm font-semibold text-primary/90 mt-4 mb-2 text-[15px]">
        Available on
        <br />
        Play Store
      </h2>
      <p className="text-sm mb-6">
        <span className="font-medium text-background-foreground">Auto-track, Budget & Analyse</span>{" "}
        right from your phone.
      </p>
      <Button onClick={onDownload} className="w-full">
        Download Now
      </Button>
    </div>
  );
}

export default AppPromo;
