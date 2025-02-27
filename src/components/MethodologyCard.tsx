import { Database, Brain, MessageCircle } from "lucide-react";

const icons = {
  database: <Database className="w-8 h-8 text-primary" />,
  brain: <Brain className="w-8 h-8 text-primary" />,
  chat: <MessageCircle className="w-8 h-8 text-primary" />,
};

type MethodologyCardProps = {
  icon: keyof typeof icons;
  title: string;
  description: string;
};

const MethodologyCard = ({ icon, title, description }: MethodologyCardProps) => {
  return (
    <div className="bg-secondary rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
      {icons[icon]}
      <h3 className="text-xl font-bold text-primary mt-4">{title}</h3>
      <p className="text-primary mt-2">{description}</p>
    </div>
  );
};

export default MethodologyCard;
