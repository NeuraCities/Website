import { Zap, Brain, Share2 } from "lucide-react"; // Add other icons as needed

const icons = {
  zap: <Zap className="w-8 h-8 text-coral" />,
  brain: <Brain className="w-8 h-8 text-coral" />,
  share2: <Share2 className="w-8 h-8 text-coral" />,
};

type FeatureCardProps = {
  icon: keyof typeof icons;
  title: string;
  description: string;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
      {icons[icon]}
      <h3 className="text-xl font-bold text-coral mt-4">{title}</h3>
      <p className="text-center text-coral mt-2">{description}</p>
    </div>
  );
};

export default FeatureCard;
