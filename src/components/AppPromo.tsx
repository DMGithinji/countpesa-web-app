import { Button } from "@/components/ui/button";
import promoImage from "../assets/giftbox.png";

const AppPromo = () => {
  const onDownload = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.countpesa&utm_source=website&utm_medium=hero&utm_campaign=web_app_promo",
      "_blank"
    );
  };

  return (
    <div className="bg-purple-900/4 rounded-sm px-6 pb-4 pt-2 flex flex-col items-center text-center mt-8 mx-6">
      <div className="relative">
        <img src={promoImage} alt="CheckPesa Logo" className="w-24 h-24" />
      </div>
      <h2 className="text-sm font-semibold text-primary/90 mt-4 mb-2 text-[15px]">
        Available on
        <br />
        Play Store
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        <span className="font-medium">Auto-track</span>, budget and analyse your
        finances right from your phone.
      </p>
      <Button onClick={onDownload} className="w-full">
        Download Now
      </Button>
    </div>
  );
};

export default AppPromo;
